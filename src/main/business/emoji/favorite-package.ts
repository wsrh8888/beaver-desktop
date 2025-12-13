import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetEmojiPackagesRes } from 'commonModule/type/ajax/emoji'
import { EmojiPackageService } from 'mainModule/database/services/emoji/package'
import { EmojiPackageCollectService } from 'mainModule/database/services/emoji/package-collect'

const ensureLogin = (header: ICommonHeader) => {
  if (!header.userId)
    throw new Error('用户未登录')
}

export class FavoritePackageBusiness {
  async getUserFavoritePackages(header: ICommonHeader): Promise<IGetEmojiPackagesRes> {
    ensureLogin(header)
    const collects = await EmojiPackageCollectService.getPackageCollectsByUserId(header.userId)
    const validCollects = collects.filter((item: any) => !item.isDeleted)
    const packageIds = validCollects.map((item: any) => item.packageId)
    const packageMap = await EmojiPackageService.getPackagesByIds(packageIds)

    const list = validCollects
      .map((item: any) => {
        const pkg = packageMap.get(item.packageId)
        if (!pkg)
          return null
        return {
          packageId: pkg.packageId,
          title: pkg.title,
          coverFile: pkg.coverFile,
          description: pkg.description || '',
          type: (pkg.type as any) || 'user',
          collectCount: 0,
          emojiCount: 0,
          isCollected: true,
          isAuthor: pkg.userId === header.userId,
        }
      })
      .filter(Boolean) as IGetEmojiPackagesRes['list']

    return { count: list.length, list }
  }
}
