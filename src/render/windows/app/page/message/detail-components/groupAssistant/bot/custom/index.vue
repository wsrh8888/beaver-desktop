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
  <div class="bot-custom-container">
    <!-- 第一步：添加机器人 -->
    <botCustomStep1Add v-if="!isEdit" @close="handleClose" @created="handleCreated" />
    <!-- 第二步：管理机器人 -->
    <botCustomStep2Manage v-else @close="handleClose" @saved="handleSaved" />
  </div>
</template>

<script lang="ts">
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import { computed, defineComponent } from 'vue'
import botCustomStep1Add from './step1Add.vue'
import botCustomStep2Manage from './step2Manage.vue'

export default defineComponent({
  name: 'botCustom',
  components: {
    botCustomStep1Add,
    botCustomStep2Manage,
  },
  emits: ['close'],
  setup(_, { emit }) {
    const groupAssistantViewStore = useGroupAssistantViewStore()

    const isEdit = computed(() => !!groupAssistantViewStore.groupBotId)

    const handleCreated = (botId: string) => {
      groupAssistantViewStore.groupBotId = botId
      groupAssistantViewStore.markListDirty()
    }

    const handleSaved = () => {
      groupAssistantViewStore.markListDirty()
    }

    const handleClose = () => {
      emit('close')
    }

    return {
      isEdit,
      handleCreated,
      handleSaved,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.bot-custom-container {
  width: 100%;
}
</style>
