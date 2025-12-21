<template>
  <!-- 表情商店弹窗 -->
  <div class="emoji-store-overlay" @click.self="handleClose">
    <div class="emoji-store-panel" @click.stop>
      <!-- 表情商店主页面 -->
      <div v-if="!selectedPackageId" class="emoji-store-main">
        <!-- 头部 -->
        <div class="panel-header">
          <div class="header-title">
            表情商店
          </div>
          <BeaverButton type="text" circle class="close-btn" @click="handleClose">
            <template #icon>
              <img src="renderModule/assets/image/common/close.svg" alt="关闭">
            </template>
          </BeaverButton>
        </div>

        <!-- 内容区域 -->
        <div class="panel-content">
          <div class="emoji-packages-list" ref="packagesListRef" @scroll="handleScroll">
            <EmojiPackageItem
              v-for="pkg in emojiPackages"
              :key="pkg.packageId"
              :package-data="pkg"
              @click="handlePackageClick"
              @collect="handleCollectPackage"
            />

            <!-- 加载更多 -->
            <div v-if="loading" class="loading-more">
              加载中...
            </div>
          </div>
        </div>
      </div>

      <!-- 表情包详情页面 -->
      <EmojiPackageDetail
        v-else
        :package-id="selectedPackageId"
        @back="handleBack"
        @close="handleClose"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import { getEmojiPackagesApi, updateFavoriteEmojiPackageApi } from 'renderModule/api/emoji'
import EmojiPackageItem from './components/package-item.vue'
import EmojiPackageDetail from './components/package-detail.vue'

export default defineComponent({
  name: 'EmojiStoreComponent',
  components: {
    BeaverButton,
    EmojiPackageItem,
    EmojiPackageDetail,
  },
  emits: ['close'],
  setup(_props, { emit }) {
    const emojiStore = useEmojiStore()

    // 状态
    const emojiPackages = ref<any[]>([])
    const selectedPackageId = ref<string>('')
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const hasMore = ref(true)
    const packagesListRef = ref<HTMLElement>()

    // 加载表情包列表
    const loadEmojiPackages = async (page = 1, append = false) => {
      if (loading.value || (!append && !hasMore.value)) return

      loading.value = true
      try {
        const response = await getEmojiPackagesApi({
          page,
          size: pageSize.value,
        })

        if (response.result?.list) {
          if (append) {
            emojiPackages.value.push(...response.result.list)
          } else {
            emojiPackages.value = response.result.list
          }

          // 检查是否还有更多数据
          hasMore.value = response.result.list.length === pageSize.value
          currentPage.value = page
        }
      } catch (error) {
        console.error('加载表情包列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 处理滚动加载
    const handleScroll = () => {
      if (!packagesListRef.value) return

      const { scrollTop, scrollHeight, clientHeight } = packagesListRef.value
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        // 距离底部100px时加载更多
        loadEmojiPackages(currentPage.value + 1, true)
      }
    }

    // 点击表情包
    const handlePackageClick = (pkg: any) => {
      selectedPackageId.value = pkg.packageId
    }

    // 返回列表
    const handleBack = () => {
      selectedPackageId.value = ''
    }

    // 收藏表情包
    const handleCollectPackage = async (pkg: any) => {
      try {
        await updateFavoriteEmojiPackageApi({
          packageId: pkg.packageId,
          type: 'favorite',
        })

        // 更新本地状态
        pkg.isCollected = true
        pkg.collectCount += 1

        // 重新初始化emoji store以更新数据
        await emojiStore.init()
      } catch (error) {
        console.error('收藏表情包失败:', error)
      }
    }

    // 关闭弹窗
    const handleClose = () => {
      emit('close')
    }

    // 初始化
    onMounted(async () => {
      await loadEmojiPackages()
    })

    return {
      emojiPackages,
      selectedPackageId,
      loading,
      packagesListRef,
      handleScroll,
      handlePackageClick,
      handleBack,
      handleCollectPackage,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.emoji-store-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 40px;
}

.emoji-store-panel {
  width: 700px;
  height: 500px;
  background-color: #f5f6fb;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .emoji-store-main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid #EBEEF5;
  background-color: #FAFBFC;

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .back-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
}

.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 20px;
}

.emoji-packages-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin-top: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e1e1e1;
    border-radius: 3px;
  }
}

.loading-more {
  text-align: center;
  padding: 20px;
  color: #B2BEC3;
  font-size: 14px;
}

</style>
