<template>
  <BeaverDialog
    :model-value="groupAssistantViewStore.visible"
    title=" "
    width="580px"
    :close-on-click-modal="false"
    class="group-assistant-overlay"
    @update:model-value="onDialogChange"
  >
    <div class="group-assistant-overlay__shell">
      <div class="group-assistant-overlay__header" >
        <button class="group-assistant-overlay__header-btn" type="button" @click="onBack" v-if="!localBotType">
          <img src="renderModule/assets/image/common/back.svg" alt="返回">
        </button>
        <h3 class="group-assistant-overlay__title">
          {{ localBotType ? '管理群助手' : '添加群助手' }}
        </h3>
        <button class="group-assistant-overlay__header-btn" type="button" @click="close">
          <img src="renderModule/assets/image/group/close.svg" alt="关闭">
        </button>
      </div>

      <div class="group-assistant-overlay__body">
        <!-- 第一步：选择助手类型 -->
        <div v-if="!localBotType">
          <group-assistant-picker
            @select="selectBot"
          />
        </div>
        <!-- 第二步：编辑/管理机器人 -->
        <div v-else>
          <bot-custom
            v-if="localBotType === 'custom'"
            @close="close"
          />
        </div>
      </div>
    </div>
  </BeaverDialog>
</template>

<script lang="ts">
import type { GroupBotType } from './config'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import botCustom from './bot/custom/index.vue'
import groupAssistantPicker from './create/picker.vue'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  components: {
    BeaverDialog,
    groupAssistantPicker,
    botCustom,
  },
  setup() {
    const groupAssistantViewStore = useGroupAssistantViewStore()
    
    // 使用本地状态管理当前选中的助手类型
    const localBotType = ref<GroupBotType>(groupAssistantViewStore.groupBotType as GroupBotType)

    // 监听 store 中 groupBotType 的变化，同步到本地状态
    watch(() => groupAssistantViewStore.groupBotType, (newType) => {
      localBotType.value = newType as GroupBotType
    })

    const close = () => {
      groupAssistantViewStore.close()
    }

    // 选择助手类型
    const selectBot = (type: GroupBotType) => {
      localBotType.value = type
    }


    // 返回逻辑
    const onBack = () => {
      if (groupAssistantViewStore.groupBotId) {
        // 如果已经保存了机器人，直接关闭
        close()
      } else if (localBotType.value) {
        // 如果选择了类型但没保存，返回选择页
        localBotType.value = ''
        groupAssistantViewStore.groupBotType = ''
      } else {
        // 其他情况关闭
        close()
      }
    }

    const onDialogChange = (visible: boolean) => {
      if (!visible) {
        close()
      }
    }

    return {
      groupAssistantViewStore,
      localBotType,
      close,
      selectBot,
      onBack,
      onDialogChange,
    }
  },
})
</script>

<style lang="less" scoped>
.group-assistant-overlay {
  :deep(.modal-header) {
    display: none;
  }

  :deep(.modal-body) {
    padding: 0;
  }

  .group-assistant-overlay__shell {
    display: flex;
    flex-direction: column;
    height: 500px;
  }

  .group-assistant-overlay__header {
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 16px 0 12px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
  }

  .group-assistant-overlay__header-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .group-assistant-overlay__title {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    color: #2d3436;
    margin: 0;
    padding: 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }

  .group-assistant-overlay__body {
    padding: 20px 16px 16px;
    max-height: 70vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(178, 190, 195, 0.5);
      border-radius: 3px;
    }
  }
}
</style>
