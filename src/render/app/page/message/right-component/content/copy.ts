/**
 * 复制相关功能
 */

/**
 * 复制选中的文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || text.trim().length === 0) {
    return false
  }

  try {
    // 尝试使用现代剪贴板API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    else {
      // 回退到传统方法
      return fallbackCopy(text)
    }
  }
  catch (error) {
    console.error('复制失败:', error)
    // 回退到传统方法
    return fallbackCopy(text)
  }
}

/**
 * 传统复制方法（备用）
 * @param text 要复制的文本
 * @returns boolean 是否复制成功
 */
function fallbackCopy(text: string): boolean {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed' // 避免滚动到底部
  textArea.style.left = '-9999px' // 移出视口
  textArea.style.top = '-9999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  }
  catch (err) {
    console.error('复制失败:', err)
    document.body.removeChild(textArea)
    return false
  }
}

/**
 * 获取当前选中的文本
 * @returns string 选中的文本
 */
export function getSelectedText(): string {
  const selection = window.getSelection()
  if (selection && selection.toString().trim().length > 0) {
    return selection.toString().trim()
  }
  return ''
}

/**
 * 检查是否有文本被选中
 * @returns boolean 是否有文本被选中
 */
export function hasTextSelected(): boolean {
  const selection = window.getSelection()
  return !!(selection && selection.toString().trim().length > 0)
}

