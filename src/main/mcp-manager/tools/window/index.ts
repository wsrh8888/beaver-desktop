/**
 * 界面窗口管理相关的MCP工具
 * 基于vite.config.ts中定义的HTML窗口配置
 * 每个工具独立文件，便于维护
 */
import { openImageWindowTool } from './open-image-window.js'
import { openVideoWindowTool } from './open-video-window.js'
import { openAudioWindowTool } from './open-audio-window.js'

export const windowTools = [
  openImageWindowTool,
  openVideoWindowTool,
  openAudioWindowTool,
]
