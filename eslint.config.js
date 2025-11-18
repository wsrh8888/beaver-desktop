import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    // 只禁用真正有问题的规则
    'antfu/top-level-function': 'off', // 允许箭头函数
    'vue/block-order': 'off', // 允许自由的 Vue 块顺序
    // 保留有意义的规则，只关闭必要的
    'no-console': 'off', // 允许所有 console 方法
    'node/prefer-global/process': 'off', // Electron 项目需要 process

    'x-invalid-end-tag': 'off', // 允许不闭合的标签

    'ts/no-use-before-define': 'off', // 允许使用未定义的变量

    'sort-imports': 'off', // 允许导入不排序

    // 禁用自动转换规则
    'prefer-const': 'off', // 不自动转换 let 为 const

    // 保持方法语法
    '@typescript-eslint/method-signature-style': ['error', 'method'],

    // 允许小写开头的构造函数名（动态导入的模块）
    'new-cap': 'off',

    // Electron 项目允许使用 require
    'ts/no-require-imports': 'off',

    // 关闭 JSDoc 参数名检查
    'jsdoc/check-param-names': 'off',
  },
  ignores: [
    'dist/**',
    'dist-electron/**',
    'release/**',
    'node_modules/**',
    'logs/**',
    '*.log',
    'src/main/preload',
  ],
})
