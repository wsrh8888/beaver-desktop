import type { ILogger } from 'commonModule/type/logger'
import path from 'node:path'
import { CacheType } from 'commonModule/type/cache/cache'
import log4js from 'log4js'
import { cacheTypeToFilePath } from 'mainModule/cache/config'
import { getCachePath } from 'mainModule/config'
import moment from 'moment'

class Logger {
  constructor() {
    // 默认初始化为公共日志
    this.init()
  }

  init(userId?: string) {
    const dateStr = moment().format('YYYY-MM-DD')

    // 根据是否有userId决定使用哪个日志路径
    const logPath = userId
      ? cacheTypeToFilePath[CacheType.USER_LOGS].replace('[userId]', userId)
      : cacheTypeToFilePath[CacheType.PUBLIC_LOGS]

    const fullLogPath = path.join(getCachePath(), logPath, `${dateStr}.log`)

    log4js.configure({
      appenders: {
        out: { type: 'stdout' },
        main: { type: 'file', filename: fullLogPath },
      },
      categories: {
        default: { appenders: ['out', 'main'], level: 'info' },
      },
    })
  }

  formatLog(level: string, msg: string) {
    return {
      contents: {
        level,
        message: `${msg}`,
      },
      time: new Date().getTime(),
    }
  }

  transformName(source: string, name = '') {
    return `[${source}${name ? `-${name}` : ''}] `
  }

  info(msg: ILogger, moduleName = '', source = 'main') {
    const message = JSON.stringify(msg)
    return log4js.getLogger('info').info(this.transformName(source, moduleName) + message)
  }

  warn(msg: ILogger, moduleName = '', source = 'main') {
    const message = JSON.stringify(msg)
    return log4js.getLogger('warn').warn(this.transformName(source, moduleName) + message)
  }

  error(msg: ILogger, moduleName = '', source = 'main') {
    const message = JSON.stringify(msg)
    return log4js.getLogger('error').error(this.transformName(source, moduleName) + message)
  }
}

export default new Logger()
