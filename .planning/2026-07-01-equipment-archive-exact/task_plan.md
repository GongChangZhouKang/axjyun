# 装备档案管理高精度还原

## 目标
在 `src/prototypes/equipment-archive-exact` 新建可运行原型，以导出包中的截图、DOM、computed styles、主题令牌和文案为唯一视觉与内容依据。页面业务层使用 Vue 3 + Element Plus，通过项目要求的 React `index.tsx` 薄壳挂载。

## 已确认决策
- 产品范围：装备档案管理单页，包含侧栏、顶部栏、页签、筛选、列表、分页与相关弹窗交互；不接真实后端。
- 设计方案：不使用现有 `contract-detail` 或其他通用主题。
- 事实源优先级：截图 > DOM/样式数据 > 导出主题令牌 > Element 默认样式。
- 响应式：忠实复刻导出包桌面、平板与手机截图的固定侧栏和横向裁切表现。
- 技术：Vue 3 + Element Plus；React 仅作为 Axhub 原型入口挂载容器。

## 阶段
- [x] 阶段 1：读取压缩包、确认需求与设计门禁
- [x] 阶段 2：建立独立计划并归档确认快照
- [x] 阶段 3：实现页面结构、样式与交互
- [x] 阶段 4：运行类型与应用就绪验收
- [x] 阶段 5：采集真实运行截图并完成视觉回归

## 验收结果
- `npm run typecheck`：通过。
- `node scripts/check-app-ready.mjs /prototypes/equipment-archive-exact`：READY。
- 生产单入口构建：通过。
- 浏览器交互：新增装备、分类管理弹窗正常打开；筛选、状态切换、编辑、删除与分页入口均可用。
- 视觉回归：1912×901、1440×901、768×1024、390×844 均已采集并对照源图。

## 错误记录
| 错误 | 尝试 | 处理 |
|---|---:|---|
| Vue flags 文件被 TypeScript 视为全局脚本，与既有原型变量重名 | 1 | 增加空导出，将新文件限定为独立 ES 模块 |
| 浏览器预览接口不支持 `networkidle` 等待状态 | 1 | 改用 `load` 状态并成功获取真实运行截图 |
| Element Plus 链接旧参数和表格内部 `undefined` 访问产生重复警告 | 1 | 链接改用 `underline="never"`；仅过滤已知 vendor 提示，其他警告继续输出 |
