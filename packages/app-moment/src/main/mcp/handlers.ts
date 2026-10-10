/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 朋友圈 MCP 工具执行实现。按 tool name 路由，调 main/api/moment.ts 的 API。
 * 开窗走本包 application 单例；其余调服务端 API（token/deviceId 由宿主拦截器注入）。
 * 返回值统一序列化为文本（喂给 LLM）。
 */
import { Logger } from '@beaver-im/beaver/main'
import application from '../application/moment'
import {
  createMomentApi,
  createMomentCommentApi,
  getMomentDetailApi,
  getMomentListApi,
  likeMomentApi,
} from '../api/moment'

const logger = new Logger('moment-mcp')

/** 按 tool name 路由执行。返回文本结果。 */
export async function dispatchMoment(name: string, args: Record<string, any>): Promise<string> {
  logger.info({ text: '朋友圈工具调用', data: { tool: name } })

  switch (name) {
    case 'open_moment': {
      application.createBrowserWindow()
      return '已打开朋友圈窗口'
    }
    case 'list_moments': {
      const res = await getMomentListApi({ page: Number(args.page) || 1, limit: Number(args.limit) || 20 })
      if (res.code !== 0)
        throw new Error(res.msg || '拉取朋友圈失败')
      const list = res.result?.list || []
      const text = list.length
        ? list.map(m =>
          `${m.id} | ${m.userName}: ${m.content || '(无文字)'} | 赞${m.likeCount} 评${m.commentCount}`,
        ).join('\n')
        : '(空)'
      return `${text}\n共 ${res.result?.count ?? list.length} 条`
    }
    case 'post_moment': {
      const res = await createMomentApi({ content: String(args.content || ''), files: [] })
      if (res.code !== 0)
        throw new Error(res.msg || '发布失败')
      return `已发布朋友圈，id=${res.result?.id}`
    }
    case 'get_moment_detail': {
      const res = await getMomentDetailApi({ momentId: String(args.momentId || '') })
      if (res.code !== 0)
        throw new Error(res.msg || '查看失败')
      const m = res.result
      return `${m.userName}: ${m.content}\n赞 ${m.likeCount} | 评 ${m.commentCount} | ${m.createdAt}`
    }
    case 'like_moment': {
      const res = await likeMomentApi({ momentId: String(args.momentId || ''), status: !!args.status })
      if (res.code !== 0)
        throw new Error(res.msg || '操作失败')
      return args.status ? '已点赞' : '已取消点赞'
    }
    case 'comment_moment': {
      const res = await createMomentCommentApi({
        momentId: String(args.momentId || ''),
        content: String(args.content || ''),
        parentId: args.parentId ? String(args.parentId) : undefined,
        replyToCommentId: args.replyToCommentId ? String(args.replyToCommentId) : undefined,
      })
      if (res.code !== 0)
        throw new Error(res.msg || '评论失败')
      return `已评论，id=${res.result?.id}`
    }
    default:
      throw new Error(`unknown moment tool: ${name}`)
  }
}
