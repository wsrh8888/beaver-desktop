import { userSyncModule } from './user'

export const userDatasync = new class userDatasync {
  async checkAndSync() {
    // 同步用户数据
    await userSyncModule.checkAndSync()
  }
}()
