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

import EmojiSvg from 'renderModule/assets/image/chat/emoji.svg'
import FileSvg from 'renderModule/assets/image/chat/file.svg'
import ImageSvg from 'renderModule/assets/image/chat/image.svg'
import ScreenshotSvg from 'renderModule/assets/image/chat/screenshot.svg'

/** PC 端不提供「按住说话」语音消息发送，仅支持播放移动端发来的 type=5 语音 */
export const toolList = [
  {
    id: 3,
    name: '文件',
    value: 'file',
    icon: FileSvg,
  },
  {
    id: 6,
    name: '截屏',
    value: 'screenshot',
    icon: ScreenshotSvg,
  },
  {
    id: 1,
    name: '表情',
    value: 'emoji',
    icon: EmojiSvg,
  },
  {
    id: 2,
    name: '图片',
    value: 'image',
    icon: ImageSvg,
  },
]
