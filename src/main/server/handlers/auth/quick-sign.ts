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

import type { Context } from 'koa'
import { getQuickSign } from '../../logic/auth/quick-sign'
import { response } from '../../utils/response'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('quick-sign')


/**
 * GET /auth/quick_sign - 获取快捷登录状态（如果已登录，返回 authCode）
 * Query: appid
 * 对标 go-zero handler，负责 HTTP 请求/响应
 */
export default async function quickSignHandler(ctx: Context): Promise<void> {
    logger.info({ text: 'quickSignHandler 开始' })
  const appId = ctx.query.appid as string

  // 参数校验
  if (!appId) {
    response(ctx, null, '缺少 appid 参数')
    return
  }

  // 调用 Logic 层
  const [result, error] = await getQuickSign(appId)

  if (error) {
    response(ctx, null, error)
    return
  }

  // 成功
  response(ctx, result)
}
