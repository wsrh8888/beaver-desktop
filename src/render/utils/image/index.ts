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

import Logger from 'renderModule/utils/logger';
const logger = new Logger('index')

/**
 * 图片工具函数
 */

export interface ImageSize {
  width: number
  height: number
}

/**
 * 计算图片的显示尺寸（保持宽高比，限制最大尺寸）
 * @param originalWidth 原始宽度
 * @param originalHeight 原始高度
 * @param maxWidth 最大宽度限制，默认 240px
 * @param maxHeight 最大高度限制，默认 300px
 * @returns 计算后的图片尺寸
 */
export function calculateImageSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 240,
  maxHeight: number = 300,
): ImageSize {
    logger.info({ text: 'calculateImageSize 开始' })
  // 如果图片的宽度和高度都小于最大限制，直接使用原始尺寸
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return {
      width: originalWidth,
      height: originalHeight,
    }
  }

  // 计算宽度和高度的缩放比例
  const widthRatio = maxWidth / originalWidth
  const heightRatio = maxHeight / originalHeight

  // 选择较小的缩放比例，确保图片完全适应限制，同时保持宽高比
  const scaleRatio = Math.min(widthRatio, heightRatio)

  const newWidth = originalWidth * scaleRatio
  const newHeight = originalHeight * scaleRatio

  return {
    width: newWidth,
    height: newHeight,
  }
}
