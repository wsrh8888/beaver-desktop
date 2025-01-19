
class Logger {
  logName: string
  constructor(name = '') {
    this.logName = name
  }

  info = (msg: string) => {
    this.sendLog('info', msg)
  }

  warn = (msg: string) => {
    this.sendLog('warn', msg)
  }

  error = (msg: string) => {
    this.sendLog('error', msg)
  }

  sendLog = (level: string, msg: string) => {
    const data = this.logName
      ? `[${this.logName}] ${msg}`
      : `${msg}`
    const conmmonLog = console[level]
    conmmonLog(level, data)
    window.electron?.log(level, data)
    window.miniApp?.log(level, data)

  }
}

export default Logger
