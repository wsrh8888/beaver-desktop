import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataCircleCommand } from 'commonModule/type/ipc/database'
import circleBusiness from 'mainModule/business/circle/circle'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

const loggerName = 'circle-handler'

class CircleHandler {
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataCircleCommand, _data: any, _header: ICommonHeader): Promise<any> {
    logger.info({ text: '处理圈子命令', data: { command } }, loggerName)
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    switch (command) {
      case DataCircleCommand.GET_CIRCLE_LIST:
        return {
          list: await circleBusiness.getCircleList(),
        }
      default:
        throw new Error('圈子数据库命令处理失败CircleHandler')
    }
  }
}

export default new CircleHandler()
