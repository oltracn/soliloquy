# 独白 (Soliloquy) — Firefox 扩展项目蓝图

> **“在每一次开启新标签页的时刻，与人类智识的精神独白不期而遇。”**

---

## 📖 项目简介 (Project Overview)

- **项目名称**：独白 / Soliloquy (或 Soliloquy Tab)
- **目标平台**：Mozilla Firefox 浏览器扩展 (WebExtension)
- **核心定位**：一款极简、高品质的 Firefox 新标签页（New Tab）替代扩展。融合**世界名人语录**、**国际化艺术调色板**与**流光/波浪动态视觉**，在沉静美感中为用户提供每日思想与灵感启发。

---

## 🎨 视觉与设计理念 (Design & Aesthetic Concept)

1. **东方与现代结合的极简主义 (Global Minimalism)**：
   - 界面无冗余元素，主次分明，大面积优雅留白。
   - 排版固定采用**居中横排 (Centered Horizontal Typography)**，以精炼对称感呈现思想。
   - 字体固定为单一种类（推荐**方正细金陵 / Noto Serif SC**等宋体/Serif字形），取消字体切换的冗余复杂度。

2. **跨文化艺术调色板与低能耗动画 (World Color Palettes & Low-Resource Animation)**：
   - **全球传统色彩**：系统化收录中国传统色、日本传统色、欧美经典传统色（如 Bleu de France、Burgundy 等），呈现名字及色值。
   - **极低功耗动画**：摒弃几枝高消耗的 Canvas (p5.js) 重绘重算方案，**仅采用一种**基于硬件加速的轻量化 **CSS/SVG 渐变流动波浪**，确保极低 CPU/GPU 占用，使页面如呼吸般静谧自然。

3. **名言与思想交汇 (Quotes & Wisdom)**：
   - 涵盖古今中外哲学家、文学家、科学家、艺术家（如苏格拉底、莎士比亚、爱因斯坦、加缪、罗素等）的双语名人语录。
   - **交互式探索**：支持点击语录内容或作者名称，直接使用默认搜索引擎跳转检索，促进用户深入探寻思想背景。

---

## 🔍 参考与借鉴：“几枝”扩展分析 (Reference: "Jizhi" Extension Analysis)

通过分析 `resources/jizhi` 目录下的静态编译资源，总结出该扩展在视觉、技术和交互上的优秀实践，作为“独白 (Soliloquy)”项目的设计参考：

1. **背景动力学与渲染算法 (Background Dynamics)**：
   - **Waves (叠浪模式)**：使用 5 层重叠的波浪，基于 2D Perlin 噪音（Perlin Noise）生成平滑起伏的顶点。最下层为不透明色，往上每层透明度阶梯式递减（`Alpha` 阶梯：255, 205, 155, 105, 55），营造出优雅的立体层次感。
   - **Blobs (有机气泡模式)**：使用 Perlin 噪音改变圆形半径，生成有机的随机变形泡泡/水母状几何体，并在画面中以不同的速度与平滑度缓慢抖动和漂移。
   - **动画控制**：支持键盘 `Space` 键播放或暂停动画；在 Waves 模式下，支持通过键盘左右方向键随机切换配色。

2. **色彩与文化叙事 (Color System)**：
   - 围绕**中国传统色**建立色彩体系。允许用户开启“保留颜色名称”，在页面上显示当前色彩的 Hex 十六进制码及其中文命名（如“中国色：#84A6C9 | 霁蓝”），赋予视觉设计以深厚的文化底蕴与信息附加值。

