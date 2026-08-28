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

import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 路由对应 WorkBuddy 业务：
 * - /new        新建任务页（「海狸, 我帮你」），侧栏导航不高亮
 * - /task/:id   已发起的任务：中间对话 + 右侧结果面板
 * - /assistant  助理（独立入口，与新建任务分离）
 * - 其余         项目 / 技能 / 自动化等独立能力页
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/new',
  },
  {
    path: '/new',
    name: 'newTask',
    component: () => import('renderModule/windows/ai/page/newTask/newTask.vue'),
  },
  {
    path: '/task/:id',
    name: 'task',
    component: () => import('renderModule/windows/ai/page/task/task.vue'),
  },
  {
    path: '/assistant',
    name: 'assistant',
    component: () => import('renderModule/windows/ai/page/assistant/assistant.vue'),
  },
  {
    path: '/project',
    name: 'project',
    component: () => import('renderModule/windows/ai/page/project/project.vue'),
  },
  {
    path: '/skill',
    name: 'skill',
    component: () => import('renderModule/windows/ai/page/skill/skill.vue'),
  },
  {
    path: '/automation',
    name: 'automation',
    component: () => import('renderModule/windows/ai/page/automation/automation.vue'),
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('renderModule/windows/ai/page/library/library.vue'),
  },
  {
    path: '/more',
    name: 'more',
    component: () => import('renderModule/windows/ai/page/more/more.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
