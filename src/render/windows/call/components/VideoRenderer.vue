<template>
  <div class="video-renderer">
    <video ref="videoEl" autoplay playsinline :class="{ mirrored: isLocal }" :muted="isLocal"></video>
    <audio ref="audioEl" autoplay playsinline :muted="isLocal" style="display: none;"></audio>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, PropType } from 'vue'

export default defineComponent({
  name: 'VideoRenderer',
  props: {
    track: {
      type: Object as PropType<any>, // using any to avoid complex type issues with wrapped objects
      required: false
    },
    audioTrack: {
      type: Object as PropType<any>,
      required: false
    },
    isLocal: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const videoEl = ref<HTMLVideoElement | null>(null)
    const audioEl = ref<HTMLAudioElement | null>(null)

    const attachTrack = () => {
      if (props.track && videoEl.value) {
        props.track.attach(videoEl.value)
        if (props.isLocal) {
          videoEl.value.muted = true
        }
      }
      // 本地音频绝对不能通过喇叭播放自己，否则会产生严重的回音（啸叫/杂音）
      if (props.audioTrack && audioEl.value && !props.isLocal) {
        props.audioTrack.attach(audioEl.value)
      }
    }

    const detachTrack = () => {
      if (props.track && videoEl.value) {
        props.track.detach(videoEl.value)
      }
      if (props.audioTrack && audioEl.value && !props.isLocal) {
        props.audioTrack.detach(audioEl.value)
      }
    }

    onMounted(() => {
      attachTrack()
    })

    onBeforeUnmount(() => {
      detachTrack()
    })

    watch(() => props.track, (newVal, oldVal) => {
      if (oldVal && videoEl.value) {
        oldVal.detach(videoEl.value)
      }
      if (newVal && videoEl.value) {
        newVal.attach(videoEl.value)
        if (props.isLocal) {
          videoEl.value.muted = true
        }
      }
    })

    watch(() => props.audioTrack, (newVal, oldVal) => {
      if (props.isLocal) return // 绝对不处理本地音频的播放

      if (oldVal && audioEl.value) {
        oldVal.detach(audioEl.value)
      }
      if (newVal && audioEl.value) {
        newVal.attach(audioEl.value)
      }
    })

    return {
      videoEl,
      audioEl
    }
  }
})
</script>

<style lang="less" scoped>
.video-renderer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  position: relative;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;

    &.mirrored {
      transform: scaleX(-1);
    }
  }
}
</style>
