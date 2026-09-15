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
 * @beaver-im/app-moment 独立打包配置
 *
 * 两个 library 入口，各自聚合对外暴露的内容：
 *   - main     主进程（application）
 *   - renderer 渲染进程（对外组件）
 *
 * 宿主内核模块（mainModule/* / renderModule/* / commonModule/* / preloadModule/*）
 * 标记为 external：产物里保留 import 串，运行时由宿主 vite 的 alias 解析。
 * electron / vue / pinia 同理 external，由宿主运行时提供。
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
        /^mainModule\//,
        /^renderModule\//,
        /^commonModule\//,
        /^preloadModule\//,
        /^@beaver\//,
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
