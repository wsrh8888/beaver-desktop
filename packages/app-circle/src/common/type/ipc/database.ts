/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 圈子数据库 IPC 通道（宿主 DatabaseCommand / registerDatabaseIpcHandler） */
export const CIRCLE_DATABASE_IPC = 'database:circle'

/** 圈子 IPC 数据库命令 */
export enum DataCircleCommand {
  GET_CIRCLE_LIST = 'circle:getCircleList',
}
