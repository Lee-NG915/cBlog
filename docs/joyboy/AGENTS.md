# AGENTS.md

Castlery e-commerce monorepo — Nx workspace, pnpm, Next.js 14 App Router, TypeScript.

## Build / Lint / Test Commands

Package manager: **pnpm 9.15.4+** | Node: **v20.9.0** (see `.nvmrc`) | Nx: **20.4.5**

### Development

```bash
pnpm web:us          # Start web app (US region)
pnpm web:sg          # Start web app (SG region) — also :au, :ca, :uk
pnpm pos:us          # Start POS app (US region) — also :sg, :au, :ca, :uk
pnpm proxy:sb        # HTTPS proxy for Storyblok dev (7010 -> 7780)
```

## Project Structure

```
apps/
  web/              Next.js 14 customer-facing e-commerce site (App Router)
  web-e2e/          Playwright E2E tests for web
  pos/              Point-of-sale Next.js app
  pos-e2e/          Playwright E2E tests for POS
libs/
  fortress/         Internal design system (wraps MUI Joy)
  modules/          Domain-driven feature modules
    <domain>/
      components/   UI components (tag: type:components)
      domain/       Business logic, entities, types, Redux slices (tag: type:domain)
      services/     API calls, helpers, listeners (tag: type:services)
  shared/           Cross-domain shared utilities (components, redux, services, types, utils, config)
  config/           Environment configuration
packages/           Tooling (i18n, feature flags)
```

Domains: checkout, cms, composite, dy, order, others, payment, posthog, product, promotion, retails, search, tracking, user.

## Code Style

### Formatting (Prettier)

- Single quotes, semicolons, trailing commas (es5)
- 2-space indent, no tabs, 120 char print width
- Config: `.prettierrc`

### Imports

Order by convention (not enforced by ESLint rule):

1. React / Next.js framework imports
2. External libraries (`@reduxjs/toolkit`, `@mui/*`, `@sentry/*`, etc.)
3. Internal `@castlery/*` imports (fortress, then modules, then shared)
4. Relative imports

### Naming Conventions

| Element                    | Convention                          | Example                              |
| -------------------------- | ----------------------------------- | ------------------------------------ |
| Components                 | PascalCase function                 | `ProductCard`, `StarRate`            |
| Component files (modules)  | kebab-case                          | `product-card.tsx`, `star-rate.tsx`  |
| Component files (fortress) | PascalCase folders                  | `Typography/`, `Modal/`              |
| Utilities / helpers        | camelCase function, kebab-case file | `formatPrice` in `product.helper.ts` |
| Entities / types           | PascalCase                          | `Product`, `Variant`, `Taxon`        |
| Redux slices               | camelCase selectors/actions         | `selectProduct`, `changeVariant`     |
| APIs (RTK Query)           | camelCase                           | `productApi`                         |
| Test files                 | `.spec.ts` / `.spec.tsx` suffix     | `product.slice.spec.ts`              |
| Stories                    | `.stories.tsx` suffix               | `Badge.stories.tsx`                  |
| Server components          | `.server.tsx` suffix                | `header.server.tsx`                  |
| Client components          | `.client.tsx` suffix                | `cart.client.tsx`                    |

File suffixes by role: `.entity.ts`, `.slice.ts`, `.event.ts`, `.api.ts`, `.helper.ts`, `.listener.ts`, `.util.ts`

### ESLint Key Rules

- **Module boundaries** (`@nx/enforce-module-boundaries`): **error** — strictly enforced

#### Architecture Design (Clean Architecture + Shared/Composite Extensions)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Component Layer (UI)                           │
│  base ◄── shared ◄── regular ◄── composite ◄── cms                     │
│   │         │           │            │          │                       │
│   ▼         ▼           ▼            ▼          ▼                       │
├─────────────────────────────────────────────────────────────────────────┤
│                       Service Layer (API/Logic)                         │
│           shared ◄── regular ◄── composite                              │
│              │          │            │                                  │
│              ▼          ▼            ▼                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                       Domain Layer (State/Entity)                       │
│           shared ◄── regular ◄── composite                              │
│              │          │            │                                  │
│              ▼          ▼            ▼                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                       Foundation Layer                                  │
│                 util ──► config (config, types)                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Core Rules:**

1. **Vertical (层级)**: Component → Service → Domain → Foundation (上层依赖下层，不可反向)
2. **Horizontal - Shared**: 同层的 `shared-*` 被 `regular` 依赖，`shared-*` 不能依赖 `regular`
3. **Horizontal - Composite**: `composite-*` 可聚合多个 `regular` + `shared`，用于跨模块组合场景

**Dependency Matrix:**

