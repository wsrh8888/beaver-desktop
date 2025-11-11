<template>
  <div
    v-show="visible"
    ref="popupRef"
    class="popup-menu"
    @click.stop
  >
    <div
      v-for="item in menuItems"
      :key="item.key"
      class="popup-menu-item"
      @click="handleItemClick(item)"
    >
      <img :src="item.icon" :alt="item.text">
      {{ item.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface MenuItem {
  key: string
  text: string
  icon: string
  action: string
}

export default {
  name: 'PopupMenu',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    menuItems: {
      type: Array as () => MenuItem[],
      required: true,
    },
  },
  emits: ['itemClick', 'hide'],
  setup(props, { emit }) {
    const popupRef = ref<HTMLElement | null>(null)

    const handleItemClick = (item: MenuItem) => {
      emit('itemClick', item)
    }

    const handleClickOutside = (event: MouseEvent) => {
      console.log('handleClickOutside', props.visible)
      if (!props.visible)
        return

      const target = event.target as HTMLElement
      const popup = popupRef.value

      // 如果点击的是弹窗内部，不隐藏
      if (popup && popup.contains(target)) {
        return
      }

      // 点击外部，隐藏弹窗
      emit('hide')
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      popupRef,
      handleItemClick,
      handleClickOutside,
    }
  },
}
</script>

<style lang="less" scoped>
.popup-menu {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 180px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;

  .popup-menu-item {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #F9FAFB;
    }

    img {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  }
}
</style>
