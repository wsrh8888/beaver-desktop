export type AiMessageRole = 'user' | 'assistant'

export interface IAiMessage {
  id: string
  role: AiMessageRole
  content: string
  timestamp: number
  streaming?: boolean
  fromVoice?: boolean
}

export interface IAiChat {
  id: string
  title: string
  timestamp: number
  skillId?: string
  messages: IAiMessage[]
}

export interface IAiChatListItem {
  id: string
  title: string
  timestamp: number
}
