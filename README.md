# 🦫 Beaver IM - 海狸即时通讯桌面端

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-31.x-green.svg)](https://electronjs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![QQ群](https://img.shields.io/badge/QQ群-1013328597%2B-blue.svg)](https://qm.qq.com/q/82rbf7QBzO)

> 🚀 **现代化桌面即时通讯应用** - 基于 Electron + Vue3 + TypeScript 构建，支持 Windows/macOS/Linux，提供完整的社交聊天体验

[English](README_EN.md) | [中文](README.md)

---

## ✨ 核心特性

- 🔐 **安全认证** - 用户注册、登录、密码找回
- 💬 **即时通讯** - 私聊、群聊支持文本、图片、表情
- 👥 **社交功能** - 好友管理、二维码添加、好友备注
- 🖼️ **多媒体支持** - 图片发送、文件传输、屏幕截图
- 📱 **多端同步** - 与移动端数据实时同步
- 🔄 **实时通信** - WebSocket 长连接保证消息实时性
- 🖥️ **原生体验** - 桌面级应用，支持系统托盘
- 🎨 **现代化UI** - 简洁美观的用户界面

## 🛠️ 技术栈

- **Electron** 31.x - 跨平台桌面应用框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **SQLite** - 本地数据存储
- **WebSocket** - 实时通信

## 📱 功能展示

### 🔐 用户认证
<div align="center">
  <img src="./static/desktop/login.jpg" width="300" alt="登录界面"/>
  <img src="./static/desktop/find-password.jpg" width="300" alt="找回密码"/>
  <img src="./static/desktop/profile-edit.jpg" width="300" alt="编辑个人资料"/>
</div>

### 💬 聊天功能
<div align="center">
  <img src="./static/desktop/message.png" width="300" alt="消息主界面"/>
  <img src="./static/desktop/private-detail.png" width="300" alt="私聊详情"/>
  <img src="./static/desktop/group-detail.png" width="300" alt="群聊详情"/>
  <img src="./static/desktop/image.png" width="300" alt="图片预览"/>
  <img src="./static/desktop/video.png" width="300" alt="视频预览"/>
</div>

### 👥 社交功能
<div align="center">
  <img src="./static/desktop/friend-list.png" width="300" alt="好友列表"/>
  <img src="./static/desktop/friend-detail.png" width="300" alt="好友详情"/>
  <img src="./static/desktop/friend-verify.png" width="300" alt="好友申请"/>
</div>

### 👥 群聊功能
<div align="center">
  <img src="./static/desktop/create-group.png" width="300" alt="创建群聊"/>
</div>

### ⚙️ 系统功能
<div align="center">
  <img src="./static/desktop/about.png" width="300" alt="关于页面"/>
  <img src="./static/desktop/update.png" width="300" alt="升级页面"/>
</div>

## 🚀 快速开始

### 环境要求
- Node.js >= 22.0.0

### 安装步骤
```bash
# 克隆项目
git clone https://github.com/wsrh8888/beaver-desktop.git
cd beaver-desktop

# 安装依赖
npm install

# 启动开发模式
npm run dev

# 构建项目
npm run build-renderer

# 在 Electron 中运行
npm run package
```

## 🔗 相关项目

| 项目 | 仓库地址 | 说明 |
|------|----------|------|
| **beaver-server** | [GitHub](https://github.com/wsrh8888/beaver-server) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-server) | 后端服务 |
| **beaver-mobile** | [GitHub](https://github.com/wsrh8888/beaver-mobile) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-mobile) | 移动端应用 |
| **beaver-desktop** | [GitHub](https://github.com/wsrh8888/beaver-desktop) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-desktop) | 桌面端应用 |

## 📚 文档与帮助

- 📖 **详细文档**: [Beaver IM 文档](https://wsrh8888.github.io/beaver-docs/)
- 🎥 **视频教程**: [B站教程](https://www.bilibili.com/video/BV1HrrKYeEB4/)
- 📱 **体验包下载**: [海狸IM Android体验包](https://github.com/wsrh8888/beaver-docs/releases/download/lastest/latest.apk)
- 💬 **QQ群**:
  - [1013328597](https://qm.qq.com/q/82rbf7QBzO) - 群一 (已满)
  - [1044762885](https://qm.qq.com/q/82rbf7QBzO) - 群二
  - [1003121259](https://qm.qq.com/q/82rbf7QBzO) - 群三

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## ⭐ 支持项目

如果这个项目对你有帮助，请给我们一个 ⭐ Star！

## ☕ 请作者喝杯茶

如果这个项目对你有帮助，欢迎请作者喝杯茶 ☕

<div align="center">
  <img src="./static/sponsor/wechat.jpg" width="200" alt="微信赞助码"/>
  <img src="./static/sponsor/zhifubao.jpg" width="200" alt="支付宝赞助码"/>
</div>

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

## ⭐ Star历史

[![Star History Chart](https://api.star-history.com/svg?repos=wsrh8888/beaver-desktop&type=Date)](https://star-history.com/#wsrh8888/beaver-desktop&Date)

---

<div align="center">
  <strong>Made with ❤️ by Beaver IM Team</strong><br>
  <em>企业级即时通讯平台</em>
</div>
