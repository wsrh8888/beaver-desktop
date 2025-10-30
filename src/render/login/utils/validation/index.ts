import { LOGIN_CONFIG } from '../../config'

// 通用验证函数
export const validateField = (value: string, fieldName: keyof typeof LOGIN_CONFIG): string => {
  const field = LOGIN_CONFIG[fieldName]
  const { rules = [] } = field

  for (const rule of rules) {
    // 必填验证
    if (rule.required && !value?.trim()) {
      return rule.message
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message
    }

    // 长度验证
    if (rule.min && value.length < rule.min) {
      return rule.message
    }

    if (rule.max && value.length > rule.max) {
      return rule.message
    }
  }

  return ''
}
