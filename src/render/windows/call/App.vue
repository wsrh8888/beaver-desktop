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
  <div class="call-app">
    <CallLayout>
      <template #content>
        <CallViewStage />
      </template>

      <template #footer>
        <CallViewFooter />
      </template>
    </CallLayout>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CallLayout from './components/layout/index.vue'
import CallViewStage from './view/stage/index.vue'
import CallViewFooter from './view/footer/index.vue'
import { usecallStore } from './pinia/call'

export default defineComponent({
  name: 'CallApp',
  components: {
    CallLayout,
    CallViewStage,
    CallViewFooter
  },
  setup() {
    const callStore = usecallStore()

    return {
      callStore
    }
  }
})
</script>

<style lang="less">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden;
  background: #f5f7fa;
  color: #333;
  font-family: "SF Pro", Roboto, "PingFang SC", "微软雅黑", sans-serif;
}

.call-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
