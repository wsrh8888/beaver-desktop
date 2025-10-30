import type { IStore, IStoreDataMap, IStoreKey, IStoreOptions, IStoreValue } from 'commonModule/type/mainStore'
import path from 'node:path'
import ElectronStore from 'electron-store'
import { getRootPath } from 'mainModule/config'

/**
 * 这里不要引入其他的业务，否则容易死循环, 尤其是log
 */
class Store implements IStore {
  private static instance: Store
  private fileStore: ElectronStore
  private memoryStore: Map<string, any> = new Map()

  private constructor() {
    this.fileStore = new ElectronStore({
      defaults: {},
      cwd: path.resolve(getRootPath()),
      name: 'config',
      clearInvalidConfig: true, // 清除无效配置

    })

    // 初始化时将文件数据加载到内存中
    this.loadFileDataToMemory()
  }

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store()
    }
    return Store.instance
  }

  // 将文件数据加载到内存中
  private loadFileDataToMemory(): void {
    try {
      const fileData = this.fileStore.store
      for (const [key, value] of Object.entries(fileData)) {
        this.memoryStore.set(key, value)
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  // 类型安全的获取数据方法
  get<T extends keyof IStoreDataMap>(key: IStoreKey<T>): IStoreValue<T> | undefined {
    try {
      console.log('get', key)
      let _value = this.memoryStore.get(key)

      return _value
    }
    catch (error) {
      console.error(`Failed to get store value for key "${key}":`, error)
      return null
    }
  }

  clearAll(): void {
    this.memoryStore.clear()
    this.fileStore.clear()
  }

  // 类型安全的设置数据方法
  set<T extends keyof IStoreDataMap>(key: IStoreKey<T>, value: IStoreValue<T>, options: IStoreOptions = {}): void {
    try {
      let _value = value

      // 更新内存数据
      this.memoryStore.set(key, _value)

      // 如果需要持久化，直接写入文件（electron-store 已经内置了优化）
      if (options.persist) {
        this.fileStore.set(key, _value)
      }
    }
    catch (error) {
      console.error('Failed to set store value:', error)
    }
  }

  // 删除数据
  delete(key: string, options: IStoreOptions = {}): void {
    try {
      this.memoryStore.delete(key)
      // 如果需要持久化，直接删除文件
      if (options.persist) {
        this.fileStore.delete(key)
      }
    }
    catch (error) {
      console.error('Failed to delete store value:', error)
    }
  }
}

// 导出初始化方法和实例获取方法
export const initStore = () => {
  Store.getInstance()
}

export const store = Store.getInstance()
