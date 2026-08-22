import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import postcssPxtorem from 'postcss-pxtorem'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'
import svgLoader from 'vite-svg-loader'

const alias = {
  commonModule: path.resolve(__dirname, 'src/common'),
  mainModule: path.resolve(__dirname, 'src/main'),
  renderModule: path.resolve(__dirname, 'src/render'),
  preloadModule: path.resolve(__dirname, 'src/preload'),
}

/** 单个 preload 入口（simple 不支持多入口 + inlineDynamicImports） */
function createPreload(name: string, entry: string) {
  return {
    onstart({ reload }: { reload: () => void }) {
      reload()
    },
    vite: {
      resolve: { alias },
      build: {
        outDir: 'dist-electron/preload',
        emptyOutDir: true,
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

export default defineConfig(({ command: _command }) => {
  return {
    plugins: [
      vue(),
      svgLoader({
        defaultImport: 'url', // or 'raw'
      }),
      electron([
        {
          entry: path.resolve(__dirname, 'src/main/main.ts'),
          vite: {
            build: {
              outDir: 'dist-electron',
              emptyOutDir: true,
              rollupOptions: {
                external: ['electron', 'electron-screenshots', 'ws'],
              },
            },
            resolve: {
              alias,
            },
          },
        },
        createPreload('index', path.resolve(__dirname, 'src/preload/electron/index.ts')),
        createPreload('bridge', path.resolve(__dirname, 'src/preload/bridge/index.ts')),
      ]),
      electronRenderer(),
    ],
    resolve: {
      alias,
    },
    server: {
      port: 3000,
      host: '127.0.0.1',
      strictPort: false,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, 'app.html'),
          login: path.resolve(__dirname, 'login.html'),
          moment: path.resolve(__dirname, 'moment.html'),
          updater: path.resolve(__dirname, 'updater.html'),
          search: path.resolve(__dirname, 'search.html'),
          verify: path.resolve(__dirname, 'verify.html'),
          image: path.resolve(__dirname, 'image.html'),
          video: path.resolve(__dirname, 'video.html'),
          audio: path.resolve(__dirname, 'audio.html'),
          call: path.resolve(__dirname, 'call.html'),
          'call-incoming': path.resolve(__dirname, 'call-incoming.html'),
          ai: path.resolve(__dirname, 'ai.html'),
          circle: path.resolve(__dirname, 'circle.html'),
          workbench: path.resolve(__dirname, 'workbench.html'),
          settings: path.resolve(__dirname, 'settings.html'),
        },
        output: {
          format: 'es', // 确保输出 ES 模块格式
          globals: {
            electron: 'electron',
          },
        },
        external: ['electron', 'electron-screenshots'],
      },
    },
    css: {
      postcss: {
        plugins: [
          postcssPxtorem({
            rootValue: 16, // 基准值，1rem = 16px (标准值，与浏览器默认字体大小一致)
            propList: ['*'], // 转换所有属性
            selectorBlackList: ['.ignore-rem'], // 忽略的类名
            replace: true, // 替换而不是添加备用属性
            mediaQuery: false, // 不转换媒体查询中的值
            minPixelValue: 1, // 最小转换值
            exclude: /node_modules/i, // 排除 node_modules
          }),
        ],
      },
    },
  }
})
