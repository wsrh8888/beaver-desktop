<template>
  <div class="settings-field">
    <div class="field-title">
      {{ section.label }}
    </div>
    <div class="toggle-list">
      <div
        v-for="field in section.fields"
        :key="`${field.scope}-${field.key}`"
        class="toggle-item"
      >
        <div class="toggle-label">
          <div class="toggle-title">
            {{ field.label }}
          </div>
          <div class="toggle-desc">
            {{ field.desc }}
          </div>
        </div>
        <label class="settings-switch">
          <input
            :checked="getValue(field.scope, field.key)"
            type="checkbox"
            @change="handleToggle(field.scope, field.key, ($event.target as HTMLInputElement).checked)"
          >
          <span class="settings-switch-slider" />
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ISettingsSection, NotificationSettingsKey, PrivacySettingsKey, SettingsToggleScope } from '../../config/settingsRegistry'
import Message from 'renderModule/components/ui/message'
import { defineComponent, type PropType } from 'vue'
import { useSettingsStore } from '../../pinia/settings'

export default defineComponent({
  name: 'ToggleField',
  props: {
    section: {
      type: Object as PropType<ISettingsSection>,
      required: true,
    },
  },
  setup() {
    const settingsStore = useSettingsStore()

    const getValue = (scope: SettingsToggleScope, key: string) => {
      if (!settingsStore.settings) {
        return false
      }
      if (scope === 'privacy') {
        return settingsStore.settings.privacy[key as PrivacySettingsKey]
      }
      if (scope === 'notification') {
        return settingsStore.settings.notification[key as NotificationSettingsKey]
      }
      return false
    }

    const handleToggle = async (scope: SettingsToggleScope, key: string, value: boolean) => {
      let ok = false
      if (scope === 'privacy') {
        ok = await settingsStore.updatePrivacy(key as PrivacySettingsKey, value)
      }
      else if (scope === 'notification') {
        ok = await settingsStore.updateNotification(key as NotificationSettingsKey, value)
      }
      if (!ok) {
        Message.error('保存失败')
      }
    }

    return {
      getValue,
      handleToggle,
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

  .toggle-list {
    .toggle-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      .toggle-label {
        flex: 1;
        padding-right: 16px;
      }

      .toggle-title {
        font-size: 14px;
        font-weight: 500;
        color: #2D3436;
        margin-bottom: 4px;
      }

      .toggle-desc {
        font-size: 12px;
        color: #B2BEC3;
        line-height: 1.4;
      }
    }
  }

  .settings-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .settings-switch-slider {
        background-color: #FF7D45;

        &::before {
          transform: translateX(20px);
        }
      }
    }
  }

  .settings-switch-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #DFE6E9;
    transition: 0.2s;
    border-radius: 24px;

    &::before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.2s;
      border-radius: 50%;
    }
  }
}
</style>
