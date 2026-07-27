<template>
  <div class="text-message-wrapper">
    <div
      class="message-text selectable"
      v-html="formattedContent"
      @click="handleClick"
    />
  </div>
</template>

<script lang="ts">
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import Message from 'renderModule/components/ui/message'
import { emojiMap } from 'renderModule/windows/app/utils/emoji'
import { computed, defineComponent, PropType } from 'vue'

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseCircleIdFromShare(raw: string): string | null {
  const value = raw.trim()
  if (!value)
    return null
  try {
    const uri = new URL(value)
    if (uri.protocol === 'beaver:' && uri.hostname === 'share') {
      const parts = uri.pathname.split('/').filter(Boolean)
      if (parts[0] === 'circle' && parts[1])
        return parts[1]
    }
  }
  catch {
    // ignore
  }
  const match = value.match(/\/share\/circle\/([^/?#]+)/)
  return match?.[1] || null
}

function parseGroupIdFromShare(raw: string): string | null {
  const value = raw.trim()
  if (!value)
    return null
  try {
    const uri = new URL(value)
    if (uri.protocol === 'beaver:' && uri.hostname === 'share') {
      const parts = uri.pathname.split('/').filter(Boolean)
      if (parts[0] === 'group' && parts[1])
        return parts[1]
    }
  }
  catch {
    // ignore
  }
  const match = value.match(/\/share\/group\/([^/?#]+)/)
  return match?.[1] || null
}

export default defineComponent({
  name: 'TextMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
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
      const circleId = parseCircleIdFromShare(url)
      if (circleId) {
        const link = `beaver://share/circle/${circleId}`
        navigator.clipboard.writeText(link).then(() => {
          Message.success('已复制圈子邀请链接，可在移动端打开加入')
        }).catch(() => {
          Message.info(link)
        })
        return
      }
      const groupId = parseGroupIdFromShare(url)
      if (groupId) {
        const link = `beaver://share/group/${groupId}`
        navigator.clipboard.writeText(link).then(() => {
          Message.success('已复制群邀请链接')
        }).catch(() => {
          Message.info(link)
        })
        return
      }
      if (/^https?:\/\//i.test(url)) {
        window.open(url, '_blank')
      }
    }

    return {
      formattedContent,
      handleClick,
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
