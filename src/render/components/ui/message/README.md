# Message 消息提示组件

类似于 Element UI 的 ElMessage 组件，用于显示操作反馈信息。

## 基本用法

```typescript
import Message from '@/components/message'

// 成功消息
Message.success('验证码已发送')

// 警告消息
Message.warning('请注意检查输入')

// 错误消息
Message.error('操作失败，请重试')

// 信息消息
Message.info('这是一条信息')

// 或者使用基础方法
Message({
  message: '自定义消息',
  type: 'success',
  duration: 3000
})
```

## 可配置选项

```typescript
Message.success('操作成功', {
  duration: 5000, // 显示时间，毫秒
  showClose: true, // 显示关闭按钮
  center: false, // 文字是否居中
  onClose: () => { // 关闭时的回调函数
    console.log('消息已关闭')
  }
})
```

## API

### Message(options)

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| message | 消息文字 | string | — | — |
| type | 主题 | string | success/warning/info/error | info |
| duration | 显示时间, 毫秒。设为 0 则不会自动关闭 | number | — | 3000 |
| showClose | 是否显示关闭按钮 | boolean | — | false |
| center | 文字是否居中 | boolean | — | false |
| onClose | 关闭时的回调函数 | function | — | — |

### 方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| Message.success(message, options) | 显示成功消息 | message: string, options?: MessageOptions |
| Message.warning(message, options) | 显示警告消息 | message: string, options?: MessageOptions |
| Message.info(message, options) | 显示信息消息 | message: string, options?: MessageOptions |
| Message.error(message, options) | 显示错误消息 | message: string, options?: MessageOptions |
| Message.closeAll() | 关闭所有消息 | — |

## 在 Vue 组件中使用

```vue
<template>
  <div>
    <button @click="showSuccess">
      显示成功消息
    </button>
    <button @click="showError">
      显示错误消息
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Message from '@/components/message'

export default defineComponent({
  setup() {
    const showSuccess = () => {
      Message.success('验证码已发送')
    }

    const showError = () => {
      Message.error('网络连接失败')
    }

    return {
      showSuccess,
      showError
    }
  }
})
</script>
```
