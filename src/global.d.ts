import {ElectronAPP} from 'commonModule/type/preload/window'

// global.d.ts
interface ElectronAPP {
  preloadPath: string;
  // 其他属性和方法
}

declare global {
  var electron: ElectronAPP;
  interface Window  {
    electron: ElectronAPP;
    
  }
}

