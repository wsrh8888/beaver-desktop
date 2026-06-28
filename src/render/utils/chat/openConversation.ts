import Message from 'renderModule/components/ui/message'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'

function parseGroupId(conversationId: string): string | null {
  if (!conversationId.startsWith('group_')) {
    return null
  }
  return conversationId.slice('group_'.length)
}

export async function isGroupConversationActive(conversationId: string): Promise<boolean> {
  const groupId = parseGroupId(conversationId)
  if (!groupId) {
    return true
  }

  const result = await electron.database.group.getGroupsBatch({ groupIds: [groupId] })
  return result.list.length > 0
}

export async function removeDissolvedGroupConversation(
  conversationId: string,
  options?: { showMessage?: boolean },
) {
  const groupId = parseGroupId(conversationId)
  const conversationStore = useConversationStore()
  const groupStore = useGroupStore()
  const messageViewStore = useMessageViewStore()

  if (options?.showMessage !== false) {
    Message.warning('群聊已解散')
  }

  await conversationStore.removeLocalConversation(conversationId)

  if (groupId) {
    groupStore.removeGroup(groupId)
  }

  if (messageViewStore.currentChatId === conversationId) {
    messageViewStore.currentChatId = null
  }
}

/**
 * 打开会话前检查群是否仍有效；已解散则提示并清理本地数据
 */
export async function tryOpenConversation(conversationId: string): Promise<boolean> {
  if (!parseGroupId(conversationId)) {
    return true
  }

  const active = await isGroupConversationActive(conversationId)
  if (active) {
    return true
  }

  await removeDissolvedGroupConversation(conversationId)
  return false
}
