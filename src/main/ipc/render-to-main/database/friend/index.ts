import { DataFriendCommand } from 'commonModule/type/ipc/database'
import { FriendService } from 'mainModule/database/services/friend/friend'
import { FriendVerifyService } from 'mainModule/database/services/friend/friend_verify'
import { friendBusiness } from 'mainModule/business/friend/friend'
import { store } from 'mainModule/store'
import { ICommonHeader } from 'commonModule/type/ajax/common'

export class FriendHandler {
  /**
   * 处理用户相关的数据库命令
   */
  static async handle(_event: Electron.IpcMainInvokeEvent, command: DataFriendCommand, data: any, header: ICommonHeader): Promise<any> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }
    switch (command) {
      case DataFriendCommand.GET_FRIENDS:
        return await friendBusiness.getFriendsList(header, data)
      case DataFriendCommand.GET_VALID_LIST:
        return await FriendVerifyService.getValidList(header, data)
      case DataFriendCommand.GET_FRIENDS_BY_VER_RANGE:
        return await FriendService.getFriendsByVerRange(header, data)
      case DataFriendCommand.GET_VALID_BY_VER_RANGE:
        return await FriendVerifyService.getValidByVerRange(header, data)
      default:
        throw new Error('好友数据库命令处理失败')
    }
  }
}
