<template>
  <div class="settings-field">
    <div class="field-title">
      {{ section.label }}
    </div>
    <div class="field-desc">
      点击快捷键区域后按下组合键即可修改，修改后立即生效
    </div>
    <div v-if="!isSettingsLoaded" class="loading-tip">
      加载中...
    </div>
    <div v-else class="keyboard-list">
      <div
        v-for="item in section.keyboard"
        :key="item.id"
        class="keyboard-item"
      >
        <div class="keyboard-label">
          <div class="keyboard-title">
            {{ item.label }}
          </div>
          <div class="keyboard-desc">
            {{ item.desc }}
          </div>
        </div>
        <button
          type="button"
          class="keyboard-key"
          :class="{ 'keyboard-key--active': recordingId === item.id }"
          @click="startRecord(item.id)"
        >
          {{ recordingId === item.id ? '请按下快捷键...' : keyboard[item.id] }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ISettingsSection } from '../../config/settingsRegistry'
import type { KeyboardActionId } from 'commonModule/type/mainStore'
import Message from 'renderModule/components/ui/message'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from 'vue'
import { useSettingsStore } from '../../pinia/settings'

function formatKeyboardEvent(event: KeyboardEvent): string | null {
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    return null
  }

  const parts: string[] = []
  if (event.ctrlKey) {
    parts.push('Ctrl')
  }
  if (event.altKey) {
    parts.push('Alt')
  }
  if (event.shiftKey) {
    parts.push('Shift')
  }
  if (event.metaKey) {
    parts.push('Cmd')
  }

  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key
  parts.push(key)
  return parts.join('+')
}

export default defineComponent({
  name: 'KeyboardField',
  props: {
    section: {
      type: Object as PropType<ISettingsSection>,
      required: true,
    },
  },
  setup() {
    const settingsStore = useSettingsStore()
    const recordingId = ref<KeyboardActionId | null>(null)
    const isSettingsLoaded = computed(() => settingsStore.isLoaded)
    const keyboard = computed(() => settingsStore.device?.keyboard ?? {})

    const startRecord = (actionId: KeyboardActionId) => {
      recordingId.value = actionId
    }

    const handleKeydown = async (event: KeyboardEvent) => {
      if (!recordingId.value) {
        return
      }
      event.preventDefault()
      event.stopPropagation()

      if (event.key === 'Escape') {
        recordingId.value = null
        return
      }

      const binding = formatKeyboardEvent(event)
      if (!binding) {
        return
      }

      const actionId = recordingId.value
      recordingId.value = null
      const ok = await settingsStore.updateKeyboard(actionId, binding)
      if (!ok) {
        Message.error('快捷键保存失败')
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown, true)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown, true)
    })

    return {
      recordingId,
      isSettingsLoaded,
      keyboard,
      startRecord,
    }
  },
})
</script>

<style lang="less" scoped>
.settings-field {
  .field-title {
    font-size: 16px;
    font-weight: 500;
    color: #2D3436;
    margin-bottom: 8px;
  }

  .field-desc {
    font-size: 13px;
    color: #B2BEC3;
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .loading-tip {
    text-align: center;
    padding: 48px 0;
    font-size: 14px;
    color: #B2BEC3;
  }

  .keyboard-list {
    .keyboard-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      .keyboard-label {
        flex: 1;
        padding-right: 16px;
      }

      .keyboard-title {
        font-size: 14px;
        font-weight: 500;
        color: #2D3436;
        margin-bottom: 4px;
      }

      .keyboard-desc {
        font-size: 12px;
        color: #B2BEC3;
        line-height: 1.4;
      }
    }
  }

  .keyboard-key {
    min-width: 140px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    background: #FAFBFC;
    color: #2D3436;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #FF7D45;
      color: #FF7D45;
    }

    &--active {
      border-color: #FF7D45;
      color: #FF7D45;
      background: #FFF5F0;
    }
  }
}
</style>
