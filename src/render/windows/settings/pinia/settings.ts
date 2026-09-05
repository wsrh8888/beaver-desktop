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
  IUserSettingsNotification,
  IUserSettingsPrivacy,
} from 'commonModule/type/ajax/user'
import type { IUserSettings, KeyboardActionId } from 'commonModule/type/mainStore'
import Logger from 'renderModule/utils/logger'
import { updateUserSettingsApi } from 'renderModule/api/user'
import { defineStore } from 'pinia'

const logger = new Logger('SettingsStore')

export const useSettingsStore = defineStore('useSettingsStore', {
  state: () => ({
    settings: null as IUserSettings | null,
  }),

  actions: {
    async init() {
      try {
        this.settings = await electron.settings.get()
        logger.info({ text: '加载用户设置成功', data: { hasSettings: !!this.settings } })
      }
      catch (error) {
        logger.error({ text: '加载用户设置失败', data: { error } })
      }
    },

    async save() {
      if (!this.settings) {
        logger.warn({ text: '保存设置被跳过：设置尚未初始化' })
        return
      }

      try {
        this.settings = await electron.settings.update({
          privacy: { ...this.settings.privacy },
          notification: { ...this.settings.notification },
          keyboard: { ...this.settings.keyboard },
        })
      }
      catch (error) {
        logger.error({ text: '保存用户设置到本地失败', data: { error } })
        throw error
      }
    },

    async updatePrivacy(key: keyof IUserSettingsPrivacy, value: boolean): Promise<boolean> {
      if (!this.settings) {
        logger.warn({ text: '更新隐私设置被跳过：设置尚未初始化' })
        return false
      }
      const prev = this.settings.privacy[key]
      this.settings.privacy[key] = value

      try {
        const res = await updateUserSettingsApi({ privacy: { [key]: value } })
        if (res.code !== 0) {
          logger.error({ text: '更新隐私设置失败', data: { key, value, code: res.code, msg: res.msg } })
          this.settings.privacy[key] = prev
          return false
        }
        await this.save()
        logger.info({ text: '更新隐私设置成功', data: { key, value } })
        return true
      }
      catch (error) {
        logger.error({ text: '更新隐私设置异常', data: { key, value, error } })
        this.settings.privacy[key] = prev
        return false
      }
    },

    async updateNotification(key: keyof IUserSettingsNotification, value: boolean): Promise<boolean> {
      if (!this.settings) {
        logger.warn({ text: '更新通知设置被跳过：设置尚未初始化' })
        return false
      }
      const prev = this.settings.notification[key]
      this.settings.notification[key] = value

      try {
        const res = await updateUserSettingsApi({ notification: { [key]: value } })
        if (res.code !== 0) {
          logger.error({ text: '更新通知设置失败', data: { key, value, code: res.code, msg: res.msg } })
          this.settings.notification[key] = prev
          return false
        }
        await this.save()
        logger.info({ text: '更新通知设置成功', data: { key, value } })
        return true
      }
      catch (error) {
        logger.error({ text: '更新通知设置异常', data: { key, value, error } })
        this.settings.notification[key] = prev
        return false
      }
    },

    async updateKeyboard(actionId: KeyboardActionId, binding: string): Promise<boolean> {
      if (!this.settings) {
        return false
      }
      const prev = this.settings.keyboard[actionId]
      this.settings.keyboard[actionId] = binding
      const res = await updateUserSettingsApi({ keyboard: { [actionId]: binding } })
      if (res.code !== 0) {
        logger.error({ text: '快捷键接口保存失败', data: { actionId, binding, code: res.code, msg: res.msg } })
        this.settings.keyboard[actionId] = prev
        return false
      }
      try {
        await this.save()
        await electron.keyboard.set(actionId, binding)
        return true
      }
      catch (error) {
        logger.error({ text: '快捷键保存失败', data: { actionId, binding, error: (error as Error)?.message } })
        this.settings.keyboard[actionId] = prev
        return false
      }
    },
  },
})
