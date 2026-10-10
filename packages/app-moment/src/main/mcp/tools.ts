/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 朋友圈 MCP 工具的 zod schema 定义。每个工具的 inputSchema 是 zod raw shape，
 * McpServer.registerTool 据此自动生成 JSON Schema 给 LLM，并校验入参。
 * 与 handlers.ts 的 dispatch 字段严格对齐。
 */
import { z } from 'zod'

/** 打开朋友圈窗口（无入参） */
export const openMomentSchema = {}

/** 列出朋友圈 */
export const listMomentsSchema = {
  page: z.number().int().default(1).describe('页码（1 基）'),
  limit: z.number().int().default(20).describe('每页条数'),
}

/** 发布朋友圈（纯文本） */
export const postMomentSchema = {
  content: z.string().describe('朋友圈文字内容'),
}

/** 查看单条朋友圈详情 */
export const getMomentDetailSchema = {
  momentId: z.string().describe('朋友圈动态 id'),
}

/** 点赞/取消点赞 */
export const likeMomentSchema = {
  momentId: z.string().describe('朋友圈动态 id'),
  status: z.boolean().describe('true=点赞 false=取消点赞'),
}

/** 评论朋友圈 */
export const commentMomentSchema = {
  momentId: z.string().describe('朋友圈动态 id'),
  content: z.string().describe('评论内容'),
  parentId: z.string().optional().describe('回复某条评论时传其 id'),
  replyToCommentId: z.string().optional().describe('回复目标评论 id'),
}
