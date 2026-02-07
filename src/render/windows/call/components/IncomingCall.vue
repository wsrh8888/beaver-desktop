<template>
  <div class="incoming-overlay">
    <div class="incoming-card">
      <div class="avatar">
        <img :src="callStore.targetAvatar" alt="avatar">
      </div>
      <h3>{{ callStore.targetName }} 来电...</h3>
      <div class="incoming-actions">
        <!-- 拒绝 -->
        <div class="btn decline" @click="$emit('decline')">
          <div class="icon-circle red">
            <img src="renderModule/assets/image/call/hangup.svg" alt="拒绝">
          </div>
          <span>拒绝</span>
        </div>
        <!-- 接听 -->
        <div class="btn accept" @click="$emit('accept')">
          <div class="icon-circle green">
            <img src="renderModule/assets/image/call/phone.svg" alt="接听">
          </div>
          <span>接听</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { usecallStore } from 'renderModule/windows/call/pinia/call'

export default defineComponent({
  name: 'IncomingCall',
  emits: ['accept', 'decline'],
  setup() {
    const callStore = usecallStore()
    return {
      callStore
    }
  }
})
</script>

<style lang="less" scoped>
.incoming-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(15px);

  .incoming-card {
    background: #2d3436;
    padding: 40px;
    border-radius: 24px;
    text-align: center;
    width: 340px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 20px;
      border: 3px solid #ff7d45;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    h3 {
      margin-bottom: 40px;
      font-size: 20px;
      font-weight: 500;
    }

    .incoming-actions {
      display: flex;
      justify-content: space-around;

      .btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        cursor: pointer;

        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 32px;
            height: 32px;
            filter: invert(1);
          }

          &.red {
            background: #ff5252;
          }

          &.green {
            background: #4caf50;
          }
        }

        span {
          font-size: 13px;
          color: #b2bec3;
        }
      }
    }
  }
}
</style>
