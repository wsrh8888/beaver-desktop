/**
 * 复制相关功能（仅 Electron，统一走主进程）
 */

/**
 * 复制文本到剪贴板（主进程 clipboard.copyText）
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || text.trim().length === 0)
    return false
  return window.electron.clipboard.copyText(text)
}

/**
 * 获取当前选中的文本
 */
export function getSelectedText(): string {
  const selection = window.getSelection()
  if (selection && selection.toString().trim().length > 0)
    return selection.toString().trim()
  return ''
}

/**
 * 检查是否有文本被选中
 */
export function hasTextSelected(): boolean {
  const selection = window.getSelection()
  return !!(selection && selection.toString().trim().length > 0)
}
