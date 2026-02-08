<template>
  <div class="video-renderer">
    <video ref="videoEl" autoplay playsinline :class="{ mirrored: isLocal }"></video>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, PropType } from 'vue'
import { Track } from 'livekit-client'

export default defineComponent({
  name: 'VideoRenderer',
  props: {
    track: {
      type: Object as PropType<any>, // using any to avoid complex type issues with wrapped objects
      required: true
    },
    isLocal: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const videoEl = ref<HTMLVideoElement | null>(null)

    const attachTrack = () => {
      if (props.track && videoEl.value) {
        props.track.attach(videoEl.value)
      }
    }

    const detachTrack = () => {
      if (props.track && videoEl.value) {
        props.track.detach(videoEl.value)
      }
    }

    onMounted(() => {
      attachTrack()
    })

    onBeforeUnmount(() => {
      detachTrack()
    })

    watch(() => props.track, (newVal, oldVal) => {
      if (oldVal) {
        oldVal.detach(videoEl.value)
      }
      if (newVal) {
        newVal.attach(videoEl.value)
      }
    })

    return {
      videoEl
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
