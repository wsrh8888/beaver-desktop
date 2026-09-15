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
  <label
    class="beaver-checkbox"
    :class="{
      'is-checked': modelValue,
      'is-disabled': disabled,
    }"
  >
    <!-- 第 1 层：勾选框区域（视觉框 + 原生 input） -->
    <span
      class="beaver-checkbox__input"
      :class="{
        'is-checked': modelValue,
        'is-disabled': disabled,
        'is-focus': focused,
      }"
    >
      <span class="beaver-checkbox__inner" />
      <input
        class="beaver-checkbox__original"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="handleChange"
        @focus="focused = true"
        @blur="focused = false"
      >
    </span>
    <!-- 第 2 层：文案 -->
    <span
      v-if="label || $slots.default"
      class="beaver-checkbox__label"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

/**
 * 通用复选框（对齐 Element 结构）：
 * label
 *  ├─ span.input  → inner（样式）+ original（原生）
 *  └─ span.label  → 文案
 * 本身 inline-flex，多个并排展示。
 */
export default defineComponent({
  name: 'BeaverCheckbox',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const focused = ref(false)

    const handleChange = (event: Event) => {
      if (props.disabled)
        return
      const checked = (event.target as HTMLInputElement).checked
      emit('update:modelValue', checked)
      emit('change', checked)
    }

    return {
      focused,
      handleChange,
    }
  },
})
</script>

<style lang="less" scoped>
.beaver-checkbox {
  --beaver-checkbox-size: 14px;
  --beaver-checkbox-color: #FF7D45;
  --beaver-checkbox-border: #DCDFE6;
  --beaver-checkbox-text: #606266;

  position: relative;
  display: inline-flex;
  align-items: center;
  height: 32px;
  margin-right: 30px;
  font-size: 14px;
  font-weight: 500;
  color: var(--beaver-checkbox-text);
  white-space: nowrap;
  user-select: none;
  cursor: pointer;

  &:last-of-type {
    margin-right: 0;
  }

  &.is-disabled {
    cursor: not-allowed;
  }

  &__input {
    position: relative;
    display: inline-flex;
    white-space: nowrap;
    outline: none;
    cursor: pointer;

    &.is-disabled {
      cursor: not-allowed;

      .beaver-checkbox__inner {
        background-color: #F5F7FA;
        border-color: #DCDFE6;
        cursor: not-allowed;
      }

      &.is-checked .beaver-checkbox__inner {
        background-color: #F2F6FC;
        border-color: #DCDFE6;

        &::after {
          border-color: #C0C4CC;
        }
      }

      & + .beaver-checkbox__label {
        color: #C0C4CC;
        cursor: not-allowed;
      }
    }

    &.is-checked {
      .beaver-checkbox__inner {
        background-color: var(--beaver-checkbox-color);
        border-color: var(--beaver-checkbox-color);

        &::after {
          border-color: #FFFFFF;
          transform: rotate(45deg) scaleY(1);
        }
      }

      & + .beaver-checkbox__label {
        color: var(--beaver-checkbox-color);
      }
    }
  }

  &__inner {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    display: inline-block;
    width: var(--beaver-checkbox-size);
    height: var(--beaver-checkbox-size);
    border: 1px solid var(--beaver-checkbox-border);
    border-radius: 2px;
    background-color: #FFFFFF;
    transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
      background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);

    &:hover {
      border-color: var(--beaver-checkbox-color);
    }

    // Element 同款对勾：border 拼出来，不用 svg
    &::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 4px;
      box-sizing: content-box;
      width: 3px;
      height: 7px;
      border: 1px solid transparent;
      border-left: 0;
      border-top: 0;
      transform: rotate(45deg) scaleY(0);
      transform-origin: center;
      transition: transform 0.15s ease-in 0.05s;
    }
  }

  &__original {
    position: absolute;
    z-index: -1;
    margin: 0;
    outline: none;
    opacity: 0;
    width: 0;
    height: 0;
  }

  &__label {
    display: inline-block;
    padding-left: 8px;
    line-height: 1;
    font-size: 14px;
  }
}
</style>
