<template>
  <div class="group-call-page">
    <div class="call-content">
      <!-- 群聊统一使用视频网格布局 (即便没开摄像头也是会议模式) -->
      <VideoCall v-if="callStore.isConnected" :room="(room as any)" :participants="(participants as any)" />
      <!-- 呼叫中状态 -->
      <AudioCall v-else :duration="duration" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { usecallStore } from 'renderModule/windows/call/pinia/call'
import AudioCall from 'renderModule/windows/call/components/AudioCall.vue'
import VideoCall from 'renderModule/windows/call/components/VideoCall.vue'
// @ts-ignore
import { Room, RemoteParticipant } from 'livekit-client'

export default defineComponent({
  name: 'GroupCall',
  components: {
    AudioCall,
    VideoCall
  },
  props: {
    room: {
      type: Object as () => Room | null,
      default: null
    },
    participants: {
      type: Array as () => RemoteParticipant[],
      default: () => []
    },
    duration: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const callStore = usecallStore()
    return {
      callStore
    }
  }
})
</script>

<style lang="less" scoped>
.group-call-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .call-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
}
</style>
