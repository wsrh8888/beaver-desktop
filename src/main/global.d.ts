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

declare namespace NodeJS {

  interface Process {
    custom: {
      /**
       * @description: 环境变量
       */
      ENV: 'prod' | 'test' | 'dev'
      /**
       * @description: 是否开启工具
       */
      TOOLS: boolean
      /**
       * @description: 设备唯一标识
       */
      DEVICE_ID: string
      /**
       * @description: 应用版本
       */
      VERSION: string

      /**
       * @description: 操作系统平台
       * @values: 'windows' | 'mac' | 'linux' | 'ios' | 'android'
       */
      PLATFORM: string
    }
  }
}

interface PerformanceMemory {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

interface Performance {
  memory?: PerformanceMemory
}
