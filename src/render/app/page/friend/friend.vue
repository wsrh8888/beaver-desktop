<template>
  <div class="friend__container">
    <div class="friend__left">
      <FriendLeftComponent></FriendLeftComponent>
    </div>
    <div class="friend__right"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import FriendLeftComponent from './component/FriendLeft.vue';
dayjs.extend(relativeTime);

export default defineComponent({
  components: {
    FriendLeftComponent
  },
  setup() {
 
    onMounted(() => {
    });

    return {}
  },
});
</script>

<style lang="less" scoped>
.friend__container {
  display: flex;
  height: 100%;
  overflow-y: hidden;

  .friend__left {
    width: 280px;
    height: 100%;
    border-right: 1px solid #e8e8e8;
    overflow: hidden;
    box-sizing: border-box;

    // 自定义滚动条样式仅在 friend__left 内生效
    &::-webkit-scrollbar {
      width: 8px;
      background-color: #f5f5f5;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: #e1e4e7;
      &:hover {
        background-color: #a8a8a8;
      }
    }

    .friend__left__item {
      display: flex;
      padding: 13px 0;
      cursor: pointer;
      &:hover {
        background-color: #f5f5f5;
      }

      .item__icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin: 0 10px;
        overflow: hidden;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .unread-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff4d4f;
          color: white;
          border-radius: 10px;
          min-width: 18px;
          height: 18px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
        }
      }
    }

    .item__msg {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 12px;
      color: #9b9b9e;

      .msg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .nickName {
          font-size: 15px;
          color: #252932;
          font-weight: 500;
        }

        .time {
          font-size: 12px;
          color: #9b9b9e;
        }
      }

      .msg-content {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .item__time {
      margin: 0 10px;
    }
  }

  .friend__right {
    flex: 1;
    height: 100%;
  }
}
</style>
