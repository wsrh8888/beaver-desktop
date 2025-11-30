// 朋友圈类型枚举
export enum MomentType {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  FILE = 4,
}

// 文件信息
export interface IFileInfo {
  fileKey: string // 文件名
  type: number    // 文件类型：2=图片 3=视频 8=音频 4=文件 (与MsgType枚举保持一致)
}

// 创建朋友圈请求
export interface ICreateMomentReq {
  content: string
  files: IFileInfo[] // 文件信息列表
}

// 创建朋友圈响应
export interface ICreateMomentRes {
  // 空响应
}

// 获取朋友圈列表请求
export interface IGetMomentListReq {
  page: number
  limit: number
}

// 点赞模型
export interface IMomentLikeModel {
  id: string // 点赞ID
  momentId: string // 动态ID
  userId: string // 用户ID
  createdAt: string // 点赞时间
  userName: string // 用户名
  avatar: string // 用户头像
}

// 评论模型
export interface IMomentCommentModel {
  id: string // 评论ID
  momentId: string // 动态ID
  userId: string // 用户ID
  userName: string // 用户名
  nickName?: string // 昵称（兼容旧字段）
  avatar?: string // 用户头像
  content: string // 评论内容
  createdAt: string // 评论时间
  replyTo?: IMomentCommentModel // 回复的评论（如果有）
}

// 动态模型
export interface IMomentModel {
  id: string // 动态ID
  userId: string // 用户ID
  userName: string // 用户名
  avatar: string // 用户头像
  content: string // 动态内容
  files: IFileInfo[] // 文件信息列表
  comments: IMomentCommentModel[] // 评论列表
  likes: IMomentLikeModel[] // 点赞列表
  createdAt: string // 动态创建时间
}

// 朋友圈信息 (前端使用的简化版本)
export interface IMomentInfo {
  id: string
  userId: string
  userName: string
  nickName?: string // 兼容旧字段
  avatar: string
  content: string
  files: IFileInfo[]
  comments: IMomentCommentModel[]
  likes: IMomentLikeModel[]
  createdAt: string
  // 以下字段为计算属性
  likeCount?: number
  commentCount?: number
  isLiked?: boolean
}

// 获取朋友圈列表响应
export interface IGetMomentListRes {
  count: number
  list: IMomentInfo[]
}

// 点赞朋友圈请求
export interface ILikeMomentReq {
  momentId: string
  status: boolean // true: 点赞 false: 取消点赞
}

// 点赞朋友圈响应
export interface ILikeMomentRes {
  // 空响应
}

// 删除朋友圈请求
export interface IDeleteMomentReq {
  momentId: string
}

// 删除朋友圈响应
export interface IDeleteMomentRes {
  // 空响应
}

// 获取单个动态详情请求
export interface IGetMomentInfoReq {
  momentId: string
}

// 获取单个动态详情响应
export interface IGetMomentInfoRes {
  moment: IMomentModel
}

// 评论信息
export interface ICommentInfo {
  commentId: string
  userId: string
  nickName: string
  avatar: string
  content: string
  createTime: string
  canDelete: boolean
}

// 获取评论列表请求
export interface IGetCommentListReq {
  momentId: string
  page: number
  limit: number
}

// 获取评论列表响应
export interface IGetCommentListRes {
  count: number
  list: ICommentInfo[]
}

// 创建评论请求
export interface ICreateCommentReq {
  momentId: string
  content: string
}

// 创建评论响应
export interface ICreateCommentRes {
  commentId: string
  message: string
}

// 删除评论请求
export interface IDeleteCommentReq {
  commentId: string
}

// 删除评论响应
export interface IDeleteCommentRes {
  message: string
}