/**
 * 打开音频播放器窗口工具
 */
import { z } from 'zod'

export const openAudioWindowTool = {
  name: 'open_audio_window',
  description: '打开音频播放器窗口，用于播放音频文件。支持播放控制、播放列表、音量调节等功能。当用户需要听音乐、播放语音消息或处理音频文件时使用此工具。',
  inputSchema: z.object({
    audioUrl: z.string().optional().describe('音频文件的URL地址或本地路径。如果不提供，将打开空的音频播放器窗口'),
    audioId: z.string().optional().describe('音频的唯一标识ID，用于关联数据库中的音频记录'),
    windowTitle: z.string().optional().default('音频播放器').describe('窗口标题，默认为"音频播放器"'),
    autoPlay: z.boolean().optional().default(false).describe('是否自动开始播放音频，默认为false'),
    showPlaylist: z.boolean().optional().default(true).describe('是否显示播放列表，默认为true'),
    loopMode: z.enum(['none', 'single', 'all']).optional().default('none').describe('循环播放模式：none(不循环)、single(单曲循环)、all(列表循环)，默认为none')
  }),
  handler: async (params: {
    audioUrl?: string
    audioId?: string
    windowTitle?: string
    autoPlay?: boolean
    showPlaylist?: boolean
    loopMode?: 'none' | 'single' | 'all'
  }) => {
    // 这里实现打开音频窗口的逻辑
    console.log('打开音频窗口:', params)
    return {
      success: true,
      windowType: 'audio',
      audioUrl: params.audioUrl,
      audioId: params.audioId,
      windowTitle: params.windowTitle || '音频播放器',
      playback: {
        autoPlay: params.autoPlay ?? false,
        showPlaylist: params.showPlaylist ?? true,
        loopMode: params.loopMode ?? 'none'
      },
      message: `成功打开音频播放器窗口${params.audioUrl ? `，播放音频: ${params.audioUrl}` : ''}`
    }
  }
}
