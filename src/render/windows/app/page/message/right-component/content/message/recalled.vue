<template>
  <div class="recalled-message">
    <span>{{ displayText }}</span>
  </div>
</template>

<script lang="ts">
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, defineComponent, PropType } from 'vue'
import { IMessageMsg } from 'commonModule/type/ws/message-types'

export default defineComponent({
  name: 'RecalledMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
    sender: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserStore()

    const displayText = computed(() => {
      if (props.sender.userId === userStore.getUserId)
        return '你撤回了一条消息'
      const name = props.sender.nickName || '对方'
      return `${name} 撤回一条消息`
    })

    return {
      displayText,
    }
  },
})
</script>

<style lang="less" scoped>
.recalled-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  padding: 2px 4px;
  color: #ffffff;
  user-select: none;
}
</style>
