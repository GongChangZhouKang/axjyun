# 网页数据导出包使用说明

本压缩包包含从网页提取的完整数据，用于 AI 辅助页面还原和设计分析。

## 📦 文件结构

```
├── README.md              # 本说明文件
├── screenshot.png         # 完整页面截图（系统 API 截取）
├── domlist.json          # DOM 结构数据（TOON 格式）
├── stylePool.json        # 样式池数据（TOON 格式）
├── theme.json            # 设计令牌（可选）
├── content.md            # 页面内容 Markdown（可选）
├── index.html            # 参考：生成的 HTML 文件
├── style.css             # 参考：生成的 CSS 文件
└── assets/
    ├── images/           # 图片资源
    └── fonts/            # 字体资源
```

## 🎯 核心文件说明

### 1. screenshot.png
- **用途：** 页面完整截图，用于视觉参考
- **截取方式：** 使用 Chrome DevTools Protocol (CDP) 系统 API
- **特点：** 完整页面截图，包含滚动区域，无拼接痕迹
- **优先级：** ⭐⭐⭐⭐⭐ 最重要的视觉参考

### 2. domlist.json（TOON 格式）
- **用途：** DOM 节点结构映射
- **格式：** 
  ```json
  {
    "nodes": {
      "n1": {
        "tag": "div",
        "children": ["n2", "n3"],
        "styleId": "style_1",
        "width": "1200px",
        "height": "800px",
        "text": "文本内容",
        "id": "元素ID",
        "class": "CSS类名",
        "label": "data-label",
        "src": "图片路径"
      }
    },
    "root": "n1"
  }
  ```
- **说明：**
  - `nodes`: 所有节点的映射表
  - `root`: 根节点 ID
  - `width/height`: 从样式中独立存放，精确尺寸
  - `styleId`: 指向 stylePool.json 中的样式

### 3. stylePool.json（TOON 格式）
- **用途：** 去重后的样式池
- **格式：**
  ```json
  {
    "styles": {
      "style_1": {
        "tw": "flex items-center justify-between",
        "custom": {
          "borderRadius": "8px",
          "boxShadow": "0 2px 8px rgba(0,0,0,0.1)"
        }
      }
    }
  }
  ```
- **说明：**
  - `tw`: Tailwind CSS 类名（已优化）
  - `custom`: 无法用 Tailwind 表达的自定义样式
  - 样式已去重，多个节点可共享同一 styleId

### 4. theme.json（可选）
- **用途：** 页面设计令牌（Top 10）
- **内容：** 颜色、字体、间距、圆角、阴影等
- **格式：**
  ```json
  {
    "colors": {
      "background": [{"value": "#ffffff", "count": 15}],
      "text": [{"value": "#333333", "count": 20}]
    },
    "typography": {
      "families": ["Inter", "Arial"],
      "textStyles": [{"size": "16px", "lineHeight": "1.5"}]
    },
    "spacing": ["8px", "16px", "24px"],
    "radius": ["4px", "8px"],
    "shadow": {
      "box": ["0 2px 8px rgba(0,0,0,0.1)"]
    }
  }
  ```

### 5. content.md（可选）
- **用途：** 页面文本内容（Markdown 格式）
- **用途：** 快速理解页面信息结构和文案

### 6. index.html 和 style.css（仅供参考）
- **⚠️ 注意：** 这两个文件仅供参考，不是还原的必需文件
- **用途：** 
  - 快速预览页面效果
  - 理解 DOM 结构和样式关系
  - 验证数据的正确性
- **说明：**
  - `index.html`: 使用 Tailwind CDN + 自定义样式
  - `style.css`: 包含 @font-face 和自定义样式
  - 可以直接在浏览器中打开查看效果
- **还原时：** 应该使用 `domlist.json` 和 `stylePool.json`，而不是直接使用这两个文件

## 🚀 快速还原指引（推荐）

**目标：** 快速生成页面视觉效果，节省 token

**数据源优先级：**
1. ⭐⭐⭐⭐⭐ `screenshot.png` - 视觉参考
2. ⭐⭐⭐⭐ `theme.json` - 设计令牌
3. ⭐⭐⭐ `content.md` - 内容结构
4. ⭐⭐ `index.html` - 参考实现（可选）

**操作步骤：**

1. **分析截图**
   - 识别页面整体布局（header、main、footer）
   - 识别主要视觉元素（导航、卡片、按钮等）
   - 识别颜色、字体、间距等设计风格

2. **提取设计令牌**（从 theme.json）
   - 颜色：背景色、文本色、边框色
   - 字体：字体家族、字号、行高、粗细
   - 间距：margin、padding、gap
   - 其他：圆角、阴影、线宽

