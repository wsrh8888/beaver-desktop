<template>
  <div class="call-footer" :class="{ 'overlay': hasVideo }">
    <div
      v-for="action in FOOTER_ACTION_LIST"
      v-show="action.visibility === 'both' || (action.visibility === 'group' && callType === 'group')"
      :key="action.id"
      class="action-item"
      :class="{ active: isActionActive(action), hangup: action.isHangup }"
      @click="handleAction(action.id)"
    >
      <div class="icon-circle">
        <img :src="getActionIcon(action)" :alt="getActionLabel(action)">
      </div>
      <span>{{ getActionLabel(action) }}</span>
    </div>
    <InviteModal v-if="showInviteModal" :visible="showInviteModal" @close="showInviteModal = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { usecallStore } from '../pinia/call'
import { useUserStore } from '../pinia/user'
import callManager from '../core'
import { FOOTER_ACTION_LIST, type FooterActionItem } from '../utils/footer-actions'
import InviteModal from './InviteModal.vue'

export default defineComponent({
  name: 'CallFooter',
  components: {
    InviteModal
  },
  setup() {
    const callStore = usecallStore()
    const userStore = useUserStore()
    const showInviteModal = ref(false)

    const me = computed(() => callStore.members.find(m => m.userId === userStore.getUserId))
    const isWaiting = computed(() => me.value?.status === 'calling')
    const hasVideo = computed(() => callStore.members.some(m => m.track))

    const callType = computed(() => callStore.baseInfo.callType || 'private')

    function isActionActive(action: FooterActionItem): boolean {
      if (action.id === 'mute') return me.value?.isMuted ?? false
      if (action.id === 'camera') return !(me.value?.isCameraOff ?? true)
      return false
    }

    function getActionIcon(action: FooterActionItem): string {
      if (action.id === 'mute' && (me.value?.isMuted ?? false)) return action.iconActive ?? action.icon
      if (action.id === 'camera' && !(me.value?.isCameraOff ?? true)) return action.iconActive ?? action.icon
      return action.icon
    }

    function getActionLabel(action: FooterActionItem): string {
      if (action.id === 'hangup') return isWaiting.value ? '取消' : action.label
      if (action.id === 'mute') return (me.value?.isMuted ?? false) ? (action.labelActive ?? action.label) : action.label
      if (action.id === 'camera') return !(me.value?.isCameraOff ?? true) ? (action.labelActive ?? action.label) : action.label
      return action.label
    }

    function handleAction(id: string) {
      if (id === 'mute') callManager.toggleMute()
      else if (id === 'camera') callManager.toggleCamera()
      else if (id === 'hangup') callManager.hangup()
      else if (id === 'invite') showInviteModal.value = true
      else if (id === 'shareScreen' || id === 'manageMembers') {
        // 预留，后续实现
      }
    }

    return {
      callStore,
      FOOTER_ACTION_LIST,
      callType,
      hasVideo,
      showInviteModal,
      isActionActive,
      getActionIcon,
      getActionLabel,
      handleAction,
    }
  }
})
</script>

<style lang="less" scoped>
.call-footer {
  padding: 30px 20px 40px;
  display: flex;
  justify-content: center;
  gap: 50px;
  background: #16213e;
  /* 默认背景，与底部渐变一致 */
  z-index: 20;
  flex-shrink: 0;

  &.overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .icon-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      img {
        width: 28px;
        height: 28px;
        filter: invert(1);
      }
    }

    &.active .icon-circle {
      background: rgba(255, 255, 255, 0.3);
    }

    &.hangup .icon-circle {
      background: #ff5252;
      box-shadow: 0 4px 15px rgba(255, 82, 82, 0.4);
    }

    &:hover .icon-circle {
      transform: scale(1.1);
    }

    span {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
