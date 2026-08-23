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

export interface IWinodwCloseOptions {
  /**
   * @description: 是否仅隐藏，默认不隐藏
   */
  hideOnly?: boolean
}

export interface IWindowOpenOptions {
  /**
   * @description: 是否唯一，默认唯一
   */
  unique?: boolean
  /**
   * @description: 窗口宽度
   */
  width?: number
  /**
   * @description: 窗口高度
   */
  height?: number
  /**
   * @description: 窗口参数（用于传递数据）
   */
  params?: Record<string, any>
}

/**
 * @description: 窗口管理模块接口
 */
export interface IWindowModule {
  /**
   * 关闭窗口。
   * @param name - (可选) 要关闭的窗口名称，不传则关闭当前窗口。
   * @param options - (可选) 窗口选项。
   * @param options.hideOnly - (可选) 仅隐藏而不销毁窗口，默认为 false。
   */
  closeWindow(name?: string, options?: IWinodwCloseOptions): void

  /**
   * 打开一个窗口。
   * @param name - 要打开的窗口名称。
   * @param options - (可选) 窗口选项。
   */
  openWindow(name: string, options?: IWindowOpenOptions): Promise<void>

  /**
   * 最小化当前窗口。
   */
  minimize(): void

  /**
   * 最大化当前窗口。
   */
  maximize(): void

  /**
   * 截取当前屏幕（整屏），返回 PNG 的 base64。
   */
  captureScreen(): Promise<{ base64: string }>
}
