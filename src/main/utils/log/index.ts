import type { ILogger } from 'commonModule/type/logger'
import { getLogId } from 'commonModule/config'
import path from 'node:path'
import { CacheType } from 'commonModule/type/cache/cache'
import log4js from 'log4js'
import { logEventsApi } from 'mainModule/api/track'
import { cacheTypeToFilePath } from 'mainModule/cache/config'
import { getCachePath } from 'mainModule/config'
import { store } from 'mainModule/store'
import moment from 'moment'
import LogConsumer from './buffer-log/log-consumer'

class Log {
  private consumer: LogConsumer | null = null

  private getConsumer() {
    if (this.consumer == null) {
      this.consumer = new LogConsumer()
      this.consumer.registerWriter('cloud', {
        write: async (items) => {
          const bucketId = getLogId()
          if (!bucketId || !items.length) {
            return
          }
          const res = await logEventsApi({
            logs: items.map(item => ({
              level: item.level,
              bucketId,
              data: JSON.stringify(item),
              timestamp: item.timestamp,
            })),
          })
          if (res.code !== 0) {
            throw new Error(res.msg || '日志上报失败')
          }
        },
      }, true)
    }
    return this.consumer
  }

  init(userId?: string) {
    const dateStr = moment().format('YYYY-MM-DD')

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

    this.getConsumer()
  }

  formatLog(level: string, msg: ILogger, moduleName = '', source = 'main') {
    const userInfo = store.get('userInfo')
    return {
      level,
      message: `${JSON.stringify(msg)}`,
      module: moduleName,
      source,
      userId: userInfo?.userId || '',
      deviceId: process.custom.DEVICE_ID,
      platform: process.custom.PLATFORM,
      version: process.custom.VERSION,
      timestamp: Date.now(),
    }
  }

  transformName(source: string, name = '') {
    return `[${source}${name ? `-${name}` : ''}] `
  }

  private pushCloud(level: string, msg: ILogger, moduleName = '', source = 'main') {
    this.getConsumer().consume(this.formatLog(level, msg, moduleName, source))
  }

  info(msg: ILogger, moduleName = '', source = 'main') {
    const message = JSON.stringify(msg)
    console.log('info', this.transformName(source, moduleName) + message)
    this.pushCloud('info', msg, moduleName, source)
    return log4js.getLogger('info').info(this.transformName(source, moduleName) + message)
  }

  warn(msg: ILogger, moduleName = '', source = 'main') {
    const message = JSON.stringify(msg)
    console.warn('warn', this.transformName(source, moduleName) + message)
    this.pushCloud('warn', msg, moduleName, source)
    return log4js.getLogger('warn').warn(this.transformName(source, moduleName) + message)
  }

  error(msg: ILogger, moduleName = '', source = 'main') {
    const message = JSON.stringify(msg)
    console.error('error', this.transformName(source, moduleName) + message)
    this.pushCloud('error', msg, moduleName, source)
    return log4js.getLogger('error').error(this.transformName(source, moduleName) + message)
  }

  async stop(timeout = 3000) {
    if (this.consumer) {
      await this.consumer.stop(timeout)
    }
  }
}

export default new Log()
