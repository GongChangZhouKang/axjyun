# Findings

- 现有原型为 React 接入层 + Vue/Element Plus 主页面，适合在 React 接入层增加独立移动端路由，避免扰动桌面模块。
- 网页端已有基于 `@rc-component/qrcode` 的二维码编码能力，二维码载荷包含装备编号、名称、数量和单位。
- 用户截图明确了 375×812 左右的移动端视觉、底部选择面板、装备卡片和固定提交按钮。
- 原型已静态接入 `annotation-source.json`，新增页面只需扩展路由、目录和稳定 locator。

