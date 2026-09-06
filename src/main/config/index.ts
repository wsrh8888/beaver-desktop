/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
  
  // 检测当前运行的操作系统平台
  let platform: 'windows' | 'mac' | 'linux' | 'ios' | 'android'
  if (process.platform === 'win32') {
    platform = 'windows'
  }
  else if (process.platform === 'darwin') {
    platform = 'mac'
  }
  else if (process.platform === 'linux') {
    platform = 'linux'
  }
  else {
    // 其他平台（如 android/ios 在 Electron 中不会出现）
    platform = 'linux'
  }
  
  process.custom = {
    ENV: 'prod',
    TOOLS: false,
    DEVICE_ID: deviceId,
    VERSION: getVersion(),
    PLATFORM: platform,
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
      // 可选：覆盖默认域名，自托管时改这一行即可，无需改源码重编
      if (config.baseUrl) {
        const baseUrl = String(config.baseUrl).trim()
        if (baseUrl) {
          process.custom.BASE_URL = baseUrl
        }
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
