---
name: ec-fe-clickup
description: >
  EC-FE team ClickUp workflow helper. Use when the user wants to create tasks,
  create GitHub branches from tasks, move tasks through the workflow, query sprint status,
  check OKRs, or manage any EC / EC-FE ClickUp items. Triggered by phrases like
  "create a clickup task", "create task", "create branch", "create github branch",
  "add to backlog", "move to requirements", "add to sprint", "show sprint tasks",
  "who's working on X", "clickup OKR", or invokes /ec-clickup.
---

# EC ClickUp Workflow

Context-aware ClickUp operations for the EC-FE team. All IDs below are stable — use them directly without looking up.

---

## Team: EC-FE Members

| username     | ClickUp User ID | Email                     |
| ------------ | --------------- | ------------------------- |
| rick-gao     | 32270854        | rick.gao@castlery.com     |
| abby-wang    | 63129899        | abby.wang@castlery.com    |
| carl-zhang   | 61636024        | carl.zhang@castlery.com   |
| jasper-zhang | 89412632        | jasper.zhang@castlery.com |
| color-li     | 89574607        | color.li@castlery.com     |

---

## Workspace Structure

| Location               | List ID      | Purpose                                      |
| ---------------------- | ------------ | -------------------------------------------- |
| 📋 Product Backlog     | 901807951861 | All new tasks land here first                |
| Requirements           | 901808093884 | Tasks after FE team review & scope confirmed |
| 📋 Sprint Backlog      | 901808195842 | Groomed tasks ready to enter a sprint        |
| EC Sprint 23 (current) | 901816561688 | 4/6 – 4/19 active sprint                     |
| EC Sprint 24           | 901816847856 | 4/20 – 5/3                                   |
| EC Sprint 25           | 901817055661 | 5/4 – 5/17                                   |
| EC Sprint 26           | 901817165888 | 5/18 – 5/31                                  |
| OKRs                   | 901807945752 | Q1 FY26 EC OKRs (onsite / offsite / retail)  |
| Order Refactoring      | 901808518896 | ORP Phase 2 & 3 epics and stories            |
| FE Refactoring         | 901808352655 | FE-specific tech debt & refactoring tasks    |

- **Space ID:** `90184288875` (Product & Engineering)
- **Workspace ID:** `3607486`

---

## Task Status Lifecycle

```
Open → in design → ready for sprint → in progress → in test → ready for release → released
```

| Status            | Meaning                                         |
| ----------------- | ----------------------------------------------- |
| Open              | Created, not yet scoped                         |
| in design         | UX/PM scoping in progress                       |
| ready for sprint  | Scoped and groomed, can be pulled into a sprint |
| planned           | Assigned to a future sprint but not started     |
| in progress       | FE actively working                             |
| in test           | QA testing                                      |
| ready for release | QA passed, pending deployment                   |
| released          | Live in production                              |
| resolved          | Closed / won't fix                              |

---

## Workflow: How Tasks Move

### Stage 1 — New Task → Product Backlog

- Create in **Product Backlog** (`901807951861`), status `Open`, tag `fe`
- Assign to the relevant FE member using their numeric ID

### Stage 2 — After FE Review → Requirements

- Add to **Requirements** (`901808093884`)
- Remove from Product Backlog
- Update status to `in design` (if design needed) or `ready for sprint` (if scoped)

### Stage 3 — Sprint Planning → Sprint Backlog

- Add to **Sprint Backlog** (`901808195842`)
- Remove from Requirements
- Status: `ready for sprint`

### Stage 4 — Active Sprint

- Add to the current sprint list (e.g., `901816561688` for Sprint 23)
- Remove from Sprint Backlog
- Update status to `in progress` when work begins → `in test` when handed to QA

### Moving between lists (ClickUp keeps multi-list by default — always remove old)

```
clickup_add_task_to_list(task_id, new_list_id)
clickup_remove_task_from_list(task_id, old_list_id)
clickup_update_task(task_id, { status: "<new_status>" })
```

---

## Required Custom Fields

**Always set on every task** (fixed values for EC-FE):

| Field         | Field ID                               | Value     | Option ID                              |
| ------------- | -------------------------------------- | --------- | -------------------------------------- |
| Business Line | `3ec2df9e-2049-4843-9cd1-79bd5d134a28` | Ecommerce | `68a22c97-3329-4bfc-a332-e70ea0145f86` |
| 👨‍💻 Tech Team  | `66de2a1c-adb7-417b-b248-0ff6b212471b` | EC FE     | `bb6817e9-8f67-45f4-bec0-7aed3f30bc5d` |

**Ask the user before setting** (context-dependent):

| Field      | Field ID                               | Options                                                                                                                           |
| ---------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 📅 Quarter | `091099bd-a31d-41e4-843d-66ed3737fdd6` | FY26 Q1 (Apr-Jun) = `5931c3ec-...` / FY26 Q2 (Jul-Sep) = `38bf8787-...` / FY26 Q3 (Oct-Dec) = `95231a3e-...`                      |
| 🏉 Squad   | `f604b574-9da6-4ac0-a870-83c5a535b108` | Onsite = `90af00df-...` / Offsite = `5e7c946f-...` / Retail = `694a8c00-...` / Fulfillment = `4e9b098e-...` / QA = `ff677735-...` |

