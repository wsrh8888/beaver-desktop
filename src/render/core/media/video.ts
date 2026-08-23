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

import { CacheType } from 'commonModule/type/cache/cache'
import { getFileNameFromUrl } from 'renderModule/utils/file/index'

/**
 * @description: 聊天视频播放（独立播放器窗口）
 */
export class VideoPlayer {
  static async resolveUrl(mediaUrl: string) {
    if (!mediaUrl)
      return ''

    let videoUrl = mediaUrl
    try {
      const cachedUrl = await electron.cache.get(CacheType.USER_VIDEO, mediaUrl)
      if (cachedUrl)
        videoUrl = cachedUrl
    }
    catch {
      // 缓存获取失败，使用在线 URL
    }
    return videoUrl
  }

  static async open(mediaUrl: string, title?: string) {
    if (!mediaUrl)
      return

    const videoUrl = await this.resolveUrl(mediaUrl)
    await electron.window.openWindow('video', {
      unique: true,
      params: {
        url: videoUrl,
        title: title || getFileNameFromUrl(mediaUrl),
      },
    })
  }
}
