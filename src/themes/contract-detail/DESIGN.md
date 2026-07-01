---
version: alpha
name: 安保管理平台后台主题
description: "A compact Chinese enterprise administration theme for Security Management Platform back-office screens: cool gray typography, white and pale-gray surfaces, precise 3–4px radii, restrained borders, and a two-level blue interaction system."
colors:
  primary: "#129BFF"
  primary-hover: "#2D8CF0"
  on-primary: "#FFFFFF"
  primary-source: "#129BFF"
  primary-accessible: "#096DD9"
  accent: "#2D8CF0"
  ink: "#515A6E"
  ink-strong: "#4B4949"
  ink-secondary: "#666666"
  ink-muted: "#808695"
  ink-subtle: "#999999"
  ink-disabled: "#C5C8CE"
  canvas: "#F5F7F9"
  surface: "#FFFFFF"
  surface-muted: "#F2F2F2"
  surface-soft: "#F5F7FB"
  surface-table: "#F4F5F7"
  surface-row-alt: "#F4F5F7"
  surface-selected: "#F0FAFF"
  surface-disabled: "#F7F7F7"
  border: "#DCDEE2"
  border-strong: "#C5C8CE"
  success-source: "#19BE6B"
  success-ink: "#1F2A10"
  success-surface: "#F6FFED"
  success-text: "#237804"
  success-text-source: "#23D170"
  warning-source: "#FFAE00"
  warning-surface: "#FFF7E6"
  warning-text: "#AD4E00"
  danger-source: "#F52C2C"
  danger-strong: "#FF0000"
  danger-surface: "#FFF1F0"
  danger-text: "#A8071A"
  overlay: "rgba(55, 55, 55, 0.60)"
  feature-photo-start: "#667EEA"
  feature-photo-end: "#764BA2"
typography:
  page-title:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 26px
    letterSpacing: 0px
  section-title:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: 0px
  body:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0px
  body-compact:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 21px
    letterSpacing: 0px
  table-header:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 21px
    letterSpacing: 0px
  caption:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
  button:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  mono:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0px
rounded:
  none: 0px
  micro: 2px
  xs: 3px
  sm: 4px
  md: 6px
  modal: 16px
  full: 9999px
spacing:
  micro: 2px
  xs: 4px
  compact: 6px
  control-y: 7px
  sm: 8px
  control-x: 10px
  md: 12px
  lg: 16px
  form-row: 18px
  xl: 20px
  xxl: 24px
  section: 32px
components:
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 0px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 7px 16px
    height: 34px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 7px 16px
    height: 34px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 7px 16px
    height: 34px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.sm}"
    padding: 6px 10px
    height: 34px
  summary-card:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 16px
  filter-bar:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 16px
  table-header:
    backgroundColor: "{colors.surface-table}"
    textColor: "{colors.ink}"
    typography: "{typography.table-header}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 8px 4px
  tab-indicator:
    backgroundColor: "{colors.primary-source}"
    rounded: "{rounded.full}"
    height: 4px
    width: 28px
  status-running:
    backgroundColor: "{colors.success-source}"
    textColor: "{colors.success-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  text-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
  meta-dot:
    backgroundColor: "{colors.ink-muted}"
    rounded: "{rounded.full}"
    size: 4px
  placeholder-rule:
    backgroundColor: "{colors.ink-subtle}"
    rounded: "{rounded.full}"
    height: 1px
    width: 48px
  disabled-icon:
    backgroundColor: "{colors.ink-disabled}"
    rounded: "{rounded.full}"
    size: 16px
  disabled-field:
    backgroundColor: "{colors.surface-disabled}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: 34px
  divider:
    backgroundColor: "{colors.border}"
    rounded: "{rounded.none}"
    height: 1px
    width: 100%
  divider-strong:
    backgroundColor: "{colors.border-strong}"
    rounded: "{rounded.none}"
    height: 1px
    width: 100%
  focus-ring:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    height: 2px
    width: 100%
  status-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: 0px
    width: 900px
  dialog-title:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.section-title}"
    rounded: "{rounded.none}"
    padding: 14px 26px
  dialog-footer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.modal}"
    padding: 10px 16px
    height: 58px
  tree-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 8px
    width: 300px
  tree-item-selected:
    backgroundColor: "{colors.surface-selected}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 7px 8px
    height: 34px
  table-row-alt:
    backgroundColor: "{colors.surface-row-alt}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 10px 16px
  status-warning:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  status-warning-source-mark:
    backgroundColor: "{colors.warning-source}"
    rounded: "{rounded.full}"
    size: 6px
  danger-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger-source}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
  danger-source-mark:
    backgroundColor: "{colors.danger-source}"
    rounded: "{rounded.full}"
    size: 6px
  required-mark:
    backgroundColor: "{colors.danger-strong}"
    rounded: "{rounded.full}"
    size: 4px
  danger-surface:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 2px 8px
  success-text-source-mark:
    backgroundColor: "{colors.success-text-source}"
    rounded: "{rounded.full}"
    size: 6px
  modal-overlay:
    backgroundColor: "{colors.overlay}"
    rounded: "{rounded.none}"
    width: 100%
    height: 100%
  photo-action-start:
    backgroundColor: "{colors.feature-photo-start}"
    rounded: "{rounded.full}"
    size: 76px
  photo-action-end:
    backgroundColor: "{colors.feature-photo-end}"
    rounded: "{rounded.full}"
    size: 76px
  section-heading-marker:
    backgroundColor: "{colors.primary-source}"
    rounded: "{rounded.xs}"
    width: 5px
    height: 16px
