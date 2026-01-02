# API 密钥配置指南

本应用使用 Google Gemini API。为保证安全，**请不要把密钥写进源码或提交到 Git**。

## 推荐方式：使用环境变量（.env）

1. 复制示例文件：

```bash
cp .env.example .env
```

2. 编辑 `.env`，填入你的密钥：

```bash
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

`.env` 已被 `.gitignore` 忽略，不会提交到仓库。

## 方式二：应用设置页面配置

1. 启动应用
2. 进入设置页面 → “API 配置”
3. 输入密钥并保存

密钥会保存在本地存储中，清除浏览器数据会丢失。

## 方式三：后端代理服务（适合公开部署）

后端会在服务器侧保存密钥，避免暴露在前端。

```bash
cd backend
npm install
cp env.example .env
# 编辑 .env，设置 GEMINI_API_KEY=你的密钥
npm start
```

## 获取 Gemini API 密钥

1. 访问 https://makersuite.google.com/app/apikey
2. 登录 Google 账号
3. 创建新的 API 密钥

## 安全提醒

- 不要把真实密钥写进源码、文档或截图
- 如果密钥泄露，请立即作废并重新生成
- 公开发布前请再次确认 `.env` 未被提交

## 故障排除

### 提示密钥格式不正确

- Gemini API Key 通常以 `AIza` 开头
- 请确认复制完整且未包含空格

### API 调用失败

- 检查密钥是否有效
- 确认网络连接与配额限制
