// 朋友圈类型枚举
export enum MomentType {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  FILE = 4,
}

// 创建朋友圈请求
export interface ICreateMomentReq {
  content: string
  type: MomentType
  mediaFiles?: string[] // 媒体文件ID列表
  location?: string // 位置信息
  isPublic: boolean // 是否公开
}

// 创建朋友圈响应
export interface ICreateMomentRes {
  momentId: string
  message: string
}

// 获取朋友圈列表请求
export interface IGetMomentListReq {
  page: number
  limit: number
  userId?: string // 可选，指定用户的朋友圈
}

// 朋友圈信息
export interface IMomentInfo {
  momentId: string
  userId: string
  nickName: string
  avatar: string
  content: string
  type: MomentType
  mediaFiles: string[]
  location?: string
  isPublic: boolean
  likeCount: number
  commentCount: number
  isLiked: boolean
  createTime: string
}

// 获取朋友圈列表响应
export interface IGetMomentListRes {
  count: number
  list: IMomentInfo[]
}

// 点赞朋友圈请求
export interface ILikeMomentReq {
  momentId: string
  action: 'like' | 'unlike'
}

// 点赞朋友圈响应
export interface ILikeMomentRes {
  message: string
}

// 删除朋友圈请求
export interface IDeleteMomentReq {
  momentId: string
}

// 删除朋友圈响应
export interface IDeleteMomentRes {
  message: string
}

// 获取单个动态详情请求
export interface IGetMomentInfoReq {
  momentId: string
}

// 获取单个动态详情响应
export interface IGetMomentInfoRes {
  moment: IMomentInfo
}
