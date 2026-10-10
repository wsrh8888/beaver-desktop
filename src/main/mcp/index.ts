/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * McpManager — MCP 模块总管（主进程单例）。
 *
 * 职责：
 *   - init()：注册 CONFIRM_TOOL IPC + 连接所有 MCP server（builtin/window + 各能力包）
 *   - callTool()：AI 调工具时按 server 名路由到对应 server 执行
 *   - reportCapabilities()：ws 连通后聚合本机工具清单上报服务端
 *   - isRequiresConfirm/getToolSchema/getToolDescription：给 agent receiver 查工具元信息
 *
 * 这是大厂（Cursor/Claude Code）模型：内置工具不是被 if 链直接调用，而是包成
 * in-process MCP server，router 通过 tools/list 发现、tools/call 调用，与外部
 * stdio/sse server 走同一条 client.callTool 路径。builtin/能力包 server 走同一路径，零特殊-case。
 *
 * requiresConfirm 等工具元信息从各 server 自带的 toolMeta（能力包）或 TOOL_META 常量
 * （builtin/window）读，合并进 manifest 上报。是否确认由 agent 接收层（receivers/agent）决定，
 * McpManager 本身只管路由执行，不管确认交互。
 *
 * 目录结构：
 *   - index.ts   McpManager（本文件）：总管 + 路由 + 上报
 *   - tools/     工具的 MCP 配置（builtin 各维度 + window）
 *
 * 工具实现不在本目录，下沉到 src/main/tools/<domain>/，ipc 也可调同一份实现。
 * 工具确认 UI 流程不在本目录，归 receivers/agent/（确认是 agent 交互层，与 mcp 协议无关）。
 * 工作目录（root）跟会话走：服务端下发 host 事件时在 payload 带 root，客户端不维护映射表。
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpServers, registerIpcHandler } from '@beaver-im/beaver/main'
import { AiHostCommand } from '@beaver-im/app-ai/common/type/ipc/command'
import { BUILTIN_SERVER_NAME } from 'commonModule/mcp/builtin'
import type { IMcpServerManifest, IMcpToolSchema } from 'commonModule/type/mcp'
import { reportCapabilitiesApi } from 'mainModule/api/mcp'
import Logger from 'mainModule/utils/logger'
import { confirmTool } from '../message-manager/receivers/agent/confirm'
import { BUILTIN_TOOL_META, createBuiltinServer } from './tools'
import { TOOL_META as WINDOW_TOOL_META, createWindowServer } from './tools/window'

const logger = new Logger('mcp')

interface HostEntry {
  client: Client
  /** tools/list 缓存；启动时拉一次，外部 server 上下线时刷新 */
  tools: IMcpToolSchema[]
}

class McpManager {
  private entries = new Map<string, HostEntry>()
  private started = false

  /**
   * 注册 IPC + 连接所有 MCP server。在主进程 beforeAppReady（activatePlugins 之后）调用。
   *   CONFIRM_TOOL — 渲染进程把用户确认的工具参数回传主进程，续跑挂起的 agent 工具调用
   *
   * CONFIRM_TOOL 的处理函数在 receivers/agent/confirm.ts（确认 UI 流程归 agent 交互层）。
   */
  async init(): Promise<void> {
    registerIpcHandler([AiHostCommand.CONFIRM_TOOL], (_event, _command, data) => {
      const { confirmId, confirmed, args } = (data || {}) as {
        confirmId?: string
        confirmed?: boolean
        args?: Record<string, any>
      }
      if (!confirmId)
        return false
      return confirmTool(confirmId, !!confirmed, args)
    })

    await this.start()
    logger.info({ text: 'MCP manager 已启动' })
  }

  /** 连接所有 MCP server：builtin/window（宿主自带）+ 各能力包注册的 server。 */
  private async start(): Promise<void> {
    if (this.started)
      return
    this.started = true
    await this.connectServer(BUILTIN_SERVER_NAME, createBuiltinServer(), BUILTIN_TOOL_META)
    await this.connectServer('beaver-window', createWindowServer(), WINDOW_TOOL_META)
    await this.registerAppServers()
  }

  /**
   * 连接各能力包注册的 MCP server（getMcpServers()）。
   * 能力包 activate() 里 registerMcpServer('moment', () => createMomentServer(), { toolMeta }),
   * 这里统一 InMemoryTransport 连接、拉 tools/list、合并 toolMeta、纳入 manifest。
   */
  private async registerAppServers(): Promise<void> {
    for (const [name, { factory, toolMeta }] of getMcpServers()) {
      try {
        const server = await factory()
        await this.connectServer(name, server, toolMeta)
      }
      catch (err: any) {
        logger.warn({ text: 'MCP server 连接失败', data: { server: name, error: err?.message || String(err) } })
      }
    }
  }

