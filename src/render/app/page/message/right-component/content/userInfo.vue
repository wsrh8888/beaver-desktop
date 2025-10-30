<template>
  <div class="user-card" :style="{ top: userStyle.top, left: userStyle.left }">
    <div class="content">
      <BeaverImage :file-name="friendInfo.fileName" class="avatar" />
      <div class="info">
        <div class="nickname">
          {{ friendInfo.nickname }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getFriendInfoApi } from 'renderModule/api/friend'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { defineComponent, onMounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'UserInfo',
  components: {
    BeaverImage,
  },
  props: {
    userInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const friendInfo = ref<{ fileName?: string, nickname?: string }>({})
    const userStyle = ref({
      top: '',
      left: '',
      right: '',
    })
    const getFriendInfo = async () => {
      const res = await getFriendInfoApi({ friendId: props.userInfo.friendId })
      friendInfo.value = res.result
    }
    watch(props.userInfo, () => {
      userStyle.value.top = props.userInfo.position.top
      userStyle.value.left = props.userInfo.position.left
      // userStyle.value.right = props.userInfo.position.right
    })
    onMounted(() => {
      userStyle.value.top = props.userInfo.position.top
      userStyle.value.left = props.userInfo.position.left
      // userStyle.value.right = props.userInfo.position.right
      console.log('mo', props, userStyle.value)
      getFriendInfo()
    })

    return {
      friendInfo,
      userStyle,
    }
  },
})
</script>

<style scoped lang="less">
.user-card {
  position: fixed;
  width: 350px;
  background: #333;
  color: #fff;
  border-radius: 12px;
  padding: 20px;
  font-family: '微软雅黑', sans-serif;
  z-index: 200000;
}

.content {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 14px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 16px;
}

.info .nickname {
  font-size: 22px;
  font-weight: bold;
}

.extra,
.actions {
  margin-top: 16px;
}

.actions button {
  margin-right: 8px;
  background: #444;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
}
</style>
