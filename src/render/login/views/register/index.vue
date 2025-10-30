<template>
  <div class="register-container">
    <WindowControls />
    <BrandSection :current-step="step" />

    <div class="register-form-container">
      <div class="form-carousel" :style="{ transform: `translateX(${step === 1 ? 0 : -400}px)` }">
        <!-- 第一步：邮箱验证 -->
        <div class="register-form">
          <div class="form-header">
            <h2 class="form-title">
              邮箱验证
            </h2>
            <p class="form-subtitle">
              请输入邮箱并获取验证码
            </p>
          </div>

          <div class="form-body">
            <div class="form-group">
              <!-- <label for="email" class="form-label">邮箱</label> -->
              <div class="input-container">
                <input
                  id="email"
                  v-model.trim="form.email"
                  :type="LOGIN_CONFIG.email.type"
                  class="form-input"
                  :placeholder="LOGIN_CONFIG.email.placeholder"
                  @blur="validateFormField('email')"
                >
              </div>
              <div v-show="errors.email" class="error-message">
                {{ errors.email }}
              </div>
            </div>

            <div class="form-group">
              <!-- <label for="verifyCode" class="form-label">验证码</label> -->
              <div class="verify-code-container">
                <div class="input-container verify-code-input">
                  <input
                    id="verifyCode"
                    v-model.trim="form.code"
                    :type="LOGIN_CONFIG.code.type"
                    class="form-input"
                    :placeholder="LOGIN_CONFIG.code.placeholder"
                    :maxlength="LOGIN_CONFIG.code.maxLength"
                    @blur="validateFormField('code')"
                  >
                </div>
                <button
                  class="get-code-btn"
                  :disabled="countdown > 0"
                  @click="handleGetCode"
                >
                  {{ countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码' }}
                </button>
              </div>

              <div v-show="errors.code" class="error-message">
                {{ errors.code }}
              </div>
            </div>
          </div>

          <div>
            <div class="form-actions">
              <button class="next-button" @click="goToStep2">
                下一步
              </button>
            </div>

            <div class="form-footer">
              <span>已有账号？</span>
              <a href="#" class="login-link" @click="handleNavigation('/login')">返回登录</a>
            </div>
          </div>
        </div>

        <!-- 第二步：设置密码 -->
        <div class="register-form">
          <div class="form-header">
            <h2 class="form-title">
              设置密码
            </h2>
            <p class="form-subtitle">
              创建一个安全的密码
            </p>
          </div>

          <div class="form-body">
            <div class="form-group">
              <label for="password" class="form-label">设置密码</label>
              <div class="input-container">
                <input
                  id="password"
                  v-model.trim="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  :placeholder="LOGIN_CONFIG.password.placeholder"
                  @blur="validateFormField('password')"
                >
                <div class="input-icon" @click="toggle('password')">
                  <img :src="showPassword ? eyeOffIcon : eyeIcon" alt="toggle password">
                </div>
              </div>

              <div v-show="errors.password" class="error-message">
                {{ errors.password }}
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">确认密码</label>
              <div class="input-container">
                <input
                  id="confirmPassword"
                  v-model.trim="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请再次输入密码"
                  @blur="validateConfirmPassword"
                >
                <div class="input-icon" @click="toggle('confirmPassword')">
                  <img :src="showConfirmPassword ? eyeOffIcon : eyeIcon" alt="toggle password">
                </div>
              </div>
              <div v-show="errors.confirmPassword" class="error-message">
                {{ errors.confirmPassword }}
              </div>
            </div>

            <div class="agreement-checkbox">
              <div
                class="custom-checkbox"
                :class="{ checked: isAgreed }"
                @click="toggle('agreement')"
              />
              <div class="agreement-text">
                我已阅读并同意 <a href="#">《Beaver 用户协议》</a>和<a href="#">《隐私政策》</a>
              </div>
            </div>
          </div>

          <div>
            <div class="form-actions">
              <button class="back-button" @click="goToStep1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button class="next-button" @click="handleRegister">
                注册
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 注册成功状态 -->
      <div v-show="showSuccess" class="register-success">
        <div class="success-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E86835" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path id="successCheck" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" style="stroke-dasharray: 100; stroke-dashoffset: 100;" />
            <polyline id="successCheckmark" points="22 4 12 14.01 9 11.01" style="stroke-dasharray: 100; stroke-dashoffset: 100;" />
          </svg>
        </div>
        <h3 class="success-title">
          注册成功!
        </h3>
        <p class="success-message">
          恭喜您成功注册 Beaver 账号，点击下方按钮登录
        </p>
        <button class="go-login-button" @click="handleNavigation('/')">
          立即登录
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { MD5 } from 'crypto-js'
import { emailRegisterApi, getEmailCodeApi } from 'renderModule/api/auth'
import eyeOffIcon from 'renderModule/assets/image/register/eye-off.svg'
import eyeIcon from 'renderModule/assets/image/register/eye.svg'
import Message from 'renderModule/components/ui/message'
import { useRouterHelper } from 'renderModule/utils/router'
import { defineComponent, ref } from 'vue'
import BrandSection from '../../components/BrandSection.vue'
import WindowControls from '../../components/WindowControls.vue'
import { LOGIN_CONFIG } from '../../config'
import { validateField } from '../../utils/validation'

export default defineComponent({
  name: 'RegisterView',
  components: {
    WindowControls,
    BrandSection,
  },
  setup() {
    const { push } = useRouterHelper()
    const step = ref(1)
    const showSuccess = ref(false)
    const countdown = ref(0)
    const isAgreed = ref(false)

    const form = ref({
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
    })

    const errors = ref({
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
    })

    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const validateFormField = (fieldName: 'email' | 'code' | 'password') => {
      errors.value[fieldName] = validateField(form.value[fieldName], fieldName)
    }

    const validatePassword = () => {
      if (!form.value.password) {
        errors.value.password = '请设置密码'
      }
      else if (!/^\S{13,}$/.test(form.value.password)) {
        errors.value.password = '密码长度不少于13位，且不能包含空格'
      }
      else {
        errors.value.password = ''
      }
    }

    const validateConfirmPassword = () => {
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = '请确认密码'
      }
      else if (form.value.confirmPassword !== form.value.password) {
        errors.value.confirmPassword = '两次输入的密码不一致'
      }
      else {
        errors.value.confirmPassword = ''
      }
    }

    const toggle = (type: 'password' | 'confirmPassword' | 'agreement') => {
      if (type === 'password') {
        showPassword.value = !showPassword.value
      }
      else if (type === 'confirmPassword') {
        showConfirmPassword.value = !showConfirmPassword.value
      }
      else if (type === 'agreement') {
        isAgreed.value = !isAgreed.value
      }
    }

    const handleGetCode = async () => {
      validateFormField('email')
      if (errors.value.email)
        return

      try {
        const res = await getEmailCodeApi({
          email: form.value.email,
          type: 'register',
        })

        if (res.code === 0) {
          Message.success('验证码已发送')
          countdown.value = 60
          const timer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        }
        else {
          Message.error(res.msg || '获取验证码失败')
        }
      }
      catch {
        Message.error('获取验证码失败，请稍后重试')
      }
    }

    const goToStep2 = () => {
      validateFormField('email')
      validateFormField('code')
      if (errors.value.email || errors.value.code)
        return
      step.value = 2
    }

    const goToStep1 = () => {
      step.value = 1
    }

    const handleRegister = async () => {
      validatePassword()
      validateConfirmPassword()
      if (errors.value.password || errors.value.confirmPassword)
        return
      if (!isAgreed.value) {
        Message.warning('请阅读并同意用户协议和隐私政策')
        return
      }

      try {
        const registerData = {
          email: form.value.email,
          password: MD5(form.value.password).toString(),
          code: form.value.code,
        }

        const res = await emailRegisterApi(registerData)
        if (res.code === 0) {
          showSuccess.value = true
          push('/login')
        }
        else {
          Message.error(res.msg || '注册失败')
        }
      }
      catch {
        Message.error('注册失败，请稍后重试')
      }
    }

    const handleNavigation = (path: string) => {
      push(path)
    }

    return {
      step,
      form,
      errors,
      showPassword,
      showConfirmPassword,
      showSuccess,
      countdown,
      isAgreed,
      eyeIcon,
      eyeOffIcon,
      validateFormField,
      validatePassword,
      validateConfirmPassword,
      toggle,
      handleGetCode,
      goToStep2,
      goToStep1,
      handleRegister,
      handleNavigation,
      LOGIN_CONFIG,
    }
  },
})
</script>

<style lang="less" scoped>
.register-container {
  width: 800px;
  height: 500px;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06);
  display: flex;
  overflow: hidden;
  position: relative;
}

