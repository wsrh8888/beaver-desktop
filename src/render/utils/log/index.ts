import type { ILogger } from 'commonModule/type/logger'

class Logger {
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
    const conmmonLog = console[level]
    conmmonLog(level, msg)
    window.electron.logger[level](msg, this.logName)
  }
}

export default Logger
