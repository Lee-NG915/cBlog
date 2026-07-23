# 09 · AI 实践：Skill Harness 与修复流

> 依据 Joyboy `.agents/skills/*`、`AGENTS.md` AI Test Workflow、`docs/superpowers` Sentry AI routine、`docs/ai-specs/*`。  
> 这是简历差异化叙事：不是「会用 Copilot」，而是把正确性做成可执行治理。

一句话：Harness = Spec + 静态检查 + 门禁 +（可选）有界 AI 修复环；默认 analyze-only，出口是 PR，**人审 merge，从不自动上线**。

---

## Skill Harness 是什么？

Harness ≠ 单个 Chat Prompt。是领域「正确性」在 coding → commit → PR → production 各层可执行、可度量。

### 8 组件范式（harness-guide）

| # | 组件 | 回答的问题 | Observability 样板 |
| --- | --- | --- | --- |
| 1 | Spec | 什么叫正确？ | `docs/ai-specs/observability/*` |
| 2 | Static | 写代码时机器能否拦住？ | `eslint-plugin-observability` |
| 3 | Dynamic | 运行时测得到吗？ | beforeSend unit + Sentry E2E |
| 4 | Gate | 合入前能否挡住？ | lint-staged + observability-lint CI |
| 5 | Feedback | 对的人知道吗？ | IDE 红线、PR 评论、AI remediation |
| 6 | Evaluation | 合规能量化吗？ | coverage-scan / baseline metrics |
| 7 | Knowledge | 新人能否维护？ | AGENTS.md / INDEX / CHANGELOG |
| 8 | Evolution | 规则如何安全演进？ | Change Protocol / 版本 bump |

最小闭环：**Spec + Static + Gate** 就能停住新违规。  
Observability 是仓内 **8/8 样板**；Tracking 用 skill + ai-specs 强流程（偏 Knowledge/Feedback）。

### 分层执法（日常）

1. IDE ESLint  
2. pre-commit lint-staged  
3. session-end Stop Hook（`stop-review.sh`）  
4. on-demand `/alert-harness`  
5. CI `observability-lint.yaml`  

---

## alert-harness：对着 Live Sentry 的有界修复

范围：偏 `apps/web`；**默认 analyze-only（不改文件）**。

| Mode | 改代码 | Verify | 开 PR |
| --- | --- | --- | --- |
| analyze-only（默认） | 否 | 否 | 否 |
| fix | 是 | 是 | 否 |
| verify | 否 | 是 | 否 |
| pr / fix --with-pr | 视模式 | 视模式 | 是 |

### 主流程要点（Steps）

1. Load specs + `error-bucket.ts`  
2. MCP 拉 Sentry：`is:unresolved`，排除无价值 third_party；按影响排序  
3. 渐进取证（禁每个 issue 打满 API）；可选 `diff-issues` 增量  
4. **去重**：已有 ClickUp / 已有 PR → skip  
5. 推断 bucket、对照告警矩阵  
6. Auto-fix：ERR 可改；WARN 先问；**不碰** checkout/payment/cart 埋点、middleware Sentry  
7. Verify：`pnpm lint:observability`；影响 tag → `e2e:sentry-tags:server-capture`  
8. Commit + PR：`fixes ISSUE` **仅 PR title/body**；挂 ClickUp  
9. 结构化 report  

### Remediation loop

- 先 batch fix，再一次 verify  
- 最多 **3** 轮；空 diff / 硬规则失败 → **ESCALATE**  
- 脚本：`remediation-loop.mjs`、`log-metric.mjs`  

---

## 周更 Local Routine：Biz vs Baseline

都是 **setup skill**：生成 prompt，在 Claude Code Local Routine 注册；**不** auto-merge。

