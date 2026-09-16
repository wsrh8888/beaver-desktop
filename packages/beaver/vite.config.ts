/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/beaver 发版构建（三层）：
 * 1. common   — src/index.ts → dist/index.js（插件契约类型 + config 运行时值）
 * 2. main     — src/main/index.ts → dist/main.js（主进程门面，externalize electron/node）
 * 3. renderer — src/renderer/index.ts → dist/renderer.js（渲染门面，externalize electron）
 *
 * d.ts 由 package.json build 脚本里的 tsc --emitDeclarationOnly 单独产出。
 */
import path from 'node:path'
import { defineConfig, type UserConfig } from 'vite'

const root = __dirname

function libConfig(entryName: string, entryPath: string, externals: string[], outputName: string): UserConfig {
  return {
    build: {
      outDir: 'dist',
      emptyOutDir: entryName === 'common',
      minify: false,
      sourcemap: false,
      lib: {
        entry: { [entryName]: entryPath },
        formats: ['es'],
        fileName: () => outputName,
      },
      rollupOptions: {
        external: externals,
        output: { entryFileNames: outputName },
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  if (mode === 'renderer')
    return libConfig('renderer', path.resolve(root, 'src/renderer/index.ts'), ['electron', 'axios', 'moment', 'uuid'], 'renderer.js')
  if (mode === 'main')
    return libConfig('main', path.resolve(root, 'src/main/index.ts'), ['electron', 'node:path', 'node:fs', 'node:url', 'node:module'], 'main.js')
  // default: common (index)
  return libConfig('common', path.resolve(root, 'src/index.ts'), [], 'index.js')
})
