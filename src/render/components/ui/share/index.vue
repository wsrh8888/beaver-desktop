<template>
  <div class="share-ui">
    <BeaverDialog v-model="visible" :title="dialogTitle" width="420px" @close="handleCancel">
      <div class="share-ui-body">
        <div class="share-ui-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="share-ui-tab"
            :class="{ active: activeTab === tab.key }"
            type="button"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'card'" class="share-ui-panel">
          <div class="share-ui-card">
            <div class="share-ui-card-avatar">
              <BeaverImage
                v-if="avatar"
                :file-name="avatar"
                alt="avatar"
                image-class="share-ui-card-avatar-img"
              />
              <span v-else class="share-ui-card-avatar-text">{{ name.slice(0, 1) || '?' }}</span>
            </div>
            <div class="share-ui-card-main">
              <div class="share-ui-card-badge">
                {{ cardLabel }}
              </div>
              <div class="share-ui-card-name">
                {{ name || '未命名' }}
              </div>
              <div class="share-ui-card-hint">
                点击分享，将以名片形式发送到会话
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'link'" class="share-ui-panel">
          <div class="share-ui-link-box">
            <div class="share-ui-link-label">
              邀请链接
            </div>
            <div class="share-ui-link-value">
              {{ shareLink }}
            </div>
          </div>
        </div>

        <div v-else class="share-ui-panel share-ui-panel--qr">
          <div class="share-ui-qr-frame">
            <img :src="qrImageUrl" alt="二维码" class="share-ui-qr-img">
          </div>
          <p class="share-ui-qr-tip">
            扫码即可加入「{{ name }}」
          </p>
        </div>
      </div>

      <template #footer>
        <template v-if="activeTab === 'card'">
          <BeaverButton type="default" @click="handleCancel">
            取消
          </BeaverButton>
          <BeaverButton type="primary" style="margin-left: 8px" @click="$emit('share')">
            分享
          </BeaverButton>
        </template>
        <template v-else-if="activeTab === 'link'">
          <BeaverButton type="default" @click="handleCancel">
            取消
          </BeaverButton>
          <BeaverButton type="primary" style="margin-left: 8px" @click="$emit('copy')">
            复制
          </BeaverButton>
        </template>
        <template v-else>
          <BeaverButton type="default" @click="$emit('save-qr')">
            保存图片
          </BeaverButton>
          <BeaverButton type="primary" style="margin-left: 8px" @click="$emit('share-link')">
            分享链接
          </BeaverButton>
        </template>
      </template>
    </BeaverDialog>
  </div>
</template>

<script lang="ts">
import { CardType } from 'commonModule/type/ajax/chat'
import { computed, defineComponent, type PropType, ref, watch } from 'vue'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

type ShareTab = 'card' | 'link' | 'qr'

export default defineComponent({
  name: 'ShareUi',
  components: { BeaverDialog, BeaverButton, BeaverImage },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    cardType: {
      type: Number as PropType<number>,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    shareLink: {
      type: String,
      required: true,
    },
    qrImageUrl: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue', 'cancel', 'share', 'copy', 'save-qr', 'share-link'],
  setup(props, { emit }) {
    const activeTab = ref<ShareTab>('card')

    const visible = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    })

    const isGroup = computed(() => props.cardType === CardType.GROUP)

    const dialogTitle = computed(() => (isGroup.value ? '分享群聊' : '分享圈子'))

    const cardLabel = computed(() => (isGroup.value ? '群名片' : '圈子名片'))

    const tabs = computed(() => [
      { key: 'card' as const, label: isGroup.value ? '群名片' : '圈子名片' },
      { key: 'link' as const, label: '获取链接' },
      { key: 'qr' as const, label: isGroup.value ? '群二维码' : '圈子二维码' },
    ])

    watch(() => props.modelValue, (val) => {
      if (val)
        activeTab.value = 'card'
    })

    const handleCancel = () => {
      emit('update:modelValue', false)
      emit('cancel')
    }

    return {
      visible,
      activeTab,
      tabs,
      dialogTitle,
      cardLabel,
      handleCancel,
    }
  },
})
</script>

<style lang="less" scoped>
.share-ui {
  pointer-events: auto;
}

.share-ui-body {
  min-height: 220px;
}

.share-ui-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 20px;
  background: #F5F6FA;
  border-radius: 10px;
}

.share-ui-tab {
  flex: 1;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #636E72;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &.active {
    background: #FFFFFF;
    color: #FF7D45;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
}

.share-ui-panel {
  min-height: 160px;
}

.share-ui-panel--qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.share-ui-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #FFE8DC;
  background: linear-gradient(135deg, #FFF7F2 0%, #FFFFFF 72%);
}

.share-ui-card-avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: #FFE6D9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FF7D45;
  font-size: 22px;
  font-weight: 600;
}

.share-ui-card-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.share-ui-card-avatar-text {
  line-height: 1;
}

.share-ui-card-main {
  flex: 1;
  min-width: 0;
}

.share-ui-card-badge {
  display: inline-flex;
  height: 20px;
  align-items: center;
  padding: 0 8px;
  border-radius: 6px;
  background: rgba(255, 125, 69, 0.12);
  color: #E86835;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 6px;
}

.share-ui-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-ui-card-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #95A5A6;
}

.share-ui-link-box {
  padding: 16px;
  border-radius: 12px;
  background: #F9FAFB;
  border: 1px solid #EBEEF5;
}

.share-ui-link-label {
  font-size: 12px;
  color: #95A5A6;
  margin-bottom: 8px;
}

.share-ui-link-value {
  font-size: 13px;
  color: #2D3436;
  line-height: 1.5;
  word-break: break-all;
  user-select: all;
}

.share-ui-qr-frame {
  padding: 12px;
  border-radius: 12px;
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.share-ui-qr-img {
  width: 168px;
  height: 168px;
  display: block;
}

.share-ui-qr-tip {
  margin: 12px 0 0;
  font-size: 12px;
  color: #636E72;
  text-align: center;
}
</style>
