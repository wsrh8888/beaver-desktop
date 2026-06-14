<template>
  <div class="markdown-message-wrapper">
    <div class="message-markdown selectable" v-html="renderedContent" />
  </div>
</template>

<script lang="ts">
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import { marked } from 'marked'
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'MarkdownMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
    // 配置 marked
    marked.setOptions({
      breaks: true, // 支持换行符
      gfm: true, // 启用 GitHub Flavored Markdown
    })

    // 渲染 Markdown 内容
    const renderedContent = computed(() => {
      const content = props.msg?.markdownMsg?.content
      if (!content) {
        return ''
      }

      try {
        return marked(content)
      } catch (error) {
        console.error('Markdown 渲染失败:', error)
        return content
      }
    })

    return {
      renderedContent,
    }
  },
})
</script>

<style lang="less" scoped>
.markdown-message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-markdown {
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
  padding: 5px;
  -webkit-user-select: text;
  user-select: text;

  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 10px 0 5px 0;
    font-weight: bold;
  }

  :deep(h1) { font-size: 18px; }
  :deep(h2) { font-size: 16px; }
  :deep(h3) { font-size: 14px; }
  :deep(h4) { font-size: 13px; }
  :deep(h5) { font-size: 13px; }
  :deep(h6) { font-size: 13px; }

  :deep(p) {
    margin: 5px 0;
  }

  :deep(ul), :deep(ol) {
    margin: 5px 0;
    padding-left: 20px;
  }

  :deep(li) {
    margin: 2px 0;
  }

  :deep(code) {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
  }

  :deep(pre) {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 5px;
    overflow-x: auto;
    margin: 5px 0;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid rgba(255, 255, 255, 0.3);
    padding-left: 10px;
    margin: 5px 0;
    color: rgba(255, 255, 255, 0.8);
  }

  :deep(a) {
    color: #FFD4B8;
    text-decoration: underline;

    &:hover {
      color: #FFE6D9;
    }
  }

  :deep(table) {
    border-collapse: collapse;
    margin: 5px 0;
    width: 100%;

    th, td {
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 5px 8px;
    }

    th {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin: 10px 0;
  }
}
</style>