| Source Tag                  | Can Depend On                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `type:base-components`      | (none) — pure design system                                                             |
| `type:shared-components`    | base-components, all services, all domains, util, config                                |
| `type:components`           | shared-components, base-components, all services, all domains, util, config             |
| `type:composite-components` | components, shared-components, base-components, all services, all domains, util, config |
| `type:cms-components`       | all components, all services, all domains, util, config                                 |
| `type:shared-services`      | all domains, util, config                                                               |
| `type:services`             | shared-services, all domains, util, config                                              |
| `type:composite-services`   | services, shared-services, all domains, util, config                                    |
| `type:shared-domain`        | util, config                                                                            |
| `type:domain`               | shared-domain, util, config                                                             |
| `type:composite-domain`     | domain, shared-domain, util, config                                                     |
| `type:config`               | config — foundation (config, types 互相依赖)                                            |
| `type:util`                 | util, config — 工具函数层                                                               |

**Scope Rules (Cross-Domain):**

- `scope:composite`: can depend on product, checkout, order, payment, promotion, retails, others
- `scope:cms` and `scope:search`: can depend on anything (\*)
- `no-console`: off
- `@typescript-eslint/no-unused-vars`: warn (ignoring `_` prefixed args/vars)
- `@typescript-eslint/no-non-null-assertion`: off

### State Management

- Redux Toolkit + RTK Query for global state and API caching
- SWR for some data fetching patterns
- react-hook-form + Zod for form state and validation

## Tracking Module Rules

Applies to any change in `libs/modules/tracking/**` or any tracking-event dispatch / trigger logic. These rules are enforced — bypassing them blocks PR review.

### Event Flow (单向，不可绕过)

```
UI component
    ↓ dispatch
domain / interaction event   ← defined in the OWNING UI module (see Co-location)
    ↓ subscribe
tracking/listener            ← libs/modules/tracking/services/src/lib/listeners/
    ↓ map & forward
event trigger                ← libs/modules/tracking/services/src/lib/triggers/
    ↓
3rd-party channel (GA / DY / FB CAPI / Klaviyo / Pinterest CAPI / UTT)
```

Reference commits:

- `1aa33ae97 refactor(coupon): route apply-coupon tracking via behavior event`
- `bdb40e1e4 refactor(tracking): route UTT conversion via declarative event`
- `dd81c6af4 refactor(tracking): route shipping selector via per-domain interaction events`

**Anti-patterns** (禁止):

- Importing a trigger function directly inside a UI component or hook.
- Hand-rolling `_event: 'trackEvent'` payload inside UI / store.
- Reading store state inside a listener / trigger to fill missing payload fields.

### Co-location

UI component and its interaction event live **in the same module**. Event payload carries every parameter the trigger needs.

| Module   | Event location                                       |
| -------- | ---------------------------------------------------- |
| cart     | `libs/modules/cart/domain/src/lib/events/*.event.ts` |
| checkout | `libs/modules/checkout/domain/src/event/*.event.ts`  |
| product  | `libs/modules/product/domain/src/event/*.event.ts`   |
| search   | `libs/modules/search/domain/src/event/*.event.ts`    |

### Three-File Sync (新增事件)

Adding an event = **all three files** updated in the same PR:

| Concern  | Path                                                                       |
| -------- | -------------------------------------------------------------------------- |
| Docs     | `libs/modules/tracking/services/src/lib/temp-docs/{channel}.events.md`     |
| Schema   | `libs/modules/tracking/services/src/lib/entity/{channel}-events.schema.ts` |
| Trigger  | `libs/modules/tracking/services/src/lib/triggers/*.trigger.ts`             |
| Listener | `libs/modules/tracking/services/src/lib/listeners/*-tracking.listener.ts`  |

Channels: `ga` / `dy` / `fb-capi` / `klaviyo` / `pinterest-capi` / `utt`.

### Diff Report (修改 / 重命名 / 删除事件)

Modifying a live event requires a **Diff Report** posted in the PR description **before** any code lands. Template:

```
### Event Diff Report
- Event:    <EVENT_CONST_NAME>
- Channel:  <ga / dy / ...>
- Type:     rename | payload-change | trigger-condition-change | remove
- Reason:   <why>

Before / After:
  name / category / label / payload / fired-when

Downstream callers (from `rg`):
  - <file:line>  <dispatch | listener | trigger | test>

Impact:
  - Dashboards / funnels affected: <list or "needs PM confirm">
  - Backward-compatible? <yes/no + reason>
```

Wait for **explicit human confirmation** before applying.

### Trigger Scenario — Human-Confirmed

The "fired when" condition for any new event is **human-confirmed**, not inferred from legacy code or screenshots. List candidate scenarios (DOM event / lifecycle / IntersectionObserver / store-state change / route change; once-per-mount / on-change / debounced; dedup window) and wait for a pick before writing code.

### AI-Assisted Flow

For AI collaborators: invoke the `tracking-event-ops` skill (see `.agents/skills/tracking-event-ops/`) when adding or modifying tracking events. It enforces the steps above and prints the templates.

## Multi-Market Deployment

The web app deploys to **SG / CA / AU / US / UK**. Changes to `libs/shared/**`, `libs/modules/*/domain/**`, or any cross-market config must consider per-market behavior before merging. For AI collaborators: invoke the `multi-market-guard` skill.
