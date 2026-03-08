<template>
  <AiLayout>
    <template #left>
      <AiViewLeft
        :chat-list="chatList"
        :current-chat-id="currentChatId"
        @new-chat="startNewChat"
        @select="selectChat"
      />
    </template>
    <template #right>
      <AiViewRight
        :title="currentChat?.title || 'AI助手'"
        :messages="currentChat?.messages ?? []"
        v-model:input-value="inputMessage"
        @send="sendMessage"
      />
    </template>
  </AiLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import AiLayout from 'renderModule/windows/ai/components/layout/index.vue'
import AiViewLeft from 'renderModule/windows/ai/view/left/index.vue'
import AiViewRight from 'renderModule/windows/ai/view/right/index.vue'

export default defineComponent({
  name: 'AiApp',
  components: {
    AiLayout,
    AiViewLeft,
    AiViewRight
  },
  setup() {
    const chatList = ref([
      {
        id: '1',
        title: '查看字节开源智能体项目',
        timestamp: Date.now() - 3600000
      },
      {
        id: '2',
        title: '固定Docker服务IP地址',
        timestamp: Date.now() - 86400000
      },
      {
        id: '3',
        title: '流程图修改与地址判断',
        timestamp: Date.now() - 172800000
      }
    ])

    const currentChatId = ref('1')
    const inputMessage = ref('')

    const chats = ref({
      '1': {
        id: '1',
        title: '查看字节开源智能体项目',
        messages: [
          {
            role: 'user',
            content: '在 LangChain 里，Skill 并不是一个独立的工程组件，它只是 Tool 的一种非正式叫法。',
            timestamp: Date.now() - 3600000
          },
          {
            role: 'assistant',
            content: '在 LangChain 设计，Skill 并不是一个独立的工程组件，它只是 Tool 的一种非正式叫法。\n\n如果你在设计一个系统：\n• 简单的功能，直接写成 Tool。\n• 复杂的能力（需要多步推理或多模型协作），先写成 Chain/Graph，然后将其包装成一个 Tool 暴露给 Agent。',
            timestamp: Date.now() - 3500000
          },
          {
            role: 'assistant',
            content: '下一步建议：\n你是想了解如何在 LangChain 里把一个复杂的 Chain 包装成一个 Tool（即实现一个高级技能），还是想看看 deer-flow 是如何通过"节点"来定义这些能力的？',
            timestamp: Date.now() - 3400000
          }
        ]
      },
      '2': {
        id: '2',
        title: '固定Docker服务IP地址',
        messages: [
          {
            role: 'user',
            content: '如何固定Docker服务的IP地址？',
            timestamp: Date.now() - 86400000
          },
          {
            role: 'assistant',
            content: '要固定 Docker 服务的 IP 地址，你可以通过以下方法：\n\n1. 使用 Docker 网络：\n   - 创建自定义网络并指定子网\n   - 在运行容器时指定 IP 地址\n\n2. 使用 Docker Compose：\n   - 在配置文件中指定 networks 部分\n   - 为每个服务指定固定 IP\n\n具体配置示例：...',
            timestamp: Date.now() - 86300000
          }
        ]
      },
      '3': {
        id: '3',
        title: '流程图修改与地址判断',
        messages: [
          {
            role: 'user',
            content: '如何修改流程图并进行地址判断？',
            timestamp: Date.now() - 172800000
          },
          {
            role: 'assistant',
            content: '修改流程图并进行地址判断的步骤：\n\n1. 使用流程图工具（如 Draw.io、Visio 等）\n2. 定义地址判断逻辑\n3. 实现条件分支\n4. 测试验证\n\n详细实现方法：...',
            timestamp: Date.now() - 172700000
          }
        ]
      }
    })

    const currentChat = computed(() => {
      return (chats.value as Record<string, typeof chats.value['1']>)[currentChatId.value]
    })

    const startNewChat = () => {
      const newId = (chatList.value.length + 1).toString()
      const newChat = {
        id: newId,
        title: '新会话',
        timestamp: Date.now()
      }
      chatList.value.unshift(newChat)
      currentChatId.value = newId
      ;(chats.value as Record<string, { id: string; title: string; messages: Array<{ role: string; content: string; timestamp: number }> }>)[newId] = {
        id: newId,
        title: '新会话',
        messages: []
      }
    }

    const selectChat = (id: string) => {
      currentChatId.value = id
    }

    const sendMessage = () => {
      if (!inputMessage.value.trim() || !currentChat.value) return

      const newMessage = {
        role: 'user' as const,
        content: inputMessage.value.trim(),
        timestamp: Date.now()
      }

      currentChat.value.messages.push(newMessage)
      inputMessage.value = ''

      setTimeout(() => {
        const aiReply = {
          role: 'assistant' as const,
          content: '这是AI的回复内容，根据你的问题生成。',
          timestamp: Date.now()
        }
        currentChat.value.messages.push(aiReply)
      }, 1000)
    }

    return {
      chatList,
      currentChatId,
      currentChat,
      inputMessage,
      startNewChat,
      selectChat,
      sendMessage
    }
  }
})
</script>

<style lang="less" scoped>
/* App 仅做组合，样式在 layout / components 中 */
</style>
