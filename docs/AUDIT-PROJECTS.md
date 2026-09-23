# Projects Module Audit — Projects List + Project Profile

Read-only audit. No code was changed to produce this document. Scope: `/projects` (list) and `/projects/$id` (profile), including every tab, sub-view, dialog and drawer reachable from them. Judged from the perspective of the **owner of a CCTV installation company** whose real projects run: site survey → quotation → approval → procurement → installation → testing/commissioning → handover → warranty/AMC.

Files inspected: `src/routes/projects.index.tsx`, `src/routes/projects.$id.tsx`, `src/lib/mock-data.ts`, `src/lib/data-context.tsx`, `src/lib/format.ts`, `src/components/app/common.tsx`.

---

## PART A — What Exists

### A1. Projects (list) page layout, top to bottom

1. **Header**: eyebrow "Portfolio Command", title "Projects", subtitle `"{N} active engagements · {QAR value} contract value under management across Qatar."`, two actions: **Export** (CSV download) and **+ New Project** (opens a create dialog).
2. **KPI strip** — 6 `StatTile`s: Active, At Risk, Delayed, Awaiting Materials, Ready for Handover, Completed.
3. **Filter bar**: free-text Search (name/number), Phase select (dynamic, built from whatever phases exist in current data), Health select (fixed list: On Track/Watch/At Risk/Awaiting Materials/Delayed), and a view switcher (Grid / Table / Kanban / Timeline) right-aligned.
4. **Body**: one of four views of the same filtered project set — card Grid, a data Table, a Kanban board grouped by phase, or a Timeline list. No pagination anywhere (dataset is small — 4 seed projects).
5. **Empty state**: "No projects match your filters" shown when the filtered set is empty.
6. **New Project dialog**: name, customer, site (auto-scoped to the chosen customer), contract value, project manager, planned start/end.

### A2. Interaction map — Projects list

| Element | Location | What it appears to do | What it ACTUALLY does | Status |
|---|---|---|---|---|
| Search input | Filter bar | Filter the list by name/number | Filters `filtered` (grid/table/kanban/timeline) correctly | WORKING |
| Phase select | Filter bar | Filter by phase | Filters correctly; options are only phases currently present in data | WORKING |
| Health select | Filter bar | Filter by health label | Filters correctly | WORKING |
| View switcher (Grid/Table/Kanban/Timeline) | Filter bar | Change layout | Switches correctly | WORKING |
| **KPI tiles (all 6)** | Top strip | Reflect the current (filtered) view | Computed from the **unfiltered** full project list (`withHealth`), not from `filtered` — never change when you search or filter | **PARTIAL (misleading)** |
| Export | Header | Export visible projects | Downloads a real CSV of the currently `filtered` set (this one DOES respect filters, unlike the KPI tiles above) | WORKING |
| + New Project | Header | Create a project | Opens a fully controlled form; on submit calls the real `addProject` mutator, navigates to the new project's profile | WORKING |
| Grid card (whole card) | Grid view | Open project | Navigates to profile | WORKING |
| Table row | Table view | Open project | Navigates to profile | WORKING |
| Kanban card | Kanban view | Open project | Navigates to profile | WORKING |
| Timeline row | Timeline view | Open project | Navigates to profile | WORKING |
| "Next" task line on grid card | Grid card | Show the next actionable task | Picks the first task whose status is not `"Ready"` — this can surface an already-`"Completed"` task as "Next" since the filter never excludes `Completed` | PARTIAL (logic gap) |

### A3. Data fields shown per project on the list

| Field | Source | Notes |
|---|---|---|
| Number, Name | `project.number` / `.name` | Hardcoded seed (or user-entered via New Project) |
| Client name | `customers.find(id===customerId).name` | Joined, not duplicated |
| Site name | `sites.find(id===siteId).name` | Joined |
| Project Manager | `employees.find(id===pmId).name` | Joined |
| Phase (`StatusPill`) | `project.phase` | Raw seed enum value |
| Health (`HealthBadge`) | `computeHealth(project, approvals, devices, materials)` | **Calculated** from `plannedProgress`/`actualProgress` deltas, pending critical approvals, failed device tests, undelivered critical materials — recalculated on every render, not stored |
| Status (`WorkStatusBadge`, e.g. "In Progress") | `projectStatus(project, health.label)` | **Calculated**, derived from `phase` first, falling back to `health.label` |
| Value | `project.contractValue` | Hardcoded seed number, **excludes `approvedVariations`** |
| Material tile | `materialStatus(materials filtered by projectId)` | Calculated from real (seed) material records |
| Cameras tile (`installed/total`) | `devices filtered by projectId`, `!== "Faulty"` count | Calculated — but see Part B, most projects have **zero** device records |
| Planned start/end | `project.plannedStart/.plannedEnd` | Hardcoded seed dates |

