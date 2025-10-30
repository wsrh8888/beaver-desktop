export interface IWsContent {
  timestamp: number
  data: {
    type: string
    body: any
  }
}

export interface IWsStore {
  code: number
  command: 'COMMON_CHAT_MESSAGE' | 'COMMON_UPDATE_MESSAGE'
  content: IWsContent
}
