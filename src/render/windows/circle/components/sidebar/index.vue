<template>
  <div class="circle-sidebar">
    <div class="circle-sidebar-top">
      <button class="circle-sidebar-create" type="button" @click="circleStore.openCreateCircle()">
        <img src="renderModule/assets/image/common/add.svg" alt="创建" class="circle-sidebar-create-icon">
        创建圈子
      </button>
    </div>

    <div class="circle-sidebar-title">
      我的圈子
    </div>

    <div class="circle-sidebar-list">
      <div v-if="circleStore.loadingCircles" class="circle-sidebar-empty">
        加载中...
      </div>
      <div v-else-if="circleStore.myCircles.length === 0" class="circle-sidebar-empty">
        还没有加入圈子<br>等待他人邀请或分享链接加入
      </div>
      <div
        v-for="item in circleStore.myCircles"
        :key="item.circleId"
        class="circle-sidebar-item"
        :class="{ active: circleStore.currentCircleId === item.circleId }"
        @click="circleStore.selectCircle(item.circleId)"
      >
        <div class="circle-sidebar-item-avatar">
          <img v-if="item.avatar" :src="item.avatar" alt="avatar">
          <span v-else>{{ item.name.slice(0, 1) }}</span>
        </div>
        <div class="circle-sidebar-item-main">
          <div class="circle-sidebar-item-name">
            {{ item.name }}
          </div>
          <div class="circle-sidebar-item-meta">
            {{ item.memberCount }} 成员
            <template v-if="item.postCount !== undefined"> · {{ item.postCount }} 帖</template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCircleStore } from 'renderModule/windows/circle/store/circle/circle'

export default defineComponent({
  name: 'CircleSidebar',
  setup() {
    const circleStore = useCircleStore()
    return { circleStore }
  },
})
</script>

<style lang="less" scoped>
.circle-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #EBEEF5;
  background: #FFFFFF;
}

.circle-sidebar-top {
  padding: 16px;
  border-bottom: 1px solid #EBEEF5;
}

.circle-sidebar-create {
  width: 100%;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 125, 69, 0.28);
}

.circle-sidebar-create-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.circle-sidebar-title {
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid #EBEEF5;
  font-size: 14px;
  font-weight: 600;
  color: #2D3436;
}

.circle-sidebar-list {
  flex: 1;
  overflow-y: auto;
}

.circle-sidebar-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  line-height: 1.6;
  color: #636E72;
}

.circle-sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #EBEEF5;
  transition: background 0.2s;

  &:hover {
    background: #F9FAFB;
  }

  &.active {
    background: rgba(255, 125, 69, 0.12);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 16px;
      bottom: 16px;
      width: 3px;
      background: #FF7D45;
      border-radius: 0 2px 2px 0;
    }
  }
}

.circle-sidebar-item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #FFE6D9;
  color: #FF7D45;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.circle-sidebar-item-main {
  flex: 1;
  min-width: 0;
}

.circle-sidebar-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circle-sidebar-item-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #636E72;
}
</style>
