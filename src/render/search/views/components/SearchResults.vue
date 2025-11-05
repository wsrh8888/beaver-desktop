<template>
  <div class="result-section">
    <!-- 搜索结果列表 -->
    <div v-if="results.length > 0" class="results-list">
      <div
        v-for="(result, index) in results"
        :key="index"
        class="card"
      >
        <div class="avatar">
          <BeaverImage :file-name="result.avatar" />
        </div>
        <div class="info">
          <div class="name">
            {{ result.title }}
          </div>
          <div class="meta">
            ID: {{ result.id }}
          </div>
        </div>
        <BeaverButton size="small" type="primary" @click.stop="handleActionClick(result)">
          添加
        </BeaverButton>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="none" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" />
      </svg>
      <p class="empty-text">
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import type { ISearchResult } from 'commonModule/type/view/search'
import { NotificationModule, NotificationSearchToVerifyCommand } from 'commonModule/type/preload/notification'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SearchResults',
  components: {
    BeaverImage,
    BeaverButton,
  },
  props: {
    results: {
      type: Array as () => ISearchResult[],
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: '输入关键词开始搜索',
    },
  },
  setup() {
    const handleActionClick = async (result: ISearchResult) => {
      electron.window.openWindow('verify')
      electron.notification.send('verify', NotificationModule.SEARCH_TO_VERIFY, NotificationSearchToVerifyCommand.SEARCH_TO_VERIFY, {
        type: result.type,
        id: result.id,
        title: result.title,
        avatar: result.avatar,
        source: result.source,
      })
    }

    return {
      handleActionClick,
    }
  },
})
</script>

<style lang="less" scoped>
.result-section {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0px;

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #636E72;
    font-size: 13px;
    gap: 12px;

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #EBEEF5;
      border-top: 2px solid #FF7D45;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* 空状态 */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #B2BEC3;
    font-size: 13px;

    .empty-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      opacity: 0.6;
    }

    .empty-text {
      margin: 0;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-list {
  .card {
    background: #FFFFFF;
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 8px;
    transition: background-color 0.2s ease;
    cursor: pointer;

    &:hover {
      background: #F9FAFB;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #EBEEF5;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #B2BEC3;
      font-weight: 500;
    }

    .info {
      flex: 1;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .name {
        font-size: 13px;
        color: #2D3436;
        font-weight: 500;
      }

      .meta {
        font-size: 12px;
        color: #B2BEC3;
      }
    }

  }
}
</style>
