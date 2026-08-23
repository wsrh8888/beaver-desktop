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

import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetEmojiPackageEmojisReq, IGetEmojiPackageEmojisRes, IGetEmojiPackagesByIdsReq, IGetEmojiPackagesByIdsRes, IGetEmojiPackagesRes, IGetEmojisListRes } from 'commonModule/type/ajax/emoji'
import { DataEmojiCommand } from 'commonModule/type/ipc/database'
import favoriteEmojiBusiness from 'mainModule/business/emoji/favorite-emoji'
import favoritePackageBusiness from 'mainModule/business/emoji/favorite-package'
import emojiPackageBusiness from 'mainModule/business/emoji/package'

class EmojiHandler {
  ensureLogin(header: ICommonHeader) {
    if (!header.userId) {
      throw new Error('用户未登录')
    }
  }

  async handle(
    _event: Electron.IpcMainInvokeEvent,
    command: DataEmojiCommand,
    data: IGetEmojiPackagesByIdsReq | IGetEmojiPackageEmojisReq,
    header: ICommonHeader,
  ): Promise<IGetEmojisListRes | IGetEmojiPackagesRes | IGetEmojiPackagesByIdsRes | IGetEmojiPackageEmojisRes> {
    this.ensureLogin(header)
    switch (command) {
      case DataEmojiCommand.GET_USER_FAVORITE_EMOJIS:
        return await favoriteEmojiBusiness.getUserFavoriteEmojis(header)
      case DataEmojiCommand.GET_EMOJI_PACKAGES:
        return await favoritePackageBusiness.getUserFavoritePackages(header)
      case DataEmojiCommand.GET_EMOJI_PACKAGES_BY_IDS:
        return await emojiPackageBusiness.getEmojiPackagesByIds(data as IGetEmojiPackagesByIdsReq)
      case DataEmojiCommand.GET_EMOJI_PACKAGE_EMOJIS:
        return await emojiPackageBusiness.getEmojiPackageEmojis(data as IGetEmojiPackageEmojisReq)
      default:
        console.error('未处理的表情命令:', command)
        throw new Error(`未处理的表情命令: EmojiHandler`)
    }
  }
}

export default new EmojiHandler()
