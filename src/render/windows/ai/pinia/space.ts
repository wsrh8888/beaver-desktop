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

import { defineStore } from 'pinia'
import type { IAiSpace } from 'renderModule/windows/ai/types/chat'

/** 本机设备标识（后续可换成真实机器 GUID） */
const LOCAL_DEVICE_GUID = 'device-local'

/** 工作空间根目录名（落在 getRootPath 下，与 BEAVER_CACHE 同级） */
const WORKSPACE_ROOT_NAME = 'BeaverWorkspaces'

/** Windows / 跨平台非法文件名字符 */
const INVALID_NAME_RE = /[<>:"/\\|?*\u0000-\u001f]/

function createSpaceId() {
  return `space_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function assertValidSpaceName(name: string) {
  const title = name.trim()
  if (!title)
    throw new Error('请输入工作空间名称')
  if (title === '.' || title === '..' || INVALID_NAME_RE.test(title))
    throw new Error('工作空间名称包含非法字符')
  return title
}

/**
 * 空间 = 本机工作区（PC 只展示本机）。
 * 新建时通过 electron.fs 在磁盘创建真实目录；打开本地文件夹则登记已有路径。
 */
export const useAiSpaceStore = defineStore('useAiSpaceStore', {
  state: () => ({
    localDeviceGuid: LOCAL_DEVICE_GUID,
    spaces: [] as IAiSpace[],
    /** null = 不使用工作空间 → 云端任务；新建/打开文件夹后自动选中 */
    selectedSpaceId: null as string | null,
  }),
  getters: {
    /** 仅本机空间 */
    localSpaces(state): IAiSpace[] {
      return state.spaces.filter(item => item.deviceGuid === state.localDeviceGuid)
    },
    selectedSpace(): IAiSpace | undefined {
      if (!this.selectedSpaceId)
        return undefined
      return this.localSpaces.find(item => item.id === this.selectedSpaceId)
    },
  },
  actions: {
    /** 选空间；传 null 表示不使用工作空间 */
    selectSpace(spaceId: string | null) {
      if (spaceId === null) {
        this.selectedSpaceId = null
        return
      }
      if (!this.localSpaces.some(item => item.id === spaceId))
        return
      this.selectedSpaceId = spaceId
    },

    /** 若已登记同路径空间则直接选中，否则新增 */
    registerSpace(name: string, dirPath: string) {
      const existed = this.spaces.find(
        item => item.deviceGuid === this.localDeviceGuid && item.path === dirPath,
      )
      if (existed) {
        this.selectedSpaceId = existed.id
        return existed.id
      }
      const space: IAiSpace = {
        id: createSpaceId(),
        name,
        deviceGuid: this.localDeviceGuid,
        path: dirPath,
      }
      this.spaces.push(space)
      this.selectedSpaceId = space.id
      return space.id
    },

    /**
     * 新建工作空间：{getRootPath}/BeaverWorkspaces/{name}
     * 仅调用通用 fs API，不走业务 IPC。
     */
    async createLocalSpace(name: string) {
      const title = assertValidSpaceName(name)
      const appRoot = await window.electron.fs.getPath('root')
      const root = await window.electron.fs.join(appRoot, WORKSPACE_ROOT_NAME)
      const rootResult = await window.electron.fs.mkdir(root)
      if (!rootResult.success)
        throw new Error(rootResult.error || '创建工作空间根目录失败')

      const dirPath = await window.electron.fs.join(root, title)
      if (await window.electron.fs.exists(dirPath))
        throw new Error('同名工作空间已存在')

      const result = await window.electron.fs.mkdir(dirPath)
      if (!result.success)
        throw new Error(result.error || '创建工作空间目录失败')

      return this.registerSpace(title, dirPath)
    },

    /** 打开本地文件夹并登记为工作空间 */
    async openLocalFolder() {
      const picked = await window.electron.fs.showOpenDirectory({
        title: '打开本地文件夹',
      })
      if (!picked)
        return null
      return this.registerSpace(picked.name || '本地文件夹', picked.path)
    },

    /** 发送时的目标：null=云端任务，否则为本机空间 id */
    resolveTargetSpaceId(): string | null {
      if (this.selectedSpaceId === null)
        return null
      if (this.localSpaces.some(item => item.id === this.selectedSpaceId))
        return this.selectedSpaceId
      return null
    },
  },
})
