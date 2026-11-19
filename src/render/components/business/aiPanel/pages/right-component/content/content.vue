<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<!--
  消息流容器：跟 IM 消息区同一套做法 —— 首屏只拉一页，滚到接近顶部再往前翻，
  翻完保持可视位置不动。

  接口就在本组件调（时序属于视图），拉回来整块交给 store（数据属于 store）。
  之后的新消息与流式增量由 notification-manager 写 store，这里只读 messages。
-->
<template>
  <div ref="scrollRef" class="ai-content" @scroll="onScroll">
    <template v-if="!messages.length">
      <slot name="empty">
        <div class="empty">
          <div class="empty-icon">
            <img src="renderModule/assets/image/ai/robot.svg" alt="">
          </div>
          <p class="empty-title">
            {{ emptyTitle }}
          </p>
          <p v-if="emptyDesc" class="empty-desc">
            {{ emptyDesc }}
          </p>
        </div>
      </slot>
    </template>

    <template v-else>
      <div v-if="loadingMore" class="loading-more">
        正在加载更早的消息…
      </div>
      <div class="thread">
        <AiMessageText
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import type { IAgentMessageItem, IAiChatMessage } from 'commonModule/type/ajax/agent'
import { listAgentMessagesApi, listAgentTopicsApi } from 'renderModule/api/agent'
import Logger from 'renderModule/utils/logger'
import { computed, defineComponent, nextTick, ref, watch } from 'vue'
import { useAiPanelStore } from '../../../store'
import AiMessageText from './message/text.vue'

const logger = new Logger('AiPanelContent')

/** 一页多少条：服务端默认 20、上限 200；AI 对话节奏慢，一页够看一会儿 */
const PAGE_SIZE = 20
/** 距顶部多少像素算「该往前翻了」，和 IM 消息区一致 */
const TOP_THRESHOLD = 50
/** 距底部多少像素算「还贴着底」，超过就不自动跟随，免得把正在翻历史的用户拽回去 */
const BOTTOM_THRESHOLD = 80

/** 服务端消息 → 气泡（优先 textMsg.content，回落 parts 里的文本） */
function toMessage(item: IAgentMessageItem): IAiChatMessage {
  const fromParts = (item.parts || [])
    .filter(p => p.type === 'text')
    .map(p => p.text || '')
    .join('\n')
  return {
    id: item.clientMsgId || item.messageId,
    role: item.role === 'user' ? 'user' : 'assistant',
    content: item.msg?.textMsg?.content || fromParts,
    timestamp: item.createdAt || 0,
    cursor: item.id,
  }
}

