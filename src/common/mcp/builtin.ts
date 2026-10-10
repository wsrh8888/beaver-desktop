/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 内置 MCP server 名称。客户端按此名称上报，服务端按此名称下发 host 事件，
 * host 收到 server === BUILTIN_SERVER_NAME 时路由到内置 dispatch。
 *
 * 工具实现已下沉到 src/main/tools/，MCP 侧的 schema/register 胶水在
 * src/main/mcp/builtin/server.ts，host 运行时通过 client.listTools() 拉，
 * 不再在此维护静态工具清单。
 */
export const BUILTIN_SERVER_NAME = 'beaver-builtin'
