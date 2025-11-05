import groupSyncModule from './group'
import groupJoinRequestSyncModule from './group-join-request'
import groupMemberSyncModule from './group-member'

export const groupDatasync = new class groupDatasync {
  async checkAndSync() {
    // 同步顺序：先同步群组基本信息，再同步群成员和入群申请
    await groupSyncModule.checkAndSync() // 1. 群组基本信息
    await groupMemberSyncModule.checkAndSync() // 2. 群成员
    await groupJoinRequestSyncModule.checkAndSync() // 3. 入群申请
  }
}()
