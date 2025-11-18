<template>
  <div class="add-group-container">
    <!-- 群组信息卡片 -->
    <div class="info-card">
      <div class="avatar">
        <BeaverImage :file-name="groupInfo.avatar" />
      </div>
      <div class="group-details">
        <div class="name">
          {{ groupInfo.title }}
        </div>
        <div class="groupid">
          ID: {{ groupInfo.id }}
        </div>
      </div>
    </div>

    <!-- 申请信息输入区 -->
    <div class="verify-section">
      <label for="verifyMsg">请输入申请信息</label>
      <textarea
        id="verifyMsg"
        v-model="verifyMessage"
        placeholder="您好，我想加入这个群聊..."
        :maxlength="100"
      />
    </div>

    <!-- 底部按钮 -->
    <div class="footer">
      <BeaverButton type="primary" size="small" @click="handleSend">
        发送申请
      </BeaverButton>
      <BeaverButton size="small" @click="handleClose">
        取消
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import type { ISearchResult } from 'commonModule/type/view/search'
import { joinGroupApi } from 'renderModule/api/group'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import Message from 'renderModule/components/ui/message/index'
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'AddGroupComponent',
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

    // 计算群组信息
    const groupInfo = computed(() => {
      return props.targetValue
    })

    // 处理取消
    const handleClose = () => {
      emit('close')
    }

    // 处理发送申请
    const handleSend = async () => {
      const result = await joinGroupApi({
        groupId: props.targetValue.id,
        message: verifyMessage.value.trim(),
      })
      if (result.code === 0) {
        Message.success('入群申请已发送，等待管理员审核')
        emit('close')
      }
      else {
        Message.error(result.msg || '发送入群申请失败，请重试')
      }
    }

    return {
      verifyMessage,
      groupInfo,
      handleClose,
      handleSend,
    }
  },
})
</script>

<style lang="less" scoped>
.add-group-container {
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

  .group-details {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .name {
      font-size: 15px;
      font-weight: 500;
      color: #2D3436;
    }

    .groupid {
      font-size: 12px;
      color: #B2BEC3;
    }

    .member-count {
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
}
</style>
