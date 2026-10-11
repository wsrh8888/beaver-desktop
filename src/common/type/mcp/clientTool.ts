/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

/**
 * 服务端下发的 client_tool 事件 payload。
 * 工作目录在服务端 agent_workspaces，不在这条事件里解析。
 */
export interface IClientToolPayload {
  requestId?: string
  server?: string
  tool?: string
  args?: Record<string, any>
  /** 本机空间 id（客户端 spaceId）。空=云端轻会话。 */
  workspaceId?: string
  /** 本机空间绝对路径。桌面优先用本地登记的 path。 */
  workspacePath?: string
  /** 该空间所在电脑的设备 id。 */
  deviceId?: string
}

/** 本机工具执行完，把结果交回正在等待的 sendMessage。 */
export interface ISubmitClientToolResultReq {
  requestId: string
  ok: boolean
  data?: Record<string, any>
  error?: string
}
