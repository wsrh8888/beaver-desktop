// OAuth 相关类型定义
// 根据后端 oauth.api 文件定义

// H5 免登获取 authCode 请求（对应后端 GetH5AuthCodeReq）
export interface IGetH5AuthCodeReq {
  appId: string
}

// H5 免登获取 authCode 响应（对应后端 GetH5AuthCodeRes）
export interface IGetH5AuthCodeRes {
  authCode: string
  expireIn: number
}
