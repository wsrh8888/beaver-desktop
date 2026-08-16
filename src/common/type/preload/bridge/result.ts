/** bridge 统一返回结构（与服务端 IResponseSuccessData 一致：code / msg / result） */

export interface IBeaverBridgeResult<T = unknown> {
  code: number
  msg: string
  result: T | null
}
