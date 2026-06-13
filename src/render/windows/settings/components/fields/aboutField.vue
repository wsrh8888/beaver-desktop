<template>
  <div class="settings-field">
    <div class="about-content">
      <img src="commonModule/assets/img/logo/logo.png" alt="海狸 Logo" class="about-content__logo">
      <div class="about-content__name">
        海狸IM
      </div>
      <div class="about-content__version">
        版本 {{ currentVersion }}
      </div>
      <BeaverButton type="primary" :loading="isChecking" @click="handleCheckUpdate">
        检查更新
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import type { ISettingsSection } from '../../config/settingsRegistry'
import { getLatestVersionApi } from 'renderModule/api/update'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import Message from 'renderModule/components/ui/message'
import { computed, defineComponent, ref, type PropType } from 'vue'

const UPDATE_APP_ID = '87c9dc499cc34f32896a4537e66cf65e'

export default defineComponent({
  name: 'AboutField',
  components: {
    BeaverButton,
  },
  props: {
    section: {
      type: Object as PropType<ISettingsSection>,
      required: true,
    },
  },
  setup() {
    const isChecking = ref(false)
    const currentVersion = computed(() => electron.app.version)

    const handleCheckUpdate = async () => {
      isChecking.value = true
      const res = await getLatestVersionApi({
        appId: UPDATE_APP_ID,
        platformId: 1,
        archId: 1,
      })
      isChecking.value = false

      if (res.code !== 0) {
        Message.error(res.msg || '检查更新失败')
        return
      }

      if (res.result.hasUpdate) {
        await electron.window.openWindow('updater', {
          params: {
            hasUpdate: res.result.hasUpdate,
            forceUpdate: res.result.forceUpdate,
            version: res.result.version,
            fileUrl: res.result.fileUrl,
            size: res.result.size,
            md5: res.result.md5,
            description: res.result.description,
            releaseNotes: res.result.releaseNotes,
          },
        })
        return
      }
      Message.success('当前已是最新版本')
    }

    return {
      isChecking,
      currentVersion,
      handleCheckUpdate,
    }
  },
})
</script>

<style lang="less" scoped>
.settings-field {
  .about-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0 16px;

    &__logo {
      width: 72px;
      height: 72px;
      margin-bottom: 20px;
    }

    &__name {
      font-size: 20px;
      font-weight: 600;
      color: #2D3436;
      margin-bottom: 8px;
    }

    &__version {
      font-size: 14px;
      color: #636E72;
      margin-bottom: 32px;
    }
  }
}
</style>