.register-form-container {
  width: 400px;
  position: relative;
  overflow: hidden;
}

.form-carousel {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
  height: 100%;
}

.register-form {
  min-width: 400px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  height: 100%;

  .form-header {
    text-align: center;
    margin-bottom: 32px;
  }

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

  .form-body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-label {
    display: block;
    margin-bottom: 10px;
    color: #2D3436;
    font-size: 14px;
    font-weight: 500;
    padding-left: 2px;
  }

  .input-container {
    position: relative;
  }

  .input-prefix {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #2D3436;
    font-weight: 500;
    font-size: 14px;
  }

  .form-input {
    width: 100%;
    height: 40px;
    background-color: #F9FAFB;
    border: 2px solid transparent;
    border-radius: 10px;
    padding: 0px 18px;
    font-size: 15px;
    color: #2D3436;
    transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);

    &::placeholder {
      color: #B2BEC3;
    }

    &:focus {
      outline: none;
      border-color: #FF7D45;
      background-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(255,125,69,0.15);
    }
  }

  .phone-input {
    padding-left: 52px;
  }

  .input-icon {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #B2BEC3;
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .verify-code-container {
    display: flex;
    gap: 15px;
  }

  .verify-code-input {
    flex: 1;
  }

  .get-code-btn {
    width: 130px;
    height: 40px;
    background: none;
    border: 2px solid #FF7D45;
    border-radius: 10px;
    color: #FF7D45;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #FFE6D9;
    }

    &:disabled {
      border-color: #EBEEF5;
      color: #B2BEC3;
      cursor: not-allowed;
    }
  }

  .form-tip {
    font-size: 12px;
    color: #636E72;
    margin-top: 8px;
    padding-left: 2px;
  }

  .error-message {
    color: #FF5252;
    font-size: 12px;
    margin-top: 8px;
    padding-left: 2px;
  }

  .password-strength {
    display: flex;
    gap: 5px;
    margin-top: 12px;
    padding: 0 2px;
  }

  .strength-indicator {
    height: 4px;
    flex: 1;
    background-color: #EBEEF5;
    border-radius: 2px;

    &.weak {
      background-color: #FF5252;
    }

    &.medium {
      background-color: #FFC107;
    }

    &.strong {
      background-color: #4CAF50;
    }
  }

  .strength-text {
    font-size: 12px;
    margin-top: 8px;
    color: #B2BEC3;
    padding-left: 2px;
  }

  .agreement-checkbox {
    display: flex;
    align-items: flex-start;
    margin-top: 16px;
    margin-bottom: 24px;
    padding: 0 2px;
  }

  .custom-checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid #EBEEF5;
    border-radius: 6px;
    margin-right: 10px;
    margin-top: 2px;
    position: relative;
    background: white;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;

    &:hover {
      border-color: #FFE6D9;
    }

    &.checked {
      background: #FF7D45;
      border-color: #FF7D45;

      &::after {
        content: "";
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        width: 6px;
        height: 3px;
        border-left: 2px solid white;
        border-bottom: 2px solid white;
      }
    }
  }

  .agreement-text {
    font-size: 13px;
    color: #636E72;
    line-height: 1.5;

    a {
      color: #FF7D45;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
  }

  .back-button {
    width: 50px;
    height: 40px;
    background: none;
    border: 2px solid #EBEEF5;
    border-radius: 10px;
    color: #636E72;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: #F9FAFB;
      border-color: #B2BEC3;
    }
  }

  .next-button {
    flex: 1;
    height: 40px;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(232, 104, 53, 0.25);

    &:hover {
      box-shadow: 0 6px 16px rgba(232, 104, 53, 0.3);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(232, 104, 53, 0.25);
    }
  }

  .form-footer {
    text-align: center;
    font-size: 13px;
    color: #636E72;

    .login-link {
      color: #FF7D45;
      font-weight: 500;
      text-decoration: none;
      margin-left: 4px;
      transition: all 0.2s ease;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.register-success {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  z-index: 100;
  animation: fadeIn 0.5s ease;
  padding: 40px;

  &.show {
    display: flex;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #FFE6D9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
    box-shadow: 0 6px 16px rgba(232, 104, 53, 0.2);
  }

  .success-title {
    font-size: 24px;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 14px;
  }

  .success-message {
    font-size: 15px;
    color: #636E72;
    margin-bottom: 32px;
    max-width: 290px;
    line-height: 1.6;
  }

  .go-login-button {
    height: 50px;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 500;
    padding: 0 32px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(232, 104, 53, 0.25);
    width: 160px;

    &:hover {
      box-shadow: 0 6px 16px rgba(232, 104, 53, 0.3);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes checkmark {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}
</style>
