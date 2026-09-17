/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/beaver 发版构建（三层，各自独立构建，互不抽取共享 chunk）：
 * 1. common   — src/common/index.ts    → dist/common.js（插件契约类型 + config 运行时值）
 * 2. main     — src/main/index.ts       → dist/main.js（主进程门面，externalize electron/node）
 * 3. renderer — src/renderer/index.ts   → dist/renderer.js（渲染门面，externalize electron）
 *
 * 三次独立 build：每个 entry 自包含，common 不会被提取成共享 chunk。
 * d.ts 由 package.json build 脚本里的 tsc --emitDeclarationOnly 单独产出。
 */
import path from 'node:path'
import { defineConfig, type UserConfig } from 'vite'

const root = import.meta.dirname

/** 包内别名：跨层引用走别名，避免深层相对路径 */
const alias = {
  '@packageCommon': path.resolve(root, 'src/common'),
  '@packageMain': path.resolve(root, 'src/main'),
  '@packageRender': path.resolve(root, 'src/renderer'),
}

export default defineConfig(({ mode }): UserConfig => {
  if (mode === 'main') {
    return {
      resolve: { alias },
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        minify: false,
        sourcemap: false,
        lib: {
          entry: { main: path.resolve(root, 'src/main/index.ts') },
          formats: ['es'],
          fileName: () => 'main.js',
        },
        rollupOptions: {
          external: ['electron', 'node:path', 'node:fs', 'node:url', 'node:module'],
          output: { entryFileNames: 'main.js' },
        },
      },
    }
  }

  if (mode === 'renderer') {
    return {
      resolve: { alias },
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        minify: false,
        cssMinify: true,
        sourcemap: false,
        lib: {
          entry: { renderer: path.resolve(root, 'src/renderer/index.ts') },
          formats: ['es'],
          fileName: () => 'renderer.js',
          cssFileName: 'renderer',
        },
        rollupOptions: {
          external: ['electron', 'axios', 'moment', 'uuid'],
          output: {
            entryFileNames: 'renderer.js',
            assetFileNames: (info) => {
              if (info.names.some(n => n.endsWith('.css')))
                return 'renderer.css'
              return 'assets/[name]-[hash][extname]'
            },
          },
        },
      },
    }
  }

  // default: common
  return {
    resolve: { alias },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
      lib: {
        entry: { common: path.resolve(root, 'src/common/index.ts') },
        formats: ['es'],
        fileName: () => 'common.js',
      },
      rollupOptions: {
        external: [],
        output: { entryFileNames: 'common.js' },
      },
    },
  }
})
