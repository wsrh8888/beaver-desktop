<template>
  <div class="recalled-message">
    <span>{{ displayText }}</span>
  </div>
</template>

<script lang="ts">
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, defineComponent, PropType } from 'vue'
import { MessageType } from 'commonModule/type/ajax/chat'
import { IMessageMsg } from 'commonModule/type/ws/message-types';

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
  emits: ['re-edit'],
  setup(props, { emit }) {
    const userStore = useUserStore()

    const isSelf = computed(() => props.sender.userId === userStore.getUserId)

    const displayText = computed(() => {
      if (isSelf.value) return '你撤回了一条消息'
      const name = props.sender.nickName || '对方'
      return `${name} 撤回一条消息`
    })

    const canReEdit = computed(() => {
      // 只有自己撤回的文本消息才显示“重新编辑”
      return isSelf.value &&
        props.msg?.type === MessageType.WITHDRAW &&
        props.msg?.withdrawMsg?.originMsg?.type === MessageType.TEXT
    })

    const onReEdit = () => {
      const content = props.msg?.withdrawMsg?.originMsg?.textMsg?.content
      if (content) {
        emit('re-edit', content)
      }
    }

    return {
      displayText,
      canReEdit,
      onReEdit,
      isSelf,
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
  color: #ffffff; // 默认灰色，适用于他人撤回在白色气泡中
  user-select: none;

  &.is-self {
    // 当在自己的橙色气泡中时，使用柔和的半透明白
    color: rgba(255, 255, 255, 0.85);
  }

  .re-edit-link {
    color: #FF7D45;
    cursor: pointer;
    margin-left: 4px;
    font-weight: 500;
    font-style: normal;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
