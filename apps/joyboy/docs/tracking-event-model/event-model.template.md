# Tracking Event Model Template

> Copy this template when adding a new event or changing an existing event. Keep the event definition focused on the business event first, then document channel-specific mappings separately.

## 1. Event Summary

| Field               | Value                                                                |
| ------------------- | -------------------------------------------------------------------- |
| Business event name | `<domain>_<action>[_<object>]`                                       |
| Event status        | `draft` / `active` / `deprecated`                                    |
| Event category      | `cart` / `checkout` / `order` / `consent` / `customer` / `marketing` |
| Owner               | `<team/person>`                                                      |
| First introduced    | `<YYYY-MM-DD>`                                                       |
| Last updated        | `<YYYY-MM-DD>`                                                       |
| Related ticket / PR | `<link>`                                                             |

## 2. Business Definition

### Purpose

<!-- Why do we need this event? What business or analytics question does it answer? -->

`<Describe the reason this event exists.>`

### User action or system action

<!-- Describe the action in product language, not implementation language. -->

`<Example: A customer adds a sellable product variant to cart.>`

### Trigger timing

<!-- Be explicit about when the event should fire. -->

| Question                                           | Answer                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| When does it fire?                                 | `<after cart mutation succeeds / after payment succeeds / when consent is accepted>` |
| What confirms success?                             | `<domain event / API response / order state / consent state>`                        |
| Should failed attempts emit this event?            | `yes / no`                                                                           |
| Can this event fire more than once in one session? | `yes / no`                                                                           |
| If repeatable, what makes each event unique?       | `<cart item id / order id / event id / timestamp + action>`                          |

### Non-goals

<!-- Clarify what this event should not represent. -->

- `<This event does not represent ...>`
- `<Use another event when ...>`

## 3. Event Boundary

### Source of truth

| Field                  | Value                                                        |
| ---------------------- | ------------------------------------------------------------ |
| Primary source         | `frontend` / `BFF` / `domain event` / `server-side job`      |
| Source event / command | `<domain event, action, API, or state transition>`           |
| Emitting layer         | `UI` / `application service` / `tracking trigger` / `server` |
| Deduplication key      | `<event_id / order_id / cart_action_id / not applicable>`    |

### Boundary rules

- Emit this event only after `<success condition>`.
- Do not emit this event from `<places that would duplicate or bypass the source of truth>`.
- If the same business action maps to multiple platforms, keep one business event definition and document each platform mapping in Section 6.

## 4. Event Payload Schema

### Required properties

| Property          | Type                    | Required | Source     | Example                    | PII / Sensitive | Notes                                              |
| ----------------- | ----------------------- | -------- | ---------- | -------------------------- | --------------- | -------------------------------------------------- |
| `event_id`        | `string`                | yes      | `<source>` | `01J...`                   | no              | Stable id for deduplication when applicable.       |
| `event_time`      | `ISO string` / `number` | yes      | `<source>` | `2026-05-14T08:00:00.000Z` | no              | Use one timestamp standard consistently per event. |
| `<property_name>` | `<type>`                | yes      | `<source>` | `<value>`                  | `yes/no`        | `<notes>`                                          |

### Optional properties

| Property          | Type     | Source     | Example   | PII / Sensitive | When present  | Notes     |
| ----------------- | -------- | ---------- | --------- | --------------- | ------------- | --------- |
| `<property_name>` | `<type>` | `<source>` | `<value>` | `yes/no`        | `<condition>` | `<notes>` |

### Property rules

- Use stable business identifiers over display labels when both exist.
- Do not include PII unless the destination requires it and consent rules allow it.
- Document currency and money fields together, including whether values are tax-inclusive or discount-inclusive.
- Document array item schema separately when the event contains product, cart, or order items.

### Item schema, if applicable

| Property   | Type     | Required | Source     | Example   | Notes                               |
| ---------- | -------- | -------- | ---------- | --------- | ----------------------------------- |
| `item_id`  | `string` | yes      | `<source>` | `SKU-123` | `<notes>`                           |
| `quantity` | `number` | yes      | `<source>` | `2`       | `<notes>`                           |
| `price`    | `number` | yes      | `<source>` | `1299`    | Clarify minor units vs major units. |

## 5. Privacy, Consent, and Compliance

