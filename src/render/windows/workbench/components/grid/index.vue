<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

<template>
  <div class="workbench-grid">
    <div v-if="workbenchStore.loading" class="workbench-grid-state">
      <div class="workbench-grid-spinner" />
      <p>加载应用中...</p>
    </div>

    <div v-else-if="workbenchStore.isEmpty" class="workbench-grid-state">
      <img src="renderModule/assets/image/leftBar/workbench.svg" alt="工作台">
      <h3>暂无应用</h3>
      <p>管理员在后台配置并上架后，应用会出现在这里</p>
    </div>

    <div v-else class="workbench-grid-content">
      <section
        v-for="group in workbenchStore.groups"
        :key="group.category"
        class="workbench-grid-group"
      >
        <h3 class="workbench-grid-group-title">{{ group.categoryName }}</h3>
        <div class="workbench-grid-cards">
          <button
            v-for="app in group.list"
            :key="app.workbenchAppId"
            class="workbench-grid-card"
            type="button"
            @click="workbenchStore.openApp(app)"
          >
            <div class="workbench-grid-card-main">
              <div class="workbench-grid-card-icon">
                <img v-if="app.icon" :src="app.icon" alt="icon">
                <span v-else>{{ app.name.slice(0, 1) }}</span>
              </div>
              <div class="workbench-grid-card-name">
                {{ app.name }}
              </div>
            </div>
            <div v-if="app.description" class="workbench-grid-card-desc">
              {{ app.description }}
            </div>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useWorkbenchStore } from 'renderModule/windows/workbench/store/workbench/workbench'

export default defineComponent({
  name: 'WorkbenchGrid',
  setup() {
    const workbenchStore = useWorkbenchStore()
    return { workbenchStore }
  },
})
</script>

<style lang="less" scoped>
.workbench-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  height: 100%;
  overflow-y: auto;
  background: #F9FAFB;
}

.workbench-grid-content {
  padding: 24px;
}

.workbench-grid-group {
  & + & {
    margin-top: 24px;
  }
}

.workbench-grid-group-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: #636E72;
}

.workbench-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.workbench-grid-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 12px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background: #FFFFFF;
  cursor: pointer;
  text-align: left;
  transition: box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 125, 69, 0.35);
    box-shadow: 0 4px 16px rgba(255, 125, 69, 0.12);

    .workbench-grid-card-desc {
      max-height: 40px;
      opacity: 1;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #F0F2F5;
    }
  }
}

.workbench-grid-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.workbench-grid-card-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #FFE6D9;
  color: #FF7D45;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.workbench-grid-card-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workbench-grid-card-desc {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  margin-top: 0;
  padding-top: 0;
  border-top: 1px solid transparent;
  font-size: 12px;
  line-height: 1.4;
  color: #636E72;
  text-align: left;
  transition: max-height 0.2s, opacity 0.2s, margin 0.2s, padding 0.2s, border-color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.workbench-grid-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #636E72;
  text-align: center;
  padding: 24px;

  img {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.8;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: #2D3436;
  }

  p {
    margin: 0;
    font-size: 13px;
    max-width: 320px;
  }
}

.workbench-grid-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #EBEEF5;
  border-top-color: #FF7D45;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
