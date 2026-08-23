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
 * 聊天内容区域右键菜单配置
 */

// 消息类型枚举（与 MessageType 保持一致）
export enum MessageContentType {
  TEXT = 1, // 文本消息
  IMAGE = 2, // 图片消息
  VIDEO = 3, // 视频消息
  FILE = 4, // 文件消息
  VOICE = 5, // 语音消息
  EMOJI = 6, // 表情消息
  NOTIFICATION = 7, // 通知消息
  AUDIO_FILE = 8, // 音频文件消息
  CALL = 9, // 音视频通话
  WITHDRAW = 10, // 撤回消息
  REPLY = 11, // 回复消息
  FORWARD = 12, // 转发消息（聊天记录）
}