---

## Overview

“安保管理平台后台主题”来自合同、员工、弹窗表单和装备出库等代表性页面截图，以及首轮页面的样式采集数据。它不是泛化的“蓝色 SaaS”，而是一套面向中文政企后台的高密度工作界面：默认正文是冷灰 `#515A6E`，大面积使用白色与极浅冷灰表面，交互以蓝色文字、描边、下划线和小面积按钮表达，圆角与阴影都很克制。

适用场景：合同、审批、项目、档案、安保、统计等桌面端管理后台；尤其适合多导航、多字段、表格和筛选器共存的任务型页面。

不适用场景：品牌营销落地页、内容沉浸页、年轻化消费应用、依赖大图和强情绪色彩的界面。不要把它扩写成大圆角卡片、玻璃拟态或渐变霓虹系统。

核心气质：**准确、克制、任务优先、冷静可信、高信息密度**。

## Colors

### Token 表

| Token | 值 | 语义与来源 |
|---|---:|---|
| `{colors.primary}` | `#129BFF` | 原系统主按钮的 source-exact 蓝；默认 CTA、批量工具栏按钮与主选中条必须使用此色 |
| `{colors.primary-hover}` | `#2D8CF0` | 原系统交互蓝；用于主按钮 hover/active、文字链接与焦点强调 |
| `{colors.primary-source}` | `#129BFF` | 与 `primary` 同源的兼容别名，供旧组件和选中条继续使用 |
| `{colors.primary-accessible}` | `#096DD9` | 高对比备用蓝；仅在明确要求 WCAG AA 的小号白字场景使用，不得替换默认视觉主色 |
| `{colors.accent}` | `#2D8CF0` | 截图中选中导航、链接与焦点强调的原始蓝；适合线、图标和边框 |
| `{colors.ink}` | `#515A6E` | 默认正文、标题、表格内容；白底对比度 6.91:1 |
| `{colors.ink-strong}` | `#4B4949` | 模态标题、重要分区标题；来自员工样式数据中的深色文本 |
| `{colors.ink-secondary}` | `#666666` | 次级正文与较重要说明；白底对比度 5.74:1 |
| `{colors.ink-muted}` | `#808695` | 元数据和辅助标签；不承载关键结论 |
| `{colors.ink-subtle}` | `#999999` | 占位与低优先级说明；不可作为正文 |
| `{colors.ink-disabled}` | `#C5C8CE` | 禁用、不可用、占位提示；不得表达仍可操作的内容 |
| `{colors.canvas}` | `#F5F7F9` | 应用框架、页签带、页面外层底色 |
| `{colors.surface}` | `#FFFFFF` | 主内容区、侧栏、输入框、表格主体 |
| `{colors.surface-muted}` | `#F2F2F2` | 摘要卡、统计卡、只读信息块 |
| `{colors.surface-soft}` | `#F5F7FB` | 筛选条、轻量工具栏、分组容器 |
| `{colors.surface-table}` | `#F4F5F7` | 表头、列标题、密集数据的结构层 |
| `{colors.surface-row-alt}` | `#F4F5F7` | 原系统表格斑马纹偶数行；与表头共用底色，但通过字重与结构位置区分语义 |
| `{colors.surface-selected}` | `#F0FAFF` | 左侧导航、组织树节点和轻量选中背景 |
| `{colors.border}` | `#DCDEE2` | 输入、按钮、分页、分割线的标准 1px 边框 |
| `{colors.border-strong}` | `#C5C8CE` | 强边界、选区、拖拽或更明显的结构分隔 |
| `{colors.success-source}` | `#19BE6B` | 执行中状态色；用于短状态标签、进度和状态点 |
| `{colors.success-surface}` / `{colors.success-text}` | `#F6FFED` / `#237804` | 可阅读的成功状态组合，5.44:1 |
| `{colors.success-text-source}` | `#23D170` | “已入职”等 source-exact 纯文本成功状态；只用于短文本 |
| `{colors.warning-source}` | `#FFAE00` | 待处理状态色；用于待签署、待复核等短状态标签 |
| `{colors.warning-surface}` / `{colors.warning-text}` | `#FFF7E6` / `#AD4E00` | 生产级警告标签与提示组合 |
| `{colors.danger-source}` | `#F52C2C` | 危险操作色；用于离职、终止、删除等操作与微型标记 |
| `{colors.danger-strong}` | `#FF0000` | 必填星号、小旗等高强调微型标记，禁止大面积使用 |
| `{colors.danger-surface}` / `{colors.danger-text}` | `#FFF1F0` / `#A8071A` | 生产级危险标签与错误提示组合 |
| `{colors.overlay}` | `rgba(55,55,55,.60)` | 模态遮罩，禁止作为实体表面色 |
| `{colors.feature-photo-start/end}` | `#667EEA → #764BA2` | 人脸/照片上传专用渐变，不是全局品牌色 |

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 以 `surface + ink + border` 构成 80% 以上界面；主按钮使用 `primary`；文字链接、焦点与 hover 使用 `accent`。 |
| 允许 | `surface-muted`、`surface-soft`、`surface-table`、`surface-row-alt` 可在同屏并存，但必须各自承担“摘要 / 工具 / 表头 / 斑马纹”语义；source-exact 状态色可用于短标签、微型标记或纯文本状态。 |
| 禁止 | 禁止把 `primary-accessible` 擅自提升为默认主色；禁止用亮蓝承载长段白字正文；禁止用 `ink-muted/subtle/disabled` 表达关键数据；禁止把蓝色或功能紫色铺成大面积背景、渐变或装饰光晕。 |

