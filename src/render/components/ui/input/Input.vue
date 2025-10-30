<template>
  <div
    class="beaver-input" :class="[
      `beaver-input--${size}`,
      {
        'is-disabled': disabled,
        'is-focused': focused,
        'is-error': error,
        'beaver-input-group': $slots.prepend || $slots.append,
        'beaver-input--prefix': $slots.prefix || prefixIcon,
        'beaver-input--suffix': $slots.suffix || suffixIcon || clearable || showPassword,
      },
    ]"
  >
    <!-- 前置元素 -->
    <div v-if="$slots.prepend" class="beaver-input-group__prepend">
      <slot name="prepend" />
    </div>

    <div class="beaver-input__wrapper">
      <!-- 前置图标 -->
      <span v-if="$slots.prefix || prefixIcon" class="beaver-input__prefix">
        <slot name="prefix">
          <img v-if="prefixIcon" :src="prefixIcon" class="beaver-input__icon">
        </slot>
      </span>

      <!-- 输入框 -->
      <input
        ref="inputRef"
        class="beaver-input__inner"
        :type="showPasswordValue ? 'text' : type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :autocomplete="autocomplete"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @keydown="handleKeydown"
      >

      <!-- 后置图标 -->
      <span v-if="getSuffixVisible" class="beaver-input__suffix">
        <template v-if="!showClear">
          <!-- 密码显示切换 -->
          <span
            v-if="showPassword"
            class="beaver-input__icon beaver-input__password"
            @click="handlePasswordVisible"
          >
            <img :src="showPasswordValue ? eyeOffIcon : eyeIcon">
          </span>

          <!-- 自定义后置图标 -->
          <slot name="suffix">
            <img v-if="suffixIcon" :src="suffixIcon" class="beaver-input__icon">
          </slot>
        </template>

        <!-- 清空按钮 -->
        <span
          v-if="showClear"
          class="beaver-input__icon beaver-input__clear"
          @click="handleClear"
        >
          <svg viewBox="0 0 1024 1024">
            <path d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
          </svg>
        </span>
      </span>
    </div>

    <!-- 后置元素 -->
    <div v-if="$slots.append" class="beaver-input-group__append">
      <slot name="append" />
    </div>
  </div>
</template>

<script lang="ts">
import eyeOffIcon from 'renderModule/assets/image/login/eye-off.svg'
import eyeIcon from 'renderModule/assets/image/login/eye.svg'
import { computed, defineComponent, nextTick, ref } from 'vue'

export type InputSize = 'large' | 'default' | 'small' | 'mini'

export default defineComponent({
  name: 'BeaverInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    size: {
      type: String as () => InputSize,
      default: 'default',
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    showPassword: {
      type: Boolean,
      default: false,
    },
    prefixIcon: {
      type: String,
      default: '',
    },
    suffixIcon: {
      type: String,
      default: '',
    },
    maxlength: {
      type: Number,
      default: undefined,
    },
    minlength: {
      type: Number,
      default: undefined,
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    error: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'input', 'change', 'focus', 'blur', 'clear', 'keydown'],
  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement>()
    const focused = ref(false)
    const showPasswordValue = ref(false)

    const showClear = computed(() => {
      return props.clearable
        && !props.disabled
        && !props.readonly
        && !!props.modelValue
        && focused.value
    })

    const getSuffixVisible = computed(() => {
      return props.suffixIcon
        || props.showPassword
        || props.clearable
        || !!props.$slots?.suffix
    })

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = target.value
      emit('update:modelValue', value)
      emit('input', value)
    }

    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('change', target.value)
    }

    const handleFocus = (event: FocusEvent) => {
      focused.value = true
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      focused.value = false
      emit('blur', event)
    }

    const handleClear = () => {
      emit('update:modelValue', '')
      emit('clear')
      focus()
    }

    const handlePasswordVisible = () => {
      showPasswordValue.value = !showPasswordValue.value
      nextTick(() => {
        focus()
      })
    }

    const handleKeydown = (event: KeyboardEvent) => {
      emit('keydown', event)
    }

    const focus = () => {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }

    const blur = () => {
      inputRef.value?.blur()
    }

    return {
      inputRef,
      focused,
      showPasswordValue,
      showClear,
      getSuffixVisible,
      eyeIcon,
      eyeOffIcon,
      handleInput,
      handleChange,
      handleFocus,
      handleBlur,
      handleClear,
      handlePasswordVisible,
      handleKeydown,
      focus,
      blur,
    }
  },
})
</script>

<style lang="less" scoped>
.beaver-input {
  position: relative;
  font-size: 13px;
  display: inline-flex;
  width: 100%;

  &__wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 100%;
    background-color: #F9FAFB;
    border: 1px solid transparent;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);

    &:hover {
      border-color: #FFE6D9;
    }
  }

  &__inner {
    width: 100%;
    flex-grow: 1;
    appearance: none;
    color: #2D3436;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    outline: none;
    border: none;
    background: none;
    box-sizing: border-box;

    &::placeholder {
      color: #B2BEC3;
    }

    &:focus {
      outline: none;
    }
  }

  &__prefix,
  &__suffix {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    color: #B2BEC3;
    text-align: center;
    transition: all 0.3s;
  }

  &__prefix {
    left: 12px;
  }

  &__suffix {
    right: 12px;
  }

  &__icon {
    width: 16px;
    height: 16px;
    cursor: pointer;
    transition: color 0.2s cubic-bezier(0.33, 1, 0.68, 1);

    &:hover {
      color: #636E72;
    }

    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  }

  &__clear,
  &__password {
    cursor: pointer;

    &:hover {
      color: #636E72;
    }
  }

  // 有前置图标时调整内边距
  &--prefix &__inner {
    padding-left: 40px;
  }

  // 有后置图标时调整内边距
  &--suffix &__inner {
    padding-right: 40px;
  }

  // 尺寸
  &--large {
    .beaver-input__inner {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
    }
  }

  &--small {
    .beaver-input__inner {
      height: 32px;
      line-height: 32px;
      font-size: 12px;
    }
  }

  &--mini {
    .beaver-input__inner {
      height: 28px;
      line-height: 28px;
      font-size: 12px;
    }
  }

  // 状态
  &.is-focused &__wrapper {
    border-color: #FF7D45;
    background-color: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(255, 125, 69, 0.1);
  }

  &.is-disabled {
    .beaver-input__wrapper {
      background-color: #F9FAFB;
      border-color: #EBEEF5;
      color: #B2BEC3;
      cursor: not-allowed;
    }

    .beaver-input__inner {
      color: #B2BEC3;
      cursor: not-allowed;

      &::placeholder {
        color: #B2BEC3;
      }
    }

    .beaver-input__icon {
      cursor: not-allowed;
    }
  }

  &.is-error {
    .beaver-input__wrapper {
      border-color: #FF5252;

      &:hover {
        border-color: #FF5252;
      }
    }

    &.is-focused .beaver-input__wrapper {
      border-color: #FF5252;
      box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.1);
    }
  }
}

// 输入组
.beaver-input-group {
  line-height: normal;
  display: inline-table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  > .beaver-input__wrapper {
    display: table-cell;
  }

  &__append,
  &__prepend {
    background-color: #F9FAFB;
    color: #636E72;
    vertical-align: middle;
    display: table-cell;
    position: relative;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    padding: 0 12px;
    width: 1px;
    white-space: nowrap;
  }

  &__prepend {
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &__append {
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &__prepend + .beaver-input__wrapper {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .beaver-input__wrapper + &__append {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
