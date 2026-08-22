import { NotificationCircleCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { circleSyncApi } from 'mainModule/api/circle'
import dbServiceCircle from 'mainModule/database/services/circle/circle'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'

class CircleBusiness {
  async getCircleList() {
    return dbServiceCircle.getCircleList()
  }

  /**
   * WS 推送圈子资料变更后，按本地版本增量拉取并通知渲染进程刷新
   */
  async handleTableUpdates(circleId: string, version: number) {
    if (!circleId)
      return

    const local = await dbServiceCircle.getCircleById(circleId)
    const localVersion = local?.version || 0
    if (localVersion >= version)
      return

    const response = await circleSyncApi({ version: localVersion })
    const list = response.result?.list || []
    if (!list.length)
      return

    const localCircles = list.map(item => ({
      circleId: item.circleId,
      name: item.name,
      avatar: item.avatar || '',
      memberCount: item.memberCount || 0,
      role: item.role || 0,
      version: item.version || 0,
    }))
    await dbServiceCircle.batchUpsert(localCircles)

    sendMainNotification('*', NotificationModule.DATABASE_CIRCLE, NotificationCircleCommand.CIRCLE_UPDATE, {
      updatedCircles: localCircles.map(item => ({
        circleId: item.circleId,
        version: item.version,
      })),
    })
  }
}

export default new CircleBusiness()
