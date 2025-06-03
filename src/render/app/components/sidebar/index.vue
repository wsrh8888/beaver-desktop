<template>
  <div class="nav-sidebar">
    <div class="main-logo">
      <svg viewBox="0 0 24 24">
        <path d="M12 3L4.5 15 8 21h8l3.5-6L12 3z" fill="#FFFFFF"/>
      </svg>
    </div>
    
    <div class="nav-icons">
      <div 
        v-for="item in outsideList" 
        :key="item.id"
        class="nav-item app__no_drag"
        :class="{ active: item.router === route.path }"
        @click="handleClick(item.router)"
      >
        <div class="nav-icon">
          <img :src="item.router === route.path ? item.activeIcon : item.defaultIcon" :alt="item.title">
          <span v-if="item.id === 'chat'" class="badge">3</span>
        </div>
        <div class="nav-label">{{ item.title }}</div>
      </div>
    </div>
    
    <div class="user-avatar-nav">
      <img :src="userInfo.avatar" :alt="userInfo.name">
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { outsideList } from './data'
import { useUserStore } from "renderModule/app/pinia/user/user";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    const userInfo = computed(() => userStore.userInfo);

    const handleClick = (path: string) => {
      console.error(path)
      nextTick(() => {
        router.push({ path });
      });
     
    };

    return {
      userInfo,
      route,
      handleClick,
      outsideList
    };
  },
});
</script>

<style lang="less" scoped>
.nav-sidebar {
  width: 68px;
  background: #F9FAFB;
  border-right: 1px solid #EBEEF5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  height: 100%;

  .main-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
    }

    svg {
      width: 24px;
      height: 24px;
      position: relative;
      z-index: 1;
    }
  }

  .nav-icons {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
    cursor: pointer;
    width: 100%;
    position: relative;

    &.active {
      .nav-icon {
        color: #FF7D45;
        background: rgba(255,125,69,0.1);
      }

      .nav-label {
        color: #FF7D45;
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 12px;
        height: 16px;
        width: 3px;
        background: #FF7D45;
        border-radius: 0 2px 2px 0;
      }
    }
  }

  .nav-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-bottom: 4px;
    position: relative;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .nav-label {
    font-size: 11px;
    color: #636E72;
  }

  .badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    background: #FF5252;
    color: white;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    padding: 0 4px;
    box-shadow: 0 2px 4px rgba(255, 82, 82, 0.2);
  }

  .user-avatar-nav {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    margin-top: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>