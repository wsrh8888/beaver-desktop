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

import assistantSvg from 'renderModule/assets/image/leftBar/assistant.svg'
import workbenchSvg from 'renderModule/assets/image/leftBar/workbench.svg'
import skillSvg from 'renderModule/assets/image/assistant/skill.svg'
import circleSvg from 'renderModule/assets/image/leftBar/circle.svg'
import momentSvg from 'renderModule/assets/image/leftBar/moment.svg'
import moreSvg from 'renderModule/assets/image/moment/more.svg'

export interface IAiNavItem {
  id: string
  title: string
  route: string
  icon: string
  tags?: string[]
}

export const aiNavList: IAiNavItem[] = [
  {
    id: 'assistant',
    title: '助理',
    route: '/assistant',
    icon: assistantSvg,
  },
  {
    id: 'project',
    title: '项目',
    route: '/project',
    icon: workbenchSvg,
  },
  {
    id: 'skill',
    title: '专家·技能·连接器',
    route: '/skill',
    icon: skillSvg,
  },
  {
    id: 'automation',
    title: '自动化',
    route: '/automation',
    icon: circleSvg,
  },
  {
    id: 'library',
    title: '资料库',
    route: '/library',
    icon: momentSvg,
  },
  {
    id: 'more',
    title: '更多',
    route: '/more',
    icon: moreSvg,
    tags: ['应用', '灵感'],
  },
]
