<template>
  <div class="login-container">
    <WindowControls />
    
    <BrandSection />
    
    <div class="login-form">
      <div class="form-header">
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-subtitle">请登录您的 Beaver 账号</p>
      </div>
      
      <div class="form-group">
        <label for="phone" class="form-label">手机号码</label>
        <div class="input-container">
          <span class="input-prefix">+86</span>
          <input 
            type="tel" 
            id="phone" 
            v-model="form.phone"
            class="form-input phone-input" 
            placeholder="请输入手机号码" 
            maxlength="11"
            @input="handlePhoneInput"
            @blur="validatePhone"
          >
        </div>
        <div class="error-message" v-show="errors.phone">{{ errors.phone }}</div>
      </div>
      
      <div class="form-group">
        <label for="password" class="form-label">密码</label>
        <div class="input-container">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="form.password"
            class="form-input" 
            placeholder="请输入密码"
            @blur="validatePassword"
          >
          <div class="input-icon" @click="togglePassword">
            <img :src="showPassword ? eyeOffIcon : eyeIcon" alt="toggle password">
          </div>
        </div>
        <div class="error-message" v-show="errors.password">{{ errors.password }}</div>
      </div>
      
      <div class="form-options">
        <div class="checkbox-container">
          <div 
            class="custom-checkbox" 
            :class="{ checked: rememberMe }"
            @click="toggleRememberMe"
          ></div>
          <span class="checkbox-label" @click="toggleRememberMe">记住登录</span>
        </div>
        <a href="#" class="forgot-link">忘记密码？</a>
      </div>
      
      <button 
        class="login-button" 
        :disabled="!isFormValid"
        @click="handleLogin"
      >登 录</button>
      
      <div class="form-footer">
        <span>还没有账号？</span>
        <a href="#" class="register-link" @click="handleRegister">立即注册</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { MD5 } from 'crypto-js';
import { loginApi } from 'renderModule/api/user';
import { ElMessage } from 'element-plus';
import WindowControls from './components/WindowControls.vue';
import BrandSection from './components/BrandSection.vue';
import eyeIcon from 'renderModule/assets/image/login/eye.svg';
import eyeOffIcon from 'renderModule/assets/image/login/eye-off.svg';
import { useRouter, useRoute } from 'vue-router';

// import eyeIcon from 'renderM';

export default defineComponent({
  name: 'LoginView',
  components: {
    WindowControls,
    BrandSection
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const form = ref({
      phone: '',
      password: ''
    });

    const errors = ref({
      phone: '',
      password: ''
    });

    const showPassword = ref(false);
    const rememberMe = ref(false);

    const isFormValid = computed(() => {
      return !errors.value.phone && 
             !errors.value.password && 
             form.value.phone && 
             form.value.password;
    });


    const handlePhoneInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/\D/g, '');
    };

    const validatePhone = () => {
      if (!form.value.phone) {
        errors.value.phone = '请输入手机号码';
      } else if (!/^1\d{10}$/.test(form.value.phone)) {
        errors.value.phone = '请输入有效的手机号码';
      } else {
        errors.value.phone = '';
      }
    };

    const validatePassword = () => {
      if (!form.value.password) {
        errors.value.password = '请输入密码';
      } else {
        errors.value.password = '';
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const toggleRememberMe = () => {
      rememberMe.value = !rememberMe.value;
    };

    const handleLogin = async () => {
      validatePhone();
      validatePassword();
      
      if (!isFormValid.value) {
        ElMessage.error('请填写正确的手机号和密码');
        return;
      }

      try {
        const res = await loginApi({
          phone: form.value.phone,
          password: MD5(form.value.password).toString()
        });

        if (res.code === 0) {
          electron.storage.saveStore('loginInfo', {
            userId: res.result.userId,
            token: res.result.token
          });
          // electron.storeData('loginInfo', {
          //   userId: res.result.userId,
          //   token: res.result.token
          // });
          electron.window.openWindow('app');
        } else {
          ElMessage.error('登录失败');
        }
      } catch (error) {
        ElMessage.error('登录失败');
      }
    };

    const handleRegister = () => {
      
      setTimeout(() => {
        router.push({ path: '/register' });
      }, 0);
    };

    return {
      form,
      errors,
      showPassword,
      rememberMe,
      isFormValid,
      eyeIcon,
      eyeOffIcon,
      handlePhoneInput,
      validatePhone,
      validatePassword,
      togglePassword,
      toggleRememberMe,
      handleLogin,
      handleRegister
    };
  }
});
</script>

