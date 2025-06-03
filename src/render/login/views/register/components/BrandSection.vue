<template>
  <div class="register-side">
    <div class="bg-pattern">
      <div class="pattern-circle circle-1"></div>
      <div class="pattern-circle circle-2"></div>
      <div class="pattern-circle circle-3"></div>
    </div>
    
    <div class="side-content">
      <div class="logo-container">
        <div class="logo-shine"></div>
        <svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="white">
          <path d="M40,8C22.36,8,8,22.36,8,40s14.36,32,32,32s32-14.36,32-32S57.64,8,40,8z M52,36c2.21,0,4,1.79,4,4 s-1.79,4-4,4s-4-1.79-4-4S49.79,36,52,36z M28,36c2.21,0,4,1.79,4,4s-1.79,4-4,4s-4-1.79-4-4S25.79,36,28,36z M40,60 c-8.01,0-15.05-5.38-17.19-13.09C25.78,48.19,32.48,48,40,48s14.22,0.19,17.19-1.09C55.05,54.62,48.01,60,40,60z"/>
        </svg>
      </div>
      <h1 class="brand-title">Beaver</h1>
      <p class="brand-slogan">创建账号，开启高效沟通</p>
      
      <div class="step-dots">
        <div class="step-dot" :class="{ active: currentStep === 1 }"></div>
        <div class="step-dot" :class="{ active: currentStep === 2 }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BrandSection',
  props: {
    currentStep: {
      type: Number,
      default: 1
    }
  }
});
</script>

<style lang="less" scoped>
.register-side {
  width:400px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.pattern-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -120px;
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: -80px;
}

.circle-3 {
  width: 80px;
  height: 80px;
  top: 30%;
  left: 20%;
  opacity: 0.15;
  animation: floatAnimation 8s infinite ease-in-out;
}

.side-content {
  position: relative;
  z-index: 5;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #FFFFFF;
  padding: 0 32px;
}

.logo-container {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  position: relative;
}

.logo-shine {
  position: absolute;
  width: 100px;
  height: 100px;
  top: -10px;
  left: -10px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  animation: pulse 4s infinite;
}

.brand-logo {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.brand-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.brand-slogan {
  font-size: 15px;
  opacity: 0.9;
  margin-bottom: 24px;
  font-weight: 300;
  letter-spacing: 0.3px;
}

.step-dots {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1);

  &.active {
    background-color: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
}

@keyframes floatAnimation {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(10px, -15px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.15; }
  100% { transform: scale(1); opacity: 0.3; }
}
</style>
