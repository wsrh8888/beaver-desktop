// 登录模块配置
export const LOGIN_CONFIG = {
  email: {
    label: '邮箱地址',
    placeholder: '请输入邮箱地址',
    type: 'email',
    rules: [
      { required: true, message: '请输入邮箱地址', trigger: 'blur' },
      { pattern: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/, message: '请输入有效的邮箱格式', trigger: 'blur' },
    ],
  },
  password: {
    label: '密码',
    placeholder: '请设置6-20位密码',
    type: 'password',
    minLength: 6,
    maxLength: 20,
    rules: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    ],
  },
  code: {
    placeholder: '请输入验证码',
    type: 'text',
    maxLength: 6,
    rules: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' },
    ],
  },
} as const
