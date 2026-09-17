# @beaver-im/app-moment（朋友圈 app）

beaver-desktop 插件化架构的第一个真实案例。朋友圈代码已从根 `src/` 迁入本包，通过 `package.json` 的 `exports` 暴露入口，宿主直接按包名 `@beaver-im/app-moment/...` 引用。

## 结构

```
packages/app-moment/
├── package.json              # @beaver-im/app-moment
├── tsconfig.json
└── src/
    ├── index.ts              # 包入口（仅声明，无运行时逻辑）
    ├── vite-env.d.ts         # .vue 模块声明
    ├── main/                 # 主进程侧（Electron Node 环境）
    │   ├── application/      #   窗口定义：moment.ts / circle.ts / common/base.ts
    │   ├── business/circle/  #   圈子业务逻辑（WS 推送增量同步）
    │   ├── api/circle.ts     #   circleSyncApi（HTTP 请求）
    │   └── database/         #   circle 表：init / services / tables
    └── renderer/             # 渲染侧（浏览器环境）
        ├── moment/           #   朋友圈窗口（18 文件：App.vue / components / store / notification-manager）
        └── circle/           #   圈子窗口（15 文件：App.vue / page / components / store）
```

一个 app = 主进程侧 + 渲染侧，齐全。

## 接入方式：包名引用

`package.json` 的 `exports` 暴露入口，宿主直接按包名 import：

```ts
import momentApplication from '@beaver-im/app-moment/main/application/moment'
import MomentContentCard from '@beaver-im/app-moment/renderer/windows/moment/components/common/MomentContentCard.vue'
```

宿主无需为包配置任何 alias / tsconfig paths，`exports` 即入口表。

## 依赖宿主内核（留根 src/，通过现有 alias 引用）

| 宿主内核模块 | 用途 |
|---|---|
| `mainModule/utils/logger` | 日志（所有文件都用） |
| `mainModule/config` | `__dirname`（窗口加载路径） |
| `mainModule/utils/request/request` | HTTP 客户端 |
| `mainModule/ipc/main-to-render` | `sendMainNotification` |
| `mainModule/database/services/base` | `BaseService` 基类 |
| `@packageCommon/*` | 类型契约（ajax / preload / mainStore / store） |

moment 所需的类型契约已随本包迁移（`src/common/type`），不再依赖宿主 commonModule。

## 迁移后改动的宿主文件（仅 3 处，改成包名引用）

- `src/main/ipc/render-to-main/window/index.ts` — `mainModule/application/moment` → `@beaver-im/app-moment/main/application/moment`
- `src/render/windows/circle/.../postDetail/index.vue` — `renderModule/windows/moment/...` → `@beaver-im/app-moment/renderer/windows/moment/...`
