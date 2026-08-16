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

export interface ICirclePostFile {
  fileKey: string
  type: number
}

export interface ICirclePostCommentPreview {
  commentId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface ICirclePostItem {
  postId: string
  circleId: string
  userId: string
  userName: string
  avatar: string
  content: string
  files?: ICirclePostFile[]
  commentCount: number
  likeCount: number
  isLiked: boolean
  comments?: ICirclePostCommentPreview[]
  createdAt: string
}

export interface ICircleCommentItem {
  commentId: string
  userId: string
  userName: string
  avatar: string
  content: string
  parentId: string
  replyToCommentId: string
  replyToUserName: string
  childCount: number
  children: ICircleCommentItem[]
  createdAt: string
}

export interface ICircleMemberItem {
  userId: string
  userName: string
  avatar: string
  role: number
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

export interface IGetCircleDetailReq {
  circleId: string
}

export interface IGetCircleDetailRes {
  circleId: string
  name: string
  description: string
  avatar: string
  memberCount: number
  postCount: number
  joinType: number
  role: number
  creatorId?: string
}

export interface IUpdateCircleReq {
  circleId: string
  name?: string
  description?: string
  avatar?: string
  joinType?: number
}

export interface IUpdateCircleRes {}

export interface IQuitCircleReq {
  circleId: string
}

export interface IQuitCircleRes {}

export interface IDeleteCircleReq {
  circleId: string
}

export interface IDeleteCircleRes {}

export interface ICircleSyncReq {
  version: number
}

export interface ICircleSyncItem {
  circleId: string
  name: string
  avatar: string
  memberCount: number
  role: number
  version: number
}

export interface ICircleSyncRes {
  list: ICircleSyncItem[]
}

export interface IGetCircleMembersReq {
  circleId: string
  page: number
  limit: number
}

export interface IGetCircleMembersRes {
  count: number
  list: ICircleMemberItem[]
}

export interface IInviteCircleMembersReq {
  circleId: string
  userIds: string[]
}

export interface IInviteCircleMembersRes {}

export interface IRemoveCircleMembersReq {
  circleId: string
  userIds: string[]
}

export interface IRemoveCircleMembersRes {}

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
  content: string
  files?: ICirclePostFile[]
}

export interface ICreatePostRes {
  postId: string
  circleId: string
  userId: string
  userName: string
  avatar: string
  content: string
  createdAt: string
}

export interface ICirclePostLikeItem {
  userId: string
  userName: string
  avatar: string
  createdAt?: string
}

export interface IGetPostLikesReq {
  postId: string
  page: number
  limit: number
}

export interface IGetPostLikesRes {
  count: number
  list: ICirclePostLikeItem[]
}

export interface IGetPostDetailReq {
  postId: string
}

export interface IGetPostDetailRes {
  postId: string
  circleId: string
  userId: string
  userName: string
  avatar: string
  content: string
  files?: ICirclePostFile[]
  commentCount: number
  likeCount: number
  isLiked: boolean
  isTop?: boolean
  comments: ICircleCommentItem[]
  likes: ICirclePostLikeItem[]
  createdAt: string
}

export interface ILikePostReq {
  postId: string
  status: boolean
}

export interface ILikePostRes {}

export interface ICreateCommentReq {
  postId: string
  content: string
  parentId?: string
  replyToCommentId?: string
}

export interface ICreateCommentRes {
  commentId: string
  postId: string
  userId: string
  userName: string
  avatar: string
  content: string
  parentId: string
  replyToCommentId: string
  replyToUserName: string
  createdAt: string
}

export interface IGetCommentListReq {
  postId: string
  parentId?: string
  page: number
  limit: number
}

export interface IGetCommentListRes {
  count: number
  list: ICircleCommentItem[]
}

export interface IDeleteCommentReq {
  commentId: string
}

export interface IDeleteCommentRes {}