## Typography

### 字体角色

默认字体栈严格继承采集结果：`"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif`。英文由 Helvetica 系列承担，中文优先苹方与微软雅黑；不加载外部 Web Font，避免政企环境中的网络和授权风险。

| Token | 规格 | 用途 |
|---|---|---|
| `{typography.page-title}` | 18/26, 500 | 页面标题、合同名称 |
| `{typography.section-title}` | 16/24, 500 | 分组标题、摘要主数字 |
| `{typography.body}` | 14/21, 400 | 默认正文、导航、表格单元格 |
| `{typography.body-compact}` | 14/20, 400 | 输入框、密集横向控件 |
| `{typography.label}` | 14/21, 500 | 页签、字段名、轻强调 |
| `{typography.table-header}` | 14/21, 700 | 表头，仅限结构标题 |
| `{typography.caption}` | 12/18, 400 | 版本号、元数据、辅助说明 |
| `{typography.button}` | 14/20, 500 | 按钮文字 |
| `{typography.mono}` | 12/18, 400 | 合同编号、日期时间、技术字段 |

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 全站以 14px 正文为基准；标题只升到 16–18px，优先靠字重和间距建立层级；中文保持 1.43–1.5 倍行高。 |
| 允许 | 12px 只用于版本、时间戳、角标；700 字重只用于表头或极少量结构标签；编号可用 mono。 |
| 禁止 | 禁止使用 20px 以上营销式大标题、全大写英文导航、负字距中文、300 细字重或 800/900 过重标题。 |

## Layout

### 栅格与密度

- 桌面框架参考：顶部栏 64px、侧栏 200px、标签导航 32px；内容区按可用宽度伸展。
- 主内容水平内边距推荐 12–16px；摘要卡之间使用 6–8px；区块之间使用 16–24px。
- 控件标准高度 34px；表头高度约 38px；数据行固定 48px；操作链接必须单行排列，不能通过换行撑高数据行；页签点击区高度 40px 左右。
- 页面不设营销式居中最大宽度；业务内容应填满可用工作区，同时保持 12–16px 安全边距。
- 树 + 列表布局：左侧树面板约 300px，右侧列表使用剩余宽度；两者之间保留 12px 间距。
- 两列表单：标签列 120–140px，控件列自适应；行间距 18px；大型模态内容左右内边距约 26px。
- 页面级与模态级 action footer 固定在底部，高约 58px，按钮右对齐，不能遮挡内容区最后一行。