### A4. Project Profile — layout, tabs, actions, fields

**Header (Layer 1 — Identity):** number chip, Health badge, Phase pill, conditional "High Priority" pill (shown when `plannedProgress − actualProgress > 10`), project name, Customer/Site/PM/"Type: CCTV Installation" line, 4 mini-stats (Value = `contractValue + approvedVariations`, Project status, Planned end + days-left, Materials).

**Header actions:** Update Project (real edit dialog: name/phase/plannedEnd/contractValue), Add Task / Add Site Report / Client Update (all jump to the relevant tab), and a "More" menu: Progress Report (real `window.print()`), Upload Document (jumps to Docs tab and — via the tab's own button — really uploads), Add Issue (toast only, no issues entity exists), Add Variation (jumps to Variations tab), Schedule Visit (jumps to Site Activity tab), Handover Checklist (jump), Archive Project (confirmation dialog → sets `phase` to `"Cancelled"`).

**Layer 2 — Command Summary Strip (6 tiles):** Project Status, Schedule (`daysLeft` = calendar days from **the real current date** to `plannedEnd`), Material Status, Cameras Installed, Tests Passed, Collected. Each tile navigates to its related tab.

**Layer 3/4 — Section nav → sub-tabs:**

| Section | Sub-tabs | Contents / actions |
|---|---|---|
| Overview | Summary | Health Drivers list, Status mini-cards (Project/Materials/Testing), Milestones list (no actions) |
| Execution | Scope & BOQ | Read-only table sourced from the linked **quotation's** line items |
| | Tasks | Full CRUD: Add (dialog), inline status change (Select), Delete (confirm dialog) |
| | Timeline | A "Gantt" — bars positioned by array index math, not by real milestone dates |
| | Site Activity | List of daily reports + "New daily report" dialog (real create) |
| | Team | PM + team member cards (read-only) |
| | Materials | Read-only table (SKU/required/ordered/delivered/issued/installed/returned/status) |
| | Device Register | Read-only, searchable table of serialized devices |
| Commercial | Financials | 8 stat cards (contract value, variations, estimated/actual cost, invoiced, collected, retention, "Forecast margin") + Payment Schedule table with "Mark collected" action |
| | Variations | Table + "New variation" dialog (real create) + "Approve" action on submitted rows |
| Quality | Testing | Pass/Fail/Pending counts, Failed Test Queue with "Retest as pass" action, per-device checklist matrix |
| | Compliance | Checklist with a "Toggle" action per item |
| Documents | Project Documents | Table + "Upload" button (real, metadata-only) |
| | Client Communication | Read-only list |
| | Activity Log | A **hardcoded, static 5-entry list** — same content regardless of which project you're viewing |
| Handover | Readiness Checklist | Checkbox list grouped by section (Technical/Documentation/Commercial/Client), toggles persist |

**Right rail ("Intelligence Rail"):** Health Score (numeric, `/100`), plus section-specific cards (Next Milestone, Current Blockers, Latest Client Message, Material Shortages, Overdue Tasks, Team on Site, Outstanding, Overdue Invoices, Forecast Margin (hardcoded "28%" — identical to the Financials tab's hardcoded number), Failed Tests, Compliance note, Pending Approvals, Recently Uploaded, Checklist Remaining, Final Payment).

### A5. Base logic

- **List → Profile**: a project is identified purely by `project.id` (a stable string like `"P-041"`) via the route `/projects/$id`; both pages read the *same* `useData()` context, so nothing about a project is duplicated between list and profile — every number on the profile is recomputed from the same source arrays the list uses. Where the two disagree (see Part B), it's a **formula difference**, not a data-duplication bug.
- **Progress**: `plannedProgress` / `actualProgress` are flat numeric fields on the seed `Project` record — not derived from tasks, milestones, or devices. Nothing on the page recalculates them from real sub-records, so editing a task's status or a device's test result never moves the progress numbers.
- **Health** (`computeHealth`): calculated from `actualProgress − plannedProgress`, count of pending *critical* approvals, count of failed device tests, and count of critical materials not yet delivered. It does **not** use any date field.
- **Schedule** ("days left"/"days over"): calculated from `plannedEnd` compared to `new Date()` — i.e. the **real browser/server clock**, not any date anchored to the demo's own timeline.
- **Status** (`projectStatus`): a lookup table keyed by `phase`, falling back to `health.label` only for a handful of phases. `phase === "Handover" | "Warranty" | "AMC"` is hardcoded to return `"Completed"` regardless of actual progress. `phase === "Cancelled"` has **no case at all** and silently falls through to the health-based default.
- **Value**: the list/Command Center total the portfolio using `contractValue` alone; the Profile header adds `contractValue + approvedVariations`. Same field, two different totals depending on which screen you're on.

---

## PART B — Client-Perspective Problems

### B1. The single biggest logic flaw: "today" is the real calendar date, not the demo's timeline

**What the client sees:** Open any of the 4 seed projects. The "Schedule" tile in the Command Summary Strip reads something like "39 days over" or "44 days over" in red/critical, for a project whose Health badge says **"On Track"** and whose Phase says **"Testing"** (mid-execution, not overdue at all).

**Why it doesn't make sense in a CCTV business:** Every date in the seed data (task due dates, milestones, AMC visits, payment due dates) was authored around a fictional "today" of roughly **21 July 2026**. But every "days left / days overdue" calculation in the app (`daysFromToday` in `src/lib/format.ts`) compares against the **actual system clock**. Concretely: `Msheireb Office Tower B` (P-038) is phase **Testing**, `actualProgress` (84%) ahead of `plannedProgress` (82%) — by every other signal on the page this is a healthy, nearly-finished project — yet its Schedule tile screams it is over 40 days past its planned end date, and the Intelligence Rail's "Overdue Tasks" counts almost every open task across every project as overdue, because virtually all task due-dates sit two months in the past relative to the real clock. A CCTV company owner would immediately distrust every date-derived number on the page.

**Severity: DEMO-KILLER**

### B2. Project value shown differently on the list vs. the profile

**What the client sees:** Al Wakrah Warehouse CCTV shows **340.0K QAR** in the Projects list, on its grid card, and in Command Center — but open the same project's profile and the header's "Value" mini-stat reads **352.0K QAR**.

**Why it doesn't make sense:** The list/portfolio totals use `contractValue` alone; the profile header adds `approvedVariations` (12,000 QAR of approved change orders) on top. Nothing on the list warns that variations exist or that the number is partial. A CCTV owner reconciling "what is this contract worth" against two different numbers for the same project, in the same app, is a trust-breaking inconsistency.

**Severity: DEMO-KILLER**

### B3. Portfolio KPI tiles never respond to search or filters

**What the client sees:** Type a customer name into Search, or pick a Phase filter that narrows the list down to one project — the "Active / At Risk / Delayed / Awaiting Materials / Ready for Handover / Completed" tiles above the list stay exactly the same as before filtering.

**Why it doesn't make sense:** These are meant to summarize what's in front of you. They're computed from the full, unfiltered project set every time, so a filtered view of "1 project, At Risk" still shows portfolio-wide counts like "Active: 3" above it — a business owner filtering to a specific client's projects would reasonably expect the summary to reflect what they're looking at.

**Severity: CONFUSING** (not fatal, but it's the first thing anyone who actually uses the filters will notice)

### B4. Three of the four demo projects are hollow shells

**What the client sees:** Click into **Msheireb Office Tower B** (phase: Testing, 84% progress) → the Device Register tab is empty, the Testing tab shows 0 devices / 0 tests, the Handover Readiness checklist is 0 of 0 items. Click into **Katara Villa 12** (phase: Procurement) → Materials tab is empty (Material Status badge literally reads "Pending" with zero line items), Milestones list is empty, Documents tab is empty, no site survey, no signed contract on file. Click into **Lusail Retail Unit 7** (phase: Handover, about to close out) → zero materials, zero devices, zero test records, zero handover checklist items.

**Why it doesn't make sense:** Every device, material, test record, milestone, handover item, compliance item and site-activity entry in the seed dataset is attached to **only one** project (`P-041`, Al Wakrah Warehouse). The other three "in-flight" or "nearly complete" projects have none of the operational records a CCTV company would actually have by that point in the lifecycle — a project literally named "Testing" phase with zero devices under test is the clearest possible tell that the data isn't real. This is more damaging than any single wrong number, because it means only 1 of the 4 demo projects can be clicked through convincingly; the other 3 fall apart the moment you open any tab beyond Overview.

**Severity: DEMO-KILLER**

### B5. Activity Log is identical on every project

**What the client sees:** Open the Documents → Activity Log tab on any project — Al Wakrah, Msheireb, Katara, Lusail — and see the exact same 5 entries, same names, same timestamps ("2026-07-19 16:40 · Ahmed Sobhi — Test result: FAIL on CP-13"), regardless of which project you're viewing (CP-13 doesn't even exist outside the Al Wakrah project).

**Why it doesn't make sense:** This is the literal "every project profile shows identical data" failure mode called out in the brief. It's a hardcoded array with no project filter at all.

**Severity: DEMO-KILLER**

### B6. "Forecast Margin" is a hardcoded constant everywhere

**What the client sees:** The Financials tab's "Forecast margin" stat and the Intelligence Rail's "Forecast Margin" card both always read **"28%"**, on every project, regardless of contract value, cost, or variations.

**Why it doesn't make sense:** A CCTV company owner uses margin to judge whether a job is worth doing — a flat, unchanging 28% on a 145K QAR villa job and a 1.24M QAR office tower job in the same breath reads as obviously fake.

**Severity: CONFUSING** (small element, but exactly the kind of thing a numbers-literate owner clocks in 5 seconds)

### B7. Impossible / unguarded states the owner can trigger live in the demo

**What the client sees:** Open "Update Project" and change Phase to "Warranty" or "AMC" on a project that's 10% complete — Status instantly flips to **"Completed"** everywhere on the page. Set Planned End to a date before Planned Start — nothing stops you, and the Schedule tile's "days left" math goes nonsensical. Use "Archive Project" — the project's Phase becomes "Cancelled," but the Status badge (list and profile) still reads **"In Progress"** because `projectStatus()` has no rule for that phase at all, and the archived project keeps appearing in the Kanban board as a new, unlabeled column.

**Why it doesn't make sense:** These aren't buried edge cases — "Update Project" and "Archive Project" are both front-and-center buttons in the header action bar, exactly the controls a demo presenter is likely to click.

**Severity: DEMO-KILLER** (if clicked live) / CONFUSING otherwise

### B8. Three overlapping status vocabularies shown at once

**What the client sees:** The profile header alone shows a Phase pill ("Installation"), a Health badge ("At Risk"), and a "Project status" mini-stat ("In Progress") — three different-looking labels, from three different enums, all claiming to answer "what state is this project in?"

**Why it doesn't make sense:** A CCTV company's real workflow has one lifecycle (survey → quotation → approval → procurement → install → test → handover → warranty/AMC). Here that lifecycle is represented by `phase` (20 possible values, including SaaS-flavored ones like "Rework" and "Inspection and Compliance"), overlaid with a separately-computed `health` (5 values) and a separately-computed `status` (11 values) that mostly restates phase. An owner has to learn three vocabularies to read one project.

**Severity: CONFUSING**

### B9. Assignee lists aren't filtered by role

**What the client sees:** "Add Task" and other assignee pickers list **all 15 employees**, including the Accounts Manager and the Managing Director, with no filter for who's actually an installation/field technician.

**Why it doesn't make sense:** In a real CCTV company, you wouldn't assign a camera-mounting task to the Accounts Manager. It's a small thing, but it undercuts the "this reflects a real operating business" feeling.

**Severity: MINOR**

### B10. The "Gantt" chart bars are decorative, not date-driven

**What the client sees:** The Timeline tab's bar chart looks like a Gantt chart, but bar position/length is computed from the milestone's index in the array (`i * 12`, `15 + (i*3) % 20`), not from its actual planned date.

**Why it doesn't make sense:** It's presented next to real planned dates in the same row, so it looks authoritative, but reordering milestones in the seed data would visibly scramble the chart independent of any real date.

**Severity: MINOR**

### B11. Scope & BOQ is empty for 3 of 4 projects, with no empty-state message

**What the client sees:** Execution → Scope & BOQ shows a fully-populated 30-row bill of quantities for Al Wakrah, and a completely blank table (just a header row, no "nothing here" message) for the other three.

**Why it doesn't make sense:** A CCTV company would never have an approved project with no BOQ — the BOQ is the contract's technical backbone. A silently blank table looks broken, not "not yet filled in."

**Severity: CONFUSING**

### B12. "No failures" reads as a pass, not as "nothing was tested"

**What the client sees:** On a project with zero devices, the "Tests Passed" tile reads "0 / 0" with the sub-label **"No failures"** in a reassuring tone.

**Why it doesn't make sense:** "No failures" implies things were tested and passed — it should distinguish "0 of 0, nothing tested yet" from "12 of 12, all passed."

**Severity: MINOR**

### B13. Essentials missing that a CCTV owner would expect on a project

Checked against the requested list:

| Expected | Present? |
|---|---|
| Site location/address | **Partial** — Site name shown, but no address/map on the profile itself (address exists on the Site record but isn't surfaced here) |
| Client contact (phone/email) | **Missing** on the profile (only on Customer Detail, not linked from here) |
| Assigned technicians | Present (Team tab) |
| Equipment/BOM list | Present for 1 of 4 projects only (see B4/B11) |
| Site survey link | **Missing** — `project.surveyId` exists in the data model but is never shown or linked anywhere on the profile |
| Quotation link | **Missing** — same story: `project.quotationId` is used internally to pull BOQ rows, but there's no visible "View Quotation" link/reference |
| Installation checklist | Not distinct from the generic Tasks list — no CCTV-specific install checklist (mounting, cabling, PoE, labeling) |
| Handover/commissioning documents | Present (Handover tab + Documents tab), but empty for 3 of 4 projects |
| Warranty/AMC period | **Missing** on the profile — `AMCContract` exists as its own entity (visible on the Service page) but has no visible link back to the originating project |
| Photos | **Missing entirely** — no photo field or gallery anywhere on the profile despite "Add Site Report"/"Upload evidence" language elsewhere in the app |
| Issues/snags | **Missing** — "Add Issue" exists as a menu item but there's no issues list, no issue entity, and the action just posts a toast |

---

## PART C — Verdict

**Does this Projects module tell a coherent story for a CCTV company?** **No.** One of the four demo projects (Al Wakrah Warehouse) is genuinely well-modeled and would survive a real walkthrough — devices, materials, tests, payments, and a handover checklist all line up. But the moment an owner clicks into any of the other three projects, or filters the list, or compares a number on the list against the same number on the profile, the illusion breaks: empty tabs with no explanation, a Schedule tile that thinks every project is over a month late, and a Financials "Forecast Margin" that never changes no matter what the numbers say. The single Al Wakrah project is a strong demo script; the module as a whole is not yet safe to let someone click around freely.

### Top 5 demo-killers, ranked

1. **The "today" anchor** — every days-left/overdue calculation uses the real system clock against a dataset written for July 2026, so Schedule tiles and "Overdue Tasks" counts look alarmingly wrong on every project, often contradicting the Health badge sitting right next to them (B1).
2. **Three of four projects have no devices, materials, tests, or handover records** — most tabs on most projects render empty with no explanation (B4).
3. **Contract value disagrees between the list and the profile for the same project** (B2).
4. **Activity Log is a hardcoded, identical block of text on every project** (B5).
5. **"Update Project"/"Archive Project" allow impossible states** (Completed at 10% progress, Cancelled projects still tagged "In Progress", no start/end date validation) — and these are the two most prominent buttons on the page (B7).

### What's missing entirely vs. what exists but is wrong

- **Missing entirely**: site survey link, quotation link, client contact on the profile, warranty/AMC period on the profile, photos, a real issues/snags list, a CCTV-specific installation checklist distinct from generic tasks.
- **Exists but wrong**: Schedule/overdue math (wrong "today"), contract value totals (two formulas), Forecast Margin (hardcoded), Activity Log (hardcoded per-project), Status vocabulary (three overlapping systems), phase/status validation (allows impossible combinations), portfolio KPI tiles (don't respect filters), Gantt bars (index-based, not date-based).

---

*This audit is descriptive only. No files were modified, installed, or deleted.*
