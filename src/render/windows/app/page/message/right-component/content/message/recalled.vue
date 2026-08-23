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
  <div class="recalled-message">
    <span>{{ displayText }}</span>
  </div>
</template>

<script lang="ts">
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, defineComponent, PropType } from 'vue'
import { IMessageMsg } from 'commonModule/type/ws/message-types'

export default defineComponent({
  name: 'RecalledMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
    sender: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserStore()

    const displayText = computed(() => {
      if (props.sender.userId === userStore.getUserId)
        return '你撤回了一条消息'
      const name = props.sender.nickName || '对方'
      return `${name} 撤回一条消息`
    })

    return {
      displayText,
    }
  },
})
</script>

<style lang="less" scoped>
.recalled-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  padding: 2px 4px;
  color: #ffffff;
  user-select: none;
}
</style>
