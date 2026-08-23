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
  <div class="select-friend">
    <BeaverDialog
      v-model="visible"
      :title="title"
      width="720px"
      @close="handleClose"
    >
      <div class="select-friend-body">
        <div class="select-friend-left">
          <BeaverInput
            v-model="searchKeyword"
            placeholder="搜索好友"
            clearable
            :prefix-icon="searchIcon"
          />

          <div class="friend-list">
            <div
              v-for="friend in filteredFriends"
              :key="friend.userId"
              class="friend-item"
              :class="{
                selected: isSelected(friend.userId),
                disabled: isDisabled(friend.userId),
              }"
              @click="!isDisabled(friend.userId) && toggleFriendSelection(friend)"
            >
              <div class="friend-avatar">
                <BeaverImage
                  :file-name="friend.avatar"
                  :cache-type="CacheType.USER_AVATAR"
                  :alt="friend.nickName"
                />
              </div>
              <div class="friend-name">
                {{ friend.nickName }}
              </div>
              <div class="friend-checkbox">
                <img
                  v-if="isSelected(friend.userId)"
                  src="renderModule/assets/image/create-group/check.svg"
                  alt="选中"
                >
              </div>
            </div>
            <div v-if="filteredFriends.length === 0" class="empty-tip">
              暂无好友
            </div>
          </div>
        </div>

        <div class="select-friend-right">
          <div class="selected-friends">
            <label>已选择的好友 ({{ selectedFriends.length }})</label>
            <div class="selected-friends-list">
              <div
                v-for="friend in selectedFriends"
                :key="friend.userId"
                class="selected-friend"
              >
                <span>{{ friend.nickName }}</span>
                <button class="remove-friend" @click="removeFriend(friend.userId)">
                  <img src="renderModule/assets/image/create-group/remove.svg" alt="删除">
                </button>
              </div>
              <div v-if="selectedFriends.length === 0" class="empty-tip">
                请从左侧选择好友
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
          :disabled="selectedFriends.length === 0"
          @click="handleConfirm"
        >
          确定
        </BeaverButton>
      </template>
    </BeaverDialog>
  </div>
</template>

<script lang="ts">
import type { IFriendInfo } from 'commonModule/type/ajax/friend'
import { CacheType } from 'commonModule/type/cache/cache'
import searchIcon from 'renderModule/assets/image/create-group/search.svg'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import BeaverInput from 'renderModule/components/ui/input/Input.vue'
import { computed, defineComponent, onMounted, type PropType, ref } from 'vue'

export default defineComponent({
  name: 'SelectFriend',
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
      default: '选择好友',
    },
    disabledIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'close', 'confirm'],
  setup(props, { emit }) {
    const searchKeyword = ref('')
    const selectedFriends = ref<IFriendInfo[]>([])
    const friendList = ref<IFriendInfo[]>([])

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const isDisabled = (userId: string): boolean => {
      return props.disabledIds.includes(userId)
    }

    const filteredFriends = computed(() => {
      if (!searchKeyword.value.trim())
        return friendList.value
      const keyword = searchKeyword.value.toLowerCase()
      return friendList.value.filter(friend =>
        friend.nickName.toLowerCase().includes(keyword),
      )
    })

    const isSelected = (userId: string): boolean => {
      return selectedFriends.value.some(friend => friend.userId === userId)
    }

    const toggleFriendSelection = (friend: IFriendInfo) => {
      const index = selectedFriends.value.findIndex(f => f.userId === friend.userId)
      if (index > -1)
        selectedFriends.value.splice(index, 1)
      else
        selectedFriends.value.push(friend)
    }

    const removeFriend = (userId: string) => {
      const index = selectedFriends.value.findIndex(friend => friend.userId === userId)
      if (index > -1)
        selectedFriends.value.splice(index, 1)
    }

    const loadFriends = async () => {
      try {
        const res = await electron.database.friend.getFriendsList({
          page: 1,
          limit: 1000,
        })
        friendList.value = res.list || []
      }
      catch {
        friendList.value = []
      }
    }

    onMounted(() => {
      loadFriends()
    })

    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }

    const handleConfirm = () => {
      if (selectedFriends.value.length === 0)
        return
      emit('confirm', selectedFriends.value.map(f => f.userId))
      handleClose()
    }

    return {
      CacheType,
      searchIcon,
      visible,
      searchKeyword,
      selectedFriends,
      filteredFriends,
      isSelected,
      isDisabled,
      toggleFriendSelection,
      removeFriend,
      handleClose,
      handleConfirm,
    }
  },
})
</script>

<style lang="less" scoped>
.select-friend {
  pointer-events: auto;
}

.select-friend-body {
  display: flex;
  gap: 24px;
  height: calc(80vh - 56px - 72px - 48px);
  min-height: 320px;
}

.select-friend-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.friend-list {
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

.friend-item {
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

    .friend-checkbox {
      background-color: #FF7D45;
      border-color: #FF7D45;
    }
  }

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;

    &:hover {
      background-color: transparent;
    }
  }
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  background-color: #D9E6FF;
  flex-shrink: 0;
}

.friend-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-checkbox {
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

.select-friend-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.selected-friends {
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

.selected-friends-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #EBEEF5;
  border-radius: 6px;
  padding: 8px;
  min-height: 120px;
}

.selected-friend {
  display: inline-flex;
  align-items: center;
  background-color: #F9FAFB;
  border-radius: 16px;
  padding: 4px 12px;
  margin: 4px;

  span {
    margin-right: 8px;
    font-size: 12px;
    color: #636E72;
  }
}

.remove-friend {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #B2BEC3;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #FF5252;
  }

  img {
    width: 10px;
    height: 10px;
  }
}

.empty-tip {
  text-align: center;
  color: #B2BEC3;
  font-size: 13px;
  padding: 40px 0;
}
</style>
