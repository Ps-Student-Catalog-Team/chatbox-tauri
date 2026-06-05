# ChatBox - 全平台聊天室

基于 Tauri + React + TypeScript + Tailwind CSS 构建的全平台局域网聊天室。

**支持平台**: Windows / macOS / Linux / Android / iOS

配套后端：[Chatbox-background](https://github.com/stormsnow2233/Chatbox-background) (Go + SQLite + WebSocket)

## 功能特性

- 用户注册/登录（WebSocket 认证）
- 公共大厅聊天
- 好友系统（添加/删除好友、私聊）
- 群组系统（创建群聊、重命名、公告、解散、退出）
- 消息发送/历史加载/撤回
- 在线人数统计
- 用户资料管理（头像、背景图、签名、密码重置）
- 深色/浅色主题切换
- 可配置服务器地址
- 响应式设计：桌面端侧边栏布局 + 移动端抽屉式侧边栏
- 全平台支持（Windows / macOS / Linux / Android / iOS）

## 技术栈

| 层级 | 技术 |
|------|------|
| 跨平台框架 | Tauri 2.x (Rust) |
| 前端框架 | React 19 + TypeScript |
| 样式方案 | Tailwind CSS 3 |
| 构建工具 | Vite 8 |
| 状态管理 | React Context + useReducer |
| 实时通信 | WebSocket |
| HTTP API | Fetch API |
| 移动端 | Tauri Mobile (Android/iOS) |

## 项目结构

```
chatbox-tauri/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件
│   │   ├── Login.tsx       # 登录/注册页面（响应式）
│   │   ├── Sidebar.tsx     # 侧边栏（桌面端固定 / 移动端滑出式抽屉）
│   │   ├── ChatArea.tsx    # 聊天区域（带移动端汉堡菜单按钮）
│   │   ├── ServerSettings.tsx  # 服务器配置
│   │   ├── UserProfile.tsx # 个人资料编辑
│   │   └── ThemeToggle.tsx # 浅色/深色切换
│   ├── services/           # API 和 WebSocket 服务
│   │   ├── api.ts          # REST API 封装
│   │   └── websocket.ts    # WebSocket 连接管理（自动重连）
│   ├── store/              # 状态管理
│   │   └── chatStore.tsx   # React Context + Reducer
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 主布局（响应式路由）
│   ├── index.css           # Tailwind + 自定义样式
│   └── main.tsx            # 入口
├── src-tauri/              # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs         # 桌面入口
│   │   └── lib.rs          # Tauri Builder（含移动端入口）
│   ├── tauri.conf.json     # Tauri 配置（桌面+移动端）
│   ├── Cargo.toml          # Rust 依赖（含 shell plugin）
│   ├── capabilities/       # 权限配置
│   └── icons/              # 多平台应用图标
├── index.html              # 入口 HTML（含移动端 meta 标签）
├── tailwind.config.js      # Tailwind 配置
├── vite.config.ts          # Vite 配置
└── package.json
```

## 快速开始

### 前置条件

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.77+
- [Go 后端](https://github.com/stormsnow2233/Chatbox-background) 运行在 `localhost:40001`

**移动端额外要求:**
- Android: [Android Studio](https://developer.android.com/studio) + Android SDK + NDK
- iOS: Xcode 15+ (仅 macOS)

### 安装依赖

```bash
npm install
```

### 桌面端开发

```bash
# 仅前端开发服务器
npm run dev

# Tauri 桌面开发模式
npm run tauri:dev

# 桌面端构建（当前平台）
npm run tauri:build
```

### 移动端开发与构建

```bash
# 初始化 Android 项目
npx tauri android init

# Android 开发模式
npx tauri android dev

# Android 构建 APK
npx tauri android build

# iOS 开发（仅 macOS）
npx tauri ios init
npx tauri ios dev
npx tauri ios build
```

### 构建产物位置

| 平台 | 路径 |
|------|------|
| Windows | `src-tauri/target/release/bundle/msi/` |
| macOS | `src-tauri/target/release/bundle/dmg/` |
| Linux | `src-tauri/target/release/bundle/deb/` |
| Android | `src-tauri/gen/android/app/build/outputs/apk/` |
| iOS | Xcode Archive → IPA |

## 移动端 UI 特性

- **抽屉式侧边栏**: 移动端点击左上角汉堡菜单滑出，选择聊天后自动关闭
- **触摸优化**: 按钮最小 40px 触摸区域，列表项适配手指操作
- **iOS 安全区域**: 自动适配刘海屏 / 灵动岛
- **16px 字号输入**: 防止 iOS 自动缩放
- **深色/浅色跟随系统**: 默认跟随系统，可手动切换
- **响应式断点**: 768px 以下切换为移动端布局

## 后端 API 对接

### 服务器配置

默认连接 `127.0.0.1:40001`，可在侧边栏底部的"服务器设置"中修改。

### WebSocket 协议 (ws://host:40001/ws)

| Action (客户端→服务器) | 说明 |
|------------------------|------|
| `login` / `register` | 登录/注册 |
| `resume` | Token 恢复会话 |
| `sync` | 同步好友和群组数据 |
| `msg` | 发送消息 |
| `add_friend` / `delete_friend` | 好友管理 |
| `create_group` | 创建群组 |
| `rename_group` | 重命名群组 |
| `publish_announcement` | 发布群公告 |
| `disband_group` / `quit_group` | 解散/退出群组 |
| `withdraw_message` | 撤回消息 |
| `update_avatar` | 更新头像 |

### HTTP REST API

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/user/info` | GET | 获取用户资料 |
| `/api/user/update` | POST | 更新签名 |
| `/api/user/avatar` | POST | 上传头像 |
| `/api/user/background` | POST | 上传背景图 |
| `/api/reset-password` | POST | 重置密码 |
| `/api/messages` | GET | 获取消息历史 |
| `/api/group/{id}/members` | GET | 获取群成员 |
| `/api/online-users` | GET | 在线用户数 |

### 默认测试账号

| 用户名 | 密码 |
|--------|------|
| admin | 123 |
| test01 | 123 |
