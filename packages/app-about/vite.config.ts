/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-about 发版构建（两层）：
 * 1. main     — 主进程：activate / application / manifest（对等依赖 external）
 * 2. renderer — 渲染进程：about 窗口挂载入口 + about.html 壳（自包含，loadFile 可用）
 *
 * 产物：
 *   dist/main.js
 *   dist/renderer.js (+ renderer.css / assets)
 *   dist/about.html
 */
import path from 'node:path'
import fs from 'node:fs'
import { transformSync } from 'esbuild'
import { defineConfig, type Plugin, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

const root = import.meta.dirname

/** 包内别名：跨层引用走别名，避免深层相对路径 */
const alias = {
  '@packageCommon': path.resolve(root, 'src/common'),
  '@packageMain': path.resolve(root, 'src/main'),
  '@packageRender': path.resolve(root, 'src/renderer'),
}

/** lib 保住 named export；写盘后再用 esbuild 压成单行 */
function minifyMainDist(): Plugin {
  return {
    name: 'minify-main-dist',
    apply: 'build',
    enforce: 'post',
    writeBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith('.js'))
          continue
        const filePath = path.resolve(root, 'dist', fileName)
        if (!fs.existsSync(filePath))
          continue
        const code = fs.readFileSync(filePath, 'utf8')
        const result = transformSync(code, {
          minify: true,
          legalComments: 'none',
        })
        fs.writeFileSync(filePath, result.code)
      }
    },
  }
}

export default defineConfig(({ mode }): UserConfig => {
  if (mode === 'renderer') {
    return {
      root,
      base: './',
      plugins: [
        vue(),
        svgLoader({ defaultImport: 'url' }),
      ],
      resolve: { alias },
      esbuild: {
        legalComments: 'none',
      },
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        minify: 'esbuild',
        cssMinify: true,
        sourcemap: false,
        rollupOptions: {
          input: {
            about: path.resolve(root, 'about.html'),
          },
          output: {
            entryFileNames: 'renderer.js',
            chunkFileNames: 'assets/[name]-[hash].js',
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

  return {
    plugins: [minifyMainDist()],
    resolve: { alias },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // lib 保住 activate/application/manifest；单行压缩交给 writeBundle
      minify: false,
      sourcemap: false,
      lib: {
        entry: {
          main: path.resolve(root, 'src/main/index.ts'),
        },
        formats: ['es'],
        fileName: () => 'main.js',
      },
      rollupOptions: {
        external: [
          'electron',
          'node:path',
          'node:fs',
          'node:url',
          'node:module',
          /^@beaver-im\//,
        ],
        output: {
          entryFileNames: 'main.js',
        },
      },
    },
  }
})
