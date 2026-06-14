import type { Context } from 'koa'

export interface IResponse {
  code: number
  msg: string
  result: any
}

export function success(ctx: Context, result: any, msg?: string): void {
  ctx.body = {
    code: 0,
    msg: msg || '获取数据成功',
    result,
  }
}

export function error(ctx: Context, code: number, msg: string): void {
  ctx.body = {
    code,
    msg,
    result: null,
  }
}

export function response(ctx: Context, result: any, err?: string | Error): void {
  if (!err) {
    ctx.body = {
      code: 0,
      msg: '获取数据成功',
      result,
    }
  } else {
    const errorMsg = typeof err === 'string' ? err : err.message
    ctx.body = {
      code: 1,
      msg: errorMsg,
      result: null,
    }
  }
}
