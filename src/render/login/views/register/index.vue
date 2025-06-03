<template>
  <div class="register-container">
    <WindowControls />
    <BrandSection :currentStep="step" />

    <div class="register-form-container">
      <div class="form-carousel" :style="{ transform: `translateX(${step === 1 ? 0 : -440}px)` }">
        <!-- 第一步：手机号验证 -->
        <div class="register-form">
          <div class="form-header">
            <h2 class="form-title">手机号验证</h2>
            <p class="form-subtitle">请输入手机号并获取验证码</p>
          </div>
          
          <div class="form-body">
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
                />
              </div>
              <div class="error-message" v-show="errors.phone">{{ errors.phone }}</div>
            </div>
            
            <div class="form-group">
              <label for="verifyCode" class="form-label">验证码</label>
              <div class="verify-code-container">
                <div class="input-container verify-code-input">
                  <input
                    type="text"
                    id="verifyCode"
                    v-model="form.code"
                    class="form-input"
                    placeholder="请输入验证码"
                    maxlength="6"
                    @blur="validateCode"
                  />
                </div>
                <button 
                  class="get-code-btn" 
                  :disabled="countdown > 0"
                  @click="handleGetCode"
                >
                  {{ countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码' }}
                </button>
              </div>
              <div class="form-tip">验证码有效期为10分钟</div>
              <div class="error-message" v-show="errors.code">{{ errors.code }}</div>
            </div>
          </div>
          
          <div>
            <div class="form-actions">
              <button class="next-button" @click="goToStep2">下一步</button>
            </div>
            
            <div class="form-footer">
              <span>已有账号？</span>
              <a href="#" class="login-link" @click="goLogin">返回登录</a>
            </div>
          </div>
        </div>

        <!-- 第二步：设置密码 -->
        <div class="register-form">
          <div class="form-header">
            <h2 class="form-title">设置密码</h2>
            <p class="form-subtitle">创建一个安全的密码</p>
          </div>
          
          <div class="form-body">
            <div class="form-group">
              <label for="password" class="form-label">设置密码</label>
              <div class="input-container">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  class="form-input"
                  placeholder="请设置6-20位密码"
                  @blur="validatePassword"
                />
                <div class="input-icon" @click="togglePassword">
                  <img :src="showPassword ? eyeOffIcon : eyeIcon" alt="toggle password" />
                </div>
              </div>
              <div class="password-strength">
                <div class="strength-indicator" :class="passwordStrengthClass"></div>
                <div class="strength-indicator" :class="passwordStrengthClass"></div>
                <div class="strength-indicator" :class="passwordStrengthClass"></div>
              </div>
              <div class="strength-text">{{ passwordStrengthText }}</div>
              <div class="error-message" v-show="errors.password">{{ errors.password }}</div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">确认密码</label>
              <div class="input-container">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  class="form-input"
                  placeholder="请再次输入密码"
                  @blur="validateConfirmPassword"
                />
                <div class="input-icon" @click="toggleConfirmPassword">
                  <img :src="showConfirmPassword ? eyeOffIcon : eyeIcon" alt="toggle password" />
                </div>
              </div>
              <div class="error-message" v-show="errors.confirmPassword">{{ errors.confirmPassword }}</div>
            </div>
            
            <div class="agreement-checkbox">
              <div 
                class="custom-checkbox" 
                :class="{ checked: isAgreed }"
                @click="toggleAgreement"
              ></div>
              <div class="agreement-text">
                我已阅读并同意 <a href="#">《Beaver 用户协议》</a>和<a href="#">《隐私政策》</a>
              </div>
            </div>
          </div>
          
          <div>
            <div class="form-actions">
              <button class="back-button" @click="goToStep1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <button class="next-button" @click="handleRegister">注册</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 注册成功状态 -->
      <div class="register-success" v-show="showSuccess">
        <div class="success-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E86835" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" id="successCheck" style="stroke-dasharray: 100; stroke-dashoffset: 100;"></path>
            <polyline points="22 4 12 14.01 9 11.01" id="successCheckmark" style="stroke-dasharray: 100; stroke-dashoffset: 100;"></polyline>
          </svg>
        </div>
        <h3 class="success-title">注册成功!</h3>
        <p class="success-message">恭喜您成功注册 Beaver 账号，点击下方按钮登录</p>
        <button class="go-login-button" @click="goLogin">立即登录</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import WindowControls from './components/WindowControls.vue';
import BrandSection from './components/BrandSection.vue';
import { registerApi } from 'renderModule/api/user';
import { ElMessage } from 'element-plus';
import eyeIcon from 'renderModule/assets/image/register/eye.svg';
import eyeOffIcon from 'renderModule/assets/image/register/eye-off.svg';

export default defineComponent({
  name: 'RegisterView',
  components: {
    WindowControls,
    BrandSection
  },
  setup() {
    const router = useRouter();
    const step = ref(1);
    const showSuccess = ref(false);
    const countdown = ref(0);
    const isAgreed = ref(false);
    
    const form = ref({
      phone: '',
      code: '',
      password: '',
      confirmPassword: ''
    });

    const errors = ref({
      phone: '',
      code: '',
      password: '',
      confirmPassword: ''
    });

    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const passwordStrength = computed(() => {
      const password = form.value.password;
      if (!password) return 0;
      
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.length >= 10) strength++;
      if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      return strength;
    });

    const passwordStrengthClass = computed(() => {
      const strength = passwordStrength.value;
      if (strength <= 2) return 'weak';
      if (strength <= 4) return 'medium';
      return 'strong';
    });

    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value;
      if (!form.value.password) return '密码强度: 请输入密码';
      if (strength <= 2) return '密码强度: 弱';
      if (strength <= 4) return '密码强度: 中等';
      return '密码强度: 强';
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

    const validateCode = () => {
      if (!form.value.code) {
        errors.value.code = '请输入验证码';
      } else if (form.value.code.length < 6) {
        errors.value.code = '请输入完整的验证码';
      } else {
        errors.value.code = '';
      }
    };

    const validatePassword = () => {
      if (!form.value.password) {
        errors.value.password = '请设置密码';
      } else if (form.value.password.length < 6 || form.value.password.length > 20) {
        errors.value.password = '密码长度应为6-20位';
      } else {
        errors.value.password = '';
      }
    };

    const validateConfirmPassword = () => {
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = '请确认密码';
      } else if (form.value.confirmPassword !== form.value.password) {
        errors.value.confirmPassword = '两次输入的密码不一致';
      } else {
        errors.value.confirmPassword = '';
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const toggleConfirmPassword = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    const toggleAgreement = () => {
      isAgreed.value = !isAgreed.value;
    };

    const handleGetCode = async () => {
      validatePhone();
      if (errors.value.phone) return;

      try {
        // TODO: 调用发送验证码接口
        // const res = await sendVerificationCodeApi({ phone: form.value.phone });
        // if (res.code === 0) {
          countdown.value = 60;
          const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
              clearInterval(timer);
            }
          }, 1000);
        // } else {
        //   ElMessage.error(res.message || '获取验证码失败');
        // }
      } catch (error) {
        ElMessage.error('获取验证码失败，请稍后重试');
      }
    };

    const goToStep2 = () => {
      validatePhone();
      validateCode();
      if (errors.value.phone || errors.value.code) return;
      step.value = 2;
    };

    const goToStep1 = () => {
      step.value = 1;
    };

    const handleRegister = async () => {
      validatePassword();
      validateConfirmPassword();
      if (errors.value.password || errors.value.confirmPassword) return;
      if (!isAgreed.value) {
        ElMessage.warning('请阅读并同意用户协议和隐私政策');
        return;
      }

      try {
        const registerData = {
          phone: form.value.phone,
          verificationCode: form.value.code,
          password: form.value.password
        };
        
        const res = await registerApi(registerData);
        if (res.code === 0) {
          showSuccess.value = true;
        } else {
          ElMessage.error(res.message || '注册失败');
        }
      } catch (error) {
        ElMessage.error('注册失败，请稍后重试');
      }
    };

    const goLogin = () => {
      router.push('/');
    };

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
      passwordStrengthClass,
      passwordStrengthText,
      handlePhoneInput,
      validatePhone,
      validateCode,
      validatePassword,
      validateConfirmPassword,
      togglePassword,
      toggleConfirmPassword,
      toggleAgreement,
      handleGetCode,
      goToStep2,
      goToStep1,
      handleRegister,
      goLogin
    };
  }
});
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
    height: 50px;
    background-color: #F9FAFB;
    border: 2px solid transparent;
    border-radius: 10px;
    padding: 0 18px;
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
    height: 50px;
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
    height: 50px;
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
    height: 50px;
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
      transform: translateY(-2px);
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
      transform: translateY(-2px);
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
