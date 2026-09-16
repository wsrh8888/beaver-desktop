/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-circle 渲染出口：圈子独立窗口相关。
 * 主窗会话 store / 通知路由留在宿主，不从这里导出。
 */

export { default as CircleRight } from './windows/circle/page/circle/right-component/index.vue'
export { default as CircleDetails } from './windows/circle/page/circle/detail-components/details/index.vue'
export { default as CirclePostDetail } from './windows/circle/page/circle/detail-components/postDetail/index.vue'
export { parseCircleId } from './windows/circle/store/circle/circle'
