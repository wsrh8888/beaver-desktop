declare namespace NodeJS {

  interface Process {
    custom: {
      /**
       * @description: 环境变量
       */
      ENV: 'prod' | 'test' | 'dev'
      /**
       * @description: 是否开启工具
       */
      TOOLS: boolean
      /**
       * @description: 设备唯一标识
       */
      DEVICE_ID: string
      /**
       * @description: 应用版本
       */
      VERSION: string

      /**
       * @description: 操作系统平台
       * @values: 'windows' | 'mac' | 'linux' | 'ios' | 'android'
       */
      PLATFORM: string
    }
  }
}

interface PerformanceMemory {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

interface Performance {
  memory?: PerformanceMemory
}
