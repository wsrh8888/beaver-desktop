// 提交反馈请求
export interface ISubmitFeedbackReq {
  content: string // 反馈内容
  type: number // 反馈类型：1-功能异常 2-功能建议 3-使用体验 4-其他问题
  fileNames?: string[] // 反馈图片，JSON格式存储URL数组，可选
}

// 提交反馈响应
export interface ISubmitFeedbackRes {
  message: string
}
