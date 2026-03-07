<template>
  <div class="recalled-message">
    <span>{{ displayText }}</span>
    <span v-if="canReEdit" class="re-edit-link" @click="onReEdit">重新编辑</span>
  </div>
</template>

<script lang="ts">
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, defineComponent } from 'vue'
import { MessageType } from 'commonModule/type/ajax/chat'

export default defineComponent({
  name: 'RecalledMessage',
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  emits: ['re-edit'],
  setup(props, { emit }) {
    const userStore = useUserStore()

    const isSelf = computed(() => props.message.sender.userId === userStore.getUserId)

    const displayText = computed(() => {
      const name = isSelf.value ? '你' : (props.message.sender.nickName || '对方')
      return `${name} 撤回了一条消息`
    })

    const canReEdit = computed(() => {
      // 只有自己撤回的文本消息才显示“重新编辑”
      return isSelf.value &&
        props.message.msg?.type === MessageType.WITHDRAW &&
        props.message.msg?.withdrawMsg?.originMsg?.type === MessageType.TEXT
    })

    const onReEdit = () => {
      const content = props.message.msg?.withdrawMsg?.originMsg?.textMsg?.content
      if (content) {
        emit('re-edit', content)
      }
    }

    return {
      displayText,
      canReEdit,
      onReEdit,
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
  color: #909399;
  font-size: 13px;
  margin: 12px 0;

  .re-edit-link {
    color: #FF7D45;
    cursor: pointer;
    font-size: 13px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
