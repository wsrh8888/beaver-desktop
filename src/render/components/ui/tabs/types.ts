// Tabs组件类型定义

export type TabType = 'line' | 'card'
export type TabSize = 'large' | 'default' | 'small'

export interface TabItem {
  key: string
  label: string
  disabled?: boolean
  closable?: boolean
}
