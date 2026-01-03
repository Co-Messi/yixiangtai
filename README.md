# 易象台（yixiangtai）

易象台是一款融合传统术数与现代 AI 的占卜与命理分析应用，涵盖六爻、奇门、八字、解梦等多个场景，并提供 Web 与 Electron 桌面端体验。

## 核心亮点

- 多模块占卜体系：六爻、奇门、八字、人生 K 线、解梦等一站式体验
- AI 解读 + 古法逻辑结合，既有仪式感也有可读性
- 9 位虚拟大师，风格多元，解读更具可玩性
- 前后端分离 + 代理服务，密钥安全可控
- 响应式布局，桌面与移动端一致体验

## 功能一览

| 模块 | 能力说明 |
| --- | --- |
| 六爻占卜 | 起卦与卦象解读、AI 解析输出 |
| 奇门遁甲 | 时局盘局、策略推演与建议 |
| 八字推命 | 自动排盘、五行统计与问事分析 |
| 人生 K 线 | 100 年运势曲线与阶段解读 |
| 周公解梦 | 梦境象征解析与引导式建议 |

## 界面预览

<table>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/home.png" alt="主页界面" width="300"/>
      <br/>
      <b>主页</b>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/liuyao.png" alt="六爻占卜界面" width="300"/>
      <br/>
      <b>六爻占卜</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/qimen.png" alt="奇门遁甲界面" width="300"/>
      <br/>
      <b>奇门遁甲</b>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/bazi.png" alt="八字推命界面" width="300"/>
      <br/>
      <b>八字推命</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/zhougong.png" alt="周公解梦界面" width="300"/>
      <br/>
      <b>周公解梦</b>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/kline.png" alt="人生K线图界面" width="300"/>
      <br/>
      <b>人生K线</b>
    </td>
  </tr>
</table>

## 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url>
cd yixiangtai
```

### 2. 安装依赖

```bash
cd yixiangtai
npm install
```

### 3. 配置密钥

推荐使用环境变量：

```bash
cp .env.example .env
# 编辑 .env，设置 VITE_GEMINI_API_KEY=你的密钥
```

也可以在应用内设置页面填写密钥，或启用后端代理：

```bash
cd backend
npm install
cp env.example .env
# 编辑 .env，设置 GEMINI_API_KEY=你的密钥
npm start
```

### 4. 启动开发环境

```bash
# Web
npm run dev

# Electron 桌面端（另开终端）
npm run electron-dev
```

访问 `http://localhost:5173`。

## 构建与发布

### Web

```bash
npm run build
```

构建产物输出到 `yixiangtai/dist/`。

### Electron

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

## 目录结构

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

## 安全与密钥

- `.env`、`backend/.env` 已被 `.gitignore` 忽略，不会提交
- 请使用 `.env.example` 作为模板，不要把真实密钥写进源码或文档
- 如果曾经提交过密钥，请立即作废并重新生成

## <span style="color:#f7931a;">₿</span> 赞助与支持

这个项目凝聚了大量时间与心力，如果它对你有帮助，欢迎用一杯咖啡的方式支持我继续打磨易象台。感谢你的认可与鼓励！
赞助为自愿支持，恕不退款。

Receive Crypto

<table>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/crypto/btc.jpg" alt="BTC" width="120"/>
      <br/>
      <b>BTC</b>
      <br/>
      <code>bc1qy5favxelvddx6vn83ggpwe2zzjnefxmxrcj2ev</code>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/crypto/eth.jpg" alt="ETH" width="120"/>
      <br/>
      <b>ETH</b>
      <br/>
      <code>0xEC0cAC8f158035136a4338a05Cdc94F5b88aFa1b</code>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/crypto/bnb.jpg" alt="BNB" width="120"/>
      <br/>
      <b>BNB</b>
      <br/>
      <code>0xEC0cAC8f158035136a4338a05Cdc94F5b88aFa1b</code>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="yixiangtai/public/img/crypto/xrp.jpg" alt="XRP" width="120"/>
      <br/>
      <b>XRP</b>
      <br/>
      <code>rhPsmMQwPipXA1oLKQzBoJanB1CqRd4Suc</code>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/crypto/ltc.jpg" alt="Litecoin" width="120"/>
      <br/>
      <b>Litecoin</b>
      <br/>
      <code>LNc12ZhzUWGbCgVVVYyV5K9qQ637YLxpk5</code>
    </td>
    <td align="center">
      <img src="yixiangtai/public/img/crypto/shib.jpg" alt="Shiba Inu" width="120"/>
      <br/>
      <b>Shiba Inu</b>
      <br/>
      <code>0xEC0cAC8f158035136a4338a05Cdc94F5b88aFa1b</code>
    </td>
  </tr>
</table>

## 许可证

Apache License 2.0

---

愿古代智慧与现代科技的结合，为你指引人生方向。
