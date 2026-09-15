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

/**
 * @beaver-im/beaver 独立打包配置
 *
 * common（对外类型）+ main（运行时门面）。不依赖宿主 alias / common-share。
 */
export default defineConfig({
  build: {
    lib: {
      entry: {
        main: path.resolve(__dirname, 'src/main/index.ts'),
        common: path.resolve(__dirname, 'src/common/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        'electron',
        'node:path',
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
