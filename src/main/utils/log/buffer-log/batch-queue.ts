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

class BatchQueue {
  private _q: any[]

  constructor(q: any[] = []) {
    this._q = q
  }

  enqueue(...elements: any[]) {
    this._q.push(...elements)
  }

  multiDequeue(count = 1) {
    if (this.length() < count) {
      return []
    }
    return this._q.splice(0, count)
  }

  multiFront(count = 1) {
    return this._q.slice(0, count)
  }

  empty() {
    return this.length() === 0
  }

  length() {
    return this._q.length
  }
}

export default BatchQueue