3. **生成 DOM 结构**
   - 根据截图创建简化的 DOM 层级
   - 不必严格按照 domlist.json
   - 使用 theme.json 中的设计令牌

4. **添加资源**
   - 图片：使用 `assets/images/` 中的资源
   - 字体：使用 `assets/fonts/` 或系统字体

5. **微调样式**
   - 对比截图调整布局和样式
   - 确保视觉效果接近原页面

**优点：**
- ✅ 快速生成
- ✅ 节省 token
- ✅ 视觉效果好

## 🎨 精细还原指引（高保真）

**目标：** 高保真还原页面结构与样式

**数据源优先级：**
1. ⭐⭐⭐⭐⭐ `screenshot.png` - 视觉参考
2. ⭐⭐⭐⭐⭐ `domlist.json` - DOM 结构
3. ⭐⭐⭐⭐⭐ `stylePool.json` - 样式数据
4. ⭐⭐⭐⭐ `theme.json` - 设计令牌
5. ⭐⭐ `index.html` - 参考实现（可选）

**操作步骤：**

1. **分析截图**
   - 页面整体布局、颜色分布、主要元素

2. **构建 DOM 树**（从 domlist.json）
   - 按 `children` 严格构建节点层级
   - 保留所有节点属性（id、class、label、src 等）
   - 使用 `width` 和 `height` 设置精确尺寸

3. **应用样式**（从 stylePool.json）
   - 每个节点通过 `styleId` 关联样式
   - `tw` 字段：Tailwind CSS 类名
   - `custom` 字段：自定义样式（CSS-in-JS 或 style 属性）

4. **添加资源**
   - 图片：`assets/images/` 中的资源，保持原始尺寸
   - 字体：`assets/fonts/` 中的 Web 字体，使用 @font-face

5. **微调细节**
   - 对比截图调整节点尺寸、间距、字体、阴影
   - 确保视觉效果高度还原

**优点：**
- ✅ 高保真还原
- ✅ 结构完整
- ✅ 样式精确

## 💡 使用建议

### 选择还原方式

- **快速原型：** 使用快速还原指引
- **生产环境：** 使用精细还原指引
- **AI Agent：** 使用渐进式还原指引（见下方 🧠 模式）
- **学习参考：** 打开 `index.html` 查看效果

### 注意事项

1. **截图优先：** 如果数据与截图冲突，以截图为准
2. **样式优化：** stylePool 中的样式已优化（Tailwind + 自定义）
3. **资源路径：** 图片和字体路径需要根据实际部署调整
4. **响应式：** 原始页面的响应式样式可能未完全保留

---

## 🧠 渐进式高精度还原（AI Agent 推荐）

使用查询脚本实现渐进式数据读取，避免 Context Window 溢出。
当离线数据不完整时，利用 Playwright 回溯原始页面补充采集。

**前置条件：** Node.js >= 18

**原始页面 URL：** `manifest.json` → `sourceUrl` 字段。
当数据不准确时，AI 可通过 Playwright 访问此 URL 获取实时信息。

### 渐进式读取

```bash
# Step 1 — 全局概览（~500 tokens）
node scripts/query-page-data.mjs <dir> summary
node scripts/query-page-data.mjs <dir> skeleton --depth=2

# Step 2 — 按 Section 深入
node scripts/query-page-data.mjs <dir> subtree n2 --depth=3
node scripts/query-page-data.mjs <dir> nodes n3,n4,n5 --fields=style,text,selector

# Step 3 — 条件反查
node scripts/query-page-data.mjs <dir> find --tag=button --interactive
node scripts/query-page-data.mjs <dir> find --text="登录"
```

### 在线回溯（按需）

当发现离线数据可疑时，可使用 Playwright（MCP 或 CLI）访问 `sourceUrl`：
- 每个节点文件 `flat/nodes/{id}.json` 包含 `selector` 字段
- 该 `selector` 可直接用于 `page.locator(selector)` 定位原始元素
- 截图、computedStyle、hover 态等均可按需获取

### 扁平化文件结构（full/interactive 模式）

```
flat/
├── skeleton.json      # 极简骨架树（含 sourceUrl，< 5KB）
├── index.json         # 反向索引（tag/role/interactive 分类）
├── nodes/             # 每个节点的完整数据（含 selector + bbox）
│   ├── n1.json
│   └── ...
└── styles/            # 每个样式的完整数据
    ├── style_1.json
    └── ...
```

---

## 📚 相关资源

- **TOON 格式：** https://github.com/toon-format/toon
- **Tailwind CSS：** https://tailwindcss.com/
- **Chrome Extension：** Axhub Make

---

**生成时间：** 2026-06-30T17:25:33.295Z
**版本：** 3.0（渐进式检索 + 在线回溯）
