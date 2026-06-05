---
name: tracking-event-ops
description: Use when the user adds, modifies, renames, removes, or changes the trigger condition of a tracking event in libs/modules/tracking/** (GA / DY / FB CAPI / Klaviyo / Pinterest CAPI / UTT). For NEW events, outputs a 3-piece sync checklist (temp-docs + entity schema + trigger). For MODIFIED events, outputs a Diff Report with grep-based downstream impact, then pauses for human confirmation before applying changes. Trigger keywords include "add event", "新增埋点", "modify event", "改 category/label", "rename event", "改 tracking", "event payload 改".
---

# Tracking Event Ops

This skill enforces the tracking rules defined in `AGENTS.md` → "Tracking Module Rules". It covers two operations: **adding new events** and **modifying existing events**. Both pause for human confirmation before any code lands.

## When this skill fires

- User asks to add a tracking event to GA / DY / FB CAPI / Klaviyo / Pinterest CAPI / UTT.
- User asks to change an existing event's name, category, label, payload field, or trigger condition.
- User asks to remove a tracking event.
- User shows a screenshot of legacy tracking code and asks to migrate to the declarative event pattern.

## Conventions (project-specific)

- **Channels**: `ga` / `dy` / `fb-capi` / `klaviyo` / `pinterest-capi` / `utt`.
- **Event flow** (single direction, no shortcuts):
  ```
  UI component → domain/interaction event → tracking/listener → event trigger → 3rd-party channel
  ```
- **Co-location**: UI component and its interaction event live in the same module. Event payload carries every parameter the trigger needs (no store re-read, no UI re-query).
- **Three files per channel**, always referenced by these exact paths:
  | Concern | Path |
  | --- | --- |
  | Docs | `libs/modules/tracking/services/src/lib/temp-docs/{channel}.events.md` |
  | Schema | `libs/modules/tracking/services/src/lib/entity/{channel}-events.schema.ts` |
  | Trigger | `libs/modules/tracking/services/src/lib/triggers/*.trigger.ts` |
  | Listener | `libs/modules/tracking/services/src/lib/listeners/*-tracking.listener.ts` |

## Step 0 — Classify the request

Decide which branch to follow:

- **ADD** → new event constant not previously in the codebase. Go to _Add Flow_.
- **MODIFY** → event constant already exists (rename / payload change / trigger condition change / remove). Go to _Modify Flow_.
- **AMBIGUOUS** → ask the user one question to disambiguate (do not guess).

To verify whether an event already exists, grep the constant or category string:

```bash
rg -n "EVENT_<NAME>|'<category_string>'" libs/
```

## Add Flow

### A1. Ask for the trigger scenario (REQUIRED — do not infer)

Per `AGENTS.md` → "Trigger Scenario — Human-Confirmed", the trigger scenario must be human-confirmed. List candidates and ask:

- DOM event / lifecycle / store state change / route change / IntersectionObserver impression?
- Frequency: once-per-mount / on-change / debounced / throttled?
- Dedup: per-session / per-page-view / none?

Wait for the user to pick one. Do not proceed until confirmed.

### A2. Output the 3-piece sync checklist

Render this checklist for the user and confirm scope before writing any file:

```
### New Event Plan: <EVENT_CONST_NAME>
- Channel: <ga / dy / fb-capi / klaviyo / pinterest-capi / utt>
- Trigger scenario: <from A1, exact wording>
- Owning module: <e.g. libs/modules/cart>

Files to add/update:
1. Docs        — libs/modules/tracking/services/src/lib/temp-docs/<channel>.events.md
                 (append a new section: name / category / label / payload schema / trigger condition)
2. Schema      — libs/modules/tracking/services/src/lib/entity/<channel>-events.schema.ts
                 (add event constant + payload type)
3. Trigger     — libs/modules/tracking/services/src/lib/triggers/<existing-or-new>.trigger.ts
                 (map domain event → channel payload)
4. Domain event — libs/modules/<module>/domain/src/.../events/<name>.event.ts
                 (define interaction event, payload carries trigger args)
5. Listener    — libs/modules/tracking/services/src/lib/listeners/<scope>-tracking.listener.ts
                 (subscribe to domain event, call trigger)
6. UI dispatch — <component path>
                 (dispatch the domain event at the confirmed trigger point)
```

Wait for user "确认" / "go" / "ok" before writing.

### A3. Implementation order

When user confirms, write in this order so each step is type-checked by the previous:

1. Schema constant + type
2. Trigger function
3. Domain event
4. Listener subscription
5. UI dispatch
6. Docs entry (last, so it reflects what actually landed)

## Modify Flow

### M1. Locate the event and its downstream

Run a grep sweep across the repo. Report results before doing anything else.

```bash
# Find the event constant declaration
rg -n "EVENT_<NAME>" libs/modules/tracking/services/src/lib/entity/

# Find every caller (dispatch / listener / trigger / test)
rg -n "EVENT_<NAME>" libs/ apps/ packages/

# Find the docs entry
rg -n "<category_or_event_label>" libs/modules/tracking/services/src/lib/temp-docs/
```

If the event is referenced by `category` string instead of constant (legacy), also grep the literal string.

### M2. Output the Diff Report (REQUIRED — do not edit yet)

```
### Event Diff Report
- Event: <EVENT_CONST_NAME>
- Channel: <ga / dy / ...>
- Type: rename | payload-change | trigger-condition-change | remove
- Reason: <why this change is requested>

Before:
  name:        <const>
  category:    <...>
  label:       <...>
  payload:     { ...fields... }
  fired when:  <...>

After:
  name:        <const>
  category:    <...>
  label:       <...>
  payload:     { ...fields... }
  fired when:  <...>

Downstream callers (from grep):
  - libs/modules/<...>:<line>   <kind: dispatch | listener | trigger | test>
  - libs/modules/<...>:<line>   ...
  - (none)  ← state explicitly if grep found nothing

Impact:
  - Dashboards / funnels affected: <list if known, or "needs PM confirm">
  - Backward-compatible? <yes/no + reason>
  - Migration order: <e.g. update trigger first, then listener, then docs>
```

Wait for explicit "确认" / "ok to proceed" from user. Do not edit any file until then.

### M3. Apply changes per the report

Once confirmed, apply edits in this order:

1. Schema (rename / add / remove constant + type)
2. Trigger (update payload mapping)
3. Listener (update subscription if event name changed)
4. Domain event (update payload shape if needed)
5. UI dispatch sites (update all grep hits)
6. Docs (last)

After each step, surface a 1-line confirmation so the user can interrupt mid-flight if something looks off.

## Output style

- Reports above are mandatory deliverables — do not skip even if the change looks small.
- Use exact path strings from the Conventions table; do not paraphrase.
- For grep output, include `file:line` hits; do not summarize them away.
- Stay in `code` blocks for the templates so they render predictably.

## Anti-patterns to flag

If the user's request implies any of the below, stop and surface the concern before continuing:

- Directly importing a `trigger` function in a UI / hook (bypasses the event flow).
- Hand-rolling `_event: 'trackEvent'` payload in UI / store (bypasses schema).
- Adding new event without confirming trigger scenario (violates AGENTS.md "Trigger Scenario").
- Modifying a live event without producing the Diff Report (violates AGENTS.md "Diff Report").
- Co-locating an interaction event outside the owning UI module.

## Related

- Source of truth for these rules: `AGENTS.md` → "Tracking Module Rules".
- Cross-market awareness: if the modified event ships per-market, also invoke `multi-market-guard`.
- Domain change radius: if the event payload type changes, also invoke `api-change-check`.
