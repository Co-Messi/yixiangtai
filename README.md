# 易象台 yixiangtai

易象台是一套面向大众的传统占卜与命理分析系统，融合古法术数与现代 AI 能力，提供六爻、奇门遁甲、八字推命、手相分析、周公解梦等完整体验，并支持 Web 与 Electron 桌面端。

## ✨ 项目特色

- 传承千年占卜智慧，结合 AI 技术提供深度解读
- 六爻、奇门遁甲、八字推命、手相分析、周公解梦等模块化占卜系统
- 人生 K 线图：基于八字命理的 100 年运势可视化分析与量化评分
- 9 位虚拟大师，多风格解读（古代圣贤 + 当代名人）
- 后端 API 代理服务，保护密钥安全，适合公开部署
- 响应式布局，兼容桌面与移动端
- 完整的占卜历史管理与导出能力

## 📱 项目展示

<table>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/home.png" alt="主页界面" width="400"/>
      <br/>
      <b>🏠 主页界面</b>
      <br/>
      <sub>简洁优雅的主页设计，提供多种占卜方式选择</sub>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/liuyao.png" alt="六爻占卜界面" width="400"/>
      <br/>
      <b>🔮 六爻占卜</b>
      <br/>
      <sub>传统六爻占卜，包含摇卦动画和详细解读</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/qimen.png" alt="奇门遁甲界面" width="400"/>
      <br/>
      <b>⭐ 奇门遁甲</b>
      <br/>
      <sub>专业奇门遁甲分析，提供时局预测和策略建议</sub>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/palmistry.png" alt="手相分析界面" width="400"/>
      <br/>
      <b>✋ 手相分析</b>
      <br/>
      <sub>AI 驱动的手相识别分析，深度解读手纹命理</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/k1.png" alt="人生K线图界面1" width="400"/>
      <br/>
      <b>📊 人生K线图 - 运势分析</b>
      <br/>
      <sub>基于八字命理的 100 年人生运势可视化分析</sub>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/k2.png" alt="人生K线图界面2" width="400"/>
      <br/>
      <b>📊 人生K线图 - 详细解读</b>
      <br/>
      <sub>AI 智能分析，提供早年、中年、晚年等阶段解读</sub>
    </td>
  </tr>
</table>

## 🔧 技术栈

- 前端：React 19 + TypeScript + Vite 6
- 样式：Tailwind CSS 4.1
- 状态管理：Zustand
- 动效：Framer Motion
- AI 服务：Google Gemini API
- 桌面端：Electron
- 后端：Node.js + Express（API 代理）

## 🎭 虚拟大师团队

### 古代圣贤
- 周文王（西周）- 易学之祖，精通八卦理论
- 诸葛亮（三国）- 智谋无双，精通奇门遁甲
- 鬼谷子（战国）- 纵横家始祖，善于观人识心
- 袁守诚（唐朝）- 著名术士，精通算命卜卦
- 李博文（明朝）- 易学大师，博学多才
- 陈图南（宋朝）- 相学宗师，精通面相手相

### 当代名人
- 大张伟 - 音乐人，幽默风趣的现代解读
- 雷佳音 - 知名演员，诚恳接地气的朴实风格
- 刘小光 - 二人转演员，浓厚东北味儿的幽默解读

## 📁 项目结构

仓库主代码位于 `yixiangtai/` 目录：

```
.
├── yixiangtai/           # 前端 + Electron + 后端
│   ├── backend/          # API 代理服务
│   ├── public/           # 静态资源
│   ├── src/              # 前端源代码
│   ├── electron/         # Electron 主进程
│   └── build/            # 图标与构建资源
├── README.md
└── 使用说明.md
```

## ✅ 环境要求

- Node.js 20+（推荐 20 LTS 或更高版本）
- npm 10+

## 🚀 快速开始（Web / Electron）

### 1. 克隆并进入仓库

```bash
git clone <repository-url>
cd yixiangtai
```

### 2. 安装前端依赖

```bash
cd yixiangtai
npm install
```

### 3. 配置 Gemini API 密钥（推荐使用环境变量）

方法一：使用 `.env`（推荐）

```bash
cp .env.example .env
# 编辑 .env，设置 VITE_GEMINI_API_KEY=你的密钥
```

方法二：应用内设置页面配置

- 启动应用后进入设置页
- 在 “API 配置” 中输入密钥并保存

方法三：启用后端代理（更安全，适合公开部署）

```bash
cd backend
npm install
cp env.example .env
# 编辑 .env，设置 GEMINI_API_KEY=你的密钥
npm start
```

> 提示：密钥请勿写入源码或提交到 Git 仓库。`.env` 已被 `.gitignore` 忽略。

### 4. 启动开发环境

```bash
# Web
npm run dev

# Electron 桌面端（另开终端）
npm run electron-dev
```

访问 `http://localhost:5173`。

## 📦 构建与打包

### Web 版本

```bash
npm run build
```

构建产物输出到 `yixiangtai/dist/`。

### Electron 桌面应用

```bash
# 打包所有平台
npm run dist

# Windows
npm run dist-win

# macOS（需在 macOS 上构建）
npm run dist-mac

# Linux
npm run dist-linux
```

构建产物输出到 `yixiangtai/release/`。

## 🎬 摇卦动画设置

六爻占卜页面支持自定义摇卦动画：

1. 准备一段 MP4 视频，命名为 `divination-animation.mp4`
2. 放置在 `yixiangtai/public/` 目录
3. 建议视频长度 3-5 秒，正方形比例

## 🔒 公开发布前检查

- `.env`、`backend/.env` 已被 `.gitignore` 忽略，不会提交
- 请使用 `.env.example` 作为模板，不要把真实密钥写进源码或文档
- 如果曾经提交过密钥，请立即作废并重新生成

## 📄 许可证

MIT License

---

愿古代智慧与现代科技的结合，为你指引人生方向。
