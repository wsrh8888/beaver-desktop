/**
 * 聊天内容区域右键菜单配置
 */

// 消息类型枚举（与 MessageType 保持一致）
export enum MessageContentType {
  TEXT = 1, // 文本消息
  IMAGE = 2, // 图片消息
  VIDEO = 3, // 视频消息
  FILE = 4, // 文件消息
  VOICE = 5, // 语音消息
  EMOJI = 6, // 表情消息
  NOTIFICATION = 7, // 通知消息
  AUDIO_FILE = 8, // 音频文件消息
  CALL = 9, // 音视频通话
  WITHDRAW = 10, // 撤回消息
  REPLY = 11, // 回复消息
  FORWARD = 12, // 转发消息（聊天记录）
}
