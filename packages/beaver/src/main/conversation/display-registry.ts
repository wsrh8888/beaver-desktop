/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 会话列表项最小字段（宿主 / 插件 enrichment 共用） */
export interface IConversationRef {
  type: number
  conversationId: string
}

/** 会话展示信息（头像 / 昵称等） */
export interface IConversationDisplay {
  avatar: string
  nickName: string
  notice?: string
}

/**
 * 插件贡献的会话展示解析器。
 * resolve 返回 conversationId → 展示信息；不关心的会话不要写入 Map。
 */
export interface IConversationDisplayProvider {
  resolve: (
    conversations: ReadonlyArray<IConversationRef>,
  ) => Promise<Map<string, IConversationDisplay>>
}

const providers: IConversationDisplayProvider[] = []

/** 插件自注册会话展示（宿主会话聚合不点名业务包） */
export function registerConversationDisplayProvider(provider: IConversationDisplayProvider): void {
  if (!providers.includes(provider))
    providers.push(provider)
}

export function getConversationDisplayProviders(): readonly IConversationDisplayProvider[] {
  return providers
}

/** 合并所有插件的会话展示结果（后注册可覆盖同 conversationId） */
export async function resolveConversationDisplays(
  conversations: ReadonlyArray<IConversationRef>,
): Promise<Map<string, IConversationDisplay>> {
  const result = new Map<string, IConversationDisplay>()
  if (!conversations.length)
    return result

  for (const provider of providers) {
    const partial = await provider.resolve(conversations)
    for (const [conversationId, display] of partial)
      result.set(conversationId, display)
  }
  return result
}
