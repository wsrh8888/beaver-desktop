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

<template>
  <div class="text-message-wrapper">
    <div
      class="message-text selectable"
      v-html="formattedContent"
      @click="handleClick"
    />
    <PreviewDialog
      v-if="previewVisible"
      v-model="previewVisible"
      :card-type="previewCardType"
      :id="previewId"
      :expire-at="0"
      :invite-token="previewToken"
    />
  </div>
</template>

<script lang="ts">
import { CardType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import Message from 'renderModule/components/ui/message'
import PreviewDialog from './card/components/previewDialog.vue'
import { emojiMap } from 'renderModule/windows/app/utils/emoji'
import { computed, defineComponent, type PropType, ref } from 'vue'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('TextMessage')

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseInviteToken(raw: string): { kind: 'circle' | 'group', token: string } | null {
  const value = raw.trim()
  if (!value)
    return null
  try {
    const uri = new URL(value)
    if (uri.protocol === 'beaver:' && uri.hostname === 'invite') {
      const parts = uri.pathname.split('/').filter(Boolean)
      if ((parts[0] === 'circle' || parts[0] === 'group') && parts[1])
        return { kind: parts[0], token: parts[1] }
    }
    const code = uri.searchParams.get('code')
    if (code) {
      if (/\/api\/circle\/v1\/circle\/invite_code/i.test(uri.pathname))
        return { kind: 'circle', token: code }
      if (/\/api\/group\/v1\/invite_code/i.test(uri.pathname))
        return { kind: 'group', token: code }
    }
  }
  catch (error) {
    logger.warn({ text: '解析邀请链接失败', data: { error: (error as Error)?.message } })
  }
  const circle = value.match(/\/api\/circle\/v1\/circle\/invite_code\?[^#]*code=([^&#]+)/i)
  if (circle)
    return { kind: 'circle', token: decodeURIComponent(circle[1]) }
  const group = value.match(/\/api\/group\/v1\/invite_code\?[^#]*code=([^&#]+)/i)
  if (group)
    return { kind: 'group', token: decodeURIComponent(group[1]) }
  const qqStyle = value.match(/\/q\/(c|g)\/([^/?#]+)/i)
  if (qqStyle)
    return { kind: qqStyle[1].toLowerCase() === 'c' ? 'circle' : 'group', token: qqStyle[2] }
  const legacy = value.match(/\/invite\/(circle|group)\/([^/?#]+)/)
  if (legacy)
    return { kind: legacy[1] as 'circle' | 'group', token: legacy[2] }
  return null
}

export default defineComponent({
  name: 'TextMessage',
  components: { PreviewDialog },
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
    const previewVisible = ref(false)
    const previewCardType = ref(0)
    const previewId = ref('')
    const previewToken = ref('')

    const formattedContent = computed(() => {
      const text = props.msg?.textMsg?.content
      if (!text)
        return ''

      const escaped = escapeHtml(text)
      const withEmojiEscaped = escaped.replace(/\[[^\]]+\]/g, (match) => {
        const emojiUrl = emojiMap(match)
        if (emojiUrl) {
          return `<img src="${emojiUrl}" alt="${match}" class="message-emoji" draggable="false" />`
        }
        return match
      })

      return withEmojiEscaped.replace(
        /(https?:\/\/[^\s<]+|beaver:\/\/[^\s<]+)/gi,
        url => `<a href="${url}" class="message-link" data-url="${url}">${url}</a>`,
      )
    })

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target || target.tagName !== 'A')
        return
      e.preventDefault()
      const url = target.getAttribute('data-url') || target.getAttribute('href') || ''
      const invite = parseInviteToken(url)
      if (invite) {
        previewCardType.value = invite.kind === 'circle' ? CardType.CIRCLE : CardType.GROUP
        previewToken.value = invite.token
        previewId.value = ''
        previewVisible.value = true
        return
      }
      if (/^https?:\/\//i.test(url)) {
        window.open(url, '_blank')
      }
      else {
        Message.info(url)
      }
    }

    return {
      formattedContent,
      handleClick,
      previewVisible,
      previewCardType,
      previewId,
      previewToken,
    }
  },
})
</script>

<style lang="less" scoped>
.text-message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-text {
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  color: inherit;
  padding: 5px;
  -webkit-user-select: text;
  user-select: text;
}

:deep(.message-emoji) {
  display: inline-block;
  width: 35px;
  height: 35px;
  vertical-align: middle;
  margin: 0 2px;
  user-select: none;
}

:deep(.message-link) {
  color: #576B95;
  text-decoration: underline;
  cursor: pointer;
  word-break: break-all;
}
</style>
