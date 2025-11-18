import type { ILogger } from 'commonModule/type/logger'
import Log from '../log'

export default class Logger {
  logName: string
  constructor(name = '') {
    this.logName = name
  }

  info = (msg: ILogger) => {
    this.sendLog('info', msg)
  }

  warn = (msg: ILogger) => {
    this.sendLog('warn', msg)
  }

  error = (msg: ILogger) => {
    this.sendLog('error', msg)
  }

  sendLog = (level: 'info' | 'warn' | 'error', msg: ILogger) => {
    Log[level](msg, this.logName, 'main')
  }
}
