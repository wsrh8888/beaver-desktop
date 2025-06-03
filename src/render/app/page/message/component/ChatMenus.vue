<template>
  <div class="chat-input-area" :style="{ height: `${height}px` }">
    <div class="toolbar">
      <div 
        v-for="tool in toolList" 
        :key="tool.id" 
        class="toolbar-btn" 
        @click="handleToolClick(tool.value)"
      >
        <img :src="tool.icon" :alt="tool.name" />
      </div>
    </div>
    <div class="input-row">
      <div
        class="message-input"
        contenteditable="true"
        @input="handleInput"
        @keydown.enter.prevent="handleSend"
        @focus="handleFocus"
        @blur="handleBlur"
        ref="inputRef"
      ></div>
      <div class="placeholder" v-show="!inputValue.trim()">输入消息...</div>
    </div>
    <div class="send-row">
      <button class="send-btn" :class="{ 'disabled': !inputValue.trim() }" @click="handleSend">发送</button>
    </div>
    <EmojiComponent 
      v-if="showEmoji" 
      @select="handleEmojiSelect"
      :menuHeight="height"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation';
import { toolList } from './data';
import EmojiComponent from './emoji.vue';

export default defineComponent({
  components: {
    EmojiComponent
  },
  setup() {
    const conversationStore = useConversationStore();
    const inputValue = ref('');
    const inputRef = ref<HTMLDivElement | null>(null);
    const height = ref(151);
    const showEmoji = ref(false);

    const handleInput = (e: Event) => {
      const target = e.target as HTMLDivElement;
      inputValue.value = target.innerText;
    };

    const handleFocus = () => {
      if (inputRef.value) {
        inputRef.value.focus();
      }
    };

    const handleBlur = () => {
      if (inputRef.value) {
        inputRef.value.blur();
      }
    };

    const handleSend = async () => {
      const content = inputValue.value.trim();
      if (!content) return;
      
      const conversationId = conversationStore.currentChatId;
      if (!conversationId) return;

      // 清空输入框
      inputValue.value = '';
      if (inputRef.value) {
        inputRef.value.innerText = '';
      }
      
      try {
        // 使用消息管理器发送消息（包含去重逻辑）
        const { messageManager } = await import('renderModule/app/message-manager');
        await messageManager.sendMessage(conversationId, content);
      } catch (error) {
        console.error('发送消息失败:', error);
        // 可以在这里添加错误提示
      }
    };

    const handleToolClick = (toolType: string) => {
      switch (toolType) {
        case 'emoji':
          showEmoji.value = !showEmoji.value;
          break;
        // 其他工具处理...
        default:
          break;
      }
    };

    // 修复后的表情选择处理函数
    const handleEmojiSelect = (emojiName: string) => {
      if (inputRef.value) {
        // 确保输入框获得焦点
        inputRef.value.focus();
        
        try {
          // 获取当前选区
          const selection = window.getSelection();
          
          // 检查选区是否存在且有范围
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // 检查范围是否在输入框内
            if (inputRef.value.contains(range.commonAncestorContainer)) {
              // 在光标位置插入表情文本
              const textNode = document.createTextNode(emojiName);
              range.insertNode(textNode);
              
              // 移动光标到插入的文本之后
              range.setStartAfter(textNode);
              range.setEndAfter(textNode);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              // 如果选区不在输入框内，追加到末尾
              inputRef.value.innerText += emojiName;
              
              // 移动光标到末尾
              const newRange = document.createRange();
              newRange.selectNodeContents(inputRef.value);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } else {
            // 如果没有选区，直接追加到末尾
            inputRef.value.innerText += emojiName;
            
            // 创建一个新的范围并设置到末尾
            const newRange = document.createRange();
            newRange.selectNodeContents(inputRef.value);
            newRange.collapse(false);
            
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
          
          // 手动触发输入事件，更新inputValue
          const inputEvent = new Event('input', { bubbles: true });
          inputRef.value.dispatchEvent(inputEvent);
        } catch (error) {
          console.error('Error inserting emoji:', error);
          
          // 出错时的备用方案：直接追加
          inputRef.value.innerText += emojiName;
          
          // 手动触发输入事件
          const inputEvent = new Event('input', { bubbles: true });
          inputRef.value.dispatchEvent(inputEvent);
        }
      }
    };

    const setHeight = (newHeight: number) => {
      height.value = newHeight;
    };

    // 关闭表情弹窗的方法
    const closeEmojiPopup = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 检查点击是否在表情弹窗内或表情按钮上
      const isEmojiPopup = !!target.closest('.emoji-popup');
      const isEmojiButton = !!target.closest('.toolbar-btn') && 
                            target.closest('.toolbar-btn')?.querySelector('img')?.alt === '表情';
      
      // 只有点击在弹窗和按钮外部时才关闭
      if (!isEmojiPopup && !isEmojiButton && showEmoji.value) {
        showEmoji.value = false;
      }
    };

    // 新增 hideEmojiPopup 方法
    const hideEmojiPopup = () => {
      showEmoji.value = false;
    };

    return {
      inputValue,
      inputRef,
      handleSend,
      handleInput,
      handleFocus,
      handleBlur,
      handleToolClick,
      toolList,
      height,
      setHeight,
      showEmoji,
      handleEmojiSelect,
      closeEmojiPopup,
      hideEmojiPopup
    };
  }
});
</script>

<style lang="less" scoped>
.chat-input-area {
  background-color: #FFFFFF;
  border-top: 1px solid #EBEEF5;
  padding: 5px 24px 10px;
  display: flex;
  flex-direction: column;
  will-change: height;
  transform: translateZ(0);
  transition: height 0.1s ease;
  min-height: 150px;

  .toolbar {
    display: flex;
    align-items: center;
    .toolbar-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      color: #B2BEC3;
      cursor: pointer;
      img {
        width: 20px;
        height: 20px;
      }
      &:hover {
        color: #FF7D45;
      }
    }
  }
  .input-row {
    display: flex;
    align-items: center;
    flex: 1;
    position: relative;
    overflow: hidden;
    
    .message-input {
      resize: none;
      width: 100%;
      height: 100%;
      font-size: 14px;
      border: none;
      color: #2D3436;
      border-radius: 6px;
      overflow-y: auto;
      display: block;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
      max-width: 100%;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(178, 190, 195, 0.5);
        border-radius: 3px;
        
        &:hover {
          background-color: rgba(178, 190, 195, 0.8);
        }
      }

      &:focus { 
        outline: none;
        background: #FFFFFF;
      }
    }

    .placeholder {
      position: absolute;
      left: 1px;
      top: 1px;
      color: #B2BEC3;
      pointer-events: none;
      font-size: 14px;
    }
  }
  .send-row {
    text-align: right;
    margin-top: 4px;
    .send-btn {
      padding: 8px 24px;
      background: #FF7D45;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      &:hover { background: #FF6B3D; }
      &.disabled { background: #B2BEC3; cursor: not-allowed; }
    }
  }
}
</style>
