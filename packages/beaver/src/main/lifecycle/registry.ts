/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 登录后钩子：插件在 activate 时自注册，宿主登录流程只跑注册列表，不点名业务包 */
export type PostLoginHook = () => void | Promise<void>

const postLoginHooks: PostLoginHook[] = []

export function registerPostLoginHook(hook: PostLoginHook): void {
  if (!postLoginHooks.includes(hook))
    postLoginHooks.push(hook)
}

export async function runPostLoginHooks(): Promise<void> {
  for (const hook of postLoginHooks)
    await hook()
}
