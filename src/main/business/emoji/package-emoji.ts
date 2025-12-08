import { EmojiPackageEmojiService } from 'mainModule/database/services/emoji/package-emoji'

export class EmojiPackageEmojiBusiness {
  async getEmojisByPackageIds(packageIds: number[]) {
    return await EmojiPackageEmojiService.getEmojisByPackageIds(packageIds)
  }
}
