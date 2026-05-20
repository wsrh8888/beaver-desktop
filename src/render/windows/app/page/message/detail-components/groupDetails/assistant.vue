<template>
  <div class="group-details-assistant">
    <div class="group-details-assistant__content">
      <div class="group-details-assistant__section-title">
        通知机器人
      </div>

      <div v-if="loading" class="group-details-assistant__empty">
        加载中…
      </div>
      <div v-else-if="notificationBots.length === 0" class="group-details-assistant__empty">
        暂无通知机器人
      </div>
      <div v-else class="group-details-assistant__list">
        <div
          v-for="bot in notificationBots"
          :key="bot.id"
          class="group-details-assistant__item"
          @click="openBotDetail(bot)"
        >
          <div class="group-details-assistant__item-avatar">
            <BeaverImage v-if="bot.avatar" :file-name="bot.avatar" image-class="group-details-assistant__item-avatar-image" />
            <span v-else class="group-details-assistant__item-avatar-text">{{ bot.name.slice(0, 1) }}</span>
          </div>
          <div class="group-details-assistant__item-meta">
            <div class="group-details-assistant__item-name">
              {{ bot.name }}
            </div>
            <div class="group-details-assistant__item-desc">
              {{ bot.description || '通知机器人' }}
            </div>
          </div>
          <span
            class="group-details-assistant__item-status"
            :class="{ 'group-details-assistant__item-status--off': bot.status !== 1 }"
          >
            {{ bot.status === 1 ? '已启用' : '已停用' }}
          </span>
        </div>
      </div>
    </div>

    <div class="group-details-assistant__footer">
      <BeaverButton type="primary" class="group-details-assistant__add-btn" @click="openAdd">
        添加群助手
      </BeaverButton>
    </div>

  </div>
</template>

<script lang="ts">
import type { INotificationBotItem } from 'commonModule/type/ajax/group'
import { listNotificationBotsApi } from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useGroupAssistantViewStore } from 'renderModule/windows/app/pinia/view/message/groupAssistant'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'groupDetailsAssistant',
  components: { BeaverButton, BeaverImage },
  emits: ['open', 'close'],
  setup() {
    const groupStore = useGroupStore()
    const messageViewStore = useMessageViewStore()
    const userStore = useUserStore()

    const groupInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return null
      return groupStore.getGroupById(currentId)
    })

    const groupId = computed(() => {
      if (!groupInfo.value)
        return ''
      const conversationId = groupInfo.value.conversationId
      return conversationId.startsWith('group_')
        ? conversationId.split('_').slice(1).join('_')
        : conversationId
    })

    const creatorUserId = computed(() => userStore.getUserId)
    const notificationBots = ref<INotificationBotItem[]>([])
    const loading = ref(false)
    const groupAssistantStore = useGroupAssistantViewStore()

    const loadList = async () => {
      if (!groupId.value || !creatorUserId.value)
        return
      loading.value = true
      const res = await listNotificationBotsApi(creatorUserId.value, { groupId: groupId.value })
      loading.value = false
      if (res.code === 0)
        notificationBots.value = res.result.list || []
    }

    watch(groupId, () => {
      loadList()
    }, { immediate: true })

    watch(() => groupAssistantStore.listRefreshKey, () => {
      loadList()
    })

    const openAdd = () => {
      if (!groupId.value || !creatorUserId.value)
        return
      groupAssistantStore.openPicker(groupId.value, creatorUserId.value)
    }

    const openBotDetail = (bot: INotificationBotItem) => {
      if (!groupId.value || !creatorUserId.value)
        return
      groupAssistantStore.openDetail(bot, groupId.value, creatorUserId.value)
    }

    return {
      groupId,
      creatorUserId,
      notificationBots,
      loading,
      loadList,
      openAdd,
      openBotDetail,
    }
  },
})
</script>

<style lang="less" scoped>
.group-details-assistant {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .group-details-assistant__content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px 16px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(178, 190, 195, 0.5);
      border-radius: 3px;
    }
  }

  .group-details-assistant__section-title {
    font-size: 15px;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 12px;
  }

  .group-details-assistant__empty {
    font-size: 13px;
    color: #b2bec3;
    padding: 8px 0;
  }

  .group-details-assistant__item {
    display: flex;
    align-items: center;
    padding: 12px 8px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }
  }

  .group-details-assistant__item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #ffe6d9;
    color: #ff7d45;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    overflow: hidden;
    flex-shrink: 0;
  }

  .group-details-assistant__item-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .group-details-assistant__item-avatar-text {
    font-size: 16px;
    font-weight: 600;
  }

  .group-details-assistant__item-meta {
    flex: 1;
    margin-left: 12px;
    min-width: 0;
  }

  .group-details-assistant__item-name {
    font-size: 14px;
    font-weight: 500;
    color: #2d3436;
  }

  .group-details-assistant__item-desc {
    font-size: 12px;
    color: #b2bec3;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group-details-assistant__item-status {
    font-size: 12px;
    color: #4caf50;
    flex-shrink: 0;
  }

  .group-details-assistant__item-status--off {
    color: #b2bec3;
  }

  .group-details-assistant__footer {
    flex-shrink: 0;
    padding: 16px;
    border-top: 1px solid #ebeef5;
  }

  .group-details-assistant__add-btn {
    width: 100%;
  }
}
</style>
