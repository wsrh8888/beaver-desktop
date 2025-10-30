export interface DatabaseConfig {
  path: string
  pragmas: {
    journal_mode: string
    synchronous: string
    busy_timeout: string
    cache_size: string
  }
}

export interface IConfig {
  baseUrl: string
  wsUrl: string
  database: DatabaseConfig
}

export interface IConfigs {
  [key: string]: IConfig
}

export interface IElectronApp {
  env: string
}

export interface IElectron {
  app: IElectronApp
}

export interface IMiniApp {
  env: string
}
