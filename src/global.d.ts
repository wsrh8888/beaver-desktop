import type { ElectronAPP } from 'commonModule/type/preload'

declare global {
  const electron: ElectronAPP
  interface Window {
    electron: ElectronAPP
  }
}
