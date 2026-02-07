<template>
  <div class="call-container" :class="{ 'is-video': isVideoMode }">
    <!-- 头部：窗口控制 -->
    <Header />

    <div class="call-main">
      <PrivatePage v-if="isPrivate" :room="(room as any)" :participants="(participants as any)" :duration="duration" />
      <GroupPage v-else :room="(room as any)" :participants="(participants as any)" :duration="duration" />
    </div>

    <!-- 底部控制按钮 -->
    <ActionButtons :is-muted="callStore.isMuted" :is-camera-off="callStore.isCameraOff" :is-private="isPrivate"
      @mute="toggleMute" @camera="toggleCamera" @hangup="handleHangup" @invite="handleInvite" />

    <!-- 呼入弹窗 -->
    <IncomingCall v-if="callStore.isIncoming && !callStore.isConnected" @accept="handleAccept"
      @decline="handleDecline" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, watch, computed, ref } from 'vue'
import { usecallStore } from 'renderModule/windows/call/pinia/call'
import { startCallApi, getCallTokenApi, hangupCallApi } from 'renderModule/api/call'
import { getUrlParams } from 'renderModule/windows/call/utils'
import Header from 'renderModule/windows/call/components/Header.vue'
import ActionButtons from 'renderModule/windows/call/components/ActionButtons.vue'
import IncomingCall from 'renderModule/windows/call/components/IncomingCall.vue'
import PrivatePage from 'renderModule/windows/call/page/private/index.vue'
import GroupPage from 'renderModule/windows/call/page/group/index.vue'

// @ts-ignore
import { Room, RoomEvent, RemoteParticipant } from 'livekit-client'

export default defineComponent({
  name: 'CallApp',
  components: {
    Header,
    ActionButtons,
    IncomingCall,
    PrivatePage,
    GroupPage
  },
  setup() {
    const callStore = usecallStore()

    // 是否私聊
    const isPrivate = computed(() => [1, 2].includes(Number(callStore.callType)))

    // 是否视频模式 (私聊类型2 或 全部群聊)
    const isVideoMode = computed(() => {
      if (isPrivate.value) return callStore.callType === 2
      return true // 群聊统一进入会议(视频)模式
    })

    // 本地组件状态
    const room = ref<Room | null>(null)
    const duration = ref(0)
    const timer = ref<any>(null)
    const participants = ref<RemoteParticipant[]>([])

    /**
     * 核心：初始化 LiveKit
     */
    const initRoom = async (roomToken: string) => {
      if (!roomToken || room.value) return
      const liveKitUrl = (window as any).electron?.config?.liveKitUrl || 'ws://localhost:7880'

      const r = new Room({ adaptiveStream: true, dynacast: true })

      r.on(RoomEvent.ParticipantConnected, () => {
        participants.value = Array.from(r.remoteParticipants.values())
      })
      r.on(RoomEvent.ParticipantDisconnected, () => {
        participants.value = Array.from(r.remoteParticipants.values())
        if (participants.value.length === 0 && callStore.role === 'caller') {
          setTimeout(() => handleHangup(), 2000)
        }
      })

      try {
        await r.connect(liveKitUrl, roomToken)
        room.value = r
        callStore.isConnected = true
        // 初始摄像头状态：语音类(1,3)默认关闭，视频类(2,4)默认开启
        callStore.isCameraOff = [1, 3].includes(Number(callStore.callType))

        // 初始化轨道状态
        await r.localParticipant.setMicrophoneEnabled(!callStore.isMuted)
        if (isVideoMode.value) {
          await r.localParticipant.setCameraEnabled(!callStore.isCameraOff)
        }
      } catch (err) {
        console.error('Connect error', err)
      }
    }

    /**
     * 通话控制
     */
    const handleHangup = () => {
      if (room.value) room.value.disconnect()
      hangupCallApi({ roomId: callStore.roomId })
      closeWindow()
    }

    const handleAccept = async () => {
      const res = await getCallTokenApi({ roomId: callStore.roomId })
      if (res.code === 0 && res.result.roomToken) {
        callStore.isIncoming = false
        await initRoom(res.result.roomToken)
      }
    }

    const handleDecline = () => {
      hangupCallApi({ roomId: callStore.roomId })
      closeWindow()
    }

    const toggleMute = async () => {
      callStore.isMuted = !callStore.isMuted
      if (room.value) await room.value.localParticipant.setMicrophoneEnabled(!callStore.isMuted)
    }

    const toggleCamera = async () => {
      if (!isVideoMode.value) return
      callStore.isCameraOff = !callStore.isCameraOff
      if (room.value) {
        await room.value.localParticipant.setCameraEnabled(!callStore.isCameraOff)
      }
    }

    const handleInvite = () => {
      console.log('Open member selector for group:', callStore.targetId)
      // TODO: 弹出成员选择器窗口
    }

    /**
     * 辅助：主叫发起请求
     */
    const startCalling = async () => {
      const res = await startCallApi({ callType: callStore.callType as any, targetId: callStore.targetId })
      if (res.code === 0 && res.result) {
        callStore.roomId = res.result.roomId
        await initRoom(res.result.roomToken)
      } else {
        // setTimeout(closeWindow, 2000)
      }
    }

    const closeWindow = () => {
      (window as any).electron?.window.closeWindow('call')
    }

    // 计时器
    watch(() => callStore.isConnected, (val) => {
      if (val) {
        timer.value = setInterval(() => duration.value++, 1000)
      }
    })

    onMounted(() => {
      const params = getUrlParams()
      callStore.setCallInfo(params)

      if (callStore.role === 'caller') {
        startCalling()
      }
    })

    onUnmounted(() => {
      if (timer.value) clearInterval(timer.value)
      if (room.value) room.value.disconnect()
    })

    return {
      callStore,
      isVideoMode,
      isPrivate,
      room,
      duration,
      participants,
      handleHangup,
      handleAccept,
      handleDecline,
      toggleMute,
      toggleCamera,
      handleInvite
    }
  }
})
</script>

<style lang="less">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden;
  background: #1e2022;
  color: #fff;
  font-family: sans-serif;
}

.call-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;

  &.is-video {
    background: #000;
  }
}

.call-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 125, 69, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(255, 125, 69, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 125, 69, 0);
  }
}
</style>
