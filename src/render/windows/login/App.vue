<template>
  <div class="login-page">
    <WindowControls />
    <BrandSection />
    <section class="login-page__main">
      <beaver-login
        class="login-page__sdk"
        :app-id="openAppId" 
        :env="currentConfig.env"
        @login="handleLogin"
      />
    </section>
  </div>
</template>

<script lang="ts">
import BeaverSDK from '@beaver-im/js-sdk'
import type { ISdkLoginEvent } from '@beaver-im/js-sdk'
import { openAppId } from 'commonModule/config'
import Message from 'renderModule/components/ui/message'
import { oauthCodeLoginApi } from 'renderModule/api/auth'
import { defineComponent, onMounted } from 'vue'
import BrandSection from './components/BrandSection.vue'
import WindowControls from './components/WindowControls.vue'
import { getCurrentConfig } from 'commonModule/config'

function parseLoginEvent(payload: CustomEvent | ISdkLoginEvent): ISdkLoginEvent | null {
  if (payload instanceof CustomEvent) {
    const detail = payload.detail as ISdkLoginEvent | ISdkLoginEvent[]
    if (Array.isArray(detail)) {
      return detail[0] ?? null
    }
    return detail ?? null
  }
  return payload
}

export default defineComponent({
  name: 'LoginApp',
  components: {
    WindowControls,
    BrandSection,
  },
  setup() {
    onMounted(() => {
      BeaverSDK.register()
    })

    const handleLogin = async (payload: CustomEvent | ISdkLoginEvent) => {
      const event = parseLoginEvent(payload)
      if (!event || event.code === 0 ) {
        const res = await oauthCodeLoginApi({ appId: openAppId, code: event.result.authCode })
        if (res.code === 0) {
          electron.storage.setAsync('userInfo', {
            userId: res.result.userId,
            token: res.result.token,
          }, { persist: true })
          
          electron.auth.login()
        }
        else {
          Message.error(res.msg )
        }
      }
    }

    return {
      openAppId,
      currentConfig: getCurrentConfig(),
      handleLogin,
    }
  },
})
</script>

<style lang="less" scoped>
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  position: relative;
  background: #ffffff;
  flex-shrink: 0;
}

.login-page__main {
  flex: 1;
  width: 400px;
  min-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .login-page__sdk {
    width: 100%;
    max-width: 360px;
  }
}
</style>
