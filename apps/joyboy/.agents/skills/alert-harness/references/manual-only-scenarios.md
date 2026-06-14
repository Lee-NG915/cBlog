---
name: manual-only-scenarios
description: Scenarios where /alert-harness must not auto-fix — requires manual investigation or human judgment
type: reference
last-reviewed: 2026-05-18
version: 1.0.1
---

# Alert Harness — Manual-only Scenarios

These scenarios should not be auto-fixed by `/alert-harness`.

## 1) Production-state-only symptoms

- Issue reproducible only with real production CDN/frame layout
- Replay-only evidence required for classification confidence
- Action: collect Sentry Replay + escalate to manual investigation

## 2) Cross-team ownership boundaries

- Checkout/payment/cart migration blocked by hard rules
- Middleware/edge runtime capture requests
- Action: do not auto-fix; provide recommendations only

## 3) Non-deterministic environment failures

- Flaky external upstream behavior without deterministic repro
- Sentry MCP/network instability across all retries
- Action: stop after 3 identical failures and output ESCALATE report

## 4) Destructive or policy-sensitive operations

- Any action requiring force push / branch rewrite / history rewrite
- Bulk changes outside observability boundaries
- Action: require explicit human approval
