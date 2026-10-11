/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 文件系统类工具的 MCP 配置。实现见 mainModule/tools/fs。
 * read_file/ls/view 只读不确认；write_file/str_replace 改文件，执行前需确认。
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { requireToolRoot } from '../toolRoot'
import { listFiles, readFile, strReplace, viewFile, writeFile } from 'mainModule/tools/fs'

/** 本组工具元信息。写/改类工具需确认，只读类不确认。 */
export const FS_TOOL_META: Record<string, { requiresConfirm?: boolean }> = {
  write_file: { requiresConfirm: true },
  str_replace: { requiresConfirm: true },
}

/** 把文件系统类工具注册进 server。 */
export function registerFsTools(server: McpServer): void {
  server.registerTool('read_file', {
    description: '读取文件。offset/limit 为行号切片。',
    inputSchema: {
      path: z.string().describe('相对工作目录的路径，或本机绝对路径'),
      offset: z.number().int().default(0).describe('起始行号（0 基）'),
      limit: z.number().int().default(0).describe('读取行数；0=到末尾'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    const text = await readFile(root, args as any)
    return { content: [{ type: 'text', text }] }
  })

  server.registerTool('write_file', {
    description: '写入文件（覆盖）。path 必须是当前工作目录内的相对路径。',
    inputSchema: {
      path: z.string().describe('相对工作目录的路径，或本机绝对路径'),
      content: z.string().describe('写入内容'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    await writeFile(root, String(args.path || ''), String(args.content ?? ''))
    return { content: [{ type: 'text', text: '(ok)' }] }
  })

  server.registerTool('str_replace', {
    description: '在文件中替换字符串。默认要求 old 唯一，replace_all=true 可多处替换。',
    inputSchema: {
      path: z.string().describe('相对工作目录的路径，或本机绝对路径'),
      old: z.string().describe('被替换的字符串'),
      new: z.string().describe('替换为的字符串'),
      replace_all: z.boolean().default(false).describe('true=替换所有匹配'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    await strReplace(root, args as any)
    return { content: [{ type: 'text', text: '(ok)' }] }
  })

  server.registerTool('ls', {
    description: '列出目录下的直接条目。',
    inputSchema: {
      path: z.string().default('.').describe('相对工作目录的目录，或本机绝对路径（如 D:\\）'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    const entries = await listFiles(root, String(args.path || '.'))
    return { content: [{ type: 'text', text: entries.length ? entries.join('\n') : '(empty)' }] }
  })

  server.registerTool('view', {
    description: '查看文件（带行号前缀），便于按行号引用。offset/limit 为行号切片。',
    inputSchema: {
      path: z.string().describe('相对工作目录的路径，或本机绝对路径'),
      offset: z.number().int().default(0).describe('起始行号（0 基）'),
      limit: z.number().int().default(0).describe('读取行数；0=到末尾'),
    },
  }, async (args) => {
    const root = requireToolRoot()
    const text = await viewFile(root, args as any)
    return { content: [{ type: 'text', text }] }
  })
}
