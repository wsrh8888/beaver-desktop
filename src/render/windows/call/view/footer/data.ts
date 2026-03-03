
import muteIcon from 'renderModule/assets/image/call/mute.svg'
import muteActiveIcon from 'renderModule/assets/image/call/mute_on.svg'
import cameraOffIcon from 'renderModule/assets/image/call/video_off.svg'
import cameraOnIcon from 'renderModule/assets/image/call/video.svg'
import addMemberIcon from 'renderModule/assets/image/call/add_member.svg'

export interface FooterActionItem {
  id: string
  defaultLabel: string
  activeLabel?: string
  defaultIcon: any
  activeIcon?: any
  /** both: 私聊和群聊都显示，group: 仅群聊 */
  visibility: 'both' | 'group'
}

export const FOOTER_ACTION_LIST: FooterActionItem[] = [
  { id: 'mute', defaultLabel: '静音', activeLabel: '取消静音', defaultIcon: muteIcon, activeIcon: muteActiveIcon, visibility: 'both' },
  { id: 'camera', defaultLabel: '开启视频', activeLabel: '关闭视频', defaultIcon: cameraOffIcon, activeIcon: cameraOnIcon, visibility: 'both' },
  { id: 'invite', defaultLabel: '邀请', defaultIcon: addMemberIcon, visibility: 'group' },
  { id: 'manageMembers', defaultLabel: '管理成员', defaultIcon: addMemberIcon, visibility: 'group' },
]
