export interface IStoreOptions {
  /**
   * 是否持久化到文件，默认 false（内存存储）
   */
  persist?: boolean
}

// Store 接口定义
export interface IStore {
  get<T extends keyof StoreDataMap>(key: IStoreKey<T>): IStoreValue<T> | undefined
  set<T extends keyof StoreDataMap>(key: IStoreKey<T>, value: IStoreValue<T>, options?: IStoreOptions): void
  delete(key: string, options?: IStoreOptions): void
}

// 当前存储的数据类型
export interface StoreDataMap {
  userInfo: {
    token?: string
    userId?: string
  }
}

// 获取存储键对应的类型
export type IStoreKey<T extends keyof StoreDataMap> = T
export type IStoreValue<T extends keyof StoreDataMap> = StoreDataMap[T]
