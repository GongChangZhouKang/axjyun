# 装备档案管理 7 月迭代｜Design QA

- source visual truth paths:
  - `C:/Users/Axj/AppData/Local/Packages/45479liulios.17062D84F7C46_p7pnf6hceqser/LocalState/history/temp/Snipaste_2026-06-30_16-37-09.png`
  - `C:/Users/Axj/AppData/Local/Packages/45479liulios.17062D84F7C46_p7pnf6hceqser/LocalState/history/temp/Snipaste_2026-06-30_16-37-43.png`
  - `C:/Users/Axj/AppData/Local/Packages/45479liulios.17062D84F7C46_p7pnf6hceqser/LocalState/history/temp/Snipaste_2026-06-30_16-51-30.png`
- implementation screenshot paths:
  - `.local/screenshot-to-prototype/untitled-4/archive.png`
  - `.local/screenshot-to-prototype/untitled-4/equipment-dialog.png`
  - `.local/screenshot-to-prototype/untitled-4/categories.png`
  - `.local/theme-audit/contract-detail/03-after-equipment.png`
  - `.local/theme-audit/contract-detail/04-after-categories.png`
- combined comparison: `.local/screenshot-to-prototype/untitled-4/comparison.png`
- viewport: 1711 × 822
- states: 装备档案默认页、分类管理页、空白新增装备弹窗

## Full-view comparison evidence

- 装备档案保持原系统的满宽桌面布局、两行筛选区、独立新增操作区、紧凑斑马纹表格、固定操作列和底部分页。
- 新增的标签导航占用约 42px 高度，属于已确认的信息架构调整；其余内容密度与原系统一致。
- 分类管理从旧弹窗升级为页内标签和树形表格，保留原有浅灰表头、交替行色、蓝色编辑与红色删除的操作语义。

## Focused region comparison evidence

- 弹窗对照：宽度、圆角、遮罩、标题栏、标签对齐、34px 输入框、滚动内容区和居中底部按钮与源图一致；按迭代要求新增装备编码只读项、供应商联想和分类级联。
- 表格对照：表头和行高接近源图，新增装备编码列后仍保持单屏高密度阅读；长分类路径和修改人采用截断提示。
- 无照片、Logo、插画或复杂图形资产，因此图片质量与素材替换项不适用；可见图标全部来自 Element Plus 图标库。

## Findings

- 无 P0/P1/P2 视觉或交互问题。
- [P3] Axhub 标注运行时会在截图边缘显示彩色标记及选中轮廓；这是 `/axhub-annotation-standalone` 的评审能力，不属于页面视觉漂移。
- [P3] 原系统截图显示 103 条和 11 页，本原型使用 15 条可操作示例数据；分页行为已实现，数据量差异不影响本轮功能验收。

## Required fidelity surfaces

- Fonts and typography: 使用主题规定的 Helvetica Neue / PingFang SC / Microsoft YaHei 字体栈，正文与表格保持 14px，标题 16px。
- Spacing and layout rhythm: 20px 页面安全边距、16px 筛选内边距、34px 控件、48px 表格行、4px 常规圆角与源图及 DESIGN.md 一致。
- Colors and visual tokens: 主色 `#129BFF`、交互蓝 `#2D8CF0`、正文 `#515A6E`、筛选底 `#F5F7FB`、表头与斑马纹 `#F4F5F7`、边框 `#DCDEE2` 已落地；`#096DD9` 仅保留为可选高对比备用色。
- Image quality and asset fidelity: 页面无复杂位图资产；未使用占位图片冒充源素材。
- Copy and content: 延续原系统中文字段与装备数据，并准确加入分类编码、装备编码、多级分类及供应商联想说明。

## Patches made since previous QA pass

- 修复删除装备取消后仍会执行删除的问题。
- 补齐表格图片列作用域，更新 Element Link 新版 API。
- 过滤 Element Plus 运行时的精确无害 vendor warning，保留其他 Vue warning 与全部错误输出。
- 稳定截图等待弹窗和标签切换动画完成后再采集，避免过渡态透明度误判。
- 根据用户反馈重新采样原系统截图，将主题默认主色从 `#096DD9` 修正为 `#129BFF`，斑马纹从 `#F8F8F9` 修正为 `#F4F5F7`。
- 将表头固定为 38px、数据行固定为 48px；分类操作列扩至 190px并禁止换行，修复 61px 行高膨胀。

## Implementation checklist

- [x] 需求与设计决策归档
- [x] Vue 3 + Element Plus 主体运行
- [x] 装备档案筛选、分页、状态、编辑和删除
- [x] 供应商联想、多级分类选择、自动编码与表单校验
- [x] 分类树、新增下级、唯一编码和删除约束
- [x] Axhub 标注目录与组件说明
- [x] 同视口视觉对照

final result: passed

---

# 库存盘点所属仓库选择器｜Design QA

- source visual truth path: `C:/Users/Axj/AppData/Local/Packages/45479liulios.17062D84F7C46_p7pnf6hceqser/LocalState/history/temp/Snipaste_2026-07-02_14-05-44.png`
- implementation screenshot path: `.local/product-design-audit/inventory-check-warehouse-open.png`
- combined comparison evidence: `.local/product-design-audit/inventory-check-warehouse-comparison.png`
- viewport: 1280 × 720
- state: 库存盘点页，所属仓库下拉菜单展开，默认选中“山东振邦保安服务有限责任公司”

## Full-view comparison evidence

- 库存盘点页左上角已增加独立的“所属仓库”选择器，位置、控件高度、蓝色聚焦边框、文字截断和下拉浮层延续库存管理现有组件。
- 当前预览为独立页面，因此不包含源截图中的平台顶部标签；该差异属于预览容器差异，不影响目标组件。

## Focused region comparison evidence

- 同屏对照图显示：标签文案、默认公司名称、选项顺序、白色浮层、蓝色选中态及滚动区域均与参考一致。
- 已实际切换到“历下分公司”，确认选中值更新；随后恢复默认公司并重新展开完成截图。

## Findings

- 无 P0/P1/P2 问题。
- [P3] Element Plus 当前版本的下拉项行高和浮层阴影较源系统有轻微渲染差异，属于组件版本差异，不影响一致性或操作。

## Required fidelity surfaces

- Fonts and typography: 复用现有系统字体栈、14px 正文与单行截断。
- Spacing and layout rhythm: 选择框宽 202px、高 34px，与参考控件尺寸一致。
- Colors and visual tokens: 复用现有 Element Plus 聚焦蓝、选中蓝、白色浮层和灰色边框。
- Image quality and asset fidelity: 本次无图片资产；未使用占位图或自绘图形。
- Copy and content: 六个仓库选项与截图逐项一致，并与库存管理共用同一组选项数据。

## Patches made since previous QA pass

- 在库存盘点页增加所属仓库选择器。
- 库存管理和库存盘点统一为同一默认值、同一组选项和同一控件宽度。

final result: passed
