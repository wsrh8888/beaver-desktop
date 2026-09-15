/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-circle 渲染进程出口（对外暴露的组件/store/路由，供宿主 app 窗口嵌入引用） */

// 圈子窗口组件（app 窗口 message 面板嵌入）
export { default as CircleRight } from './windows/circle/page/circle/right-component/index.vue'
export { default as CircleDetails } from './windows/circle/page/circle/detail-components/details/index.vue'
export { default as CirclePostDetail } from './windows/circle/page/circle/detail-components/postDetail/index.vue'
export { parseCircleId } from './windows/circle/store/circle/circle'

// app 窗口用的圈子 store + 通知路由
export { useCircleStore } from './app/pinia/circle/circle'
export { circleNotificationRouter } from './app/notification-manager/circle'
