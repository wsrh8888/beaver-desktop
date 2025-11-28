import { emojiController } from './controller'
import { emojiSyncModule } from './emoji'

export const emojiDatasync = new class emojiDatasync {
  async checkAndSync() {
    // 并行同步表情数据和表情收藏数据
    await Promise.all([
      emojiSyncModule.checkAndSync(), // emoji表同步
      emojiController.checkAndSync(), // 其他表情相关表同步
    ])
  }
}()
