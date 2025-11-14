<template>
  <div class="notification-item" @click="handleClick">
    <div class="item-left">
      <div class="avatar">
        <BeaverImage :file-name="item.avatar || ''" />
      </div>
      <div class="item-info">
        <div class="item-name-row">
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.headerText" class="item-status-inline" :class="item.statusClass">
            {{ item.headerText }}
          </span>
        </div>
        <div class="item-desc">
          {{ item.message }}
        </div>
      </div>
    </div>
    <div class="item-right">
      <div class="item-time">
        {{ item.time }}
      </div>
      <div v-if="!item.statusResult" class="item-actions">
        <BeaverButton
          type="success"
          size="mini"
          @click.stop="handleAction('approve')"
        >
          同意
        </BeaverButton>
        <BeaverButton
          type="danger"
          size="mini"
          @click.stop="handleAction('reject')"
        >
          拒绝
        </BeaverButton>
      </div>
      <div v-else class="item-status-result">
        {{ item.statusResult }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { INotificationItem } from 'commonModule/type/view/notification'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotificationItem',
  components: {
    BeaverButton,
    BeaverImage,
  },
  props: {
    item: {
      type: Object as () => INotificationItem,
      required: true,
    },
  },
  emits: ['click', 'approve', 'reject'],
  setup(props, { emit }) {
    const handleClick = () => {
      emit('click', props.item)
    }

    const handleAction = (action: 'approve' | 'reject') => {
      emit(action, props.item)
    }

    return {
      handleClick,
      handleAction,
    }
  },
})
</script>

<style lang="less" scoped>
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F9FAFB;
  }

  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #636E72;
  flex-shrink: 0;

  &.group-avatar {
    background-color: #FF7D45;
    color: #FFFFFF;
  }
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-status-inline {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
}

.item-desc {
  font-size: 12px;
  color: #636E72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 100px;
}

.item-time {
  font-size: 11px;
  color: #B2BEC3;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.status-approved {
  background-color: #E8F5E8;
  color: #4CAF50;
}

.status-rejected {
  background-color: #FFEBEE;
  color: #FF5252;
}
</style>
