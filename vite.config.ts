/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import postcssPxtorem from 'postcss-pxtorem'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'
import svgLoader from 'vite-svg-loader'
import { createAliases, htmlInputs, projectRoot } from './vite.apps'

const alias = createAliases()
const pages = htmlInputs()

/** preload 多入口共用 outDir：仅第一个 emptyOutDir */
function preload(name: string, entry: string, emptyOutDir = false) {
  return {
    onstart({ reload }: { reload: () => void }) {
      reload()
    },
    vite: {
      resolve: { alias },
      build: {
        outDir: 'dist-electron/preload',
        emptyOutDir,
        rollupOptions: {
          input: { [name]: entry },
          external: ['electron', 'electron-screenshots'],
          output: {
            format: 'cjs' as const,
            inlineDynamicImports: true,
            entryFileNames: '[name].mjs',
            chunkFileNames: '[name].mjs',
            assetFileNames: '[name].[ext]',
          },
        },
      },
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    svgLoader({ defaultImport: 'url' }),
    electron([
      {
        entry: path.resolve(projectRoot, 'src/main/main.ts'),
        vite: {
          build: {
            outDir: 'dist-electron',
            emptyOutDir: true,
            rollupOptions: {
              external: ['electron', 'electron-screenshots', 'ws'],
            },
          },
          resolve: { alias },
        },
      },
      preload('index', path.resolve(projectRoot, 'src/preload/electron/index.ts'), true),
      preload('bridge', path.resolve(projectRoot, 'src/preload/bridge/index.ts')),
    ]),
    electronRenderer(),
  ],
  resolve: {
    alias,
    dedupe: ['vue', 'vue-router', 'pinia', 'marked'],
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    strictPort: false,
    fs: {
      allow: [path.resolve(projectRoot, '..')],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: pages,
      output: {
        format: 'es',
        globals: { electron: 'electron' },
      },
      external: ['electron', 'electron-screenshots'],
    },
  },
  css: {
    postcss: {
      plugins: [
        postcssPxtorem({
          rootValue: 16,
          propList: ['*'],
          selectorBlackList: ['.ignore-rem'],
          replace: true,
          mediaQuery: false,
          minPixelValue: 1,
          exclude: /node_modules/i,
        }),
      ],
    },
  },
})
