export interface IAuthModule {
  /**
   * @description: 登录
   */
  login(): Promise<void>
  /**
   * @description: 登出
   */
  logout(): Promise<void>
}
