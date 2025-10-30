/**
 * User-Agent 工具类
 * 用于生成Electron应用的自定义User-Agent标识
 */

/**
 * 生成自定义User Agent标识
 * @param version 应用版本号
 * @returns 自定义标识字符串
 */
export function generateUserAgentIdentifier(version: string = '1.1.0'): string {
  const platform = process.platform
  const arch = process.arch

  // 构建标识符
  let identifier = ''
  if (platform === 'win32') {
    identifier = arch === 'arm64' ? 'beaver_desktop_windows_arm64' : 'beaver_desktop_windows_x64'
  }
  else if (platform === 'darwin') {
    identifier = arch === 'arm64' ? 'beaver_desktop_macos_arm64' : 'beaver_desktop_macos_x64'
  }
  else if (platform === 'linux') {
    identifier = arch === 'arm64' ? 'beaver_desktop_linux_arm64' : 'beaver_desktop_linux_x64'
  }

  return `BeaverDesktop/${version} ${identifier}`
}
