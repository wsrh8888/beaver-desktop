/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver/app-circle 圈子 app
 *
 * 自带主进程(窗口/business/database/datasync) + 渲染进程(circle 窗口 + app 窗口内嵌圈子组件)。
 *
 * 接入方式：本包通过 package.json 的 exports 暴露入口，宿主直接按包名引用：
 *   @beaver/app-circle/main
 *   @beaver/app-circle/renderer
 *
 * 依赖宿主内核（留根 src/，通过宿主现有 alias 引用）：
 *   mainModule/utils/logger, mainModule/config, mainModule/utils/request/request,
 *   mainModule/ipc/main-to-render, mainModule/database/services/base,
 *   commonModule/*（类型契约）
 *
 * 依赖同级包：@beaver/app-moment/renderer（MomentContentCard 组件）
 */
export {}
