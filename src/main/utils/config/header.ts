import { store } from 'mainModule/store'
import moment from 'moment'

export const getCommonParams = () => {
  const userInfo = store.get('userInfo') || {}

  return {
    source: 'beaver-desktop',
    timestamp: `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`,
    env: process.custom.ENV,
    deviceId: process.custom.DEVICE_ID,
    token: userInfo?.token,
  }
}
