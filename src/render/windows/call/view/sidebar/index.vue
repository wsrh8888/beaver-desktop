<template>
  <div class="call-sidebar">
    <div class="sidebar-header">
      <span>参会成员 ({{ memberCount }})</span>
    </div>
    <div class="member-list">
      <div v-for="member in members" :key="member.userId" class="member-item">
        <div class="member-info">
          <BeaverImage :file-name="member.avatar" image-class="member-avatar" :cache-type="CacheType.USER_AVATAR" />
          <span class="member-name">{{ member.nickName }}</span>
        </div>
        <div class="member-status">
          <span v-if="member.isMuted" class="icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { usecallStore } from '../../pinia/call'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

export default defineComponent({
  name: 'CallSidebar',
  components: {
    BeaverImage
  },
  setup() {
    const callStore = usecallStore()
    const members = computed(() => callStore.members)
    const memberCount = computed(() => members.value.length)

    return {
      members,
      memberCount,
      CacheType
    }
  }
})
</script>

<style lang="less" scoped>
.call-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .sidebar-header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebedf0;
    font-size: 14px;
    font-weight: 500;
  }

  .member-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    .member-item {
      height: 48px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &:hover {
        background: #f5f5f5;
      }

      .member-info {
        display: flex;
        align-items: center;
        gap: 10px;

        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 4px;
        }

        .member-name {
          font-size: 13px;
          color: #333;
        }
      }

      .member-status {
        .icon-svg {
          width: 14px;
          height: 14px;
          color: #ff5252;
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
</style>
