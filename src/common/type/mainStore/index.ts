export interface IStoreOptions {
  /**
   * @description: 是否持久化到文件
   * @default false 内存存储
   * @type boolean
   */
  persist?: boolean
}

// Store 接口定义
export interface IStore {
  get<T extends keyof IStoreDataMap>(key: IStoreKey<T>): IStoreValue<T> | undefined
  set<T extends keyof IStoreDataMap>(key: IStoreKey<T>, value: IStoreValue<T>, options?: IStoreOptions): void
  delete(key: string, options?: IStoreOptions): void
}

// 当前存储的数据类型
export interface IStoreDataMap {
  userInfo: {
    token?: string
    userId?: string
  }
  allUser: Record<string, {
    userId: string
    nickName: string
    avatar: string
    abstract?: string
    phone?: string
    email?: string
    gender?: number
    version?: number
  }>
  searchResults: {
    type: string
    id: string
    title: string
    source: string
    avatar: string
  }
}

// 获取存储键对应的类型
export type IStoreKey<T extends keyof IStoreDataMap> = T
export type IStoreValue<T extends keyof IStoreDataMap> = IStoreDataMap[T]
