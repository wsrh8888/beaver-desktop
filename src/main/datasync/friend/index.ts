import { friendSyncModule } from './friend'
import { friendVerifySyncModule } from './friend-verify'

export const friendDatasync = new class friendDatasync {
  async checkAndSync() {
    // 并行同步好友数据和好友验证数据
    await Promise.all([
      friendSyncModule.checkAndSync(),
      friendVerifySyncModule.checkAndSync(),
    ])
  }
}()
