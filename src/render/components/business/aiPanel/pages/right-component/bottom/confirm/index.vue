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

<!--
  待确认区：agent 要动手、需本人点头的动作（代发消息、删文件…）在这里等表态。

  队列读 store，回传走 notification-manager/confirm.ts（入队与回传同源，不拆两处）。
  画由 card.vue 负责，这里只管「取哪一条、能不能点、点了怎么办」。

  回传成功才出队；失败时卡片留在原地，显示「已确认」但实际没送达比多点一次糟糕得多。
-->
<template>
  <AiConfirmCard
    v-if="pending"
    :title="pending.title"
    :content="pending.content"
    :confirm-text="pending.confirmText"
    :cancel-text="pending.cancelText"
    :tone="pending.tone"
    :expires-at="pending.expiresAt"
    :busy="busy"
    @confirm="onConfirm"
    @cancel="onCancel"
    @expire="onExpire"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { resolveConfirm } from '../../../../notification-manager'
import { useAiPanelStore } from '../../../../store'
import AiConfirmCard from './card.vue'

export default defineComponent({
  name: 'AiConfirmPanel',
  components: { AiConfirmCard },
  props: {
    /** 场景内绑定 ID：确认请求按会话入队 */
    refId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const aiStore = useAiPanelStore()
    const busy = ref(false)

    /** 最近一条待表态的确认；没有就整块不渲染 */
    const pending = computed(() => aiStore.pendingConfirmOf(props.refId))

    /** 只有「确认」传 approved=true；取消与超时都是否，busy 期间不重复回传 */
    const resolve = async (approved: boolean) => {
      const target = pending.value
      if (!target || busy.value)
        return
      busy.value = true
      try {
        await resolveConfirm(props.refId, target.requestId, approved)
      }
      finally {
        busy.value = false
      }
    }

    const onConfirm = () => void resolve(true)
    const onCancel = () => void resolve(false)
    // 超时等于用户没点头，按否回传，别让服务端干等
    const onExpire = () => void resolve(false)

    return { pending, busy, onConfirm, onCancel, onExpire }
  },
})
</script>
