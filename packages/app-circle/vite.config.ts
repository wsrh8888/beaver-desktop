/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

/**
 * @beaver-im/app-circle 独立打包配置
 *
 * 两个 library 入口：
 *   - main     主进程
 *   - renderer 渲染进程
 *
 * external 只留真正的运行时对等依赖（框架 / Node / 平台包）。
 * 宿主 alias（renderModule / commonModule 等）不应出现在这里——那些是待替换的历史耦合。
 */
export default defineConfig({
  plugins: [
    vue(),
    svgLoader({ defaultImport: 'url' }),
  ],
  build: {
    lib: {
      entry: {
        main: path.resolve(__dirname, 'src/main/index.ts'),
        renderer: path.resolve(__dirname, 'src/renderer/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'electron',
        'vue',
        'pinia',
        'node:path',
        /^@beaver-im\//,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
