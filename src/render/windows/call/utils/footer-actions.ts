
export interface FooterActionItem {
  id: string
  label: string
  labelActive?: string
  icon: string
  iconActive?: string
  /** both: 私聊和群聊都显示，group: 仅群聊 */
  visibility: 'both' | 'group'
  /** 是否为结束会议按钮（用于挂断样式） */
  isHangup?: boolean
}

/** 底部操作项列表（顺序即从左到右），DOM 里根据 visibility + callType 判断是否展示 */
export const FOOTER_ACTION_LIST: FooterActionItem[] = [
  { id: 'mute', label: '静音', labelActive: '取消静音', icon: 'renderModule/assets/image/call/mute.svg', iconActive: 'renderModule/assets/image/call/mute_on.svg', visibility: 'both' },
  { id: 'camera', label: '开启视频', labelActive: '关闭视频', icon: 'renderModule/assets/image/call/video_off.svg', iconActive: 'renderModule/assets/image/call/video.svg', visibility: 'both' },
  { id: 'shareScreen', label: '共享屏幕', icon: 'renderModule/assets/image/call/video.svg', visibility: 'both' },
  { id: 'invite', label: '邀请', icon: 'renderModule/assets/image/call/add_member.svg', visibility: 'group' },
  { id: 'manageMembers', label: '管理成员', icon: 'renderModule/assets/image/call/add_member.svg', visibility: 'group' },
  { id: 'hangup', label: '挂断', icon: 'renderModule/assets/image/call/hangup.svg', visibility: 'both', isHangup: true },
]
