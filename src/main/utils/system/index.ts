import si from 'systeminformation'
import { app, screen } from 'electron'

// 类型别名
type GraphicsData = si.Systeminformation.GraphicsData
type GraphicsControllerData = si.Systeminformation.GraphicsControllerData
type OsData = si.Systeminformation.OsData
type UserData = si.Systeminformation.UserData
type CpuData = si.Systeminformation.CpuData
type MemData = si.Systeminformation.MemData
type FsSizeData = si.Systeminformation.FsSizeData
type NetworkInterfacesData = si.Systeminformation.NetworkInterfacesData
type BatteryData = si.Systeminformation.BatteryData
type BiosData = si.Systeminformation.BiosData
type BaseboardData = si.Systeminformation.BaseboardData
type ProcessData = si.Systeminformation.ProcessesData
type LoadData = si.Systeminformation.CurrentLoadData
type NetworkStatsData = si.Systeminformation.NetworkStatsData
type UsbData = si.Systeminformation.UsbData

// 通用错误处理函数
const handleError = (error: any, defaultValue: any) => {
  console.error('Error:', error)
  return defaultValue
}

/**
 * @description: 获取图形硬件信息
 */
export const getGraphicsControllers = async (): Promise<GraphicsData | null> => {
  try {
    return await si.graphics()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取图形的显示器信息
 */
export const getGraphicsDisplays = async (): Promise<GraphicsControllerData[]> => {
  try {
    const info = await si.graphics()
    return info.controllers
  } catch (error) {
    return handleError(error, [])
  }
}

/**
 * @description: 当前系统设置的分辨率大小以及缩放值
 */
export const getPrimaryDisplay = async (): Promise<Electron.Display | null> => {
  try {
    await app.whenReady()
    return screen.getPrimaryDisplay()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取windows版本号
 */
export const getSystemOsInfo = async (): Promise<OsData | null> => {
  try {
    return await si.osInfo()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取系统用户名称
 */
export const getSystemUserInfo = async (): Promise<UserData[]> => {
  try {
    return await si.users()
  } catch (error) {
    return handleError(error, [])
  }
}

/**
 * @description: 获取CPU信息
 */
export const getCpuInfo = async (): Promise<CpuData | null> => {
  try {
    return await si.cpu()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取内存信息
 */
export const getMemoryInfo = async (): Promise<MemData | null> => {
  try {
    return await si.mem()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取磁盘信息
 */
export const getDiskInfo = async (): Promise<FsSizeData[] | null> => {
  try {
    return await si.fsSize() 
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取网络信息
 */
export const getNetworkInterfaces = async (): Promise<NetworkInterfacesData[] | null> => {
  try {
    return await si.networkInterfaces() as NetworkInterfacesData[]
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取电池信息
 */
export const getBatteryInfo = async (): Promise<BatteryData | null> => {
  try {
    return await si.battery()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取BIOS信息
 */
export const getBiosInfo = async (): Promise<BiosData | null> => {
  try {
    return await si.bios()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取主板信息
 */
export const getBaseboardInfo = async (): Promise<BaseboardData | null> => {
  try {
    return await si.baseboard()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取进程信息
 */
export const getProcessInfo = async (): Promise<ProcessData | null> => {
  try {
    return await si.processes()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取系统负载信息
 */
export const getLoadInfo = async (): Promise<LoadData | null> => {
  try {
    return await si.currentLoad()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取网络速度信息
 */
export const getNetworkStats = async (): Promise<NetworkStatsData[] | null> => {
  try {
    return await si.networkStats()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 获取USB设备信息
 */
export const getUsbInfo = async (): Promise<UsbData[] | null> => {
  try {
    return await si.usb()
  } catch (error) {
    return handleError(error, null)
  }
}

/**
 * @description: 批量获取所有系统信息
 */
export const getAllSystemInfo = async () => {
  const [
    graphics, displays, primaryDisplay, osInfo, users, cpu, memory, disk, network,
    battery, bios, baseboard, processes, load, networkStats, usb
  ] = await Promise.all([
    getGraphicsControllers(),
    getGraphicsDisplays(),
    getPrimaryDisplay(),
    getSystemOsInfo(),
    getSystemUserInfo(),
    getCpuInfo(),
    getMemoryInfo(),
    getDiskInfo(),
    getNetworkInterfaces(),
    getBatteryInfo(),
    getBiosInfo(),
    getBaseboardInfo(),
    getProcessInfo(),
    getLoadInfo(),
    getNetworkStats(),
    getUsbInfo()
  ])

  return {
    graphics,
    displays,
    primaryDisplay,
    osInfo,
    users,
    cpu,
    memory,
    disk,
    network,
    battery,
    bios,
    baseboard,
    processes,
    load,
    networkStats,
    usb
  }
}
