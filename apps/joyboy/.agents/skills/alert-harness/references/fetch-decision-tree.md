---
name: fetch-decision-tree
description: Progressive Sentry issue data fetch decision tree for MCP calls
type: reference
last-reviewed: 2026-04-22
version: 1.0.0
---

# Progressive Sentry Issue Fetch — Decision Tree

For each issue from `search_issues`, fetch additional data **only when necessary**.

## Stop Conditions

1. `search result` 中 `error_bucket` 已可见? → **STOP**，无需额外调用
2. `search result` 中 `domain` + `page_type` 已可见且清晰? → **STOP**
3. Classification 明确无误? → **STOP**

## Decision Flow

```
search_issues result
  │
  ├─ error_bucket visible and clear?
  │     └─ YES → STOP (no additional calls)
  │     └─ NO  → get_issue_tag_values(issue_id, "error_bucket")
  │
  ├─ culprit is a route (starts with "/")?
  │     └─ YES → get_issue_tag_values(issue_id, "domain")
  │                → get_issue_tag_values(issue_id, "page_type")
  │     └─ NO  → continue
  │
  ├─ classification seems wrong but can't confirm?
  │     └─ YES → search_issue_events(issue_id, limit=1)
  │                → inspect stack frames, message, errorName
  │     └─ NO  → continue
  │
  └─ root cause still unclear after frames?
        └─ YES → analyze_issue_with_seer(issue_id)
        └─ NO  → STOP
```

## Hard Rule

**Never call all four tag keys for every issue.** Fetch progressively — stop when enough evidence exists to make a classification judgment.

## Evidence Sufficiency Criteria

| What you need to judge  | Minimum evidence required                       |
| ----------------------- | ----------------------------------------------- |
| Correct `error_bucket`  | `error_bucket` tag OR issue title + message     |
| Correct `domain`        | `domain` tag OR `transaction` URL route segment |
| Correct `page_type`     | `page_type` tag OR route pattern match          |
| Classification mismatch | Inferred bucket ≠ actual `error_bucket` tag     |

If all three criteria are satisfied, no additional MCP calls are needed.
