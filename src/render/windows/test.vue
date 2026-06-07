<template>
  <div class="login__content">
    <!-- 窗口控制按钮 -->
    <WindowControls />
    
    <!-- 登录组件容器 -->
    <div class="login__container">
      <beaver-login 
        class="login__container__beaver-login"
        app-id="app_3d70caad" 
        @login-success="handleLoginSuccess"
        @login-error="handleLoginError"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WindowControls from './components/WindowControls.vue'

export default defineComponent({
  components: {
    WindowControls,
  },
  setup() {
    // 处理登录成功
    const handleLoginSuccess = (data: any) => {
      console.log('登录成功:', data)
      
      // 计算 token 过期时间戳
      const expiresAt = Date.now() + (data.expiresIn || 7200) * 1000
      
      // 保存用户信息到 electron store
      electron.storage.setAsync('userInfo', {
        userId: data.userId,
        token: data.token,
        expiresAt: expiresAt,  // ← 过期时间戳
      } as any, { persist: true })
      
      // 触发登录状态更新
      electron.auth.login()
    }

    // 处理登录错误
    const handleLoginError = (error: any) => {
      console.error('登录失败:', error)
      // TODO: 显示错误提示
    }

    return {
      handleLoginSuccess,
      handleLoginError,
    }
  },
})
</script>

<style lang="less" scoped>
.login__content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

// 登录组件容器，占据剩余空间并居中
.login__container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  .login__container__beaver-login {
    width: 100%;
    height: 100%;
  }
}
</style>
