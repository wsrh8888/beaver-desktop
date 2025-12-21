<template>
  <!-- 表情包详情页面 -->
  <div class="emoji-package-detail">
    <!-- 头部 -->
    <div class="panel-header">
      <BeaverButton type="text" circle class="back-btn" @click="handleBack">
        <template #icon>
          <img src="renderModule/assets/image/common/back.svg" alt="返回">
        </template>
      </BeaverButton>
      <div class="header-title">
        表情商店
      </div>
      <BeaverButton type="text" circle class="close-btn" @click="handleClose">
        <template #icon>
          <img src="renderModule/assets/image/common/close.svg" alt="关闭">
        </template>
      </BeaverButton>
    </div>
    <div class="package-detail-content">
      <!-- 封面介绍区域 -->
      <div class="package-cover-section">
        <div class="cover-image">
          <BeaverImage :file-name="packageInfo.coverFile" alt="封面" image-class="cover-image-content" />
        </div>
        <div class="cover-info">
          <div class="cover-title">{{ packageInfo.title }}</div>
          <div class="cover-description">{{ packageInfo.description || '暂无描述' }}</div>
          <div class="cover-actions">


            <BeaverButton type="primary" :disabled="packageInfo.isCollected" @click="handleCollect" size="small">
              {{ packageInfo.isCollected ? '已收藏' : '添加' }}
            </BeaverButton>
          </div>
        </div>
      </div>

      <!-- 表情列表 -->
      <div class="package-emojis-section">
        <div class="emojis-grid">
          <div v-for="emoji in emojis" :key="emoji.emojiId" class="emoji-grid-item">
            <BeaverImage :file-name="emoji.fileKey" alt="表情" image-class="emoji-grid-image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import { getEmojiPackageDetailApi, updateFavoriteEmojiPackageApi } from 'renderModule/api/emoji'

export default defineComponent({
  name: 'EmojiPackageDetail',
  components: {
    BeaverButton,
    BeaverImage,
  },
  props: {
    packageId: {
      type: String,
      required: true,
    },
  },
  emits: ['back', 'close'],
  setup(props, { emit }) {
    const emojiStore = useEmojiStore()

    // 状态
    const packageInfo = ref<any>({
      packageId: props.packageId,
      title: '',
      coverFile: '',
      description: '',
      emojiCount: 0,
      collectCount: 0,
      isCollected: false,
    })
    const emojis = ref<any[]>([])

    // 加载表情包详情
    const loadPackageDetail = async () => {
      try {
        const response = await getEmojiPackageDetailApi({
          packageId: props.packageId,
        })

        if (response.result) {
          packageInfo.value = {
            ...response.result,
            packageId: props.packageId,
          }
          emojis.value = response.result.emojis || []
        }
      } catch (error) {
        console.error('加载表情包详情失败:', error)
      }
    }

    // 收藏表情包
    const handleCollect = async () => {
      try {
        await updateFavoriteEmojiPackageApi({
          packageId: props.packageId,
          type: 'favorite',
        })

        // 更新本地状态
        packageInfo.value.isCollected = true
        packageInfo.value.collectCount += 1

        // 重新初始化emoji store以更新数据
        await emojiStore.init()
      } catch (error) {
        console.error('收藏表情包失败:', error)
      }
    }
    // 返回
    const handleBack = () => {
      emit('back')
    }

    // 关闭
    const handleClose = () => {
      emit('close')
    }

    // 初始化
    onMounted(async () => {
      await loadPackageDetail()
    })

    return {
      packageInfo,
      emojis,
      handleCollect,
      handleBack,
      handleClose,
    }
  },
})
</script>

<style lang="less" scoped>
.emoji-package-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #EBEEF5;
  height: 50px;

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
.package-detail-content {
  overflow-y: auto;
  // 现代化滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #FF7D45 0%, #E86835 100%);
    border-radius: 3px;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(180deg, #E86835 0%, #D55A2B 100%);
      box-shadow: 0 0 6px rgba(255, 125, 69, 0.4);
    }
  }
}
.package-cover-section {
  display: flex;
  margin: 18px;


  .cover-image {
    width: 300px;
    height: 130px;
    border-radius: 8px;
    overflow: hidden;
    margin-right: 20px;
    flex-shrink: 0;
    background: red;

    .cover-image-content {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .cover-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .cover-title {
      font-size: 15px;
      color: #2D3436;
      margin-bottom: 8px;
    }

    .cover-description {
      font-size: 12px;
      color: #636E72;
      line-height: 1.5;
      margin-bottom: 12px;
      flex: 1;
    }

    .cover-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .stat-item {
        font-size: 12px;
        color: #B2BEC3;
      }
    }
  }
}

.package-emojis-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  .emojis-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 12px;
  }

  .emoji-grid-item {
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;

    .emoji-grid-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
