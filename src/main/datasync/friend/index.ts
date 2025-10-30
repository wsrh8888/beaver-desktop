import { friendSyncModule } from './friend'
import friendVerifySyncModule from './friend_verify'

export const friendDatasync = new class friendDatasync {
  async checkAndSync() {
    // 同步好友数据
    await friendSyncModule.checkAndSync()
    // 同步好友验证数据
    await friendVerifySyncModule.checkAndSync()
  }
}()
