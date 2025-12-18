// 数据库服务基类
import dbManager from '../db'

export abstract class BaseService {
  protected get db() {
    return dbManager.db
  }
}
