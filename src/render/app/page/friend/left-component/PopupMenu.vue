<template>
  <div v-show="visible" class="popup-menu">
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
interface MenuItem {
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
  emits: ['itemClick'],
  setup(props, { emit }) {
    const handleItemClick = (item: MenuItem) => {
      emit('itemClick', item)
    }

    return {
      handleItemClick,
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
