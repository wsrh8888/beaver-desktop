import type { IGetEmojiPackagesByIdsReq, IGetEmojiPackagesByIdsRes } from 'commonModule/type/ajax/emoji'
import { EmojiPackageService } from 'mainModule/database/services/emoji/package'

export class EmojiPackageBusiness {
  async getEmojiPackagesByIds(params: IGetEmojiPackagesByIdsReq): Promise<IGetEmojiPackagesByIdsRes> {
    const ids = params?.ids || []
    const packageMap = await EmojiPackageService.getPackagesByIds(ids)

    const packages = ids
      .map((id) => {
        const pkg = packageMap.get(id)
        if (!pkg) return null
        return {
          packageId: pkg.uuid,
          uuid: pkg.uuid,
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
}
