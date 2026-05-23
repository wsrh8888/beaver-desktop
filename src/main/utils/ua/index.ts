/**
 * User-Agent 工具类
 * 用于生成Electron应用的自定义User-Agent标识
 * 对标大厂格式：BeaverDesktop/1.1.0 (windows; x64) device_id/xxx
 */

/**
 * 生成符合后端识别规则的 User-Agent
 * 后端通过 contains 匹配平台关键字：beaver_desktop_windows / beaver_desktop_macos / beaver_desktop_linux
 * @returns User-Agent 字符串
 */
export function generateUserAgentIdentifier(): string {
  const version = process.custom.VERSION
  const deviceId = process.custom.DEVICE_ID
  const platformName = process.custom.PLATFORM
  const arch = process.arch

  // 架构名称（标准化）
  const archName = arch === 'arm64' ? 'arm64' : 'x64'

  // 格式：BeaverDesktop/1.1.0 (windows; x64) device_id/abc123
  return `BeaverDesktop/${version} (${platformName}; ${archName}) device_id/${deviceId}`
}