### Spacing tokens

`2 / 4 / 6 / 7 / 8 / 10 / 12 / 16 / 18 / 20 / 24 / 32px`。其中 7px 是控件垂直密度微调，10px 是控件水平内边距，18px 是表单行节奏，不应互换为通用栅格。

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 结构间距使用 8、12、16、24px；按钮和输入统一 34px 高；表单标签、输入和操作保持同一基线。 |
| 允许 | 6px 用于卡片间缝、7px 用于控件垂直 padding、20/32px 用于页面级分组；移动端可将密度放宽到 40px 触控高度。 |
| 禁止 | 禁止把 7px 扩展成全局栅格；禁止 40px 以上卡片内边距、96px 营销 section 间距或大面积居中留白。 |

## Elevation & Depth

### Shadow tokens

| Token | 值 | 用途 |
|---|---|---|
| `shadow-popover` | `0 1px 6px rgba(0,0,0,.20)` | 下拉、日期选择、轻浮层 |
| `shadow-dialog` | `0 4px 12px rgba(0,0,0,.15)` | 对话框、抽屉上层内容 |
| `shadow-edge-left` | `-2px 0 6px -2px rgba(0,0,0,.20)` | 固定列右侧的左向边缘阴影 |
| `shadow-edge-right` | `2px 0 6px -2px rgba(0,0,0,.20)` | 固定列左侧的右向边缘阴影 |
| `shadow-focus-inset` | `inset 0 0 0 1px #2D8CF0` | 不改变布局的焦点强调 |
| `shadow-modal` | `0 0 12px rgba(0,0,0,.16)` | 大型模态容器，叠加在 `overlay` 上 |

常规卡片不使用阴影。层级主要由表面色、1px 边框和内容分组建立。

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 卡片和工具栏优先用浅灰填充或 1px `border`；阴影仅用于浮层与固定列边缘。 |
| 允许 | 对话框使用 `shadow-modal` 或 `shadow-dialog`；悬浮菜单使用 `shadow-popover`；焦点可使用 1–2px 蓝色 ring；模态遮罩固定使用 `overlay`。 |
| 禁止 | 禁止给摘要卡、表格、普通按钮加投影；禁止彩色阴影、内外双阴影和模糊光晕。 |

## Shapes

### Radius tokens

| Token | 值 | 用途 |
|---|---:|---|
| `{rounded.none}` | 0px | 页签下划线、表格主体、结构分割 |
| `{rounded.micro}` | 2px | 缩略图、小图片边缘、微型标记 |
| `{rounded.xs}` | 3px | 状态标签、小角标 |
| `{rounded.sm}` | 4px | 按钮、输入、分页、卡片、筛选条 |
| `{rounded.md}` | 6px | 角色分组、局部嵌套面板；低频使用 |
| `{rounded.modal}` | 16px | 少量独立引导或大模态容器；不是常规卡片半径 |
| `{rounded.full}` | 9999px | 头像、圆形图标底、短状态点 |

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 组件默认 4px；状态标签 3px；分割线和选中条保持直线或极小圆角。 |
| 允许 | 头像与图标底使用圆形；2px 用于缩略图，6px 用于嵌套分组；16px 只在独立的大型模态或特殊信息容器使用。 |
| 禁止 | 禁止把 16px 升格为卡片默认值；禁止按钮胶囊化、表格大圆角化或不同半径随机混用。 |

## Components

### 核心组件

