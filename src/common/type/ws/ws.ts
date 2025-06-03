export interface IWsContent {
  timestamp: number;
  data: {
    type: string;
    body: {
      messageId: number;
      conversationId: string;
      msg: {
        type: number;
        textMsg?: {
          content: string;
        };
        imageMsg?: {
          src: string;
        } | null;
      };
      sender: {
        userId: string;
        avatar: string;
        nickname: string;
      };
      create_at: string;
      msgPreview?: string;
    };
  };
} 