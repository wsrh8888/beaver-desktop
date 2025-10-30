import type { ILogger } from 'commonModule/type/logger'
import path from 'node:path'
import log4js from 'log4js'
import { getRootPath } from 'mainModule/config'
import moment from 'moment'

class Logger {
  private filePath: string
  constructor() {
    this.filePath = getRootPath()
    this.init()
  }

  init() {
    const dateStr = moment().format('YYYY-MM-DD')
    log4js.configure({
      appenders: {
        out: { type: 'stdout' }, // 设置是否在控制台打印日志
        info: { type: 'file', filename: `${path.resolve(this.filePath)}/logs/${dateStr}.log` },
        error: { type: 'file', filename: `${path.resolve(this.filePath)}logs/${dateStr}.log` },
      },
      categories: {
        default: { appenders: ['out', 'info'], level: 'info' }, // 去掉'out'。控制台不打印日志
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
