<template>
  <div class="login-container">
    <WindowControls />

    <BrandSection />

    <div class="login-form">
      <div class="form-header">
        <h2 class="form-title">
          欢迎回来
        </h2>
        <p class="form-subtitle">
          请登录您的 海狸 账号
        </p>
      </div>

      <div class="form-group">
        <label for="email" class="form-label">{{ LOGIN_CONFIG.email.label }}</label>
        <div class="input-container">
          <input
            id="email" v-model.trim="form.email" :type="LOGIN_CONFIG.email.type" class="form-input" :placeholder="LOGIN_CONFIG.email.placeholder"
            @blur="validateFormField('email')"
          >
        </div>
        <div v-show="errors.email" class="error-message">
          {{ errors.email }}
        </div>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">{{ LOGIN_CONFIG.password.label }}</label>
        <div class="input-container">
          <input
            id="password" v-model.trim="form.password" :type="showPassword ? 'text' : 'password'"
            class="form-input" :placeholder="LOGIN_CONFIG.password.placeholder" @blur="validateFormField('password')"
          >
          <div class="input-icon" @click="toggle('password')">
            <img :src="showPassword ? eyeOffIcon : eyeIcon" alt="toggle password">
          </div>
        </div>
        <div v-show="errors.password" class="error-message">
          {{ errors.password }}
        </div>
      </div>

      <div class="form-options">
        <div class="checkbox-container">
          <div class="custom-checkbox" :class="{ checked: rememberMe }" @click="toggle('rememberMe')" />
          <span class="checkbox-label" @click="toggle('rememberMe')">记住登录</span>
        </div>
        <a href="#" class="forgot-link" @click="handleNavigation('/forgot')">忘记密码？</a>
      </div>

      <BeaverButton type="primary" size="large" class="login-button" :disabled="!isFormValid" @click="handleLogin">
        登
        录
      </BeaverButton>

      <div class="form-footer">
        <span>还没有账号？</span>
        <a href="#" class="register-link" @click="handleNavigation('/register')">立即注册</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { MD5 } from 'crypto-js'
import { emailPasswordLoginApi } from 'renderModule/api/auth'
import eyeOffIcon from 'renderModule/assets/image/login/eye-off.svg'
import eyeIcon from 'renderModule/assets/image/login/eye.svg'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import Message from 'renderModule/components/ui/message'
import { validateField } from 'renderModule/login/utils/validation'
import { useRouterHelper } from 'renderModule/utils/router'
import { computed, defineComponent, ref } from 'vue'
import BrandSection from '../../components/BrandSection.vue'
import WindowControls from '../../components/WindowControls.vue'
import { LOGIN_CONFIG } from '../../config'

// import eyeIcon from 'renderM';

export default defineComponent({
  name: 'LoginView',
  components: {
    WindowControls,
    BrandSection,
    BeaverButton,
  },
  setup() {
    const routerHelper = useRouterHelper()

    const form = ref({
      email: '751135385@qq.com',
      password: '15383645663.rH',
    })

    const errors = ref({
      email: '',
      password: '',
    })

    const showPassword = ref(false)
    const rememberMe = ref(false)

    const isFormValid = computed(() => {
      return !errors.value.email
        && !errors.value.password
        && form.value.email
        && form.value.password
    })

    const validateFormField = (fieldName: 'email' | 'password') => {
      errors.value[fieldName] = validateField(form.value[fieldName], fieldName)
    }

    const toggle = (type: 'password' | 'rememberMe') => {
      if (type === 'password') {
        showPassword.value = !showPassword.value
      }
      else if (type === 'rememberMe') {
        rememberMe.value = !rememberMe.value
      }
    }

    const handleLogin = async () => {
      validateFormField('email')
      validateFormField('password')

      if (!isFormValid.value) {
        Message.error('请填写正确的邮箱和密码')
        return
      }

      try {
        const res = await emailPasswordLoginApi({
          email: form.value.email,
          password: MD5(form.value.password).toString(),
        })

        if (res.code === 0) {
          electron.storage.setAsync('userInfo', {
            userId: res.result.userId,
            token: res.result.token,
          }, { persist: true })
          electron.auth.login()
        }
        else {
          Message.error(res.msg || '登录失败')
        }
      }
      catch {
        Message.error('登录失败')
      }
    }

    const handleNavigation = (path: string) => {
      routerHelper.push(path)
    }

    return {
      form,
      errors,
      showPassword,
      rememberMe,
      isFormValid,
      eyeIcon,
      eyeOffIcon,
      validateFormField,
      toggle,
      handleLogin,
      handleNavigation,
      LOGIN_CONFIG,
    }
  },
})
</script>

<style lang="less" scoped>
.login-container {
  width: 800px;
  height: 500px;
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;

  /* 确保子元素不会影响布局 */
  >* {
    flex-shrink: 0;
  }
}

.login-form {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s cubic-bezier(0.33, 1, 0.68, 1);
  flex-shrink: 0;

  .form-header {
    text-align: center;
    margin-bottom: 32px;

    .form-title {
      font-size: 22px;
      font-weight: 600;
      color: #2D3436;
      margin-bottom: 8px;
    }

    .form-subtitle {
      color: #636E72;
      font-size: 14px;
    }
  }

  .form-group {
    margin-bottom: 24px;
    position: relative;

    .form-label {
      display: block;
      margin-bottom: 8px;
      color: #2D3436;
      font-size: 14px;
      font-weight: 500;
    }

    .input-container {
      position: relative;

      .input-prefix {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #2D3436;
        font-weight: 500;
        font-size: 14px;
      }

      .form-input {
        width: 100%;
        height: 48px;
        background-color: #F9FAFB;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 0 16px;
        font-size: 13px;
        color: #2D3436;
        transition: all 200ms cubic-bezier(0.33, 1, 0.68, 1);

        &::placeholder {
          color: #B2BEC3;
        }

        &:focus {
          outline: none;
          border-color: #FF7D45;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px #FFE6D9;
        }
      }

      .phone-input {
        padding-left: 48px;
      }

      .input-icon {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #B2BEC3;
        cursor: pointer;

        img {
          width: 18px;
          height: 18px;
        }
      }
    }

    .error-message {
      position: absolute;
      left: 0;
      bottom: -20px;
      color: #FF5252;
      font-size: 12px;
      line-height: 1.2;
      transition: opacity 100ms;
      opacity: 1;
      pointer-events: none;
    }
  }

  .form-options {
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .checkbox-container {
      display: flex;
      align-items: center;

      .custom-checkbox {
        width: 18px;
        height: 18px;
        border: 1px solid #EBEEF5;
        border-radius: 6px;
        margin-right: 8px;
        position: relative;
        background: #FFFFFF;
        cursor: pointer;

        &.checked::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #FF7D45;
          font-size: 12px;
          font-weight: 600;
        }
      }

      .checkbox-label {
        font-size: 13px;
        color: #636E72;
        cursor: pointer;
      }
    }

    .forgot-link {
      color: #FF7D45;
      font-size: 13px;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .login-button {
    margin-top: 16px;
    width: 100%;
  }

  .form-footer {
    margin-top: auto;
    text-align: center;
    font-size: 13px;
    color: #636E72;

    .register-link {
      color: #FF7D45;
      font-weight: 500;
      text-decoration: none;
      margin-left: 8px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
