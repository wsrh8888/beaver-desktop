import type { IGetEmojiPackageEmojisReq, IGetEmojiPackageEmojisRes, IGetEmojiPackagesByIdsReq, IGetEmojiPackagesByIdsRes } from 'commonModule/type/ajax/emoji'
import dBServiceEmojiPackageEmoji  from 'mainModule/database/services/emoji/package-emoji'
import dBServiceEmoji  from 'mainModule/database/services/emoji/emoji'
import dBServiceEmojiPackage  from 'mainModule/database/services/emoji/package'

class EmojiPackageBusiness {
  async getEmojiPackagesByIds(params: IGetEmojiPackagesByIdsReq): Promise<IGetEmojiPackagesByIdsRes> {
    const ids = params?.ids || []
    const packageMap = await dBServiceEmojiPackage.getPackagesByIds({ ids })

    const packages = ids
      .map((id) => {
        const pkg = packageMap.get(id)
        if (!pkg)
          return null
        return {
          packageId: pkg.packageId,
          title: pkg.title,
          coverFile: pkg.coverFile,
          userId: pkg.userId,
          description: pkg.description || '',
          type: pkg.type,
          status: pkg.status,
          collectCount: 0,
          createAt: pkg.createdAt,
          updateAt: pkg.updatedAt,
          version: pkg.version,
        }
      })
      .filter(Boolean) as IGetEmojiPackagesByIdsRes['packages']

    return { packages }
  }

  async getEmojiPackageEmojis(params: IGetEmojiPackageEmojisReq): Promise<IGetEmojiPackageEmojisRes> {
    const { packageId } = params
    console.log('getEmojiPackageEmojis called with packageId:', packageId)

    // 获取表情包关联数据
    const packageEmojis = await dBServiceEmojiPackageEmoji.getEmojisByPackageId({ packageId })
    console.log('packageEmojis found:', packageEmojis.length, packageEmojis)

    if (packageEmojis.length === 0) {
      return { list: [], total: 0 }
    }

    // 提取表情ID列表
    const emojiIds = packageEmojis.map(item => item.emojiId)
    console.log('emojiIds to query:', emojiIds)

    // 获取表情详情
    const emojiMap = await dBServiceEmoji.getEmojisByIds({ ids: emojiIds })
    console.log('emojiMap size:', emojiMap.size, 'keys:', Array.from(emojiMap.keys()))

    // 组装返回数据，按关联表的排序返回
    const list = packageEmojis
      .map(packageEmoji => {
        const emoji = emojiMap.get(packageEmoji.emojiId)

        // 如果表情详情不存在，创建基本信息（用于调试）
        if (!emoji) {
          console.warn(`表情 ${packageEmoji.emojiId} 详情不存在`)
          return {
            emojiId: packageEmoji.emojiId,
            name: `表情 ${packageEmoji.emojiId.slice(0, 8)}...`, // 临时名称
            icon: '', // 空图标
            version: packageEmoji.version || 0,
          }
        }

        return {
          emojiId: emoji.emojiId,
          name: emoji.title, // 将title映射为name
          icon: emoji.fileKey, // 将fileKey映射为icon
          version: emoji.version,
        }
      })

    return {
      list,
      total: list.length
    }
  }
}

export default new EmojiPackageBusiness()