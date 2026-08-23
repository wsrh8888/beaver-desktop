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

import type {
  IWorkbenchEmbedBounds,
  IWorkbenchEmbedStatePayload,
  IWorkbenchModule,
} from 'commonModule/type/preload/workbench'
import { WORKBENCH_EMBED_STATE_CHANNEL } from 'commonModule/type/main/web-contents-view/workbench'
import { WorkbenchCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const workbenchModule: IWorkbenchModule = {
  openEmbed: (data) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_OPEN, data)
  },
  hideAllEmbeds: () => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_HIDE_ALL, {})
  },
  setEmbedBounds: (data: { tabId: string, bounds: IWorkbenchEmbedBounds }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_SET_BOUNDS, data)
  },
  reloadEmbed: (data: { tabId: string }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_RELOAD, data)
  },
  closeEmbed: (data: { tabId: string }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.EMBED_CLOSE, data)
  },
  openExternal: (data: { url: string }) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WorkbenchCommand.OPEN_EXTERNAL, data)
  },
  onEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => {
    ipcRenderManager.on(WORKBENCH_EMBED_STATE_CHANNEL, callback)
  },
  offEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => {
    ipcRenderManager.removeListener(WORKBENCH_EMBED_STATE_CHANNEL, callback)
  },
}
