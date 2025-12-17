/**
 * 朋友圈相关的MCP工具
 * 包含朋友圈的各种操作功能
 */
import { openMomentWindowTool } from './open-moment-window.js'
import { viewMomentsTool } from './view-moments.js'
import { createMomentTool } from './create-moment.js'
import { likeMomentTool } from './like-moment.js'
import { commentMomentTool } from './comment-moment.js'

export const momentTools = [
  openMomentWindowTool,
  viewMomentsTool,
  createMomentTool,
  likeMomentTool,
  commentMomentTool,
]
