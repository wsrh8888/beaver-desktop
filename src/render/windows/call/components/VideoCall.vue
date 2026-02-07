<template>
  <div class="video-grid" :class="gridClass">
    <!-- 本地视频 -->
    <div class="video-item local">
      <video ref="localVideo" autoplay playsinline muted></video>
      <div class="user-label">我 ({{ callStore.isMuted ? '静音' : '' }})</div>
    </div>
    <!-- 远程视频 -->
    <div v-for="p in participants" :key="p.identity" class="video-item remote">
      <video :ref="el => setRemoteVideoRef(el, p.identity)" autoplay playsinline></video>
      <div class="user-label">{{ p.identity }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, computed } from 'vue'
import { RoomEvent, Track, RemoteTrack, RemoteTrackPublication, RemoteParticipant, Room } from 'livekit-client'
import { usecallStore } from 'renderModule/windows/call/pinia/call'

export default defineComponent({
  name: 'VideoCall',
  props: {
    room: {
      type: Object as () => Room | null,
      default: null
    },
    participants: {
      type: Array as () => RemoteParticipant[],
      default: () => []
    }
  },
  setup(props) {
    const callStore = usecallStore()
    const localVideo = ref<HTMLVideoElement | null>(null)
    const remoteVideoRefs = ref<Record<string, HTMLVideoElement>>({})

    const setRemoteVideoRef = (el: any, identity: string) => {
      if (el) remoteVideoRefs.value[identity] = el as HTMLVideoElement
    }

    const gridClass = computed(() => {
      const count = props.participants.length + 1
      if (count <= 1) return 'grid-1'
      if (count <= 2) return 'grid-2'
      if (count <= 4) return 'grid-4'
      if (count <= 9) return 'grid-9'
      if (count <= 16) return 'grid-16'
      return 'grid-20'
    })

    /**
     * 更新本地视频显示
     */
    const updateLocalVideo = () => {
      if (!props.room || !localVideo.value) return
      setTimeout(() => {
        const videoTrack = props.room?.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack
        if (videoTrack && localVideo.value) {
          videoTrack.attach(localVideo.value)
        }
      }, 500)
    }

    /**
     * 设置音视频轨道监听器
     */
    const setupTrackListeners = (room: Room) => {
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (track.kind === 'video') {
          setTimeout(() => {
            const el = remoteVideoRefs.value[participant.identity]
            if (el) track.attach(el)
          }, 500)
        } else if (track.kind === 'audio') {
          track.attach()
        }
      })

      // 初始订阅
      room.remoteParticipants.forEach((p) => {
        p.trackPublications.forEach((pub) => {
          if (pub.track && pub.kind === 'video') {
            const el = remoteVideoRefs.value[p.identity]
            if (el) pub.track.attach(el)
          }
        })
      })
    }

    watch(() => props.room, (newRoom) => {
      if (newRoom) {
        setupTrackListeners(newRoom)
        updateLocalVideo()
      }
    }, { immediate: true })

    watch(() => callStore.isCameraOff, (val) => {
      if (!val) updateLocalVideo()
    })

    onMounted(() => {
      if (props.room) {
        setupTrackListeners(props.room)
        updateLocalVideo()
      }
    })

    return {
      callStore,
      localVideo,
      setRemoteVideoRef,
      gridClass,
      participants: props.participants
    }
  }
})
</script>

<style lang="less" scoped>
.video-grid {
  width: 100%;
  height: 100%;
  display: grid;
  padding: 10px;
  gap: 10px;

  &.grid-1 {
    grid-template-columns: 1fr;
  }

  &.grid-2 {
    grid-template-columns: 1fr 1fr;
  }

  &.grid-4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  &.grid-9 {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }

  &.grid-16 {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }

  &.grid-20 {
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }

  .video-item {
    position: relative;
    background: #2d3436;
    border-radius: 12px;
    overflow: hidden;

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-label {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.5);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      backdrop-filter: blur(4px);
    }
  }
}
</style>