> **Note:** For pure tech-debt or engineering-practice tasks (e.g. CI/CD improvements, code-style changes, AI workflow refinements) where no product squad is directly involved, leave **Squad empty**. Set `Requirement Type` to `Tech` instead.

**Optional fields** (set when relevant):

| Field               | Field ID                               | Useful Values                                                                                |
| ------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| 📚 Requirement Type | `198d5223-7543-4140-b27f-b9bc71975eb4` | Tech = `87ca950b-b689-47ea-ad05-411cb041b642` / Biz = `619f99a6-96c2-431e-a353-95b83168a230` |
| 📅 Monthly Plan     | `51f98b9f-9166-4b97-bb8d-9817c2a185f3` | Apr 2026 = `79daab21-...` / May = `2d978b1d-...` / Jun = `0cea4743-...`                      |
| Health Check        | `52f9de4a-bf46-4dbb-a7f4-1f614a7eeb3a` | On Track = `48dc0726-...` / At Risk = `8079a180-...`                                         |
| 🚀 Release Date     | `a9ce9120-a0ce-49e2-8cd0-343feafc530b` | YYYY-MM-DD                                                                                   |

---

## Common Operations

### Create a new FE task

Always set Business Line + Tech Team. Ask the user for Quarter and Squad before creating:

```
clickup_create_task(
  list_id: "901807951861",
  name: "<task title>",
  assignees: [<member_id>],
  status: "Open",
  tags: ["fe"],
  custom_fields: [
    { id: "3ec2df9e-2049-4843-9cd1-79bd5d134a28", value: "68a22c97-3329-4bfc-a332-e70ea0145f86" },  // Business Line: Ecommerce (fixed)
    { id: "66de2a1c-adb7-417b-b248-0ff6b212471b", value: "bb6817e9-8f67-45f4-bec0-7aed3f30bc5d" },  // Tech Team: EC FE (fixed)
    { id: "091099bd-a31d-41e4-843d-66ed3737fdd6", value: "<confirm with user: which quarter?>" },    // Quarter (context-dependent)
    { id: "f604b574-9da6-4ac0-a870-83c5a535b108", value: "<confirm with user: which squad?>" }       // Squad (context-dependent, may be omitted)
  ]
)
```

### Move task to Requirements (after review)

```
clickup_add_task_to_list(task_id, "901808093884")
clickup_remove_task_from_list(task_id, "901807951861")
clickup_update_task(task_id, { status: "ready for sprint" })
```

### Pull task into current sprint (Sprint 23)

```
clickup_add_task_to_list(task_id, "901816561688")
clickup_remove_task_from_list(task_id, "901808195842")
clickup_update_task(task_id, { status: "in progress" })
```

### Query all EC-FE team tasks

```
clickup_filter_tasks(
  space_ids: ["90184288875"],
  assignees: ["32270854", "63129899", "61636024", "89412632", "89574607"]
)
```

### Show current sprint tasks for EC-FE

```
clickup_filter_tasks(
  list_ids: ["901816561688"],
  assignees: ["32270854", "63129899", "61636024", "89412632", "89574607"]
)
```

### Look up EC onsite OKRs

```
clickup_filter_tasks(
  list_ids: ["901807945752"],
  tags: ["onsite"]
)
```

### Create GitHub branch from ClickUp task

ClickUp GitHub integration auto-generates branch names using the team-configured template:

```
:username:/:taskId:/:taskName:
```

**Result format:** `<username>/CU-<task_id>/<Task-Name-With-Dashes>`

**Examples:**

- carl-zhang/CU-86ex8218p/Fixed-Menu-Bar-Component
- `jasper-zhang/CU-86ex81u6q/PDP-Hierarchy1-Product-Information`

**When creating manually**, follow the same format. Spaces in task names become dashes; keep original casing.

### Create branch when no task exists yet

If the user asks to create a branch but does not provide a ClickUp task ID:

1. **Ask**: "Do you have an existing ClickUp task for this work?"
2. **If yes**: Ask for the task ID, then proceed with branch creation.
3. **If no**: Offer to create a ClickUp task first (use "Create a new FE task" above), then create the branch using the new task's ID.

> Every branch should map to a ClickUp task. Do not create orphan branches.

---

## Notes & Gotchas

- **Never guess user IDs** — always use the team table above for EC-FE members.
- **Current sprint is Sprint 23** (4/6–4/19). Check sprint dates before adding tasks; use Sprint 24 for work starting after 4/19.
- **Always remove from old list** after adding to a new one — ClickUp keeps tasks in multiple lists otherwise, causing duplicates in views.
- **Status must match list context**: Sprint Backlog → `ready for sprint`; active sprint start → `in progress`; FE done → `in test`.
- **OKR list is read-only**: Do not create or delete tasks in `901807945752` unless explicitly asked. OKRs are managed by PM/leadership.
- **Order Refactoring tasks**: Use list `901808518896`. Primary FE assignees are Abby (63129899) and Color (89574607) for ORP Phase 2 & 3.
- **Rick is tech lead**: Rick (32270854) typically reviews tasks before they move to Requirements, not assigned to sprint feature tasks directly.
