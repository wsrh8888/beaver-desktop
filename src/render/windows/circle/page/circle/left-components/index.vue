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
  <div class="circle-sidebar">
    <div class="circle-sidebar-top">
      <button class="circle-sidebar-create" type="button" @click="$emit('create')">
        <img src="renderModule/assets/image/common/add.svg" alt="创建" class="circle-sidebar-create-icon">
        创建圈子
      </button>
    </div>

    <div class="circle-sidebar-title">
      我的圈子
    </div>

    <div class="circle-sidebar-list">
      <div
        v-for="item in list"
        :key="item.circleId"
        class="circle-sidebar-item"
        :class="{ active: currentCircleId === item.circleId }"
        @click="$emit('select', item.circleId)"
      >
        <div class="circle-sidebar-item-avatar">
          <BeaverImage
            v-if="item.avatar"
            :file-name="item.avatar"
            alt="avatar"
            image-class="circle-sidebar-item-avatar-img"
          />
        </div>
        <div class="circle-sidebar-item-main">
          <div class="circle-sidebar-item-name">
            {{ item.name }}
          </div>
          <div class="circle-sidebar-item-meta">
            {{ item.memberCount }} 成员
            <template v-if="item.postCount !== undefined"> · {{ item.postCount }} 帖</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ICircleListItem } from 'commonModule/type/ajax/circle'
import { defineComponent, onMounted, ref } from 'vue'
import { getMyCircleListApi } from 'renderModule/api/circle'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message'
import Logger from 'renderModule/utils/logger'
import { useCircleStore } from 'renderModule/windows/circle/store/circle/circle'

const logger = new Logger('CircleLeftPanel')

export default defineComponent({
  name: 'CircleLeft',
  components: { BeaverImage },
  props: {
    currentCircleId: {
      type: String,
      default: '',
    },
  },
  emits: ['select', 'create'],
  setup(_props, { expose }) {
    const list = ref<ICircleListItem[]>([])
    const loading = ref(false)
    const circleStore = useCircleStore()

    const loadList = async () => {
      loading.value = true
      logger.info({ text: '开始加载圈子列表', data: { page: 1, limit: 100 } })

      try {
        const res = await getMyCircleListApi({ page: 1, limit: 100 })
        if (res.code !== 0) {
          logger.error({ text: '获取圈子列表失败', data: { code: res.code, msg: res.msg } })
          Message.error(res.msg || '获取圈子列表失败')
          return
        }
        list.value = res.result.list || []
        circleStore.myCircles = list.value
        logger.info({ text: '获取圈子列表成功', data: { count: list.value.length } })
      }
      catch (error) {
        logger.error({ text: '获取圈子列表异常', data: { error } })
        Message.error('获取圈子列表异常')
      }
      finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadList()
    })

    expose({ loadList })

    return {
      list,
      loading,
      loadList,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-sidebar {
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #EBEEF5;
  background: #FFFFFF;
}

.circle-sidebar-top {
  padding: 16px;
  border-bottom: 1px solid #EBEEF5;
}

.circle-sidebar-create {
  width: 100%;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 125, 69, 0.28);
}

.circle-sidebar-create-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.circle-sidebar-title {
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid #EBEEF5;
  font-size: 14px;
  font-weight: 600;
  color: #2D3436;
}

.circle-sidebar-list {
  flex: 1;
  overflow-y: auto;

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

.circle-sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #EBEEF5;
  transition: background 0.2s;

  &:hover {
    background: #F9FAFB;
  }

  &.active {
    background: rgba(255, 125, 69, 0.12);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 16px;
      bottom: 16px;
      width: 3px;
      background: #FF7D45;
      border-radius: 0 2px 2px 0;
    }
  }
}

.circle-sidebar-item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #F0F2F5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.circle-sidebar-item-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circle-sidebar-item-main {
  flex: 1;
  min-width: 0;
}

.circle-sidebar-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle-sidebar-item-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #636E72;
}
</style>
