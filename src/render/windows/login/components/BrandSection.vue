<template>
  <div class="login-side">
    <div class="bg-pattern">
      <div class="pattern-circle circle-1" />
      <div class="pattern-circle circle-2" />
      <div class="pattern-circle circle-3" />
      <div class="pattern-circle circle-4" />
    </div>

    <div class="login-date">
      {{ currentDate }}
    </div>

    <div class="brand-content">
      <div class="logo-container">
        <div class="logo-shine" />
        <img src="commonModule/assets/img/logo/logo.png" class="brand-logo" alt="Beaver Logo">
      </div>
      <h1 class="brand-title">
        Beaver
      </h1>
      <p class="brand-slogan">
        连接每一刻，分享每一天
      </p>

      <div class="feature-list">
        <div v-for="(feature, index) in features" :key="index" class="feature-item">
          <div class="feature-icon">
            ✓
          </div>
          <div class="feature-text">
            {{ feature }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'BrandSection',
  props: {
    currentStep: {
      type: Number,
      default: 1,
    },
  },
  setup() {
    const currentDate = ref('')
    const features = [
      '简洁高效的沟通体验',
      '安全可靠的消息加密',
      '跨设备同步的云端存储',
    ]

    onMounted(() => {
      const now = new Date()
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
      currentDate.value = now.toLocaleDateString('zh-CN', options)
    })

    return {
      currentDate,
      features,
    }
  },
})
</script>

<style lang="less" scoped>
.login-side {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  height: 100%;
  background-color: var(--color-primary);
  background-image: var(--gradient-primary);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

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
    top: 20%;
    left: 20%;
    opacity: 0.2;
    animation: float 8s ease-in-out infinite;
  }

  .circle-4 {
    width: 40px;
    height: 40px;
    bottom: 30%;
    right: 20%;
    opacity: 0.15;
    animation: float 6s ease-in-out infinite reverse;
  }

  .login-date {
    position: absolute;
    bottom: var(--spacing-2);
    left: var(--spacing-2);
    color: rgba(255,255,255,0.7);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-regular);
  }

  .brand-content {
    position: relative;
    z-index: 2;
    color: var(--color-text-white);
    text-align: center;
    padding: 0 var(--spacing-4);

    .logo-container {
      width: 100px;
      height: 100px;
      min-width: 100px;
      min-height: 100px;
      max-width: 100px;
      max-height: 100px;
      margin: 0 auto var(--spacing-4);
      position: relative;
      flex-shrink: 0;

      .logo-shine {
        position: absolute;
        width: 120px;
        height: 120px;
        top: -10px;
        left: -10px;
        background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
        border-radius: 50%;
        animation: pulse 4s infinite;
      }

      .brand-logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
      }
    }

    .brand-title {
      font-size: 32px;
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--spacing-2);
      letter-spacing: 1px;
    }

    .brand-slogan {
      font-size: var(--font-size-title);
      opacity: 0.9;
      margin-bottom: var(--spacing-4);
      font-weight: var(--font-weight-regular);
      letter-spacing: 0.5px;
      line-height: var(--line-height-body);
    }

    .feature-list {
      text-align: left;
      max-width: 280px;
      margin: 0 auto;

      .feature-item {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-2);

        .feature-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--spacing-2);
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .feature-text {
          font-size: var(--font-size-subtitle);
          line-height: var(--line-height-body);
        }
      }
    }
  }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
  100% { transform: translateY(0); }
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
</style>
