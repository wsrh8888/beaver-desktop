import circleReceiver from './circle'

/**
 * @description: 圈子消息路由器
 */
class CircleMessageRouter {
  private circleReceiver = circleReceiver

  async processCircleMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      console.warn('圈子消息缺少 type 字段', wsMessage)
      return
    }

    switch (data.type) {
      case 'circle_receive':
        await this.circleReceiver.handleTableUpdates(wsMessage.data.body)
        break
      default:
        console.warn('未知的圈子消息类型', data.type)
    }
  }
}

export default new CircleMessageRouter()
