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

import customAvatar from 'renderModule/assets/image/groupAssistant/custom.svg'
/** 与服务端 GroupBotModel.type 一致 */
export type GroupBotType = 'custom' | 'gitlab' | ''

export type BotTemplateKey = GroupBotType

export interface IBotTypeOption {
  key: string
  label: string
}

export interface IBotTemplateOption {
  key: BotTemplateKey
  name: string
  desc: string
  avatar: string
  preset: {
    name: string
    description: string
  }
}

/** 助手类型（第二行可选列表，目前仅通知机器人） */
export const botTypeOptions: IBotTypeOption[] = [
  {
    key: 'notification',
    label: '通知机器人',
  },
]

/** 第三行模板卡片（一行两个） */
export const botTemplateOptions: IBotTemplateOption[] = [
  {
    key: 'custom',
    name: '自定义机器人',
    desc: '通过 Webhook 自定义服务',
    avatar: customAvatar,
    preset: {
      name: '',
      description: '',
    },
  },
]