3. **字体排版与中式美学 (Typography)**：
   - **多排版模式**：支持一键切换“竖版诗词”与“横版诗词”。
   - **精选艺术字体**：本地打包集成高品质的江西拙楷（[JXZhuoKai.8cd2b107.woff](file:///home/oltra/Projects/soliloquy/resources/jizhi/assets/JXZhuoKai.8cd2b107.woff)，约 4.8MB），并提供欣意吉祥宋、方正细金陵等字体的按需加载与字体背后的故事介绍。

4. **诗词生成引擎 (Poetry Engine)**：
   - 采用“今日诗词 API”动态获取诗词，并内置了精选经典诗词（如王维的《相思》、白居易的《钱塘湖春行》等）的离线 fallback 数据库。

5. **操作与分享导出 (Export & Sharing)**：
   - 支持使用 `html-to-image`/`dom-to-image` 等技术将当前画面生成 PNG 文件并下载保存（默认快捷键 `Alt/Option + S`），让用户能轻松保存喜欢的配色与诗词组合。

6. **控制面板与偏好设置 (UI Controls)**：
   - 采用极简的侧边抽屉/悬浮面板，划分为“设置”、“背景”、“操作”、“字体”、“关于”五个 Tab，支持搜索引擎切换（Google/百度/Bing）、白天/黑夜/系统跟随的色彩模式等。

---

## 🚀 核心功能规划 (Core Features)

### MVP 基础功能 (Phase 1)
- [x] **新标签页接管 (New Tab Override)**：替换 Firefox 默认新标签页。
- [x] **低能耗流光波浪**：仅使用一种高度优化的 CSS/SVG 渐变流动波浪，确保极佳能效与极低 CPU 占用。
- [x] **世界传统色彩库**：整合中国、日本、欧美的传统色名字与 Hex 码，可显示在页面并支持左右方向键随机切换。
- [x] **居中横排排版**：固定使用经典的对称居中横排布局，展现极致简练。
- [x] **固定经典宋体**：全局固定使用优雅的宋体字形（如 Noto Serif SC 配合系统金陵宋体/衬线字 fallback），不设字体切换选项。
- [x] **快捷跳转搜索**：点击语录内容或作者名字，自动使用用户配置的默认搜索引擎进行跳转搜索。
- [x] **基本控制面板**：切换下一条语录、切换色彩主题、配置搜索引擎。

### 进阶功能 (Phase 2)
- [ ] **极简搜索框**：可选隐藏/呼出的搜索栏（支持 Google, Bing, DuckDuckGo 等）。
- [ ] **语录收藏与卡片导出**：一键生成高颜值名言海报/壁纸并下载。

---

## 🛠️ 技术架构与目录结构 (Technical Architecture)

### 技术栈 (Tech Stack)
- **Manifest Version**: Firefox WebExtension Manifest V3 (兼顾 V2 兼容性)
- **前端技术**: HTML5, Vanilla CSS3 (CSS Custom Properties & Canvas/SVG 动画), Standard JavaScript (ES6+ Modules)
- **存储方案**: `browser.storage.local` / `browser.storage.sync`（存储用户偏好与收藏）

### 目录结构规划 (Directory Structure)
```
soliloquy/
├── manifest.json              # Firefox 扩展配置文件
├── index.html                 # 新标签页入口 HTML
├── blueprint.md               # 项目蓝图与设计文档
├── styles/
│   ├── main.css               # 主样式与基础布局
│   ├── colors.css             # 全球艺术调色板定义
│   └── animations.css         # 渐变与波浪动画
├── scripts/
│   ├── app.js                 # 核心应用逻辑
│   ├── quotes.js              # 名人语录数据库与选择逻辑
│   ├── palettes.js            # 配色方案与动画控制
│   └── storage.js             # 本地存储与用户设置
└── assets/
    ├── icons/                 # 扩展图标 (16/32/48/128px)
    └── fonts/                 # webfonts (或加载 Google Fonts)
```

---

## 📅 开发计划 (Roadmap)

1. **第一阶段：准备与基础原型 (Prototype)**
   - 初始化 Firefox 扩展 Manifest
   - 搭建 index.html 界面框架与基础 CSS 变量调色库
   - 录入首批 100+ 条经典世界名人语录 (JSON)

2. **第二阶段：视觉与动画雕琢 (Polish)**
   - 实现多套艺术调色板与渐变波浪动画效果
   - 优化中英文排版、微交互与悬停反馈

3. **第三阶段：交互与设置 (Interactivity)**
   - 实现设置面板、语录收藏、搜索引擎可选切换功能

4. **第四阶段：打包与发布 (Release)**
   - Firefox AMO (Add-ons for Firefox) 审核准备与打包提交
