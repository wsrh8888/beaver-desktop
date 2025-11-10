import groupSync from './group'
import groupJoinRequestSync from './group-join-request'
import groupMemberSync from './group-member'

// 群组数据同步统一入口
// 独立同步三个模块：群资料、群成员、入群申请
export const groupDatasync = new class GroupDatasync {
  async checkAndSync() {
    // 并行执行所有群组相关同步器
    await Promise.all([
      groupSync.checkAndSync(), // 群资料同步
      groupMemberSync.checkAndSync(), // 群成员同步
      groupJoinRequestSync.checkAndSync(), // 入群申请同步
    ])
  }
}()
