# 品牌同步清单

当样式优化触及 **设计 token**、**全局 CSS 类**、**组件视觉模式** 或 **全站气质** 时，逐项勾选。

## A. 代码与设计系统

- [ ] `tailwind.config.js` — `colors` / `fontFamily` / `boxShadow` 与品牌语义一致
- [ ] `app/globals.css` — `editorial-*`、`prose`、`reveal`、`showcase-sandbox` 已更新
- [ ] `app/layout.tsx` — 字体变量与 `body` 默认 `font-sans` 正确
- [ ] 组件无新增裸 hex（搜索 `#` 在 `components/`、`app/` 中排查）
- [ ] 暗色模式 `dark:` 成对完整

## B. 品牌文档（单一事实来源）

- [ ] `lib/brand.ts`
  - [ ] `presentation` 反映新的展现形式
  - [ ] `designSystemMapping` 增删改 token 行
  - [ ] 若气质变化，检查 `personality` / `voice`
- [ ] `docs/brand-core.md` — 与 `lib/brand.ts` 内容一致（表格与列表同步）

## C. 品牌展示页

- [ ] `app/brand/page.tsx` — 叙述与设计系统表无过时描述
- [ ] `components/brand/BrandComponentShowcase.tsx`
  - [ ] 组件清单表含新增/重命名组件
  - [ ] 色板 / 排版样例反映新 token
  - [ ] 受影响组件样例已更新
  - [ ] 可点击样例仍包裹在 `ShowcaseSandbox` 内

## D. 站点文案（若语气或定位变化）

- [ ] `lib/site.ts` — `description`、分类 `description`
- [ ] `app/about/page.tsx` — 与品牌本质一致

## E. 验证

- [ ] 本地预览 `/brand` 与改动页面
- [ ] `npm run build` 成功
- [ ] 客户端路由跳转后内容可见（`RevealController`）

## 同步模板（designSystemMapping 新行）

```ts
{
  brand: "语义 · 简短名",
  token: "tailwind-token 或 CSS 类",
  value: "色值或参数量",
  usage: "在哪些组件/页面使用",
},
```

## 何时可跳过品牌同步

仅当**同时满足**：

- 只改单个页面的一次性 spacing/class，不形成可复用模式
- 未动 `tailwind.config.js`、`globals.css` 的 `@layer components`、字体
- 不改变 token 语义（仍用现有 `primary`、`ink` 等）

即便如此，若改动与品牌「避免」项冲突（如强 hover 位移），应修正为品牌友好实现，而非跳过。
