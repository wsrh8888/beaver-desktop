import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app } from 'electron'
import ini from 'ini'
import { machineIdSync } from 'node-machine-id'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getCachePath = () => {
  return path.resolve(getRootPath(), 'BEAVER_CACHE')
}

export const getRootPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname, '../')
  }
  // 获取 exe 文件的目录，然后取其父目录（因为 exe 在 electron 子目录下）
  const exePath = app.getPath('exe')
  return path.dirname(path.dirname(exePath))
}

export function initCustom() {
  // 使用 node-machine-id 获取真正的机器唯一标识
  // 这会返回一个 SHA-256 哈希值，确保每台机器的唯一性
  const deviceId = machineIdSync()
  process.custom = {
    ENV: 'prod',
    TOOLS: false,
    DEVICE_ID: deviceId,
    VERSION: getVersion(),
  }
}

const getVersion = () => {
  // 判断跟目录是否存在god.txt
  if (fs.existsSync(path.resolve(getExePath(), 'version'))) {
    // 读取文件内容
    return fs.readFileSync(path.resolve(getExePath(), 'version'), 'utf-8').trim()
  }
  return '1.0.0.0'
}

export function loadConfigs() {
  const configPaths = [
    path.resolve(__dirname, '../config.ini'),
    path.resolve(__dirname, '../../../config.ini'),
  ]
  configPaths.forEach(loadConfigFile)
}

function loadConfigFile(configPath: string) {
  if (fs.existsSync(configPath)) {
    try {
      const config = ini.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.env) {
        process.custom.ENV = config.env
      }
      if (config.tools) {
        process.custom.TOOLS = config.tools
      }
    }
    catch {
    }
  }
}

export const getExePath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname, '../')
  }
  // 获取 exe 文件的目录（因为 version 文件在安装根目录）
  return path.dirname(app.getPath('exe'))
}
