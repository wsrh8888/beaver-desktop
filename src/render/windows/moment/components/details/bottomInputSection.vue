<template>
  <div class="bottom-input-section">
    <!-- 正常状态：回复按钮和点赞按钮在同一行 -->
    <div class="quick-actions">
      <button class="reply-btn" @click="handleShowFullInput">
        <span>写评论</span>
      </button>
      <button class="like-btn" @click="handleQuickLike">
        <img :src="isLiked ? SvgLikeActive : SvgLike" alt="点赞" class="action-icon">
      </button>
    </div>

    <!-- 展开输入状态：遮罩层 + 大输入框 -->
    <div class="input-overlay" v-if="showFullInput">
      <div class="input-container">
        <textarea
          ref="textareaRef"
          v-model="commentText"
          class="input-textarea"
          :placeholder="replyPlaceholder"
          @input="handleTextareaInput"
          @keydown.enter.exact.prevent="handleSendComment" @keydown.enter.shift.exact="commentText += '\n'"></textarea>
        <div class="input-actions">
          <button class="send-btn" @click="handleSendComment" :disabled="!commentText.trim()">
            <img src="renderModule/assets/image/moment/send.svg" alt="发送" class="send-icon">
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import SvgLikeActive from 'renderModule/assets/image/moment/like-active.svg'
import SvgLike from 'renderModule/assets/image/moment/like-default.svg'
export default defineComponent({
  name: 'BottomInputSection',
  props: {
    isLiked: {
      type: Boolean,
      default: false
    },
    replyPlaceholder: {
      type: String,
      default: '说点什么...'
    },
    openKey: {
      type: Number,
      default: 0
    }
  },
  emits: ['sendComment', 'quickLike', 'closeReply'],
  setup(props, { emit }) {
    const showFullInput = ref(false)
    const commentText = ref('')
    const textareaRef = ref<HTMLTextAreaElement | null>(null)
    let clickOutsideHandler: ((event: Event) => void) | null = null

    // 处理显示完整输入框
    const handleShowFullInput = () => {
      showFullInput.value = true
      // 添加全局点击监听器
      addClickOutsideListener()
      nextTick(() => {
        textareaRef.value?.focus()
      })
    }

    // 处理隐藏完整输入框
    const handleHideFullInput = () => {
      showFullInput.value = false
      commentText.value = ''
      // 移除全局点击监听器
      removeClickOutsideListener()
      emit('closeReply')
    }

    // 添加点击外部区域的监听器
    const addClickOutsideListener = () => {
      clickOutsideHandler = (event: Event) => {
        const target = event.target as HTMLElement
        // 检查点击是否在 bottom-input-section 内部
        const bottomInputSection = target.closest('.bottom-input-section')
        if (!bottomInputSection) {
          handleHideFullInput()
        }
      }
      // 使用捕获阶段监听，这样可以避开 stopPropagation 的影响
      document.addEventListener('click', clickOutsideHandler, true)
    }

    // 移除点击外部区域的监听器
    const removeClickOutsideListener = () => {
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler, true)
        clickOutsideHandler = null
      }
    }

    // 处理发送评论
    const handleSendComment = () => {
      if (commentText.value.trim()) {
        emit('sendComment', commentText.value.trim())
        commentText.value = ''
        handleHideFullInput()
      }
    }

    // 处理快速点赞
    const handleQuickLike = () => {
      emit('quickLike')
    }



    // 组件挂载时
    onMounted(() => {
      // 如果初始状态就是展开的，添加监听器
      if (showFullInput.value) {
        addClickOutsideListener()
      }
    })

    // 外部触发打开输入框
    watch(
      () => props.openKey,
      (v) => {
        if (v) {
          handleShowFullInput()
        }
      }
    )

    // 组件卸载时
    onUnmounted(() => {
      removeClickOutsideListener()
    })

    // 处理textarea输入变化，实现自动高度调整
    const handleTextareaInput = (event: Event) => {
      const textarea = event.target as HTMLTextAreaElement
      // 重置高度以获取正确的scrollHeight
      textarea.style.height = 'auto'
      // 计算新高度，最小60px，最大400px
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 300)
      textarea.style.height = newHeight + 'px'
    }

    return {
      showFullInput,
      commentText,
      textareaRef,
      handleShowFullInput,
      handleHideFullInput,
      handleSendComment,
      handleQuickLike,
      handleTextareaInput,
      SvgLikeActive,
      SvgLike,
    }
  }
})
</script>

<style lang="less" scoped>
.bottom-input-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #E5E5E5;
  padding: 0;
  z-index: 10;

  .quick-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 10px;

    .reply-btn {
      flex: 1;
      background: #FFFFFF;
      border: 1px solid #EBEEF5;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      height: 48px;
      display: flex;
      align-items: center;

      &:hover {
        border-color: #FF7D45;
        background: #FFE6D9;
      }

      &:focus {
        outline: none;
        border-color: #FF7D45;
        box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.1);
      }

      span {
        color: #636E72;
        font-size: 13px;
      }
    }

    .like-btn {
      background: none;
      border: none;
      padding: 6px;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #FFE6D9;
      }

      .action-icon {
        width: 32px;
        height: 32px;
        opacity: 0.7;
      }
    }
  }

  .input-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #FFFFFF;
    box-sizing: border-box;

    .input-container {
      border: 1px solid #E86835;
      margin: 10px;
      box-sizing: border-box;
      border-radius: 10px;
      display: block;
      .input-textarea {
        border: none;
        padding: 5px 17px;
        margin: 10px 10px;
        font-size: 14px;
        line-height: 1.5;
        box-sizing: border-box;
        width: -webkit-fill-available;
        resize: none;
        outline: none;
        display: block;
        font-family: inherit;
        min-height: 60px;
        box-sizing: border-box;

        &::placeholder {
          color: #B2BEC3;
        }
        /* 现代化滚动条样式 */
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #F5F5F5;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: #CCCCCC;
          border-radius: 3px;
          transition: all 0.3s ease;

          &:hover {
            background: #999999;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
          }
        }

        &::-webkit-scrollbar-corner {
          background: transparent;
        }
      }

      .input-actions {
        padding: 12px 10px;
        margin: 0 10px;
        background: #FFFFFF;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .send-btn {
          background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #FFFFFF;
          font-weight: 500;


          &:disabled {
            background: #CCCCCC;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .send-icon {
            width: 16px;
            height: 16px;
            filter: brightness(0) invert(1);
          }
        }
      }
    }

  }
}
</style>
