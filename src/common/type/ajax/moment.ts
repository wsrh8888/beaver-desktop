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
  type: number // 文件类型：2=图片 3=视频 8=音频 4=文件 (与MsgType枚举保持一致)
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
  userId?: string // 用户ID（可不传，已在请求头处理）
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
  childCount?: number // 子评论数量
  parentId?: string // 根评论ID（两层结构下为顶层ID）
  replyToCommentId?: string // 被回复的评论ID
  replyToUserName?: string // 被回复用户昵称
  children?: IMomentCommentModel[] // 子评论（最多两层展示）
  createdAt: string // 评论时间
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
  count: number // 总数
  list: {
    id: string // 动态ID
    userId: string // 用户ID
    userName: string // 用户名
    avatar: string // 用户头像
    content: string // 动态内容
    files: IFileInfo[] // 文件信息列表
    comments: IMomentCommentModel[] // 评论列表（最多3条最新评论）
    likes: IMomentLikeModel[] // 点赞列表（最多10个最新点赞）
    commentCount: number // 总评论数
    likeCount: number // 总点赞数
    isLiked: boolean // 当前用户是否已点赞
    createdAt: string // 动态创建时间
  }[]
}

// 点赞朋友圈请求
export interface ILikeMomentReq {
  userId?: string // 用户ID（可不传，已在请求头处理）
  momentId: string
  status: boolean // true: 点赞 false: 取消点赞
}

// 点赞朋友圈响应
export interface ILikeMomentRes {
  // 空响应
}

// 删除朋友圈请求
export interface IDeleteMomentReq {
  userId?: string // 用户ID（可不传，已在请求头处理）
  momentId: string
}

// 删除朋友圈响应
export interface IDeleteMomentRes {
  // 空响应
}

// 创建评论请求
export interface ICreateMomentCommentReq {
  userId?: string // 用户ID（可不传，已在请求头处理）
  momentId: string // 动态ID
  content: string // 评论内容
  parentId?: string // 顶层评论ID（两层结构）
  replyToCommentId?: string // 被回复的评论ID
}

// 创建评论响应
export interface ICreateMomentCommentRes {
  id: string // 评论ID
  userId: string // 用户ID
  userName: string // 用户昵称
  avatar: string // 用户头像
  content: string // 评论内容
  parentId: string // 顶层评论ID
  replyToCommentId: string // 被回复的评论ID
  replyToUserName: string // 被回复用户昵称
  createdAt: string // 评论时间
}

// 获取动态详情请求
export interface IGetMomentDetailReq {
  userId?: string // 用户ID（可不传，已在请求头处理）
  momentId: string
}

// 获取动态详情响应
export interface IGetMomentDetailRes {
  id: string // 动态ID
  userId: string // 用户ID
  userName: string // 用户名
  avatar: string // 用户头像
  content: string // 动态内容
  files: IFileInfo[] // 文件信息列表
  comments: IMomentCommentModel[] // 最新20条评论
  likes: IMomentLikeModel[] // 最新50个点赞
  commentCount: number // 总评论数
  likeCount: number // 总点赞数
  isLiked: boolean // 当前用户是否已点赞
  createdAt: string // 动态创建时间
}

// 获取动态评论列表请求
export interface IGetMomentCommentsReq {
  userId?: string // 用户ID（可不传，已在请求头处理）
  momentId: string // 动态ID
  parentId?: string // 顶层评论ID，传则获取其子评论
  page: number // 页码
  limit: number // 每页数量
}

// 获取动态评论列表响应
export interface IGetMomentCommentsRes {
  count: number // 总数
  list: IMomentCommentModel[] // 评论列表
}

// 获取动态点赞列表请求
export interface IGetMomentLikesReq {
  userId?: string // 用户ID（可不传，已在请求头处理）
  momentId: string // 动态ID
  page: number // 页码
  limit: number // 每页数量
}

// 获取动态点赞列表响应
export interface IGetMomentLikesRes {
  count: number // 总数
  list: IMomentLikeModel[] // 点赞列表
}
