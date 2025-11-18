import type { IStoreDataMap, IStoreKey, IStoreOptions, IStoreValue } from '../mainStore'

/**
 * @description: 数据存储模块接口
 */
export interface IStorageModule {
  /**
   * 获取指定键的数据（类型安全）。
   * @param key - 数据的键，必须是 StoreDataMap 中定义的键。
   * @returns Promise<StoreValue<T> | undefined> - 返回存储的数据，类型安全。
   */
  getAsync<T extends keyof IStoreDataMap>(key: IStoreKey<T>, options?: IStoreOptions): Promise<IStoreValue<T> | undefined>

  /**
   * 设置键值对数据（类型安全）。
   * @param key - 数据的键，必须是 StoreDataMap 中定义的键。
   * @param value - 数据的值，必须符合 StoreDataMap 中定义的类型。
   * @param options - 存储选项。
   * @returns Promise<void> - 操作完成的 Promise。
   */
  setAsync<T extends keyof IStoreDataMap>(key: IStoreKey<T>, value: IStoreValue<T>, options?: IStoreOptions): Promise<void>

  /**
   * 删除指定键的数据。
   * @param key - 要删除的数据的键。
   * @returns Promise<void> - 操作完成的 Promise。
   */
  removeAsync(key: string): Promise<void>

}
