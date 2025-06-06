declare namespace NodeJS {
  import { BrowserWindow } from "electron";

  interface Process {
    custom: {
      /**
       * @description: 环境变量
       */      
      ENV: 'prod' | 'test';
      /**
       * @description: 是否开启工具
       */
      TOOLS: boolean
      /**
       * @description: token
       */      
      TOKEN: string
      /**
       * @description: 设备唯一标识
       */
      DEVICE_ID: string
    };
  }
}

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface Performance {
  memory?: PerformanceMemory;
}