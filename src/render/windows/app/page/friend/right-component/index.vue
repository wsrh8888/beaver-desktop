<template>
  <div class="friend-detail-container">
    <FriendDetailContent v-if="selectedType === 'friend'" />
    <GroupDetailContent v-else-if="selectedType === 'group'" />
    <!-- 好友通知 -->
    <FriendNotificationContent v-else-if="selectedType === 'friend-notification'" />
    <!-- 群通知 -->
    <GroupNotificationContent v-else-if="selectedType === 'group-notification'" />
  </div>
</template>

<script lang="ts">
import { useFriendViewStore } from 'renderModule/windows/app/pinia/view/friend'
import { computed } from 'vue'
import GroupDetailContent from './group/GroupDetailContent.vue'
import FriendNotificationContent from './notification/friend.vue'
import GroupNotificationContent from './notification/group.vue'
import FriendDetailContent from './private/FriendDetailContent.vue'

export default {
  name: 'FriendRightComponent',
  components: {
    FriendDetailContent,
    GroupDetailContent,
    FriendNotificationContent,
    GroupNotificationContent,
  },
  setup() {
    const friendViewStore = useFriendViewStore()

    // 直接使用selectedType，更简洁
    const selectedType = computed(() => friendViewStore.selectedType)

    return {
      selectedType,
    }
  },
}
</script>

<style lang="less" scoped>
.friend-detail-container {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-left: 1px solid #EBEEF5;

  /* 移除header相关样式，内容直接显示 */

  .detail-content {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
    background: #FAFBFC;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #6C757D;

      .empty-icon {
        margin-bottom: 20px;
        opacity: 0.6;

        img {
          width: 80px;
          height: 80px;
          filter: grayscale(0.3);
        }
      }

      .empty-text {
        font-size: 15px;
        color: #6C757D;
        text-align: center;
        line-height: 1.5;
        max-width: 200px;
      }
    }
  }
}
</style>
