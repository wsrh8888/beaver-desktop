import type { UserInfo } from 'commonModule/type/business/user'
import { UserService } from 'mainModule/database/services/user/user'

/**
 * 用户业务逻辑
 * 对应 users 表
 * 负责用户管理的业务逻辑
 */
export class UserBusiness {

}

// 导出单例实例
export const userBusiness = new UserBusiness()
