import type { Context } from 'koa'
import { getQuickSign } from '../../logic/auth/quick-sign'
import { response } from '../../utils/response'

/**
 * GET /auth/quick_sign - 获取快捷登录状态（如果已登录，返回 authCode）
 * Query: appid
 * 对标 go-zero handler，负责 HTTP 请求/响应
 */
export default async function quickSignHandler(ctx: Context): Promise<void> {
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
