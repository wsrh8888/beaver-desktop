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
  <div class="select-conversation">
    <BeaverDialog
      v-model="visible"
      :title="title"
      width="720px"
      @close="handleClose"
    >
      <div class="select-conversation-body">
        <div class="select-conversation-left">
          <BeaverInput
            v-model="searchKeyword"
            placeholder="搜索会话"
            clearable
            :prefix-icon="searchIcon"
          />

          <div class="conversation-list">
            <div
              v-for="item in filteredList"
              :key="item.conversationId"
              class="conversation-item"
              :class="{ selected: selectedId === item.conversationId }"
              @click="pickConversation(item)"
            >
              <div class="conversation-avatar">
                <BeaverImage
                  :file-name="item.avatar"
                  :cache-type="CacheType.USER_AVATAR"
                  :alt="item.nickName"
                />
              </div>
              <div class="conversation-name">
                {{ item.nickName }}
              </div>
              <div class="conversation-checkbox">
                <img
                  v-if="selectedId === item.conversationId"
                  src="renderModule/assets/image/create-group/check.svg"
                  alt="选中"
                >
              </div>
            </div>
            <div v-if="filteredList.length === 0" class="empty-tip">
              暂无会话
            </div>
          </div>
        </div>

        <div class="select-conversation-right">
          <div class="selected-conversations">
            <label>已选择的会话 ({{ selectedItem ? 1 : 0 }})</label>
            <div class="selected-conversations-list">
              <div v-if="selectedItem" class="selected-conversation">
                <span>{{ selectedItem.nickName }}</span>
                <button class="remove-conversation" @click="clearSelection">
                  <img src="renderModule/assets/image/create-group/remove.svg" alt="删除">
                </button>
              </div>
              <div v-else class="empty-tip">
                请从左侧选择会话
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <BeaverButton type="default" @click="handleClose">
          取消
        </BeaverButton>
        <BeaverButton
          type="primary"
          style="margin-left: 8px"
          :disabled="!selectedId || sending"
          @click="handleConfirm"
        >
          {{ sending ? '发送中...' : '发送' }}
        </BeaverButton>
      </template>
    </BeaverDialog>
  </div>
</template>

<script lang="ts">
import Logger from 'renderModule/utils/logger';
const logger = new Logger('index')

import type { IConversationInfoRes } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'
import { CacheType } from 'commonModule/type/cache/cache'
import searchIcon from 'renderModule/assets/image/create-group/search.svg'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import BeaverInput from 'renderModule/components/ui/input/Input.vue'
import Message from 'renderModule/components/ui/message'
import { ChatCore } from 'renderModule/core/message/index'
import { computed, defineComponent, onMounted, type PropType, ref } from 'vue'

export default defineComponent({
  name: 'SelectConversation',
  components: {
    BeaverDialog,
    BeaverButton,
    BeaverInput,
    BeaverImage,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '选择会话',
    },
    msg: {
      type: Object as PropType<IMessageMsg | null>,
      default: null,
    },
  },
  emits: ['update:modelValue', 'close', 'sent'],
  setup(props, { emit }) {
    logger.info({ text: 'setup 开始' })
    const searchKeyword = ref('')
    const selectedId = ref('')
    const sending = ref(false)
    const conversations = ref<IConversationInfoRes[]>([])

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const filteredList = computed(() => {
      const list = conversations.value
      if (!searchKeyword.value.trim())
        return list
      const kw = searchKeyword.value.toLowerCase()
      return list.filter(c => c.nickName?.toLowerCase().includes(kw))
    })

    const selectedItem = computed(() => {
      if (!selectedId.value)
        return null
      return conversations.value.find(c => c.conversationId === selectedId.value) || null
    })

    const pickConversation = (item: IConversationInfoRes) => {
    logger.info({ text: 'pickConversation 开始' })
      selectedId.value = item.conversationId
    }

    const clearSelection = () => {
    logger.info({ text: 'clearSelection 开始' })
      selectedId.value = ''
    }

    const loadConversations = async () => {
    logger.info({ text: 'loadConversations 开始' })
      try {
        const res = await electron.database.chat.getRecentChatList({
          page: 1,
          limit: 100,
        })
        conversations.value = res.list || []
      }
      catch {
      logger.error({ text: 'defineComponent 失败' })
        conversations.value = []
      }
    }

    onMounted(() => {
      loadConversations()
    })

    const handleClose = () => {
    logger.info({ text: 'handleClose 开始' })
      emit('update:modelValue', false)
      emit('close')
    }

    const handleConfirm = async () => {
    logger.info({ text: 'handleConfirm 开始' })
      if (!selectedId.value || !props.msg || sending.value)
        return
      const target = conversations.value.find(c => c.conversationId === selectedId.value)
      const chatType = target?.chatType === 2 ? 'group' : 'private'
      sending.value = true
      try {
        await ChatCore.sendMessage(selectedId.value, props.msg, chatType)
        Message.success('已发送')
        emit('sent')
        handleClose()
      }
      catch {
      logger.error({ text: 'defineComponent 失败' })
        Message.error('发送失败')
      }
      finally {
        sending.value = false
      }
    }

    return {
      CacheType,
      searchIcon,
      visible,
      searchKeyword,
      selectedId,
      selectedItem,
      sending,
      filteredList,
      pickConversation,
      clearSelection,
      handleClose,
      handleConfirm,
    }
  },
})
</script>

<style lang="less" scoped>
.select-conversation {
  pointer-events: auto;
}

.select-conversation-body {
  display: flex;
  gap: 24px;
  height: calc(80vh - 56px - 72px - 48px);
  min-height: 320px;
}

.select-conversation-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #EBEEF5;
  border-radius: 6px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #F9FAFB;
  }

  &.selected {
    background-color: #FFE6D9;

    .conversation-checkbox {
      background-color: #FF7D45;
      border-color: #FF7D45;
    }
  }
}

.conversation-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  background-color: #D9E6FF;
  flex-shrink: 0;
}

.conversation-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  flex-shrink: 0;
  transition: all 0.2s;

  img {
    width: 12px;
    height: 12px;
  }
}

.select-conversation-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.selected-conversations {
  flex: 1;
  display: flex;
  flex-direction: column;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #2D3436;
  }
}

.selected-conversations-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  padding: 8px;
  min-height: 120px;
}

.selected-conversation {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 4px;
  background: #F5F6FA;
  border-radius: 6px;
  font-size: 13px;
  color: #2D3436;
}

.remove-conversation {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    width: 12px;
    height: 12px;
  }
}

.empty-tip {
  text-align: center;
  color: #B2BEC3;
  font-size: 13px;
  padding: 40px 0;
}
</style>
