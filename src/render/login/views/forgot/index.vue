<template>
  <div class="forgot-password-container">
    <WindowControls />

    <BrandSection />

    <div class="forgot-password-form">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <div class="step-number">
            1
          </div>
          <div class="step-label">
            验证邮箱
          </div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }" />
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <div class="step-number">
            2
          </div>
          <div class="step-label">
            输入验证码
          </div>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }" />
        <div class="step" :class="{ active: currentStep >= 3 }">
          <div class="step-number">
            3
          </div>
          <div class="step-label">
            重置密码
          </div>
        </div>
      </div>

      <!-- 步骤1: 邮箱验证 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="form-header">
          <h2 class="form-title">
            忘记密码
          </h2>
          <p class="form-subtitle">
            请输入您的邮箱地址
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">邮箱地址</label>
          <BeaverInput
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱地址"
            :error="!!errors.email"
            @blur="validateEmail"
          />
          <div v-show="errors.email" class="error-message">
            {{ errors.email }}
          </div>
        </div>

        <BeaverButton
          type="primary"
          :loading="loading"
          :disabled="!form.email || !!errors.email"
          @click="handleSendCode"
        >
          {{ loading ? '发送中...' : '发送验证码' }}
        </BeaverButton>
      </div>

      <!-- 步骤2: 验证码输入 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="form-header">
          <h2 class="form-title">
            输入验证码
          </h2>
          <p class="form-subtitle">
            验证码已发送至 {{ form.email }}，请查收邮件
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">验证码</label>
          <BeaverInput
            v-model="form.code"
            type="text"
            placeholder="请输入6位验证码"
            :maxlength="6"
            :error="!!errors.code"
            @blur="validateCode"
          />
          <div v-show="errors.code" class="error-message">
            {{ errors.code }}
          </div>
        </div>

        <div class="resend-container">
          <span v-if="countdown > 0" class="countdown-text">
            {{ countdown }}秒后可重新发送
          </span>
          <BeaverButton v-else type="text" @click="handleResendCode">
            重新发送验证码
          </BeaverButton>
        </div>

        <BeaverButton
          type="primary"
          :disabled="!form.code || !!errors.code || form.code.length !== 6"
          @click="handleVerifyCode"
        >
          验证并继续
        </BeaverButton>
      </div>

      <!-- 步骤3: 重置密码 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="form-header">
          <h2 class="form-title">
            重置密码
          </h2>
          <p class="form-subtitle">
            请设置您的新密码
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">新密码</label>
          <BeaverInput
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            :error="!!errors.newPassword"
            @blur="validatePassword"
          />
          <div v-show="errors.newPassword" class="error-message">
            {{ errors.newPassword }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <BeaverInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            :error="!!errors.confirmPassword"
            @blur="validateConfirmPassword"
          />
          <div v-show="errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <BeaverButton
          type="primary"
          :loading="loading"
          :disabled="!isPasswordFormValid"
          @click="handleResetPassword"
        >
          {{ loading ? '重置中...' : '重置密码' }}
        </BeaverButton>
      </div>

      <!-- 返回登录 -->
      <div class="form-footer">
        <span>想起密码了？</span>
        <a href="#" class="login-link" @click="handleBackToLogin">返回登录</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { MD5 } from 'crypto-js'
import { getEmailCodeApi, resetPasswordApi } from 'renderModule/api/auth'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverInput from 'renderModule/components/ui/input/Input.vue'
import Message from 'renderModule/components/ui/message'
import { validateField } from 'renderModule/login/utils/validation'
import { useRouterHelper } from 'renderModule/utils/router'
import { computed, onUnmounted, ref } from 'vue'
import BrandSection from '../../components/BrandSection.vue'
import WindowControls from '../../components/WindowControls.vue'

export default {
  name: 'ForgotPasswordView',
  components: {
    WindowControls,
    BrandSection,
    BeaverButton,
    BeaverInput,
  },
  setup() {
    const routerHelper = useRouterHelper()

    const currentStep = ref(1)
    const loading = ref(false)
    const countdown = ref(0)
    let countdownTimer: NodeJS.Timeout | null = null

    const form = ref({
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    })

    const errors = ref({
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    })

    const isPasswordFormValid = computed(() => {
      return !errors.value.newPassword
        && !errors.value.confirmPassword
        && form.value.newPassword
        && form.value.confirmPassword
        && form.value.newPassword === form.value.confirmPassword
    })

    // 验证邮箱
    const validateEmail = () => {
      errors.value.email = validateField(form.value.email, 'email')
    }

    // 验证验证码
    const validateCode = () => {
      if (!form.value.code) {
        errors.value.code = '请输入验证码'
      }
      else if (form.value.code.length !== 6) {
        errors.value.code = '请输入6位数字验证码'
      }
      else {
        errors.value.code = ''
      }
    }

    // 验证密码
    const validatePassword = () => {
      if (!form.value.newPassword) {
        errors.value.newPassword = '请输入新密码'
      }
      else if (form.value.newPassword.length < 6) {
        errors.value.newPassword = '密码长度至少6位'
      }
      else {
        errors.value.newPassword = ''
      }
    }

    // 验证确认密码
    const validateConfirmPassword = () => {
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = '请确认密码'
      }
      else if (form.value.confirmPassword !== form.value.newPassword) {
        errors.value.confirmPassword = '两次输入的密码不一致'
      }
      else {
        errors.value.confirmPassword = ''
      }
    }

    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0 && countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }, 1000)
    }

    // 发送验证码
    const handleSendCode = async () => {
      validateEmail()
      if (errors.value.email)
        return

      loading.value = true
      const res = await getEmailCodeApi({
        email: form.value.email,
        type: 'reset_password',
      })

      if (res.code === 0) {
        Message.success('验证码已发送到您的邮箱')
        currentStep.value = 2
        startCountdown()
      }
      else {
        Message.error(res.msg || '发送验证码失败')
      }

      loading.value = false
    }

    // 重新发送验证码
    const handleResendCode = async () => {
      await handleSendCode()
    }

    // 验证验证码
    const handleVerifyCode = () => {
      validateCode()
      if (!errors.value.code && form.value.code.length === 6) {
        currentStep.value = 3
      }
    }

    // 重置密码
    const handleResetPassword = async () => {
      validatePassword()
      validateConfirmPassword()

      if (!isPasswordFormValid.value)
        return

      loading.value = true
      const res = await resetPasswordApi({
        email: form.value.email,
        code: form.value.code,
        password: MD5(form.value.newPassword).toString(),
      })

      if (res.code === 0) {
        Message.success('密码重置成功，请使用新密码登录')
        setTimeout(() => {
          routerHelper.push('/login')
        }, 2000)
      }
      else {
        Message.error(res.msg || '密码重置失败')
      }

      loading.value = false
    }

    // 返回登录
    const handleBackToLogin = () => {
      routerHelper.push('/login')
    }

    // 清理定时器
    onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    })

    return {
      currentStep,
      loading,
      countdown,
      form,
      errors,
      isPasswordFormValid,
      validateEmail,
      validateCode,
      validatePassword,
      validateConfirmPassword,
      handleSendCode,
      handleResendCode,
      handleVerifyCode,
      handleResetPassword,
      handleBackToLogin,
    }
  },
}
</script>