<style lang="less" scoped>
.login-container {
  width: 800px;
  height: 500px;
  background-color: var(--color-bg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-window);
  display: flex;
  overflow: hidden;
  position: relative;
}

.login-form {
  width: 400px;
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s var(--transition-bezier);

  .form-header {
    text-align: center;
    margin-bottom: var(--spacing-4);
    .form-title {
      font-size: var(--font-size-large-title);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-title);
      margin-bottom: var(--spacing-1);
    }
    .form-subtitle {
      color: var(--color-text-body);
      font-size: var(--font-size-subtitle);
    }
  }

  .form-group {
    margin-bottom: var(--spacing-3);
    position: relative;
    .form-label {
      display: block;
      margin-bottom: var(--spacing-1);
      color: var(--color-text-title);
      font-size: var(--font-size-subtitle);
      font-weight: var(--font-weight-medium);
    }
    .input-container {
      position: relative;
      .input-prefix {
        position: absolute;
        left: var(--spacing-2);
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-title);
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-subtitle);
      }
      .form-input {
        width: 100%;
        height: var(--height-input);
        background-color: var(--color-bg-secondary);
        border: 1px solid transparent;
        border-radius: var(--border-radius-md);
        padding: 0 var(--spacing-2);
        font-size: var(--font-size-body);
        color: var(--color-text-title);
        transition: all var(--transition-normal) var(--transition-bezier);
        &::placeholder {
          color: var(--color-text-secondary);
        }
        &:focus {
          outline: none;
          border-color: var(--color-primary);
          background-color: var(--color-bg);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }
      }
      .phone-input {
        padding-left: var(--spacing-6);
      }
      .input-icon {
        position: absolute;
        right: var(--spacing-2);
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-secondary);
        cursor: pointer;
        img {
          width: var(--size-icon-md);
          height: var(--size-icon-md);
        }
      }
    }
    .error-message {
      position: absolute;
      left: 0;
      bottom: -20px;
      color: var(--color-error);
      font-size: var(--font-size-small);
      line-height: var(--line-height-compact);
      transition: opacity var(--transition-fast);
      opacity: 1;
      pointer-events: none;
    }
  }

  .form-options {
    margin-top: var(--spacing-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    .checkbox-container {
      display: flex;
      align-items: center;
      .custom-checkbox {
        width: var(--size-icon-md);
        height: var(--size-icon-md);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-sm);
        margin-right: var(--spacing-1);
        position: relative;
        background: var(--color-bg);
        cursor: pointer;
        &.checked::after {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--color-primary);
          font-size: var(--font-size-small);
          font-weight: var(--font-weight-bold);
        }
      }
      .checkbox-label {
        font-size: var(--font-size-body);
        color: var(--color-text-body);
        cursor: pointer;
      }
    }
    .forgot-link {
      color: var(--color-primary);
      font-size: var(--font-size-body);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .login-button {
    height: var(--height-input);
    background: var(--gradient-primary);
    color: var(--color-text-white);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-normal) var(--transition-bezier);
    box-shadow: var(--shadow-button);
    margin-top: var(--spacing-2);
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-button-hover);
    }
    &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-button-active);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .form-footer {
    margin-top: auto;
    text-align: center;
    font-size: var(--font-size-body);
    color: var(--color-text-body);
    .register-link {
      color: var(--color-primary);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      margin-left: var(--spacing-1);
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
