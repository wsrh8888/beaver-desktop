import circleBusiness from 'mainModule/business/circle/circle'

/**
 * @description: 圈子资料接收器 - 处理 circles 表更新
 */
class CircleReceiver {
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tables } = tableUpdatesBody

    for (const update of tables || []) {
      switch (update.table) {
        case 'circles':
          for (const dataItem of update.data || []) {
            if (dataItem?.circleId && dataItem?.version) {
              await circleBusiness.handleTableUpdates(dataItem.circleId, dataItem.version)
            }
          }
          break
        default:
          break
      }
    }
  }
}

export default new CircleReceiver()
