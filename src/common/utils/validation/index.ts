/**
 * @description: 常用验证函数
 */

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email?.trim() || '')
}

export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone?.trim() || '')
}

export const isValidCode = (code: string): boolean => {
  return /^\d{6}$/.test(code?.trim() || '')
}

export const isValidPassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/.test(password?.trim() || '')
}

export const isValidUsername = (username: string): boolean => {
  return /^[\w\u4E00-\u9FA5]{2,20}$/.test(username?.trim() || '')
}
