<template>
  <div v-if="visible" class="moment-messages">
    <div class="moment-messages__mask" @click="handleClose" />
    <div class="moment-messages__panel">
      <div class="moment-messages__header">
        <span>朋友圈消息</span>
        <button class="moment-messages__close" @click="handleClose">×</button>
      </div>

      <div class="moment-messages__body">
        <div v-if="notificationStore.loading" class="moment-messages__loading">
          加载中...
        </div>
        <div v-else-if="!notificationStore.interactions.length" class="moment-messages__empty">
          暂无互动消息
        </div>
        <div v-else class="moment-messages__list">
          <div
            v-for="item in notificationStore.interactions"
            :key="item.eventId"
            class="moment-messages__item"
            @click="handleItemClick(item)"
          >
            <BeaverImage
              :file-name="item.fromAvatar"
              :cache-type="CacheType.USER_AVATAR"
              class="moment-messages__avatar"
            />
            <div class="moment-messages__content">
              <div class="moment-messages__top">
                <span class="moment-messages__name">{{ item.fromUserName }}</span>
                <span class="moment-messages__time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <div class="moment-messages__action">
                {{ notificationStore.getActionText(item.eventType) }}
              </div>
              <div v-if="item.content" class="moment-messages__text">
                {{ item.content }}
              </div>
            </div>
            <span v-if="!item.isRead" class="moment-messages__dot" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent } from 'vue'
import { useMomentNotificationStore } from '../../store/notification/notification'
import { useMomentStore } from '../../store/moment/moment'

export default defineComponent({
  name: 'MomentMessagesPanel',
  components: {
    BeaverImage,
  },
  setup() {
    const notificationStore = useMomentNotificationStore()
    const momentStore = useMomentStore()

    const visible = computed(() => notificationStore.showMessagesPanel)

    const handleClose = () => {
      notificationStore.closeMessagesPanel()
    }

    const handleItemClick = (item: any) => {
      notificationStore.closeMessagesPanel()
      momentStore.showMomentDetail(item.momentId)
    }

    const formatTime = (timestamp: number) => {
      if (!timestamp)
        return ''
      const dt = new Date(timestamp * 1000)
      const now = Date.now()
      const diff = now - dt.getTime()
      const minutes = Math.floor(diff / 60000)
      if (minutes < 60)
        return `${Math.max(minutes, 1)}分钟前`
      const hours = Math.floor(minutes / 60)
      if (hours < 24)
        return `${hours}小时前`
      const days = Math.floor(hours / 24)
      if (days < 30)
        return `${days}天前`
      return `${dt.getMonth() + 1}-${dt.getDate()}`
    }

    return {
      CacheType,
      notificationStore,
      visible,
      handleClose,
      handleItemClick,
      formatTime,
    }
  },
})
</script>

<style lang="less" scoped>
.moment-messages {
  position: fixed;
  inset: 0;
  z-index: 200;

  &__mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
  }

  &__panel {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 320px;
    background: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  }

  &__header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #EBEEF5;
    font-size: 15px;
    font-weight: 600;
    color: #2D3436;
  }

  &__close {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    font-size: 20px;
    color: #636E72;
    cursor: pointer;
    border-radius: 6px;

    &:hover {
      background: #F9FAFB;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
  }

  &__loading,
  &__empty {
    padding: 48px 16px;
    text-align: center;
    color: #B2BEC3;
    font-size: 14px;
  }

  &__list {
    padding: 8px;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    position: relative;

    &:hover {
      background: #F9FAFB;
    }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    flex-shrink: 0;
    overflow: hidden;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #576B95;
  }

  &__time {
    font-size: 11px;
    color: #B2BEC3;
    flex-shrink: 0;
  }

  &__action {
    margin-top: 4px;
    font-size: 13px;
    color: #2D3436;
  }

  &__text {
    margin-top: 4px;
    font-size: 13px;
    color: #636E72;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #FF4757;
    flex-shrink: 0;
    margin-top: 4px;
  }
}
</style>