export default defineComponent({
  name: 'AiPanelContent',
  components: { AiMessageText },
  props: {
    /** 面板是否展开：展开即刷一次，保证跨端看到最新数据 */
    visible: {
      type: Boolean,
      default: false,
    },
    /** 场景内绑定 ID：消息按它隔离 */
    refId: {
      type: String,
      default: '',
    },
    emptyTitle: {
      type: String,
      default: '开始提问',
    },
    emptyDesc: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const aiStore = useAiPanelStore()
    const scrollRef = ref<HTMLElement | null>(null)
    /** 还有更早的消息可翻；空页或不足一页即到底 */
    const hasMore = ref(true)
    const loadingMore = ref(false)
    /** 贴底跟随：用户往上翻历史时置 false，回到底部再置 true */
    const stickToBottom = ref(true)

    const messages = computed(() => aiStore.messagesOf(props.refId))

    const scrollToBottom = async () => {
      await nextTick()
      const el = scrollRef.value
      if (el)
        el.scrollTop = el.scrollHeight
    }

    /** 拉一页消息；beforeId > 0 表示往前翻，0 表示最新一页 */
    const fetchPage = async (topicId: string, beforeId = 0): Promise<IAiChatMessage[]> => {
      if (!topicId)
        return []
      const res = await listAgentMessagesApi({ topicId, beforeId: beforeId || undefined, limit: PAGE_SIZE })
      if (res.code !== 0 || !res.result)
        throw new Error((res as any).msg || (res as any).message || '加载历史失败')
      const list = (res.result.list || []).map(toMessage)
      // 不足一页 = 已经到头，不用再问服务端
      hasMore.value = list.length >= PAGE_SIZE
      return list
    }

    /**
     * 首屏：先拿话题（最新的在第一个），再拉这个话题的最新一页。
     * refId 换了就丢弃旧结果，免得串会话。
     */
    const loadLatest = async (refId: string, cancelled: () => boolean) => {
      const res = await listAgentTopicsApi({ conversationId: refId })
      if (res.code !== 0 || !res.result)
        throw new Error((res as any).msg || (res as any).message || '加载话题失败')
      const topics = res.result.list || []
      const activeTopicId = topics[0]?.topicId || ''
      // 新话题还没消息：hasMore 归位，否则下次开面板会白翻一次
      hasMore.value = !!activeTopicId
      const list = activeTopicId ? await fetchPage(activeTopicId) : []
      if (cancelled())
        return
      stickToBottom.value = true
      aiStore.hydrate(refId, { topics, activeTopicId, messages: list })
    }

    /**
     * 往前翻一页。
     * 游标取「第一条带 cursor 的消息」—— 本地乐观插入的气泡没有 cursor，
     * 直接拿 messages[0] 会漏掉服务端主键。
     */
    const loadMore = async () => {
      const refId = props.refId
      const topicId = aiStore.activeTopicIdOf(refId)
      const cursor = messages.value.find(m => !!m.cursor)?.cursor || 0
      if (!refId || !topicId || !cursor || loadingMore.value || !hasMore.value)
        return

      const el = scrollRef.value
      const prevHeight = el?.scrollHeight || 0
      const prevTop = el?.scrollTop || 0
      loadingMore.value = true
      try {
        const list = await fetchPage(topicId, cursor)
        if (!list.length)
          return
        aiStore.prependMessages(refId, list)
        // 插在前面会把内容整体往下推，这里补回同样的高度差，视线才不跳
        await nextTick()
        if (el)
          el.scrollTop = prevTop + (el.scrollHeight - prevHeight)
      }
      catch (err) {
        logger.error({ text: '加载更早消息失败', data: { refId, error: (err as Error).message } })
      }
      finally {
        loadingMore.value = false
      }
    }

    const onScroll = () => {
      const el = scrollRef.value
      if (!el)
        return
      stickToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD
      if (el.scrollTop <= TOP_THRESHOLD)
        void loadMore()
    }

    // 新消息与流式追加都会改变 messages：只在贴底时跟随，免得翻历史时被拽走
    watch(messages, () => {
      if (stickToBottom.value)
        void scrollToBottom()
    }, { deep: true })

    watch([() => props.visible, () => props.refId], async ([visible, refId], _prev, onCleanup) => {
      if (!visible || !refId)
        return
      // 生成中别用服务端历史覆盖本地：流式气泡还没落库，重开会话会把半截回复冲掉
      if (aiStore.isStreaming(refId))
        return
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })
      try {
        await loadLatest(refId, () => cancelled)
      }
      catch (err) {
        logger.error({ text: 'AI 历史加载失败', data: { refId, error: (err as Error).message } })
      }
    }, { immediate: true })

    return { scrollRef, messages, loadingMore, onScroll }
  },
})
</script>

<style lang="less" scoped>
.ai-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: #FAFBFC;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(178, 190, 195, 0.5);
    border-radius: 3px;
  }

  .loading-more {
    padding: 10px 0 0;
    text-align: center;
    font-size: 12px;
    color: #A6ADB3;
  }

  .empty {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 28px;
    text-align: center;

    .empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: #FFF1EA;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;

      img {
        width: 28px;
        height: 28px;
      }
    }

    .empty-title {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: 600;
      color: #2D3436;
    }

    .empty-desc {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #8A9196;
    }
  }

  .thread {
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
}
</style>
