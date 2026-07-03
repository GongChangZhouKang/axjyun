# Rebuild Page Prompt

Rebuild the page "装备档案管理" as a production-ready webpage.

Use the export pack in this order:
1. Read `manifest.json` to understand available files and capabilities.
2. Use `screenshot.png` as the visual source of truth.
3. Use `topology.json`, `selector-map.json`, and `content.blocks.json` when present to preserve page structure and section semantics.
4. Use `theme.json`, `doms.toon`, and `styles.toon` to restore layout, tokens, and styling details.
5. Use `behaviors.json`, `responsive.json`, and `network-summary.json` when present to preserve dynamic behavior and breakpoint changes.
6. Use `preview/index.html` and `preview/style.css` only as references, not as the final implementation.

Implementation requirements:
- Match the original hierarchy section by section.
- Reuse exported assets from `assets/images` and `assets/fonts`.
- Preserve CTA order, sticky/fixed layers, and content hierarchy.
- Keep the page responsive across desktop, tablet, and mobile.
- Document any behavior or asset you cannot reproduce exactly.

Export mode: `full`.