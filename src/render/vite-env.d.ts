/// <reference types="vite/client" />

import {ElectronAPP} from 'commonModule/type/preload/window'
import {MiniApp} from 'commonModule/type/preload/minApp'



declare global {
  interface Window  {
    electron: ElectronAPP;
    miniApp: MiniApp;
    
  }
}