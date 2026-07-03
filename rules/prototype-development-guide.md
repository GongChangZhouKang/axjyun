# 原型开发与验收指南

用于 `src/prototypes/<name>/` 下的原型实现、局部修改、多页面组织和预览验收。主题创建、派生和主题页验收优先看 `rules/theme-guide.md`。

开发流程：

```text
读取已确认需求和设计决策 -> 修改原型目录内代码 -> 运行验收脚本 -> 按错误信息修复 -> 重新验收
```

## 实现边界

- 一个原型目录就是主要隔离边界，页面组件、样式和素材优先留在对应原型目录内。
- 不为单个原型随意修改 `src/common/`、全局主题或共享工具。
- 多步骤或高风险修改先拆成短任务，逐项处理并维护当前状态。
- 一次只处理一个明确问题；遇到构建、运行或验收失败，先定位原因再继续。
- 完成后必须通过预览验收；纯视觉、文案、布局和素材调整不要求测试驱动。

## 文件结构与命名

```text
src/prototypes/<name>/
├── index.tsx      # 必需
├── style.css      # 可选
├── components/    # 可选：原型内部共享组件
├── pages/         # 可选：多页面原型页面组件
├── docs/          # 可选：目录 Markdown 文档
└── assets/        # 可选：原型专属素材
```

- 原型入口文件必须是 `index.tsx`。
- 原型目录名使用小写字母、数字、连字符，如 `order-review`。
- 当目录名为 `untitled`、`untitled-*` 或显示名为「未命名」时，开始生成实际内容前应更新为有意义的目录名和 `@name`。
- 本项目当前不产出独立 `components` 资源；原型内部组件放在对应原型目录下的 `components/`。
- 原型目录文档放在当前原型的 `docs/` 下，例如 `src/prototypes/order-review/docs/prd-03-status.md`。
- `annotation-source.json` 的目录文档节点优先使用相对当前原型目录的 `markdownPath`，例如 `"markdownPath": "docs/prd-03-status.md"`；不要写绝对路径、`..` 或跨原型引用。
- 普通预览和 `@axhub/annotation` 阅读页不显示目录文档编辑入口；编辑 URL 由 Make 批注宿主回调生成，不写进 annotation 包或目录节点数据。
- 只有 Make 批注/编辑工具启用、且当前选中的是带安全本地 `markdownPath` 的目录 Markdown 正文子节点时，批注气泡卡片才显示“文档编辑”按钮。
- 导出/发布时会构建期内联 `markdownPath` 正文，不依赖运行时请求 `.md` 文件。

每个原型的 `index.tsx` 顶部建议包含面向用户的中文 `@name`，用于预览列表展示名：

```typescript
/**
 * @name 评审工作台
 */
```

## 多页面原型

单个原型可以包含多个页面，通过 URL hash 参数 `#page=<pageId>` 定位：

```text
/prototypes/express-app/#page=home
/prototypes/express-app/#page=detail
```

多页面仍属于同一个原型目录；页面组件放在原型内部的 `pages/`，跨页面共享组件放在原型内部的 `components/`。

使用公共 hook `src/common/useHashPage.ts`：

```typescript
import { useHashPage } from '../../common/useHashPage';

export default function MyApp() {
    const { page, setPage } = useHashPage('home');
    // page === 'home' | 'detail' | ...
}
```

- `pageId` 命名使用小写字母、数字、连字符。
- 不带 `#page=` 时自动使用 `defaultPage`。
- 此路由完全在原型内部，不影响构建。

参考实现：`src/prototypes/ref-app-home/index.tsx`。

## 依赖与样式

- React 与 Hooks 直接从 `react` 导入。
- 当原型为 Vue + Element Plus 实现时，允许保留轻量的 React `index.tsx` 作为 Make 客户端接入层；页面结构、组件、状态和交互应集中在 Vue 实现中，避免把业务逻辑拆回 React 接入层。
- 第三方库按需导入，新增依赖必须同步更新 `package.json`。
- 使用 Tailwind CSS V4 时，入口样式文件需包含：

```css
@import "tailwindcss";
```

- 使用主题 CSS Variables 时，按所选 `DESIGN.md` 和主题规则引入，不复制另一套 token。

## 验收流程

验收分为“目标原型验收”和“全仓工程检查”。目标原型验收是原型交付的必要条件；全仓工程检查用于发现共享依赖、类型声明和其他目录中的工程问题，两者必须分开判断和报告，不能用无关的全仓错误替代目标原型验收。

运行原型验收脚本：

```bash
node scripts/check-app-ready.mjs /prototypes/[原型目录]
```

关键返回字段：

- `status`: `READY` / `ERROR` / `TIMEOUT`。
- `targetUrl`: 本次验收目标地址。
- `errors`: 构建、运行时或页面加载错误列表。

错误处理：

- `ERROR`：按 `errors` 修复后重新执行验收脚本，直到通过。
- `TIMEOUT`：优先排查 dev server 启动、端口、长任务和运行时阻塞。
- 修复时先处理构建、启动和运行时报错，再处理交互与视觉问题；一次只修一个明确问题，修完重新验收。

### Vue + Element Plus 原型验收

Vue + Element Plus 原型完成实现或修改后，由 Agent 依次完成以下检查，不能把命令执行或验收工作转交给不熟悉技术的用户：

1. **运行验收**
   - 启动本地预览并直接打开目标原型及目标页面。
   - 确认 Vue 应用成功挂载，无白屏、构建错误、运行时报错或关键资源加载失败。
2. **Element Plus 交互验收**
   - 实际操作本次修改涉及的标签页、按钮、查询、重置、表格、分页、弹窗、表单、选择器、确认框和消息提示。
   - 核对交互前后状态、禁用状态、激活状态、关闭行为和数据反馈是否符合已确认需求。
3. **浏览器视觉验收**
   - 在需求指定的页面尺寸下检查元素坐标、宽高、间距、字体、颜色、边框和层级关系。
   - 有参考截图时，对关键区域进行截图或像素取色核对，同时验证默认、激活、悬浮、弹出和空状态。
   - 修改后必须重新加载目标页面，以实际渲染结果为准，不能只根据源码推断完成。
4. **结果报告**
   - 分别报告“Vue 原型运行”“Element Plus 交互”“浏览器视觉验收”的通过或失败状态。
   - 如执行全仓类型检查或测试，还应单独报告结果；若被目标原型之外的既有问题阻断，应说明具体原因和影响范围，不得笼统表述为目标原型校验失败。

React 接入层仍属于宿主工程的一部分，因此缺少 `@types/react`、`@types/react-dom` 等声明时应作为工程依赖问题修复或记录；在依赖问题修复前，仍须完成上述目标原型运行、交互和视觉验收。

## 最小清单

- [ ] `index.tsx` 完整存在。
- [ ] `index.tsx` 顶部有清晰的 `@name`。
- [ ] 占位原型已更新为有意义的目录名和显示名。
- [ ] 新增依赖已写入 `package.json`。
- [ ] `check-app-ready.mjs` 原型验收通过。
- [ ] Vue + Element Plus 原型已完成运行、交互和浏览器视觉验收。
- [ ] 目标原型问题与全仓既有问题已分开报告。