- **主按钮**：34px 高，4px 圆角，7px 16px padding；背景使用原系统主色 `primary #129BFF`，hover/active 使用 `primary-hover #2D8CF0`，白字。
- **次按钮**：白底、`border #DCDEE2`、`ink #515A6E`；悬停时边框与文字变为 `accent`。
- **输入框 / Select**：34px 高，4px 圆角，1px 边框；focus 使用 `accent` 边框和轻 ring，不改高度。
- **页签**：默认 `ink`，选中使用 `primary` 文字；底部保留 4px `primary-source` 指示条。
- **摘要卡**：`surface-muted` 背景、4px 圆角、无阴影；图标只用线性蓝色图标。
- **筛选条**：`surface-soft` 背景，控件横向排列，主操作靠右；小屏可换行。
- **表格**：表头 `surface-table`、约 38px 高；数据行固定 48px，正文白底、水平 1px 分割线；操作列禁止换行；空状态居中但不占用夸张高度。
- **表格斑马纹**：数据密集页可交替使用 `surface + surface-row-alt`；hover 使用更轻的蓝灰，不改变文字颜色。
- **组织树**：约 300px 固定宽度，节点高 34px；选中使用 `surface-selected + primary`，机构图标保持 16–20px。
- **批量工具栏**：允许同一任务簇出现多个蓝色按钮和分裂下拉按钮；必须与筛选器、表格保持 8–12px 间距，不能散落到普通内容区。
- **状态标签**：源亮绿可保留，但必须配 `success-ink`；推荐常规场景使用 `success-surface + success-text`。警告、危险也应优先使用浅色表面 + 深色文字组合。
- **大型模态**：参考宽 900px、16px 圆角；标题栏约 52px、底栏约 58px，正文可滚动；内部页签、表单、角色分组仍遵循 14px/34px 基础密度。
- **两列表单**：标签右对齐、必填星号在标签前；输入/选择器统一 34px，文本域可用 52px 起步；角色/权限多选使用带边框分组。
- **固定操作栏**：页面级和模态级统一右对齐取消/暂存/确认；中间态操作为白底描边，最终提交才使用实心主按钮。
- **分组标题**：16px/24px、500–700 字重，左侧配 5px `primary-source` 竖条。
- **照片上传浮动按钮**：仅在人脸/照片录入功能中使用紫色渐变圆形按钮；其他业务页面禁止复用该强调色。

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 一个操作组只保留一个实心主按钮；选择态由文字、边框或指示条表达；表格和筛选器优先服务扫描效率。 |
| 允许 | 摘要卡可使用 2–4 列自适应网格；批量工具栏作为任务簇可并列多个主色按钮；次按钮、文本按钮和图标按钮可并列；空状态可配一行解释。 |
| 禁止 | 禁止在非批量任务区出现多个同权重蓝色主按钮；禁止将照片上传专用渐变用于普通 CTA；禁止厚描边、超大图标或营销插画侵入业务工作区。 |

## Do's and Don'ts

### 推荐

- 让白色与浅冷灰承担主要层级，蓝色只标记“可操作、已选择、需关注”。
- 保持 14px 中文正文和 34px 控件的紧凑节奏。
- 先保证表格、筛选、标签导航的扫描效率，再考虑装饰。
- 默认使用 source-exact token 复现原系统；只有验收明确要求更高对比度时，才局部使用 `primary-accessible`。

### 允许

- 在不改变主题骨架的情况下，为移动端增加 40px 触控高度和纵向堆叠。
- 在浮层中使用采集到的两级阴影。
- 在图标、选中条和非文本图形中使用较亮的原始蓝。

### 禁止

- 不添加玻璃拟态、渐变背景、彩色大阴影、3D 插图或大圆角卡片。
- 不把弱灰文字当作主要正文；不要用高对比备用蓝覆盖截图中明确存在的主按钮色。
- 不把截图里的偶发值当全局规则；16px 圆角和 400ms 入场动效都属于特殊场景。

## Motion

### Motion tokens

| Token | 值 | 用途 |
|---|---|---|
| `duration-fast` | `120ms` | 按下、焦点反馈 |
| `duration-base` | `200ms` | 颜色、背景、边框、轻位移 |
| `duration-enter` | `400ms` | 抽屉、对话框、内容进入 |
| `duration-loading` | `1000ms` | 线性加载旋转 |
| `ease-standard` | `ease-in-out` | 常规组件状态 |
| `ease-enter` | `cubic-bezier(.4,0,.2,1)` | 进入与退出 |

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 颜色、边框和背景使用 200ms；加载图标使用 1s linear；只动画 `opacity` 与 `transform`。 |
| 允许 | 抽屉和对话框使用 400ms 标准曲线；按压反馈可缩短至 120ms。 |
| 禁止 | 禁止对全局属性使用 `transition: all`；禁止循环脉冲装饰、弹跳、视差和超过 500ms 的业务操作动效。 |

## Responsive Behavior

- **Desktop ≥ 1280px**：保留 200px 侧栏与横向多标签；摘要卡 3 列；筛选器单行；表格完整展示。
- **Tablet 768–1279px**：侧栏收起为图标栏或抽屉；摘要卡 2 列；筛选器允许两行；表格水平滚动并固定首列。
- **Mobile < 768px**：顶部与侧栏合并为单一导航入口；摘要卡 1 列；页签水平滚动；筛选器纵向堆叠；表格切换为关键字段卡片或受控横向滚动。

