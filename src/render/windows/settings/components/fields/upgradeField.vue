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
  <div class="settings-field">
    <div class="upgrade-content">
      <img src="commonModule/assets/img/logo/logo.png" alt="海狸 Logo" class="upgrade-content__logo">
      <div class="upgrade-content__name">
        海狸IM
      </div>
      <div class="upgrade-content__version">
        当前版本 {{ currentVersion }}
      </div>
      <p class="upgrade-content__desc">
        检查桌面端是否有新版本可用
      </p>
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
  name: 'UpgradeField',
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
  .upgrade-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 0 32px;

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
      margin-bottom: 8px;
    }

    &__desc {
      margin: 0 0 28px;
      font-size: 13px;
      color: #B2BEC3;
    }
  }
}
</style>
