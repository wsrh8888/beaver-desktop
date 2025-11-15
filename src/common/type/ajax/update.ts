// 更新类型枚举
export enum UpdateType {
  FORCE = 1, // 强制更新
  OPTIONAL = 2, // 可选更新
  SILENT = 3, // 静默更新
}

// 上报版本信息请求
export interface IReportVersionReq {
  deviceId: string // 客户端生成的设备唯一标识符
  appId: string // 应用ID
  platformId: number // 平台ID：1=Windows, 2=MacOS, 3=iOS, 4=Android, 5=HarmonyOS
  archId: number // 架构ID：0=h5, 1=WinX64, 2=WinArm64, 3=MacIntel, 4=MacApple, 5=iOS, 6=Android, 7=HarmonyOS
  version: string // 版本号
}

// 上报版本信息响应
export interface IReportVersionRes {
  message: string
}

// 获取最新版本请求
export interface IGetLatestVersionReq {
  appId: string // 应用ID
  platformId: number // 平台ID：1=Windows, 2=MacOS, 3=iOS, 4=Android, 5=HarmonyOS
  archId: number // 架构ID：1=WinX64, 2=WinArm64, 3=MacIntel, 4=MacApple, 5=iOS, 6=Android, 7=HarmonyOS
}

// 获取最新版本响应
export interface IGetLatestVersionRes {
  hasUpdate: boolean
  version?: string // 最新版本号
  fileKey: string // 文件ID
  size: number // 安装包大小
  md5: string // MD5校验
  description?: string // 版本描述
  releaseNotes?: string // 更新日志
}
