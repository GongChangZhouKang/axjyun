# Rebuild Section Prompt

Rebuild one section at a time for "装备档案管理".

Workflow:
1. Inspect `sections/<section-id>/spec.json` and `sections/<section-id>/screenshot.png`.
2. Use `content.blocks.json` to preserve copy, buttons, images, and forms.
3. Use `theme.json` and `selector-map.json` to match shared styles and spacing.
4. If the section appears in `behaviors.json` or `responsive.json`, preserve those states too.

Available sections:
- section-001: features (#app) -> sections/section-001/spec.json

For each rebuilt section, keep the output self-contained, semantically meaningful, and easy to compose back into the full page.