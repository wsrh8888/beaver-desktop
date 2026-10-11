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
  FsSystemPathName,
  IFsModule,
  IFsMkdirResult,
  IFsDirEntry,
  IFsOpenDirectoryResult,
  IFsTextFileResult,
  IFsWriteTextFileResult,
  IFsDataUrlResult,
} from 'commonModule/type/preload/fs'
import { FsCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const fsModule: IFsModule = {
  mkdir: (dirPath: string): Promise<IFsMkdirResult> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.MKDIR, { path: dirPath })
  },
  exists: (targetPath: string): Promise<boolean> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.EXISTS, { path: targetPath })
  },
  getPath: (name: FsSystemPathName): Promise<string> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.GET_PATH, { name })
  },
  join: (...parts: string[]): Promise<string> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.JOIN, { parts })
  },
  basename: (targetPath: string): Promise<string> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.BASENAME, { path: targetPath })
  },
  showOpenDirectory: (options?: {
    title?: string
    defaultPath?: string
  }): Promise<IFsOpenDirectoryResult | null> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.SHOW_OPEN_DIRECTORY, options || {})
  },
  readDir: (dirPath: string): Promise<IFsDirEntry[]> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.READ_DIR, { path: dirPath })
  },
  readTextFile: (filePath: string): Promise<IFsTextFileResult> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.READ_TEXT_FILE, { path: filePath })
  },
  writeTextFile: (filePath: string, content: string): Promise<IFsWriteTextFileResult> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.WRITE_TEXT_FILE, { path: filePath, content })
  },
  readFileDataUrl: (filePath: string): Promise<IFsDataUrlResult> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, FsCommand.READ_FILE_DATA_URL, { path: filePath })
  },
}
