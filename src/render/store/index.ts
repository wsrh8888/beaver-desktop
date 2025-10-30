class CommonStore {
  userInfo = {
    token: '',
    userId: '',
  }

  constructor() {
    setTimeout(async () => {
      await this.updateUserInfo()
    }, 0)
  }

  async updateUserInfo() {
    this.userInfo = await electron.storage.getAsync('userInfo') || {}
  }
}
export default new CommonStore()
