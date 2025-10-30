import moment from 'moment'
import commonStore from 'renderModule/store'

export const getCommonParams = () => {
  return {
    source: 'beaver-desktop',
    timestamp: `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}`,
    env: electron.app.env,
    deviceId: electron.app.devicedId,
    token: commonStore.userInfo.token,
  }
}
