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
