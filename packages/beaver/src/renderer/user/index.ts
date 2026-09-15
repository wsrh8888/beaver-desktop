/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

function getElectron(): any {
  return (globalThis as any).electron || (globalThis as any).window?.electron
}

/** 当前登录用户 id（storage.userInfo） */
export async function getUserId(): Promise<string> {
  try {
    const info = await getElectron()?.storage?.getAsync?.('userInfo')
    return info?.userId || ''
  }
  catch {
    return ''
  }
}
