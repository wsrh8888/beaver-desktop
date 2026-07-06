export interface ICircleListItem {
  circleId: string
  name: string
  avatar?: string
  description?: string
  memberCount: number
  postCount?: number
  joinType?: number
  role: number
}

export interface ICirclePostItem {
  postId: string
  circleId: string
  userId: string
  userName: string
  avatar: string
  title: string
  content: string
  commentCount: number
  likeCount: number
  isLiked: boolean
  createdAt: string
}

export interface IGetMyCircleListReq {
  page: number
  limit: number
}

export interface IGetMyCircleListRes {
  count: number
  list: ICircleListItem[]
}

export interface ISearchCircleReq {
  keywords: string
  page: number
  limit: number
}

export interface ISearchCircleRes {
  count: number
  list: ICircleListItem[]
}

export interface ICreateCircleReq {
  name: string
  description?: string
  avatar?: string
  joinType?: number
}

export interface ICreateCircleRes {
  circleId: string
  name: string
  description: string
  avatar: string
  joinType: number
  creatorId: string
  createdAt: string
}

export interface IJoinCircleReq {
  circleId: string
  reason?: string
}

export interface IJoinCircleRes {
  status: number
}

export interface IGetPostListReq {
  circleId: string
  page: number
  limit: number
}

export interface IGetPostListRes {
  count: number
  list: ICirclePostItem[]
}

export interface ICreatePostReq {
  circleId: string
  title?: string
  content: string
}

export interface ICreatePostRes {
  postId: string
  circleId: string
  userId: string
  userName: string
  avatar: string
  title: string
  content: string
  createdAt: string
}

export interface ILikePostReq {
  postId: string
  status: boolean
}

export interface ILikePostRes {}
