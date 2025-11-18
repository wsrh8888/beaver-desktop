<template>
  <!-- 插槽模式：包裹元素，自动处理右键事件 -->
  <div
    v-if="trigger === 'contextmenu'"
    ref="triggerRef"
    class="context-menu-trigger"
    @contextmenu.prevent="handleContextMenu"
  >
    <slot />
  </div>

  <!-- 右键菜单 -->
  <Teleport to="body">
    <Transition name="context-menu-fade">
      <div
        v-if="visible"
        ref="menuRef"
        class="context-menu"
        :class="[`context-menu--${placement}`]"
        :style="menuStyle"
        @click.stop
      >
        <div
          v-for="(item, index) in menuItems"
          :key="item.id || index"
          class="context-menu-item"
          :class="{
            'is-disabled': item.disabled,
            'is-divided': item.divided,
          }"
          @click="handleItemClick(item)"
        >
          <slot name="item" :item="item">
            <span class="context-menu-item__text">{{ item.label }}</span>
            <span v-if="item.shortcut" class="context-menu-item__shortcut">{{ item.shortcut }}</span>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface ContextMenuItem {
  id?: string | number
  label: string
  disabled?: boolean
  divided?: boolean
  shortcut?: string
  [key: string]: any
}

export default defineComponent({
  name: 'ContextMenu',
  props: {
    // 触发方式：contextmenu（右键）或 manual（手动）
    trigger: {
      type: String as () => 'contextmenu' | 'manual',
      default: 'contextmenu',
    },
    // 菜单项数据
    menuItems: {
      type: Array as () => ContextMenuItem[],
      default: () => [],
    },
    // 是否显示菜单
    visible: {
      type: Boolean,
      default: false,
    },
    // 菜单位置
    placement: {
      type: String as () => 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end',
      default: 'bottom-start',
    },
    // 手动模式下的位置
    position: {
      type: Object as () => { x: number, y: number } | null,
      default: null,
    },
  },
  emits: ['update:visible', 'command', 'show', 'hide'],
  setup(props, { emit }) {
    const triggerRef = ref<HTMLElement | null>(null)
    const menuRef = ref<HTMLElement | null>(null)
    const internalVisible = ref(false)
    const menuPosition = ref({ x: 0, y: 0 })

    // 计算菜单样式
    const menuStyle = computed(() => {
      if (props.trigger === 'manual' && props.position) {
        return {
          position: 'fixed' as const,
          left: `${props.position.x}px`,
          top: `${props.position.y}px`,
          zIndex: 9999,
        }
      }
      return {
        position: 'fixed' as const,
        left: `${menuPosition.value.x}px`,
        top: `${menuPosition.value.y}px`,
        zIndex: 9999,
      }
    })

    // 处理右键事件
    const handleContextMenu = async (event: MouseEvent) => {
      if (props.trigger !== 'contextmenu') {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      // 计算菜单位置
      await calculatePosition(event)

      internalVisible.value = true
      emit('update:visible', true)
      emit('show', event)
    }

    // 计算菜单位置
    const calculatePosition = async (event: MouseEvent) => {
      await nextTick()

      if (!menuRef.value) {
        menuPosition.value = { x: event.clientX, y: event.clientY }
        return
      }

      const menuRect = menuRef.value.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = event.clientX
      let y = event.clientY

      // 防止菜单超出右边界
      if (x + menuRect.width > viewportWidth) {
        x = viewportWidth - menuRect.width - 10
      }

      // 防止菜单超出下边界
      if (y + menuRect.height > viewportHeight) {
        y = viewportHeight - menuRect.height - 10
      }

      // 防止菜单超出左边界
      if (x < 10) {
        x = 10
      }

      // 防止菜单超出上边界
      if (y < 10) {
        y = 10
      }

      menuPosition.value = { x, y }
    }

    // 处理菜单项点击
    const handleItemClick = (item: ContextMenuItem) => {
      if (item.disabled) {
        return
      }

      internalVisible.value = false
      emit('update:visible', false)
      emit('command', item)
      emit('hide')
    }

    // 隐藏菜单
    const hideMenu = () => {
      internalVisible.value = false
      emit('update:visible', false)
      emit('hide')
    }

    // 显示菜单（手动模式）
    const showMenu = async (event: MouseEvent | { x: number, y: number }) => {
      if (props.trigger !== 'manual') {
        return
      }

      if (event instanceof MouseEvent) {
        await calculatePosition(event)
      }

      internalVisible.value = true
      emit('update:visible', true)
      emit('show', event)
    }

    // 监听 visible 变化
    watch(() => props.visible, (newVal) => {
      internalVisible.value = newVal
    })

    watch(internalVisible, (newVal) => {
      if (newVal && props.trigger === 'manual' && props.position) {
        // 手动模式下，使用 position prop
        menuPosition.value = { x: props.position.x, y: props.position.y }
      }
    })

    // 点击外部隐藏菜单
    const handleClickOutside = (event: MouseEvent) => {
      if (!internalVisible.value) {
        return
      }

      const target = event.target as HTMLElement
      if (menuRef.value && !menuRef.value.contains(target)) {
        if (props.trigger === 'contextmenu' && triggerRef.value && triggerRef.value.contains(target)) {
          return
        }
        hideMenu()
      }
    }

    // 监听 ESC 键
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && internalVisible.value) {
        hideMenu()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('contextmenu', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('contextmenu', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    })

    // 暴露方法供外部调用
    return {
      triggerRef,
      menuRef,
      menuStyle,
      handleContextMenu,
      handleItemClick,
      hideMenu,
      showMenu,
    }
  },
})
</script>

<style lang="less" scoped>
.context-menu-trigger {
  display: inline-block;
}

.context-menu {
  position: fixed;
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  min-width: 120px;
  max-width: 300px;
  z-index: 9999;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #2D3436;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s;

  &:hover:not(.is-disabled) {
    background-color: #F9FAFB;
    color: #FF7D45;
  }

  &.is-disabled {
    color: #C0C4CC;
    cursor: not-allowed;
  }

  &.is-divided {
    border-top: 1px solid #EBEEF5;
    margin-top: 5px;
    padding-top: 8px;
  }

  &__text {
    flex: 1;
  }

  &__shortcut {
    margin-left: 20px;
    color: #909399;
    font-size: 12px;
  }
}

.context-menu-fade-enter-active,
.context-menu-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.context-menu-fade-enter-from,
.context-menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

