# 🦫 Beaver IM - Desktop Instant Messaging Client

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-31.x-green.svg)](https://electronjs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![QQ Groups](https://img.shields.io/badge/QQ_Groups-1013328597%2B-blue.svg)](https://qm.qq.com/q/82rbf7QBzO)

> 🚀 **Modern Desktop Instant Messaging Application** - Built with Electron + Vue3 + TypeScript, providing native desktop experience for Windows/macOS/Linux with complete social chat features.

[English](README_EN.md) | [中文](README.md)

---

## ✨ Core Features

- 🔐 **Account Login** - Password login and QR code login
- 💬 **Instant Messaging** - Private/group chat with text, voice, Markdown, images, video, emojis, forward and reply
- 👥 **Group Features** - Create groups and manage group assistants (Webhook bots)
- 🤝 **Friends & Social** - Friend requests, profile management, and Moments feed
- 📞 **Audio/Video Calls** - Voice and video calls in private and group chats
- 🖥️ **Desktop Experience** - System tray, keyboard shortcuts, screenshot tool, account and storage settings
- 🔄 **Real-time Sync** - WebSocket keeps messages consistent across desktop and mobile

## 🛠️ Technology Stack

- **Electron** 31 - Cross-platform desktop application
- **Vue 3** + **Vite** + **TypeScript** - Frontend rendering and tooling
- **Pinia** + **Vue Router** - State management and routing
- **SQLite** + **Drizzle ORM** - Local message and conversation storage
- **WebSocket** - Real-time message delivery
- **LiveKit** - Audio and video calls

## 📱 Feature Showcase

### 🔐 User Authentication
<div align="center">
  <img src="./static/desktop/登录-密码登录.png" width="300" alt="Password Login"/>
  <img src="./static/desktop/登录-扫码登录.png" width="300" alt="QR Code Login"/>
</div>

### 💬 Chat Features
<div align="center">
  <img src="./static/desktop/message.png" width="300" alt="Message Interface"/>
  <img src="./static/desktop/聊天-语音.png" width="300" alt="Voice Message"/>
  <img src="./static/desktop/聊天-markdown.png" width="300" alt="Markdown Message"/>
  <img src="./static/desktop/private-detail.png" width="300" alt="Private Chat Details"/>
  <img src="./static/desktop/group-detail.png" width="300" alt="Group Chat Details"/>
  <img src="./static/desktop/image.png" width="300" alt="Image Preview"/>
  <img src="./static/desktop/video.png" width="300" alt="Video Preview"/>
  <img src="./static/desktop/emoji-store.png" width="300" alt="Emoji Store"/>
  <img src="./static/desktop/emoji-favorites.png" width="300" alt="Favorite Emojis"/>
  <img src="./static/desktop/forward.png" width="300" alt="Forward Message"/>
  <img src="./static/desktop/reply.png" width="300" alt="Reply Message"/>
  <img src="./static/desktop/multi-select.png" width="300" alt="Multi-select Messages"/>
  <img src="./static/desktop/call.png" width="300" alt="Audio/Video Call"/>
</div>

### 👥 Group Features
<div align="center">
  <img src="./static/desktop/create-group.png" width="300" alt="Create Group"/>
  <img src="./static/desktop/群助手-列表.png" width="300" alt="Group Assistant List"/>
  <img src="./static/desktop/群助手-添加群助手.png" width="300" alt="Add Group Assistant"/>
</div>

### 👥 Friend Management
<div align="center">
  <img src="./static/desktop/friend-list.png" width="300" alt="Friend List"/>
  <img src="./static/desktop/friend-detail.png" width="300" alt="Friend Details"/>
  <img src="./static/desktop/friend-verify.png" width="300" alt="Friend Request"/>
</div>

### 📸 Moments
<div align="center">
  <img src="./static/desktop/朋友圈-主页.png" width="300" alt="Moments Feed"/>
  <img src="./static/desktop/朋友圈-发布朋友圈.png" width="300" alt="Post Moment"/>
  <img src="./static/desktop/朋友圈-详情内容.png" width="300" alt="Moment Details"/>
  <img src="./static/desktop/朋友圈-点赞.png" width="300" alt="Like"/>
  <img src="./static/desktop/朋友圈-评论.png" width="300" alt="Comment"/>
</div>

### 👤 Profile
<div align="center">
  <img src="./static/desktop/profile-edit.jpg" width="300" alt="Edit Profile"/>
</div>

### ⚙️ System Features
<div align="center">
  <img src="./static/desktop/about.png" width="300" alt="About Page"/>
  <img src="./static/desktop/设置-检查更新.png" width="300" alt="Check for Updates"/>
  <img src="./static/desktop/设置-快捷键.png" width="300" alt="Keyboard Shortcuts"/>
  <img src="./static/desktop/设置-账号与存储.png" width="300" alt="Account & Storage"/>
</div>

## 🔗 Related Projects

| Project | Repository | Description |
|---------|------------|-------------|
| **beaver-server** | [GitHub](https://github.com/wsrh8888/beaver-server) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-server) | Backend microservices |
| **beaver-flutter** | [GitHub](https://github.com/wsrh8888/beaver-flutter) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-flutter) | Mobile (Flutter, recommended) |
| **beaver-desktop** | [GitHub](https://github.com/wsrh8888/beaver-desktop) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-desktop) | Desktop (Electron) (this repo) |
| **beaver-manager** | [GitHub](https://github.com/wsrh8888/beaver-manager) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-manager) | Admin management system |
| **beaver-docs** | [GitHub](https://github.com/wsrh8888/beaver-docs) | Documentation site |
| **beaver-open** | [GitHub](https://github.com/wsrh8888/beaver-open) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-open) | Open platform |
| **beaver-oauth** | [GitHub](https://github.com/wsrh8888/beaver-oauth) \| [Gitee](https://gitee.com/dawwdadfrf/beaver-oauth) | OAuth authorization |
| **beaver-uniapp** | [GitHub](https://github.com/wsrh8888/beaver-uniapp) | Mobile (UniApp, deprecated) |

## 📚 Documentation & Help

- 📖 **Detailed Documentation**: [Beaver IM Docs](https://wsrh8888.github.io/beaver-docs/)
- 📝 **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- 🎥 **Video Tutorial**: [Bilibili Tutorial](https://www.bilibili.com/video/BV1HrrKYeEB4/)
- 💬 **QQ Groups**:
  - [1013328597](https://qm.qq.com/q/82rbf7QBzO) - Group 1
  - [1044762885](https://qm.qq.com/q/82rbf7QBzO) - Group 2
  - [1003121259](https://qm.qq.com/q/82rbf7QBzO) - Group 3

## ⭐ Support Project

If this project helps you, please give us a ⭐ Star!

## ☕ Buy Me a Coffee

If this project helps you, welcome to buy me a coffee ☕

<div align="center">
  <img src="./static/sponsor/wechat.jpg" width="200" alt="WeChat Sponsor Code"/>
  <img src="./static/sponsor/zhifubao.jpg" width="200" alt="Alipay Sponsor Code"/>
</div>

## 📄 License & Legal

- This project is licensed under the [MIT](LICENSE) License
- Before use, modification, or commercial deployment, please read the [Legal Disclaimer](LEGAL.md) for permitted/prohibited uses and liability terms

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=wsrh8888/beaver-desktop&type=Date)](https://star-history.com/#wsrh8888/beaver-desktop&Date)
