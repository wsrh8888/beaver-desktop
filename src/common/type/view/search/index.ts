export interface ISearchResult {
  /**
   * 用户/群组 ID
   */
  id: string
  /**
   * 会话ID
   */
  conversationId: string
  /**
   * 标题
   */
  title: string
  /**
   * 头像
   */
  avatar: string
  /**
   * 类型
   */
  type: 'friend' | 'group'

  source: string
}
