import type { Context } from 'koa'

/**
 * 统一响应格式
 * 对标 go-zero response.Response
 */
export interface IResponse {
  code: number
  msg: string
  data: any  // 使用 data 而不是 result（对标知音楼）
}

/**
 * 成功响应
 */
export function success(ctx: Context, data: any, msg?: string): void {
  ctx.body = {
    code: 0,
    msg: msg || '获取数据成功',
    data,
  }
}

/**
 * 失败响应
 */
export function error(ctx: Context, code: number, msg: string): void {
  ctx.body = {
    code,
    msg,
    data: null,
  }
}

/**
 * 统一响应函数（对标 go-zero response.Response）
 * @param ctx - Koa Context
 * @param data - 业务数据
 * @param err - 错误信息（可选）
 */
export function response(ctx: Context, data: any, err?: string | Error): void {
  if (!err) {
    // 成功
    ctx.body = {
      code: 0,
      msg: '获取数据成功',
      data,
    }
  } else {
    // 失败
    const errorMsg = typeof err === 'string' ? err : err.message
    ctx.body = {
      code: 1,
      msg: errorMsg,
      data: null,
    }
  }
}