### 三级使用规范

| 等级 | 规则 |
|---|---|
| 推荐 | 优先保留任务、状态和主操作；减少同时可见的导航层级；移动端控件提升到至少 40px。 |
| 允许 | 次要元数据折叠、表格横向滚动、固定关键列；摘要卡从 3→2→1 列。 |
| 禁止 | 禁止把桌面 200px 侧栏直接压缩到手机；禁止缩小到 12px 正文以容纳表格；禁止隐藏核心状态和主操作。 |

## Prompt Guide

### 推荐写法

1. “使用安保管理平台后台主题生成中文政企后台，默认正文 14px/21px、`#515A6E`，控件高 34px、圆角 4px。”
2. “以白色主表面和 `#F5F7FB` 工具条组织合同筛选器，主操作使用原系统蓝 `#129BFF`，hover 使用 `#2D8CF0`。”
3. “摘要卡无阴影，用 `#F2F2F2` 填充、4px 圆角和 16px 内边距；选中页签使用蓝色文字与 4px 指示条。”
4. “表格表头使用 `#F4F5F7`，正文白底，边框 `#DCDEE2`，保持高密度扫描体验。”
5. “按钮和选中条使用 `#129BFF`，文字链接、focus 与 hover 使用 `#2D8CF0`；`#096DD9` 仅作为高对比备用色。”
6. “员工信息页采用左侧组织树、右侧筛选与批量工具栏；数据表使用 `#F4F5F7` 斑马纹，表头约 38px、数据行 48px，选中节点使用 `#F0FAFF`。”
7. “新增/编辑员工使用 900px 大型模态、两列表单、可滚动正文和固定底部操作栏；成功、警告、危险状态使用已定义语义色。”

### 禁止写法

1. “做成现代 SaaS 大圆角卡片风。”
2. “增加蓝紫渐变、玻璃拟态和发光阴影。”
3. “使用 48px 标题与大面积留白。”
4. “所有按钮都做成蓝色胶囊按钮。”
5. “为了适配移动端把表格文字缩到 11–12px。”
6. “把员工照片按钮的蓝紫渐变复用到所有主按钮。”

### 可直接复用的生成提示

> 为安保管理平台生成一个生产级中文后台页面。严格使用 Security Management Platform DESIGN.md：白色主内容区、`#F5F7F9` 应用画布、`#515A6E` 默认正文、14px/21px 基准排版、34px 控件、4px 圆角、1px `#DCDEE2` 边框。主按钮使用原系统蓝 `#129BFF`，hover、文字链接与焦点使用 `#2D8CF0`；`#096DD9` 只作为明确要求高对比度时的备用色。筛选条使用 `#F5F7FB`，表头和斑马纹使用 `#F4F5F7`，表头约 38px、数据行固定 48px，操作列不换行。员工管理采用组织树 + 批量工具栏 + 表格；新增/编辑采用两列表单的大型模态和固定操作栏。成功、警告、危险状态使用语义 token。保持高信息密度、明确层级和克制动效；除照片采集专用按钮外，不使用渐变、大圆角、玻璃拟态或装饰性阴影。

## Evidence and Confidence

- **高置信**：颜色、字体栈、14px 主字号、3/4/16px 圆角、主要间距、边框、阴影与 200/400/1000ms 动效来自用户提供的样式采集数据。
- **高置信**：页面密度、导航层级、摘要卡、筛选条、页签、组织树、批量工具栏、斑马纹表格、两列表单、大型模态与固定操作栏来自 6 张代表性业务截图。
- **用户确认**：执行中使用 `#19BE6B`、待处理使用 `#FFAE00`、危险操作使用 `#F52C2C`；这三项覆盖原截图中的对应状态色。
- **高置信**：`#23D170` 成功、`rgba(55,55,55,.60)` 遮罩以及照片按钮 `#667EEA → #764BA2` 来自员工信息与合同列表截图/样式数据。
- **用户反馈校准**：源截图的 `#129BFF` 恢复为默认主按钮色，`#2D8CF0` 用于交互态；`#096DD9` 保留为可选高对比备用色，不再改变默认视觉。
- **尚未覆盖**：登录/认证、全局消息与通知、异常页、删除确认、暗色模式和原生移动布局没有直接视觉证据；需要这些场景时应补充对应截图后再扩展，不从现有页面臆测。
