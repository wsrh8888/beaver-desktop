/** 成员状态（与 pinia call CallMember.status 一致） */
export type CallMemberStatus = 'calling' | 'joined' | 'left' | 'rejected' | 'busy'

/** 成员状态对应的展示文案（画面上方占位/提示用） */
export const MEMBER_STATUS_HINT: Record<CallMemberStatus, string> = {
  calling: '等待接听...',
  joined: '',
  left: '已离开',
  rejected: '已拒绝',
  busy: '忙碌中',
}

export function getMemberStatusHint(status: CallMemberStatus): string {
  return MEMBER_STATUS_HINT[status] ?? ''
}
