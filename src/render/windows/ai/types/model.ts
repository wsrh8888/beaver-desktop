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
 * 模型配置。一个会话选用一个模型；可在设置里增删。
 */
export interface IAiModel {
  id: string
  /** 展示名，如「GPT-4o」 */
  name: string
  /** 服务商：openai / anthropic / deepseek / ollama / custom ... */
  provider: string
  /** API Key（本机存储，后续接入加密） */
  apiKey: string
  /** 自定义接口地址，留空走服务商默认 */
  endpoint: string
}

/** 设置弹窗左侧导航分类。先只放「模型」，后续逐步加。 */
export type AiSettingsSection = 'model'
