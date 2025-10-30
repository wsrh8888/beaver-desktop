/// <reference types="vite/client" />

import type { ElectronAPP } from 'commonModule/type/preload'

declare global {
  interface Window {
    electron: ElectronAPP
  }
}
