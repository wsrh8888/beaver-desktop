<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

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
