# 装备档案管理 7 月迭代

## 目标
在 `src/prototypes/untitled-4` 内实现可运行的装备档案管理原型，主体采用 Vue 3 + Element Plus，沿用安保管理后台主题与现有系统截图，并接入 Axhub 原型标注。

## 已确认决策
- 产品需求与设计方案均已由用户确认。
- 信息架构：装备档案、分类管理两个标签页。
- 分类管理：多级分类、唯一分类编码、树形表格、新增/编辑/删除约束。
- 装备档案：增加装备编码列；新增/编辑支持供应商联想、多级分类选择和编码预览。
- 编码规则：末级分类编码 + 三位流水号，例如 `FZ-YD-001`；编码只读。
- 视觉：严格继承 `src/themes/contract-detail/DESIGN.md` 和用户提供的三张截图。
- 交互：筛选、分页、页签、弹窗、联想输入、级联选择、表单校验、状态切换均可操作。

## 阶段
- [x] 阶段 1：确认需求、设计基底与参考数据
- [x] 阶段 2：归档确认快照并搭建 Vue + Element Plus 运行边界
- [x] 阶段 3：实现装备档案与分类管理完整交互
- [x] 阶段 4：接入原型目录与组件标注
- [x] 阶段 5：运行类型、就绪、交互与视觉回归验收
- [x] 阶段 6：重新采集源图与当前原型，量化主题偏差
- [x] 阶段 7：修正 `contract-detail` 主题事实源与派生文件
- [x] 阶段 8：同步装备档案页并完成主题/原型视觉回归

## 错误记录
| 错误 | 尝试 | 处理 |
|---|---:|---|
| 默认 Python 命令不可用 | 1 | 改用 Codex 工作区自带 Python，Product Design 上下文预检完成 |
| 安装依赖后审计提示 5 项间接依赖漏洞 | 1 | 未执行破坏性 `audit fix --force`；记录为依赖链风险，不影响原型运行验收 |
| Element Plus 的表格与表单内部重复输出同一条无功能影响的 `undefined` 访问 warning | 3 | 精确过滤该条 vendor warning；其他 Vue warning 和全部错误继续输出 |
| 浏览器版 Vue 编译器不支持 `prefixIdentifiers` | 1 | 已撤回该选项，改为定位模板中被解析的 `undefined` 来源 |
| Element Plus 提示 `el-link` 布尔型 underline 将弃用 | 1 | 改用新 API `underline="never"` |
| Vue ESM bundler 在开发预览提示 feature flags 未定义 | 1 | 增加原型内静态前置模块设置三个官方 feature flags，避免修改全局 Vite 配置 |
| 动态加载 Vue 导致 IIFE 单入口构建不支持代码分割 | 1 | 恢复静态加载，改用有序的本地前置模块，不改变项目构建格式 |
| 主题与原型并行执行 ready 检查时争用 `entries.json` 原子重命名 | 1 | 原型已 READY；主题改为顺序单独复验，避免扫描器文件锁冲突 |

## 验收结果
- `npm run typecheck`：通过。
- `node scripts/check-app-ready.mjs /prototypes/untitled-4`：READY。
- 浏览器回归：标签、筛选、分页、弹窗、表单校验、供应商联想、分类级联、`FZ-YD-001` 自动编码、分类树与新增分类弹窗均通过。
- 最新页面加载后无新增 console warning/error。
- `design-qa.md`：`final result: passed`。
- `node scripts/check-app-ready.mjs /themes/contract-detail`：READY。
- 修复后视觉回归：主按钮 `#129BFF`、表头 38px、装备与分类数据行均为 48px；分类操作链接不再换行。

## 用户反馈后的校准目标
- 主按钮必须匹配原系统 source-exact 蓝色，不再用深蓝 AA 替代色改变视觉。
- 重新核对表格行高、表头高度、控件高度和页面密度，消除主题与页面局部样式的双重偏差。
- 修改顺序：先校准 `DESIGN.md`，再同步 `theme.json`、`assets/tokens.json`、`style.css`、`tw.css` 和目标原型。
