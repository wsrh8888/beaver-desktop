/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const src: string
  export default src
}

/** 渲染进程 preload 桥；完整类型仍在宿主 commonModule/type/preload */
declare const electron: any
