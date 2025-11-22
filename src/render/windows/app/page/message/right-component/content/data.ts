/**
 * 聊天内容区域右键菜单配置
 */

import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'

// 消息类型枚举（与 MessageType 保持一致）
export enum MessageContentType {
  TEXT = 1, // 文本消息
  IMAGE = 2, // 图片消息
  VIDEO = 3, // 视频消息
  FILE = 4, // 文件消息
  VOICE = 5, // 语音消息
}

/**
 * 文本消息的右键菜单项
 */
export const textMenuItems: ContextMenuItem[] = [
  {
    id: 'copy',
    label: '复制',
  },
  {
    id: 'forward',
    label: '转发',
    divided: true,
  },
  {
    id: 'delete',
    label: '删除',
  },
]

/**
 * 图片消息的右键菜单项
 */
export const imageMenuItems: ContextMenuItem[] = [
  {
    id: 'save',
    label: '保存图片',
  },
  {
    id: 'view',
    label: '查看原图',
  },
  {
    id: 'copy',
    label: '复制图片',
    divided: true,
  },
  {
    id: 'forward',
    label: '转发',
  },
  {
    id: 'delete',
    label: '删除',
    divided: true,
  },
]

/**
 * 视频消息的右键菜单项
 */
export const videoMenuItems: ContextMenuItem[] = [
  {
    id: 'save',
    label: '保存视频',
  },
  {
    id: 'play',
    label: '播放',
    divided: true,
  },
  {
    id: 'forward',
    label: '转发',
  },
  {
    id: 'delete',
    label: '删除',
    divided: true,
  },
]

/**
 * 音频/语音消息的右键菜单项
 */
export const audioMenuItems: ContextMenuItem[] = [
  {
    id: 'save',
    label: '保存音频',
  },
  {
    id: 'play',
    label: '播放',
    divided: true,
  },
  {
    id: 'forward',
    label: '转发',
  },
  {
    id: 'delete',
    label: '删除',
    divided: true,
  },
]

/**
 * 文件消息的右键菜单项
 */
export const fileMenuItems: ContextMenuItem[] = [
  {
    id: 'save',
    label: '保存文件',
  },
  {
    id: 'open',
    label: '打开文件',
    divided: true,
  },
  {
    id: 'forward',
    label: '转发',
  },
  {
    id: 'delete',
    label: '删除',
    divided: true,
  },
]

/**
 * 根据消息类型和是否有选中文本返回对应的菜单项
 * @param messageType 消息类型（MessageContentType）
 * @param hasTextSelected 是否有文本被选中（仅对文本消息有效）
 * @returns 菜单项数组
 */
export function getMenuItems(
  messageType: MessageContentType,
  hasTextSelected: boolean = false,
): ContextMenuItem[] {
  switch (messageType) {
    case MessageContentType.TEXT:
      // 文本消息：如果有选中文本，只显示复制；否则显示完整菜单
      if (hasTextSelected) {
        return [
          {
            id: 'copy',
            label: '复制',
          },
        ]
      }
      return textMenuItems

    case MessageContentType.IMAGE:
      return imageMenuItems

    case MessageContentType.VIDEO:
      return videoMenuItems

    case MessageContentType.VOICE:
      return audioMenuItems

    case MessageContentType.FILE:
      return fileMenuItems

    default:
      // 默认返回文本菜单
      return hasTextSelected
        ? [{ id: 'copy', label: '复制' }]
        : textMenuItems
  }
}
