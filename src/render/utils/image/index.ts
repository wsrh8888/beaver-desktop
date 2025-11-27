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
