# Contributing to eslint-plugin-observability

## 添加/修改规则 Checklist

修改任何规则前，逐项确认：

### 1. 规则实现

- [ ] 规则文件: `rules/<rule-name>.js`
- [ ] 在 `index.js` 注册规则
- [ ] `meta.messages` 包含清晰的错误信息

### 2. 测试

- [ ] 在 `tests/rules.test.js` 添加 valid + invalid cases
- [ ] 运行: `node tools/eslint-plugin-observability/tests/rules.test.js`
- [ ] 所有测试通过

### 3. 配置

- [ ] `apps/web/.eslintrc.json` 添加规则配置 (severity + file overrides)
- [ ] 如需 critical path 升级为 error，在 overrides 中指定文件 pattern

### 4. 文档更新

- [ ] `CHANGELOG.md` 添加变更记录
- [ ] `.agents/skills/alert-harness/README.md` 更新规则表
- [ ] `.agents/skills/alert-harness/references/checks.md` 更新 Violation→Fix Mapping
- [ ] 如涉及新 Hard Rule: 更新 `CLAUDE.md` § Observability Hard Rules（唯一权威源）
- [ ] 若改动客户端 `beforeSend`、envelope tag 或相关可观测性契约：同步 `shared-observability` 单测与/或 `web-e2e` `sentry-tags` 流程 — 见 `.agents/skills/alert-harness/README.md` § Dynamic Verification

### 5. 验证

- [ ] `pnpm lint:observability` 无误
- [ ] 本地 ESLint 跑一遍 `npx eslint apps/web --ext .ts,.tsx 2>&1 | grep "observability/"` 确认无意外 error

### 6. Coverage Baseline

- [ ] 如果本次改动新增了 `page.tsx` / `layout.tsx` 的 Sentry context 接入，更新 baseline：

  ```bash
  bash scripts/coverage-scan.sh --ci > metrics/baseline.json
  ```

- [ ] 提交 `metrics/baseline.json` 变更
