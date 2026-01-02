# 易象台（应用目录）

本目录包含前端、Electron 桌面端与后端代理服务代码。若你在仓库根目录，请先执行 `cd yixiangtai`。

## ✅ 环境要求

- Node.js 20+（推荐 20 LTS）
- npm 10+

## 🚀 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Gemini API 密钥

推荐使用环境变量，不要把密钥写进源码或提交到 Git。

方法一：使用 `.env`（推荐）

```bash
cp .env.example .env
# 编辑 .env，设置 VITE_GEMINI_API_KEY=你的密钥
```

方法二：应用设置页面配置

- 启动应用后进入设置页
- 在 “API 配置” 中输入密钥并保存

方法三：启用后端代理（适合公开部署）

```bash
cd backend
npm install
cp env.example .env
# 编辑 .env，设置 GEMINI_API_KEY=你的密钥
npm start
```

### 3. 启动开发环境

```bash
# Web
npm run dev

# Electron 桌面端（另开终端）
npm run electron-dev
```

访问 `http://localhost:5173`。

## 📦 构建与打包

```bash
# Web 版本
npm run build

# Electron 桌面应用
npm run dist
npm run dist-win
npm run dist-mac
npm run dist-linux
```

构建产物输出到 `dist/` 与 `release/`。

## 🧱 目录结构

```
.
├── backend/          # API 代理服务
├── electron/         # Electron 主进程
├── public/           # 静态资源
├── src/              # 前端源代码
└── build/            # 图标与构建资源
```

## 🎬 摇卦动画设置

六爻占卜页面支持自定义摇卦动画：

1. 准备一段 MP4 视频，命名为 `divination-animation.mp4`
2. 放置在 `public/` 目录
3. 建议视频长度 3-5 秒，正方形比例

## 🔒 安全提示

- `.env`、`backend/.env` 已被 `.gitignore` 忽略
- 请勿将真实密钥写入源码或文档
- 如有泄露，请在 Google AI Studio 立即作废并更换

## 📘 说明

更详细的项目说明与截图请查看仓库根目录 `README.md`。