| Question                           | Answer                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Does this event contain PII?       | `yes / no`                                                               |
| PII fields                         | `<email / phone / address / user id / none>`                             |
| Consent required?                  | `yes / no`                                                               |
| Consent source                     | `<cookie consent / account setting / checkout consent / not applicable>` |
| Market-specific constraints        | `SG / CA / AU / US / UK / none`                                          |
| Hashing or normalization required? | `<rules>`                                                                |
| Data retention concern             | `<rules or not applicable>`                                              |

## 6. Destination Mapping

> Keep the business event stable. Add one row per destination event mapping.

| Destination    | Destination event name | Sent from       | Required fields | Optional fields | Deduplication  | Notes     |
| -------------- | ---------------------- | --------------- | --------------- | --------------- | -------------- | --------- |
| GA4            | `<event_name>`         | `client/server` | `<fields>`      | `<fields>`      | `<key or n/a>` | `<notes>` |
| Meta CAPI      | `<event_name>`         | `server`        | `<fields>`      | `<fields>`      | `<event_id>`   | `<notes>` |
| DY             | `<event_name>`         | `client/server` | `<fields>`      | `<fields>`      | `<key or n/a>` | `<notes>` |
| Klaviyo        | `<event_name>`         | `server`        | `<fields>`      | `<fields>`      | `<key or n/a>` | `<notes>` |
| Pinterest CAPI | `<event_name>`         | `server`        | `<fields>`      | `<fields>`      | `<event_id>`   | `<notes>` |

### Destination-specific transformations

| Destination     | Source property     | Destination property     | Transformation                                     |
| --------------- | ------------------- | ------------------------ | -------------------------------------------------- |
| `<destination>` | `<source_property>` | `<destination_property>` | `<rename / format / hash / normalize / calculate>` |

## 7. Implementation References

| Area                   | Reference               |
| ---------------------- | ----------------------- |
| Domain event / trigger | `<file path or symbol>` |
| Tracking service       | `<file path or symbol>` |
| Destination adapter    | `<file path or symbol>` |
| Tests                  | `<file path or symbol>` |
| Dashboard / report     | `<link>`                |

## 8. QA Checklist

- [ ] Event fires only after the documented success condition.
- [ ] Event does not fire for failed or cancelled flows unless explicitly documented.
- [ ] Event does not duplicate across UI, BFF, and server-side triggers.
- [ ] Required properties are present in test data.
- [ ] Optional properties are present only under documented conditions.
- [ ] Money and currency fields match destination expectations.
- [ ] PII fields follow consent, hashing, and normalization rules.
- [ ] Destination mappings have been verified in test or debug tools.
- [ ] Existing dashboards, audiences, or automations affected by the change have been checked.

## 9. Change Impact

Use this section when modifying an existing event.

| Change type                   | Applies? | Notes                                           |
| ----------------------------- | -------- | ----------------------------------------------- |
| New event                     | `yes/no` | `<notes>`                                       |
| Rename event                  | `yes/no` | `<old name -> new name>`                        |
| Add property                  | `yes/no` | `<property and reason>`                         |
| Remove property               | `yes/no` | `<property and impact>`                         |
| Change property meaning       | `yes/no` | `<old meaning -> new meaning>`                  |
| Change trigger timing         | `yes/no` | `<old timing -> new timing>`                    |
| Change destination mapping    | `yes/no` | `<destination and impact>`                      |
| Requires downstream migration | `yes/no` | `<dashboard, audience, automation, data model>` |

## 10. Changelog

| Date           | Author   | Change           | Reason  | Impact                      |
| -------------- | -------- | ---------------- | ------- | --------------------------- |
| `<YYYY-MM-DD>` | `<name>` | `<what changed>` | `<why>` | `<who or what is affected>` |

## 11. Open Questions

- `<Question 1>`
- `<Question 2>`

## References

This template is adapted from common tracking-plan and schema-as-code patterns:

- Segment Tracking Plan concepts: event names, properties, validation, and planned vs. unplanned events.
- Snowplow tracking plan and Iglu schema patterns: schema ownership, versioning, and explicit event specifications.
- Product analytics tracking plan practices from Amplitude and KISSmetrics: business purpose, naming, ownership, QA, and lifecycle management.
