<template>
  <div class="message__container">
    <div class="message__left">
      <div class="message__left__item" v-for="item of chatList" :key="item.conversationId">
        <div class="item__icon">
          <img :src="item.avatar" alt="" />
        </div>
        <div class="item__msg">
          <div class="nickName">{{ item.nickname }}</div>
          <div>{{ item.msg_preview }}</div>
        </div>
        <!-- <div class="item__time">{{ item.create_at }}</div> -->
      </div>
    </div>
    <div class="message__right">3</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import { useChatStore } from 'renderModule/app/pinia/chat/chat';

export default defineComponent({
  setup() {
    const chatStore = useChatStore();
    const chatList = computed(() => chatStore.recentChatList);

    onMounted(() => {
      // You can add your logic here if needed
    });

    return {
      chatList,
    };
  },
});
</script>

<style lang="less" scoped>
.message__container {
  display: flex;
  height: 100%;
  overflow-y: hidden;

  .message__left {
    width: 270px;
    height: 100%;
    border-right: 1px solid #e8e8e8;
    overflow-y: auto;

    // 自定义滚动条样式仅在 message__left 内生效
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

    .message__left__item {
      display: flex;
      padding: 13px 0;
      &:hover {
        background-color: #f5f5f5;
      }

      .item__icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin: 0 10px;
        overflow: hidden;

        img {
          max-width: 100%;
          max-height: 100%;
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

      .nickName {
        font-size: 15px;
        color: #252932;
      }

      div {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .item__time {
      margin: 0 10px;
    }
  }

  .message__right {
    flex-grow: 1;
    height: 100%;
  }
}
</style>
