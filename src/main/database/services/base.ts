/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

// 数据库服务基类
// 注意：不能静态 import ../db。否则会形成
// BaseService → db → initTables → app-circle 桶（含 Service）→ BaseService
// 打包成 ESM 后触发 "Cannot access 'BaseService' before initialization"
// 也不能 createRequire(相对路径)：打进 dist-electron 单文件后相对路径失效。
import { getDb } from '../db-accessor'

export abstract class BaseService {
  protected get db() {
    return getDb()
  }
}
