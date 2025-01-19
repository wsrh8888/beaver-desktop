import log4js from 'log4js'
import moment from 'moment'
import { getRootPath } from 'mainModule/utils/config'
import path from 'node:path'

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
        error: { type: 'file', filename: `${path.resolve(this.filePath)}logs/${dateStr}.log` }
      },
      categories: {
        default: { appenders: ['out', 'info'], level: 'info' } // 去掉'out'。控制台不打印日志
      }
    })
  }


  formatLog(level: string, msg: string) {
    return {
      contents: {
        level: level,
        message: `${msg}`
      },
      time: new Date().getTime()
    }
  }
  transformName(source: string, name = '') {
   return `[${source}${name ? `-${name}` : ''}] `
  }
  info(msg: string, source = 'main', name = '') {
    return log4js.getLogger('info').info(this.transformName(source, name) + msg)
  }

  warn(msg: string, source = 'main', name = '') {
    return log4js.getLogger('warn').warn(this.transformName(source, name) + msg)
  }

  error(msg: string, source = 'main', name = '') {
    return log4js.getLogger('error').error(this.transformName(source, name) + msg)
  }
  
}

export default new Logger()
