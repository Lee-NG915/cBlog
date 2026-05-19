---
name: style-optimization
description: >-
  Optimizes cBlog UI and styles against the Color 手记 brand system (柔和、舒缓、学习、个人记录).
  Syncs lib/brand.ts, docs/brand-core.md, and /brand showcase when design tokens or visual
  language change. Use when polishing styles, Tailwind/CSS, component appearance, layout,
  typography, animations, design tokens, editorial patterns, or the brand page.
---

# 样式优化（品牌对齐）

每次样式优化必须先对齐品牌，再改代码；若改动触及组件风格或全站视觉语言，必须同步更新品牌文档与展示页。

## 品牌单一事实来源（必读）

动手前按顺序阅读：

| 优先级 | 文件 | 用途 |
|--------|------|------|
| 1 | `lib/brand.ts` | 运行时品牌配置（人格、语气、token 映射） |
| 2 | `docs/brand-core.md` | 品牌 Markdown 文档（与 ts 保持同步） |
| 3 | `tailwind.config.js` | 色彩、字体、阴影 token |
| 4 | `app/globals.css` | `editorial-*`、`prose`、`data-reveal`、工具类 |
| 5 | `app/layout.tsx` | 字体加载（Noto Serif SC / Noto Sans SC） |
| 6 | `app/brand/page.tsx` + `components/brand/*` | 品牌说明与组件样例合集 |

站点品牌页：`/brand` — 改完样式后确认样例仍准确。

## 品牌视觉速查（勿偏离）

**关键词**：柔和 · 舒缓 · 学习 · 个人记录

| 语义 | Token / 类 | 规则 |
|------|------------|------|
| 纸·底色 | `background-light` / `background-dark` | 暖米白，勿纯白刺眼 |
| 墨·文字 | `ink` / `ink-muted` / `ink-soft` | 层级靠透明度与字号 |
| 点缀 | `primary-*` | 陶土色：标签、徽章、引用左边框 |
| 安静 CTA | `accent-sage` | 主操作按钮 |
| 思考/链接 | `accent-blue` | `prose a`、信息强调 |
| 卡片 | `editorial-card` + `surface-*` + `line-*` | 轻边框、弱阴影 |
| 标题 | `font-display` | Noto Serif SC，`font-semibold` 为主 |
| 界面 | `font-sans` | Noto Sans SC，导航/元信息/按钮 |
| 长文 | `prose` + `font-serif` 正文 | 行高 ~1.95，留白充足 |
| 动效 | `data-reveal` + `RevealController` | 淡入上移，0.75s，忌弹跳/炫技 |

**禁止**（除非用户明确要求偏离品牌）：
- 新增强对比色、霓虹渐变、玻璃拟态堆叠
- 卡片 `hover` 大幅 `translate` 或强阴影跳变
- 英文全大写标签、`tracking-[0.18em]` 杂志感
- 绕过 token 写死 `#hex`（除 `globals.css` 中已有代码块底色等例外）
- 破坏 `/brand` 样例区的 `ShowcaseSandbox`（预览不可跳转）

## 工作流程

### Step 1：界定改动范围

```
局部样式 → 只改目标组件/页面，核对品牌速查表
组件模式  → 改 components/ + 检查是否需更新 /brand 样例
设计 token → 改 tailwind.config.js / globals.css + 必须品牌同步
全站气质  → 上述全部 + lib/brand.ts + docs/brand-core.md + /brand
```

### Step 2：实现样式

1. **优先复用**现有 token 与类：`editorial-card`、`editorial-label`、`editorial-pill`、`prose`
2. **标题**：`font-display` + `font-semibold`（非 `bold`，除非 Hero 特例）
3. **正文/元信息**：`font-sans`；`prose` 内段落保持 `font-serif`
4. **间距**：区块 `space-y-6`～`space-y-16`；卡片 `p-6`～`p-8`
5. **交互**：hover 改 `border-color` / `text-color`；避免 `-translate-y-*`
6. **动效**：新区块加 `data-reveal`；路由切换依赖 `RevealController`（`usePathname`）
7. **暗色**：所有颜色成对考虑 `dark:` 变体

### Step 3：品牌同步（条件触发）

满足**任一**条件时，必须执行 [brand-sync-checklist.md](brand-sync-checklist.md)：

- 修改 `tailwind.config.js` 的 `colors` / `fontFamily` / `boxShadow`
- 修改 `app/globals.css` 中 `@layer components` 或 `reveal` 相关规则
- 修改 `app/layout.tsx` 字体配置
- 新增/重命名全局 CSS 类（如 `editorial-*`）
- 调整组件视觉模式（卡片结构、按钮层级、标题字号体系）且会影响多处复用
- 用户明确要求「换风格 / 改品牌 / 整体改版」

同步最小集：

1. 更新 `lib/brand.ts`（`presentation`、`designSystemMapping`、必要时 `personality`）
2. 更新 `docs/brand-core.md` 对应章节
3. 更新 `components/brand/BrandComponentShowcase.tsx` 中受影响样例
4. 若文案语气变化，检查 `lib/site.ts` 与 `app/about/page.tsx`

### Step 4：验证

- [ ] 浅色/深色模式均可读
- [ ] 客户端路由切换后 `data-reveal` 内容可见
- [ ] 未引入裸 hex（除既有例外）
- [ ] `/brand` 样例与实现一致；样例仍在 `ShowcaseSandbox` 内
- [ ] `npm run build` 通过

## 常见改动映射

| 用户意图 | 主要修改 | 品牌同步 |
|----------|----------|----------|
| 调按钮/链接色 | 组件 class + 可能 `primary`/`accent` | token 变更 → 同步 |
| 调标题字号 | 页面/组件 `font-display` | 仅局部 → 样例可选更新 |
| 调文章阅读感 | `globals.css` `.prose` | 更新 brand mapping + md |
| 调首页/卡片 | `app/page.tsx` + `PostCard` 等 | 模式变更 → 同步 + /brand |
| 新组件样式 | `components/New.tsx` | 加入 BrandComponentShowcase 清单 |

## 输出要求

向用户说明时包含：

1. **改动范围**（局部 / 组件 / token / 全站）
2. **品牌对齐点**（引用了哪些品牌原则）
3. **是否已同步品牌文件**（列出已改文件）
4. **建议预览路径**（如 `/`、`/brand`、具体文章页）

## 附加资源

- 品牌同步清单：[brand-sync-checklist.md](brand-sync-checklist.md)
- 项目组件与 token 详表：见 `/brand` 页面「组件清单」章节
