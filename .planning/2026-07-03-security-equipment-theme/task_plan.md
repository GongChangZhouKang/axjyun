# 安保装备管理独立主题

## Goal

基于现有平台框架与装备档案设计基底，交付可复用、框架与页面分离的标准主题，并完成结构与可见预览验收。

## Phases

- [x] Phase 1：确认产品需求与主题范围
- [x] Phase 2：确认设计基底、信息架构与组件边界
- [x] Phase 3：创建主题规范、令牌、演示入口与决策快照
- [x] Phase 4：运行结构检查并修正问题
- [x] Phase 5：打开主题预览并完成视觉验收

## Decisions

- 主题目录为 `src/themes/security-equipment-admin/`。
- 平台框架只生成一次，新业务页面只替换内容区。
- 桌面后台主题不包含移动端装备领用界面。

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| `check-app-ready` 启动服务时报 `spawn EINVAL` | 1 | 判断为 Windows 进程启动问题；改用项目构建检查与手动启动预览完成验收。 |
| 全项目 TypeScript 检查缺少 React 类型声明并产生大量既有错误 | 1 | 错误覆盖公共组件和既有主题；不修改依赖，改做目标主题单独构建。 |
| Playwright CLI 默认 Chrome 不存在 | 1 | 检查本机可用浏览器，优先复用 Edge 或工作区浏览器运行时。 |
| 主题页控制台请求 `/favicon.ico` 返回 404 | 1 | 判定为全站通用图标缺失，不影响主题入口、资源或页面渲染。 |
