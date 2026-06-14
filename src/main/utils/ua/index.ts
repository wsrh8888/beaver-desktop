/**
 * User-Agent 工具类
 * 对标大厂：型号 + 系统版本 + 设备名
 * BeaverDesktop/1.0.0 (windows; x64) device_id/xxx model/Windows-PC os/10.0.19045 name/DESKTOP-HOME
 */

import os from 'node:os'

function encodeUAToken(value: string): string {
  return encodeURIComponent(value)
}

export function generateUserAgentIdentifier(): string {
  const version = process.custom.VERSION
  const deviceId = process.custom.DEVICE_ID
  const platformName = process.custom.PLATFORM
  const arch = process.arch
  const archName = arch === 'arm64' ? 'arm64' : 'x64'
  const osVersion = os.release()
  const name = os.hostname()

  return `BeaverDesktop/${version} (${platformName}; ${archName}) device_id/${deviceId} model/${platformName} os/${osVersion} name/${encodeUAToken(name)}`
}
