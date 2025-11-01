<template>
  <div class="add-friend-container">
    <!-- 用户信息卡片 -->
    <div class="info-card">
      <div class="avatar">
        <BeaverImage :file-name="userInfo.avatar" />
      </div>
      <div class="user-details">
        <div class="name">
          {{ userInfo.title }}
        </div>
        <div class="userid">
          ID: {{ userInfo.id }}
        </div>
      </div>
    </div>

    <!-- 验证信息输入区 -->
    <div class="verify-section">
      <label for="verifyMsg">请输入验证信息</label>
      <textarea
        id="verifyMsg"
        v-model="verifyMessage"
        placeholder="您好，我是..."
        :maxlength="100"
      />
    </div>

    <!-- 底部按钮 -->
    <div class="footer">
      <BeaverButton type="primary" size="small" @click="handleSend">
        发送
      </BeaverButton>
      <BeaverButton size="small" @click="handleClose">
        取消
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import type { ISearchResult } from 'commonModule/type/view/search'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message/index'
import { computed, defineComponent, ref } from 'vue'
import { applyAddFriendApi } from '../../api/friend'

export default defineComponent({
  name: 'AddFriendComponent',
  components: {
    BeaverImage,
    BeaverButton,
  },
  props: {
    targetValue: {
      type: Object as () => ISearchResult,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const verifyMessage = ref('')

    // 计算用户信息
    const userInfo = computed(() => {
      return props.targetValue
    })

    // 处理取消
    const handleClose = () => {
      emit('close')
    }

    // 处理发送
    const handleSend = async () => {
      const result = await applyAddFriendApi({
        friendId: props.targetValue.id,
        verify: verifyMessage.value.trim(),
        source: props.targetValue.source, // 来源可以根据实际情况调整
      })
      if (result.code === 0) {
        Message.success('好友申请已发送，等待对方验证')
        emit('close')
      }
      else {
        Message.error(result.msg || '发送好友申请失败，请重试')
      }
    }

    return {
      verifyMessage,
      userInfo,
      handleClose,
      handleSend,
    }
  },
})
</script>

<style lang="less" scoped>
.add-friend-container {
  width: 100%;
  height: calc(100vh - 40px); // 减去标题栏高度
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 信息卡：头像左+信息右 */
.info-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #EBEEF5;

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #EBEEF5;
    flex-shrink: 0;
    object-fit: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #B2BEC3;
    font-weight: 500;
    font-size: 18px;
  }

  .user-details {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .name {
      font-size: 15px;
      font-weight: 500;
      color: #2D3436;
    }

    .userid {
      font-size: 12px;
      color: #B2BEC3;
    }
  }
}

/* 验证信息输入区 */
.verify-section {
  padding: 16px;
  flex: 1;

  label {
    font-size: 13px;
    color: #636E72;
    margin-bottom: 8px;
    display: block;
  }

  textarea {
    resize: none;
    width: 100%;
    height: 80px;
    padding: 10px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.4;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s ease;

    &::placeholder {
      color: #B2BEC3;
    }

    &:focus {
      border-color: #FF7D45;
      box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.2);
    }
  }
}

/* 底部按钮区 */
.footer {
  padding: 12px 16px;
  border-top: 1px solid #EBEEF5;
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .btn {
    width: 96px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.btn-secondary {
      background-color: #FFFFFF;
      color: #FF7D45;
      border: 1px solid #FF7D45;

      &:hover {
        background-color: #FFF8F5;
      }
    }

    &.btn-primary {
      background-color: #FF7D45;
      color: #FFFFFF;

      &:hover:not(:disabled) {
        background-color: #E86835;
      }

      &:disabled {
        background-color: #FFB088;
        cursor: not-allowed;
        opacity: 0.6;
      }

      &.btn-loading {
        cursor: not-allowed;
        opacity: 0.8;
      }
    }

    .loading-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid #FFFFFF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 6px;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
