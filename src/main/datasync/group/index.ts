import groupUnifiedSyncManager from './group-unified-sync'

// 群组数据同步统一入口（大厂IM标准架构）
// 不再分别同步三个模块，而是统一管理所有群组相关数据的增量同步
export const groupDatasync = new class GroupDatasync {
  async checkAndSync() {
    // 使用统一同步管理器：批量获取版本信息 → 批量增量同步 → 分发到各个数据域
    await groupUnifiedSyncManager.checkAndSync()
  }
}()
