import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import postcssPxtorem from 'postcss-pxtorem'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'
import svgLoader from 'vite-svg-loader'

const beaverSrc = path.resolve(__dirname, 'packages/beaver/src')
const beaverUiSrc = path.resolve(__dirname, 'packages/beaver-ui/src')
const beaverBizSrc = path.resolve(__dirname, 'packages/beaver-biz/src')
const commonSrc = path.resolve(__dirname, 'src/common')
const appCircleSrc = path.resolve(__dirname, 'packages/app-circle/src')
const appMomentSrc = path.resolve(__dirname, 'packages/app-moment/src')
const nm = path.resolve(__dirname, 'node_modules')

/** 仓外 app 与正式包名解析；宿主内部 commonModule → src/common */
const alias = [
  { find: /^@beaver-im\/beaver\/(.*)$/, replacement: `${beaverSrc}/$1` },
  { find: '@beaver-im/beaver', replacement: path.resolve(beaverSrc, 'index.ts') },
  { find: /^@beaver-im\/beaver-ui\/(.*)$/, replacement: `${beaverUiSrc}/$1` },
  { find: '@beaver-im/beaver-ui', replacement: path.resolve(beaverUiSrc, 'index.ts') },
  { find: /^@beaver-im\/beaver-biz\/(.*)$/, replacement: `${beaverBizSrc}/$1` },
  { find: '@beaver-im/beaver-biz', replacement: path.resolve(beaverBizSrc, 'index.ts') },
  // 具体入口必须在通用 app-* 正则之前
  { find: '@beaver-im/app-circle/main/init-tables', replacement: path.resolve(appCircleSrc, 'main/database/init/circle/index.ts') },
  { find: '@beaver-im/app-circle/circle-entry', replacement: path.resolve(appCircleSrc, 'renderer/windows/circle/main.ts') },
  { find: /^@beaver-im\/app-circle\/(.*)$/, replacement: `${appCircleSrc}/$1` },
  { find: '@beaver-im/app-circle', replacement: path.resolve(appCircleSrc, 'index.ts') },
  { find: '@beaver-im/app-moment/moment-entry', replacement: path.resolve(appMomentSrc, 'renderer/windows/moment/main.ts') },
  { find: /^@beaver-im\/app-moment\/(.*)$/, replacement: `${appMomentSrc}/$1` },
  { find: '@beaver-im/app-moment', replacement: path.resolve(appMomentSrc, 'index.ts') },
  { find: 'commonModule', replacement: commonSrc },
  { find: 'mainModule', replacement: path.resolve(__dirname, 'src/main') },
  { find: 'renderModule', replacement: path.resolve(__dirname, 'src/render') },
  { find: 'preloadModule', replacement: path.resolve(__dirname, 'src/preload') },
  // app-ai 在仓外时，Vite 不会从宿主 node_modules 解析这些依赖
  { find: 'vue-router', replacement: path.resolve(nm, 'vue-router') },
  { find: 'marked', replacement: path.resolve(nm, 'marked') },
]

/**
 * 单个 preload 入口（simple 不支持多入口 + inlineDynamicImports）。
 * 多个 preload 共用 outDir 时，只有第一个可 emptyOutDir，否则后构建会把先产出的文件删掉。
 */
function createPreload(name: string, entry: string, emptyOutDir = false) {
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

/**
 * 拆包约定：
 * - 业务代码在 packages/*（包名 @beaver-im/*，未来可独立发 npm）
 * - 窗口 html 留在宿主根目录（Electron loadRender 约定 /name.html → dist/name.html）
 * - html 内通过包名 import 入口，例如 import '@beaver-im/app-moment/moment-entry'
 */
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
        createPreload('index', path.resolve(__dirname, 'src/preload/electron/index.ts'), true),
        createPreload('bridge', path.resolve(__dirname, 'src/preload/bridge/index.ts'), false),
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
        // 允许读仓外 app-ai 源码
        allow: [path.resolve(__dirname, '..')],
      },
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
          about: path.resolve(__dirname, 'about.html'),
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