<style lang="less" scoped>
.forgot-password-container {
  width: 800px;
  height: 500px;
  background-color: var(--color-bg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-window);
  display: flex;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;

  > * {
    flex-shrink: 0;
  }
}

.forgot-password-form {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s var(--transition-bezier);
  flex-shrink: 0;

  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-5);

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;

      .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--color-bg-secondary);
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-small);
        font-weight: var(--font-weight-medium);
        margin-bottom: var(--spacing-1);
        transition: all var(--transition-normal);
      }

      .step-label {
        font-size: var(--font-size-small);
        color: var(--color-text-secondary);
        transition: all var(--transition-normal);
      }

      &.active .step-number {
        background-color: var(--color-primary);
        color: var(--color-text-white);
      }

      &.active .step-label {
        color: var(--color-text-title);
      }

      &.completed .step-number {
        background-color: var(--color-success);
        color: var(--color-text-white);
      }
    }

    .step-line {
      width: 40px;
      height: 2px;
      background-color: var(--color-bg-secondary);
      margin: 0 var(--spacing-2);
      transition: all var(--transition-normal);

      &.active {
        background-color: var(--color-primary);
      }
    }
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

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
      line-height: var(--line-height-body);
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

  .resend-container {
    text-align: center;
    margin-bottom: var(--spacing-3);

    .countdown-text {
      font-size: var(--font-size-small);
      color: var(--color-text-secondary);
    }
  }

  .form-footer {
    margin-top: auto;
    text-align: center;
    font-size: var(--font-size-body);
    color: var(--color-text-body);

    .login-link {
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
