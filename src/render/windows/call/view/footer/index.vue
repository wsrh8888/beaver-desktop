<template>
  <div class="call-footer">
    <div class="footer-left"></div>

    <div class="footer-center">
      <div v-for="item in actionList" :key="item.id"
        v-show="item.visibility === 'both' || (isGroup && item.visibility === 'group')" class="action-item"
        :class="{ active: states[item.id] }" @click="onAction(item.id)">
        <div class="icon-wrapper">
          <img :src="(states[item.id] && item.activeIcon) ? item.activeIcon : item.defaultIcon" :alt="item.id">
        </div>
        <span class="label">{{ (states[item.id] && item.activeLabel) ? item.activeLabel : item.defaultLabel }}</span>
      </div>
    </div>

    <div class="footer-right">
      <div class="hangup-btn" @click="onAction('hangup')">结束会议</div>
    </div>

    <InviteModal v-if="showInviteModal" :visible="showInviteModal" @close="showInviteModal = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { usecallStore } from '../../pinia/call'
import { useUserStore } from '../../pinia/user'
import callManager from '../../core'
import { FOOTER_ACTION_LIST } from './data'
import InviteModal from '../../components/invite-modal/index.vue'

export default defineComponent({
  name: 'CallFooter',
  components: { InviteModal },
  setup() {
    const callStore = usecallStore()
    const userStore = useUserStore()
    const showInviteModal = ref(false)

    const me = computed(() => callStore.members.find(m => m.userId === userStore.getUserId) || ({} as any))
    const isGroup = computed(() => callStore.baseInfo.callType === 'group')
    const actionList = FOOTER_ACTION_LIST

    // 数据驱动：将业务状态映射为简单的键值对，让模板直接通过 id 访问
    const states = computed<Record<string, boolean>>(() => ({
      mute: !!me.value.isMuted,
      camera: !me.value.isCameraOff,
      shareScreen: false,
      invite: false,
      manageMembers: false
    }))

    const onAction = (id: string) => {
      switch (id) {
        case 'mute':
          callManager.toggleMute()
          break
        case 'camera':
          callManager.toggleCamera()
          break
        case 'invite':
          showInviteModal.value = true
          break
        case 'hangup':
          callManager.hangup()
          break
        case 'shareScreen':
          // callManager.shareScreen()
          break
        case 'manageMembers':
          // callManager.toggleMemberList()
          break
      }
    }

    return {
      me,
      isGroup,
      actionList,
      states,
      showInviteModal,
      onAction
    }
  }
})
</script>

<style lang="less" scoped>
.call-footer {
  height: 68px; // 降低高度
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-top: 1px solid #ebedf0;
  z-index: 100;
  flex-shrink: 0;

  .footer-left,
  .footer-right {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .footer-center {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    min-width: 64px;

    .icon-wrapper {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;

      img {
        width: 28px;
        height: 28px;
        transition: transform 0.2s;
      }
    }

    .label {
      font-size: 12px;
      color: #333;
    }

    &:hover {
      .icon-wrapper img {
        transform: scale(1.1);
      }

      .label {
        color: #ff7d45;
      }
    }

    &.active .label {
      color: #ff7d45;
    }
  }

  .footer-right {
    justify-content: flex-end;

    .hangup-btn {
      padding: 8px 24px;
      border: 1.5px solid #ff5252;
      color: #ff5252;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      &:hover {
        background: #fff5f5;
      }
    }
  }
}
</style>
