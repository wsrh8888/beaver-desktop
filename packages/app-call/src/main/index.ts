/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** @beaver-im/app-call 主进程出口（call + call-incoming 双窗） */

import callIncomingApplication from './application/call-incoming'

export { activate } from './activate'
export { callManifest as manifest, callManifest } from './manifest'
export { default as application } from './application/call'
export { default as callApplication } from './application/call'
export { default as callIncomingApplication } from './application/call-incoming'

export const extraApplications = {
  'call-incoming': callIncomingApplication,
}
