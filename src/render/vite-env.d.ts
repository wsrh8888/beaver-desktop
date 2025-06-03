/// <reference types="vite/client" />

import {ElectronAPP} from 'commonModule/type/preload/window'



declare global {
  interface Window  {
    electron: ElectronAPP;    
  }
}