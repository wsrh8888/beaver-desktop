import type { IGetLatestVersionRes } from 'commonModule/type/ajax/update'
import { defineStore } from 'pinia'
import { getLatestVersionApi } from 'renderModule/api/update'

/**
 * @description: 更新状态管理
 * 简化的更新检查，只需要知道是否有更新
 */
export const useUpdateStore = defineStore('update', {
  state: () => ({
    updateInfo: {} as IGetLatestVersionRes,

  }),

  actions: {
    /**
     * @description: 初始化更新检查（应用启动时调用）
     */
    async init() {
      try {
        await this.checkUpdate()
      }
      catch (error) {
        console.warn('初始化更新检查失败:', error)
      }
    },

    /**
     * @description: 检查更新
     */
    async checkUpdate() {
      try {
        const response = await getLatestVersionApi({
          appId: '87c9dc499cc34f32896a4537e66cf65e',
          platformId: 1,
          archId: 1,
        })

        if (response.code === 0) {
          this.updateInfo = response.result
        }
      }
      catch (error) {
        console.error('检查更新异常:', error)
      }
    },

    /**
     * @description: 开始更新（打开更新窗口）
     */
    async startUpdate() {
      console.log('开始更新')
      // 通过IPC通知主进程打开更新窗口
      await electron.window?.openWindow('updater', {
        params: {
          hasUpdate: this.updateInfo.hasUpdate,
          version: this.updateInfo.version,
          fileKey: this.updateInfo.fileKey,
          size: this.updateInfo.size,
          md5: this.updateInfo.md5,
          description: this.updateInfo.description,
          releaseNotes: this.updateInfo.releaseNotes,
        },
      })
    },
  },
})
