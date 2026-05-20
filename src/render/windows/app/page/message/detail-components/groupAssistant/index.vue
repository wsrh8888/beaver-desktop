<template>
  <BeaverDialog
    :model-value="store.visible"
    title=" "
    width="480px"
    :close-on-click-modal="false"
    class="group-assistant-overlay"
    @update:model-value="onVisibleChange"
  >
    <div class="group-assistant-overlay__shell">
      <div class="group-assistant-overlay__header">
        <button
          class="group-assistant-overlay__header-btn"
          type="button"
          @click="store.headerBack()"
        >
          <img src="renderModule/assets/image/common/back.svg" alt="返回">
        </button>

        <h3 class="group-assistant-overlay__title">
          {{ store.headerTitle }}
        </h3>

        <button class="group-assistant-overlay__header-btn" type="button" @click="store.close()">
          <img src="renderModule/assets/image/group/close.svg" alt="关闭">
        </button>
      </div>

      <div class="group-assistant-overlay__body">
        <group-assistant-picker v-if="store.view === 'picker'" />
        <group-assistant-custom-form v-else-if="store.view === 'custom'" />
        <group-assistant-detail v-else-if="store.view === 'detail'" />
      </div>
    </div>
  </BeaverDialog>
</template>

<script lang="ts">
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import { defineComponent } from 'vue'
import groupAssistantCustomForm from './customForm.vue'
import groupAssistantDetail from './detail.vue'
import groupAssistantPicker from './picker.vue'

export default defineComponent({
  name: 'groupAssistantOverlay',
  components: {
    BeaverDialog,
    groupAssistantPicker,
    groupAssistantCustomForm,
    groupAssistantDetail,
  },
  setup() {
    const store = useGroupAssistantViewStore()

    const onVisibleChange = (v: boolean) => {
      if (!v)
        store.close()
    }

    return {
      store,
      onVisibleChange,
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
    flex-shrink: 0;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .group-assistant-overlay__header-placeholder {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .group-assistant-overlay__title {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    color: #2d3436;
    margin: 0;
    padding: 0 8px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