| | Baseline | Biz |
| --- | --- | --- |
| 目标 | 分类/上下文缺口等可观测性正确性 | 个人 assigned 业务/边界错误 |
| 执行 | 整段跑 `/alert-harness` | Dev + Reviewer 子 agent |
| 禁区 | — | **不改** `libs/shared/observability/**`、eslint-plugin 等 |
| 门禁 | lint/E2E | Rubric 四维打分；低分或 confidence&lt;70% → **停，走人审** |
| 出口 | PR + ClickUp 状态 | 同；Summary 写明 Next: human review merge |

设计意图：每周约处理有限 issue，复杂题跳过；biz 与 baseline **硬隔离**。

---

## 其它 AI Flow

### AGENTS.md：AI Test & Dual-AI

- 改 runtime 行为 → **同 patch 带测试**；跑不了也要写测并声明原因。  
- 交付必带 **AI Test Record**；中高风险再加 **AI Review Record**（Dual-AI）。  
- Review Gate：无测试且无例外说明 ≠ done。  
- 适用：checkout/payment/login、跨模块、异步等。

### tracking-event-ops

- 单向流强制；ADD/MODIFY 要人确认 + Diff Report。  
- 防 AI 直接改 trigger 导致多渠道口径漂移。  

### sentry-cli

- 查 issue / explain / plan 的工具手册，**不是**治理 harness 本身。  

### vercel-react-best-practices

- 性能/RSC 规则库，供 AI 改前端时对照（与 CWV 叙事可联动）。  

---

## 面试可以说 / 不要说

**可以说**

- 正确性 = Spec + ESLint + CI + Skill + 有界修复环  
- AI 默认只分析；显式才改；verify 有 lint/E2E；失败 ESCALATE  
- 周 routine 分流 biz/baseline；低置信度停；只开 PR  
- `fixes` 写在 PR 触发 Sentry resolve；人审 merge  

**不要说**

- 自动部署 / 无人审 merge  
- 默认就会改生产代码  
- 修了所有 Sentry / 全自动交易埋点  
- baseline 与 biz 同一套权限  
- Grafana SLO 已全靠 AI 闭环（观测与 AI 是两条线）  

---

## 口述稿

### 1 分钟

我们不是让 AI 随便修 bug，而是做 **Harness**：Spec 定义正确，ESLint/CI 拦住写错，再用 `/alert-harness` 对着线上 Sentry 做分类与有界修复——默认只分析，显式才改；lint 和必要时本地 Sentry E2E，最多三轮，失败就升级人工。业务 issue 另有每周 Local routine，估分不够就停，最后只开 PR，**合并仍是人**。

### 3 分钟

1. **范式**：8 层治理，Observability 是样板（ai-specs + eslint-plugin + E2E + CI）。  
2. **防错**：IDE → pre-commit → stop-hook → PR lint。  
3. **主动闭环**：MCP 拉高影响 issue → 对照 `error_bucket`/告警矩阵 → 补分类或 context → remediation-loop → 合格才 PR，并挂 ClickUp。  
4. **周自动化**：baseline=alert-harness；biz=业务修复且禁动 observability 核心。  
5. **编码规范**：同改同测 + Dual-AI Review Record；埋点走 tracking-event-ops。  
6. **边界**：无 auto-merge；交易 page instrumentation 仍有 blocked 半边；工具是 MCP/CLI，治理是 harness。  

---

## 与 03/05/06 的关系

| 模块 | AI 怎么接 |
| --- | --- |
| 可观测性 | alert-harness + baseline routine + eslint 硬规则 |
| 埋点 | tracking-event-ops（Diff Report、人确认） |
| 交易 | Dual-AI + 测试强制；**不**让 alert-harness 乱改 payment 埋点 |
| 性能 | 可引用 vercel-react-best-practices；INP attribution 仍是观测能力 |

---

## 高概率追问 → 要点

- Harness 和 Chat 改代码区别？→ 可执行 Spec/门禁/度量，有界重试与升级。  
- 如何防误修？→ analyze 默认、白名单、max 3、硬规则、人审、禁区。  
- 准确率怎么控？→ 去重已有 PR、E2E tag 门禁、Rubric/confidence、metrics.jsonl。  
- 和生产发布关系？→ 只到 PR；merge/release 人控。
