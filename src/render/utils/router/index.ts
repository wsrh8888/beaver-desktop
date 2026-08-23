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

import { useRouter } from 'vue-router'

/**
 * 路由跳转工具函数
 * 添加setTimeout避免某些跳转问题
 */
export const useRouterHelper = () => {
  const router = useRouter()

  const routerHelper = {
    push: (path: string) => {
      setTimeout(() => {
        router.push({ path })
      }, 0)
    },

    replace: (path: string) => {
      setTimeout(() => {
        router.replace({ path })
      }, 0)
    },
  }

  return routerHelper
}
