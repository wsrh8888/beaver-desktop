/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-search 主进程出口（search + verify 双窗） */

import verifyApplication from './application/verify'

export { activate } from './activate'
export { searchManifest as manifest, searchManifest } from './manifest'
export { default as application } from './application/search'
export { default as searchApplication } from './application/search'
export { default as verifyApplication } from './application/verify'

export const extraApplications = {
  verify: verifyApplication,
}