  /**
   * 通用：用 InMemoryTransport 连接一个 in-process server，拉 tools/list 入表。
   * toolMeta 按工具名声明 requiresConfirm，合并进 tools 项（SDK listTools 不带这个字段）。
   */
  private async connectServer(
    name: string,
    server: McpServer,
    toolMeta: Record<string, { requiresConfirm?: boolean }> = {},
  ): Promise<void> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'beaver-mcp', version: '1.0.0' }, { capabilities: {} })
    await client.connect(clientTransport)
    await server.connect(serverTransport)
    const { tools } = await client.listTools()
    this.entries.set(name, {
      client,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description || '',
        inputSchema: t.inputSchema as Record<string, any>,
        requiresConfirm: !!toolMeta[t.name]?.requiresConfirm,
      })),
    })
    logger.info({ text: 'MCP server 已注册', data: { server: name, tools: this.entries.get(name)!.tools.length } })
  }

  /** 该工具调用前是否需要用户在 AI 聊天框确认参数。 */
  isRequiresConfirm(server: string, tool: string): boolean {
    const entry = this.entries.get(server)
    if (!entry)
      return false
    return entry.tools.find(t => t.name === tool)?.requiresConfirm === true
  }

  /** 取工具的 inputSchema（确认卡片据此渲染表单）。无则 null。 */
  getToolSchema(server: string, tool: string): Record<string, any> | null {
    const entry = this.entries.get(server)
    if (!entry)
      return null
    return entry.tools.find(t => t.name === tool)?.inputSchema ?? null
  }

  /** 取工具的 description（确认卡片标题）。无则空串。 */
  getToolDescription(server: string, tool: string): string {
    const entry = this.entries.get(server)
    if (!entry)
      return ''
    return entry.tools.find(t => t.name === tool)?.description ?? ''
  }

  /**
   * 按 server+tool 调用。root 注入 args.__root，builtin server 解包后传给实现。
   * 返回 { ok, data, error }，对齐 IHostToolResult（data.text = MCP text content）。
   */
  async callTool(server: string, tool: string, args: Record<string, any>, root: string): Promise<{ ok: boolean, data?: Record<string, any>, error?: string }> {
    const entry = this.entries.get(server)
    if (!entry)
      return { ok: false, error: `unknown mcp server: ${server || '(empty)'}` }
    try {
      const result = await entry.client.callTool({ name: tool, arguments: { ...args, __root: root } })
      const text = extractText(result)
      return { ok: true, data: { text } }
    }
    catch (err: any) {
      return { ok: false, error: err?.message || 'mcp tool call failed' }
    }
  }

  /**
   * 聚合所有 server 的 tools/list，生成 capability manifest。
   * builtin transport='client'（本机执行，走 agent 事件回路）。
   */
  async getManifest(): Promise<IMcpServerManifest[]> {
    const manifest: IMcpServerManifest[] = []
    for (const [name, entry] of this.entries) {
      manifest.push({
        name,
        version: '1.0.0',
        transport: 'client',
        tools: entry.tools,
      })
    }
    return manifest
  }

  /**
   * ws 连通后聚合本机工具清单，POST reportCapabilities 上报给服务端。
   * 失败只告警不抛，不阻断主流程。服务端收不到 manifest 时 LLM 不会下发本机工具。
   */
  async reportCapabilities(): Promise<void> {
    try {
      const servers = await this.getManifest()
      const res = await reportCapabilitiesApi({ source: 'client', servers })
      if (res.code === 0 && res.result?.accepted) {
        logger.info({ text: '能力清单上报成功', data: { toolCount: res.result.toolCount, servers: servers.map(s => s.name) } })
      }
      else {
        logger.warn({ text: '能力清单上报未接受', data: { code: res.code, msg: res.msg } })
      }
    }
    catch (err: any) {
      logger.error({ text: '能力清单上报失败', data: { error: err?.message || String(err) } })
    }
  }
}

/** 从 MCP callTool 结果提取文本（content[].text 拼接）。 */
function extractText(result: any): string {
  if (!result)
    return ''
  const content = result.content
  if (!Array.isArray(content))
    return typeof result === 'string' ? result : JSON.stringify(result)
  return content
    .filter((c: any) => c?.type === 'text' && typeof c.text === 'string')
    .map((c: any) => c.text)
    .join('\n')
}

let manager: McpManager | null = null

/** 获取 McpManager 单例。首次调用会触发 server 连接。 */
export async function getMcpManager(): Promise<McpManager> {
  if (!manager) {
    manager = new McpManager()
    await manager.init()
  }
  return manager
}
