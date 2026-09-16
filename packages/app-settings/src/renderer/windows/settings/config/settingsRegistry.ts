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
} from '../../../../common/type/ajax/user'
import type { KeyboardActionId } from '../../../../common/type/settings'
import { Logger } from '@beaver-im/beaver/renderer'
const logger = new Logger('settingsRegistry')

export type SettingsFieldType = 'devices' | 'toggle-group' | 'keyboard' | 'upgrade' | 'about'

export type SettingsToggleScope = 'privacy' | 'notification'

export type PrivacySettingsKey = keyof IUserSettingsPrivacy
export type NotificationSettingsKey = keyof IUserSettingsNotification

export type SettingsToggleKey = PrivacySettingsKey | NotificationSettingsKey

export interface IToggleFieldDef {
  scope: SettingsToggleScope
  key: SettingsToggleKey
  label: string
  desc: string
}

export interface IKeyboardFieldDef {
  id: KeyboardActionId
  label: string
  desc: string
}

export interface ISettingsSection {
  id: string
  label: string
  type: SettingsFieldType
  fields?: IToggleFieldDef[]
  keyboard?: IKeyboardFieldDef[]
}

export const settingsRegistry: ISettingsSection[] = [
  {
    id: 'account',
    label: '账号与存储',
    type: 'devices',
  },
  {
    id: 'keyboard',
    label: '快捷键',
    type: 'keyboard',
    keyboard: [
      { id: 'sendMessage', label: '发送消息', desc: '在聊天输入框中发送当前内容' },
      { id: 'screenshot', label: '截图', desc: '打开区域截图工具' },
      { id: 'toggleWindow', label: '显示/隐藏主窗口', desc: '快速切换主窗口显示状态' },
    ],
  },
  {
    id: 'upgrade',
    label: '升级',
    type: 'upgrade',
  },
  {
    id: 'about',
    label: '开源致谢',
    type: 'about',
  },
]

export function findSettingsSection(sectionId: string): ISettingsSection | undefined {
    logger.info({ text: 'findSettingsSection 开始' })
  return settingsRegistry.find(section => section.id === sectionId)
}

export function getDefaultActiveSectionId(): string {
    logger.info({ text: 'getDefaultActiveSectionId 开始' })
  return settingsRegistry[0].id
}
