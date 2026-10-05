# SecureX UI Audit

Read-only audit of the SecureX operations dashboard as exported from Lovable. Goal: know exactly what exists so every button/feature can be made functional for a client demo. No app code was modified to produce this document.

---

## 1. Stack Snapshot

- **Framework/Router:** TanStack Start (SSR) + TanStack Router (file-based routes in `src/routes/`), React 19, Vite 8, Nitro server runtime. TanStack Query is installed and wired via `QueryClientProvider` in `__root.tsx` but **no route currently uses it** — all data comes from local React state.
- **Styling:** Tailwind CSS v4 + shadcn/Radix UI primitives (`src/components/ui/*`), custom dark "operations command center" design system built on top (`src/components/app/common.tsx`, `src/components/app/shell.tsx`).
- **State/Data:** All app data is in-memory mock data (`src/lib/mock-data.ts`) fed through a single React Context (`src/lib/data-context.tsx`, `DataProvider`/`useData()`). No backend, no Supabase, no persistence — a full page refresh resets every edit.

---

## 2. Screen Inventory

| # | Route | Path | Purpose | Main sections |
|---|---|---|---|---|
| 1 | Command Center | `/` | Executive home dashboard — portfolio value, pipeline, collections, active projects at a glance | 4 top metric cards, execution bar chart, "Recent Operations" feed, live project portfolio table, portfolio summary card, quick actions, project distribution donut, "Requires Attention" alerts, installation lifecycle funnel |
| 2 | Projects (list) | `/projects` | Portfolio of all CCTV projects with health/status | 6 stat tiles, search + phase/health filters, 4 view modes (Grid/Table/Kanban/Timeline), "New Project" dialog |
| 3 | Project Detail | `/projects/$id` | Full single-project workspace (the largest screen in the app) | Identity header + action bar, 6 command tiles, section nav (Overview/Execution/Commercial/Quality/Documents/Handover) each with sub-tabs (Summary, Scope & BOQ, Tasks, Timeline, Site Activity, Team, Materials, Device Register, Financials, Variations, Testing, Compliance, Project Documents, Client Communication, Activity Log, Handover Checklist), right-hand "Intelligence Rail" |
| 4 | Field Operations | `/field` | Mobile-first PWA-style view for field technicians | Check-in/out header, "Today" tab (site card, today's tasks, quick actions), Projects tab, Tasks tab, Materials tab, Me tab, bottom nav |
| 5 | Calendar | `/calendar` | Unified schedule of surveys, milestones, installs, tickets, AMC visits | View switch (Month/Week/Day/Agenda — only Month implemented), 4 stat tiles, month grid |
| 6 | Sales | `/sales` | Lead pipeline and sales forecasting | 4 metric cards, tab set (Pipeline/Leads/Follow-Ups/Activities/Targets/Analytics), drag-and-drop Kanban board, stage chart, monthly target, priority queue, leaderboard, lead source pie chart, new-lead dialog |
| 7 | Site Surveys | `/surveys` | Camera-point capture surveys that feed BOQ/devices/testing | 4 metric cards, tabs (List/Calendar/Templates), survey detail dialog with camera-point table |
| 8 | Customers (list) | `/customers` | Accounts overview | 4 stat tiles, search, accounts table |
| 9 | Customer Detail | `/customers/$id` | Single customer account | 4 stat tiles, tabs (Overview, Contacts, Sites, Projects, AMC, Tickets, Documents — most are stub empty states) |
| 10 | Equipment | `/equipment` | Product catalogue + serialized device register | 4 stat tiles, stock value panel, tabs (Catalogue with search, Serialized Register) |
| 11 | Procurement | `/procurement` | Purchase requests/orders and sourcing pipeline | 4 stat tiles, tabs (Purchase Requests, Purchase Orders, Pipeline funnel) |
| 12 | Employees | `/employees` | Workforce availability and workload | 4 stat tiles, workforce table |
| 13 | Documents | `/documents` | Contracts/drawings/reports/compliance document register | 4 stat tiles, search, tabs (All, Missing, Expiring) |
| 14 | Service and AMC | `/service` | AMC contracts, tickets, preventive maintenance | 4 stat tiles, tabs (AMC Contracts, Tickets, Preventive Maintenance checklist) |
| 15 | Reports | `/reports` | Business intelligence / analytics | 4 stat tiles, category tabs (Executive fully built; Project/Sales/Financial/Service and AMC/Compliance and Quality are placeholder panels) |
| 16 | Notifications | `/notifications` | Alert center | 4 stat tiles, filter tabs (mostly non-functional), notification list |
| 17 | Settings | `/settings` | Company/appearance/numbering/data preferences | Tabs (Company, Numbering, Appearance, Language, Notifications, Data) |
| 18 | 404 / Error | (root fallback) | Not-found and error boundary screens | "Go to Command Center" / "Try again" / "Home" |

**Global chrome (every page except `/field`):** left sidebar nav (6 groups, ~17 links), top bar with breadcrumb, global search (⌘K), "Create" quick-menu, role switcher, density toggle, notifications bell, help button, user menu, mobile bottom tab bar + FAB.

---

## 3. Interaction Map

Status legend: **WORKING** = mutates real (in-memory) state or navigates correctly · **VISUAL ONLY** = renders but has no `onClick`/handler, or is decorative · **PARTIAL** = does something but incomplete/inconsistent (e.g. toast-only "demo" actions, filters that don't affect all data) · **BROKEN** = throws, dead link, or visibly wrong behavior.

Note on "demo" actions: many buttons call `toast.success("... (demo)")` and change nothing. These are marked **PARTIAL** because they give feedback but don't touch data — treat them as the fastest wins to wire up.

### Global Shell (all pages)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Nav links (17) | Sidebar | Route to each module | WORKING | route table (static) |
| Collapse sidebar | Sidebar footer | Toggle width | WORKING (local UI state) | none |
| User menu (Profile/Preferences/Log out) | Sidebar footer dropdown | Account actions | PARTIAL (toast only) | auth/user record |
| Global search (⌘K) | Top bar | Search projects/customers/leads/devices/employees/tickets/docs | WORKING (searches in-memory data, navigates) | all mock collections |
| Quick Create menu (8 items) | Top bar | Shortcut to create records | PARTIAL — every item just **navigates** to a list page; none opens a create form directly | target pages already have their own dialogs |
| Role switcher (Owner/PM/Sales/…) | Top bar | Preview app as a role | PARTIAL — changes a display label only; **no page actually restricts/adapts content by role** | role-based permission model (doesn't exist yet) |
| Density toggle (Cmp/Cmf) | Top bar | Switch layout density | VISUAL ONLY — toggles state label but no layout actually changes | none |
| Notifications bell | Top bar | Go to notifications | WORKING (navigates) | — |
| Help button | Top bar | Open help center | PARTIAL (toast only) | help content |
| Mobile FAB (+) | Mobile bottom | Quick create | PARTIAL — always navigates to `/projects` regardless of intent | — |
| Mobile bottom tabs (5) | Mobile bottom | Navigate | WORKING | — |

### Command Center (`/`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| 4 metric cards (Active value / Pipeline / Outstanding / Active projects) | Top row | Click-through to relevant module | WORKING (navigate) | projects, leads, payments |
| Range segmented control (Month/Quarter/Year) | Execution chart | Change chart aggregation | VISUAL ONLY — state updates but chart data (`execData`) is static regardless of range | needs real time-series aggregation |
| Execution bar chart (click bar) | Execution chart | Select a month | PARTIAL — sets `month` state, only used for bar highlight color, no drill-down | — |
| "View all" (Recent Operations) | Panel head | Go to full activity list | WORKING (navigates to `/projects`, not a dedicated activity log) | should ideally go to a real activity/log page |
| Recent Operations rows | Feed | — | VISUAL ONLY (display only, generated deterministically from project index, not real events) | needs a real activity/events collection |
| Live Project Portfolio table rows | Table | Open project | WORKING (row click navigates) | projects, customers, milestones |
| Quick Actions (New Project / Site Update / Report / Alert) | Right rail | Shortcuts | PARTIAL — all 4 just navigate to a list page, none opens the actual creation dialog | — |
| Project Distribution donut | Right rail | Visual only | VISUAL ONLY (no click) | projects by phase |
| "Requires Attention" alert cards + "Open project/PO/AMC" action | Right rail | Go to source record | WORKING (navigates) | projects, POs, AMC |
| Installation Lifecycle bars | Right rail | Visual only | VISUAL ONLY | devices |

### Projects List (`/projects`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Export button | Page header | Export CSV | PARTIAL (toast only, no file produced) | — |
| "+ New Project" button + dialog | Page header | Create project | **BROKEN-ish PARTIAL** — dialog opens, all fields are uncontrolled/decorative (no `value`/`onChange` wired except two `Select`s that don't bind to state), "Create project" button just closes dialog + toasts; **no project is actually added** (contrast with `addProject` which exists in `data-context.tsx` but is never called here) | `d.addProject` (already implemented, unused) |
| Search input | Filter bar | Filter by name/number | WORKING | — |
| Phase filter, Health filter | Filter bar | Filter list | WORKING | — |
| View switch (Grid/Table/Kanban/Timeline) | Filter bar | Change layout | WORKING | — |
| Project cards / table rows / kanban cards / timeline rows | Body | Open project detail | WORKING (navigate) | — |
| 6 stat tiles | Top | Visual only | VISUAL ONLY | computed from projects |

### Project Detail (`/projects/$id`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "Update Project" button | Header action bar | Edit project | PARTIAL (toast only, `d.updateProject` exists but is unused here) | — |
| "Add Task" / "Add Site Report" / "Client Update" buttons | Header action bar | Jump to relevant tab | WORKING (navigates within tabs via `goTo`) | — |
| "More" dropdown: Progress Report | Header | Generate report | PARTIAL (toast only) | — |
| "More" dropdown: Upload Document | Header | Jump to docs tab | WORKING (navigate to tab) | — |
| "More" dropdown: Add Issue | Header | Log issue | PARTIAL (toast only) | needs an issues/tickets collection |
| "More" dropdown: Add Variation | Header | Jump to variations tab | WORKING (navigate to tab) | — |
| "More" dropdown: Schedule Visit | Header | Schedule | PARTIAL (toast only) | calendar integration |
| "More" dropdown: Handover Checklist | Header | Jump to tab | WORKING | — |
| "More" dropdown: Archive Project | Header | Archive | PARTIAL (toast only, no state change) | project status field |
| 6 Command Tiles (Status/Schedule/Materials/Cameras/Tests/Collected) | Command strip | Jump to related section | WORKING (navigate to tab) | — |
| Section nav (6 tabs) + sub-nav | Layer 3/4 | Switch workspace section | WORKING | — |
| Milestones list (Overview) | Overview tab | Visual timeline | VISUAL ONLY | milestones |
| Scope & BOQ table | Execution | Visual only | VISUAL ONLY (read-only) | quotation items |
| Tasks: "Add task" dialog | Tasks tab | Create task | WORKING — validates title, calls `d.addTask` | — |
| Tasks: status `Select` per row | Tasks tab | Update status | WORKING — calls `d.updateTask` | — |
| Tasks: "Delete" + confirm dialog | Tasks tab | Delete task | WORKING — calls `d.deleteTask` | — |
| Timeline/Gantt bars | Timeline tab | Visual only | VISUAL ONLY | milestones (positions are pseudo-random, not derived from real dates) |
| Site Activity: "New daily report" dialog | Site tab | Log site visit | WORKING — calls `d.addSiteActivity` | — |
| Team cards | Team tab | Visual only | VISUAL ONLY | employees |
| Materials table | Materials tab | Visual only (read-only) | VISUAL ONLY | materials |
| Device Register search + table | Devices tab | Search/filter devices | WORKING (client-side filter); table itself read-only | devices |
| Documents: "Upload" button | Docs tab | Upload doc | PARTIAL (toast only, `d.addDocument` exists but unused here) | — |
| Variations: "New variation" button | Vars tab | Create variation | PARTIAL (toast only, no `addVariation` mutator exists at all) | needs new mutator |
| Testing: "Retest as pass" button | Testing tab | Mark device retested | WORKING — calls `d.updateDevice` | — |
| Payment Schedule: "Mark collected" | Financials tab | Mark payment collected | WORKING — calls `d.markPaymentCollected` | — |
| Compliance: "Toggle" button | Quality tab | Toggle approval status | WORKING — calls `d.toggleCompliance` | — |
| Handover checklist checkboxes | Handover tab | Toggle item done | WORKING — calls `d.toggleHandover` | — |
| Activity Log entries | Documents section | Visual only | VISUAL ONLY, hardcoded fake log, not tied to real actions elsewhere on the page | needs a real audit-log collection |
| Intelligence Rail cards (contextual per section) | Right rail | Some clickable, jump to tab | WORKING for cards with `onClick` (Next Milestone, Blockers→materials, etc.); several are static | — |

### Field Operations (`/field`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "Exit" link | Header | Return to desktop app | WORKING (navigate to `/`) | — |
| Check in / Check out button | Today card | Toggle on-site status | PARTIAL — local `useState`, resets on refresh, doesn't persist or affect other pages | needs shared attendance state |
| Camera icon button (photo) | Today card | Capture photo | PARTIAL (toast only) | file/camera capture |
| Task "Start" / "Complete" buttons | Today's Tasks | Update task progress | PARTIAL (toast only) — does **not** call `d.updateTask`, so task status shown elsewhere (Project Detail tasks tab) never reflects this | should call `d.updateTask` |
| Quick actions (Raise issue / Upload evidence / Client sign / Request material) | Today tab | Field actions | PARTIAL (toast only, all 4) | issues, evidence, e-signature, material-request collections |
| Bottom nav (Today/Projects/Tasks/Materials/Me) | Footer | Switch tab | WORKING (local tab state) | — |
| Projects/Tasks/Materials tab lists | Body | Browse | VISUAL ONLY (read-only lists, no row action) | projects, tasks, materials |

### Calendar (`/calendar`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| View segmented (Month/Week/Day/Agenda) | Header | Switch calendar view | **PARTIAL/BROKEN** — only "Month" is implemented; selecting Week/Day/Agenda changes state but renders nothing different (same month grid stays) | needs Week/Day/Agenda views |
| Month grid days/events | Body | Visual only | VISUAL ONLY, no click | surveys, milestones, tickets, AMC visits — dates are hardcoded to July 2026 only |
| 4 stat tiles | Top | Visual only | VISUAL ONLY | — |

### Sales (`/sales`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "Import leads" button | Header | Bulk import | VISUAL ONLY — **no `onClick` at all** | file import |
| "New lead" button + dialog | Header | Create lead | WORKING — validates company, calls `d.addLead` | — |
| 4 metric cards | Top | Visual only | VISUAL ONLY | leads |
| Tabs (Pipeline/Leads/Follow-Ups/Activities/Targets/Analytics) | Body | Switch views | WORKING | — |
| Pipeline board: drag lead card between stage columns | Pipeline tab | Move lead through stages | WORKING — `d.updateLead` on drop, opens "mark lost" confirm dialog when dropped on Lost | — |
| Pipeline card click | Pipeline tab | Open lead detail dialog | WORKING (read-only detail view) | — |
| Priority Queue / Leaderboard / Lead Source chart | Pipeline tab | Visual only | VISUAL ONLY | leads |
| Leads table row delete (trash icon) + confirm | Leads tab | Delete lead | WORKING — `d.deleteLead` | — |
| Follow-Ups groups | Follow-ups tab | Visual only | VISUAL ONLY | leads |
| Targets tab cards | Targets tab | Visual only | VISUAL ONLY, quota values are pseudo-random per employee id | employees, hardcoded target |
| Analytics tab | Analytics tab | Visual only | VISUAL ONLY (re-renders same stage chart, taller) | — |

### Site Surveys (`/surveys`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "New survey" button | Header | Schedule survey | PARTIAL (toast only, no `addSurvey` mutator exists) | needs new mutator |
| 4 metric cards | Top | Visual only | VISUAL ONLY | surveys |
| Tabs (List/Calendar/Templates) | Body | Switch views | WORKING | — |
| Survey list rows / "Open" button | List tab | Open survey detail dialog | WORKING (dialog with camera-point table) | — |
| Survey Calendar grid | Calendar tab | Visual only | VISUAL ONLY | surveys |
| "Use template" buttons (6) | Templates tab | Apply survey template | PARTIAL (toast only) | needs template application logic |
| "Print report" button (in detail dialog) | Detail dialog | Print/export | PARTIAL (toast only) | — |

### Customers List (`/customers`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Search input | Filter bar | Filter customers | WORKING | — |
| Customer name link | Table | Open customer detail | WORKING | — |
| 4 stat tiles | Top | Visual only | VISUAL ONLY | customers, projects |

### Customer Detail (`/customers/$id`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Tabs (Overview/Contacts/Sites/Projects/AMC/Tickets/Documents) | Body | Browse customer data | PARTIAL — Overview/Sites/Projects render real data; **Contacts, AMC, Tickets, Documents are hardcoded `EmptyState` stubs regardless of actual data** (e.g., `d.amc`/`d.tickets`/`d.documents` filtered by customer are never queried here) | needs per-customer filtering wired for those 4 tabs |
| Project row links | Projects tab | Open project | WORKING | — |
| "Back to customers" (not-found state) | — | Recovery link | WORKING | — |

### Equipment (`/equipment`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Search input (Catalogue tab) | Catalogue | Filter SKUs | WORKING | — |
| Catalogue / Serialized Register tabs | Body | Switch views | WORKING | — |
| Table rows | Body | Visual only (no click) | VISUAL ONLY | products, devices |

### Procurement (`/procurement`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Tabs (Purchase Requests/Purchase Orders/Pipeline) | Body | Switch views | WORKING | — |
| Table rows | Body | Visual only (no click, no detail drill-down) | VISUAL ONLY | POs/PRs |
| Pipeline stage tiles | Pipeline tab | Visual only | VISUAL ONLY | purchase requests |

### Employees (`/employees`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Table rows | Body | Visual only (no click) | VISUAL ONLY | employees, tasks |

### Documents (`/documents`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "Upload" button | Header | Upload document | PARTIAL (toast only, `d.addDocument` exists but unused here) | — |
| Search input | Body | Filter docs | WORKING | — |
| Tabs (All/Missing/Expiring) | Body | Switch views | WORKING | — |
| "Add placeholder" buttons (Missing tab) | Missing tab | Create placeholder doc | PARTIAL (toast only, list is hardcoded 3 strings, not tied to real data) | — |

### Service and AMC (`/service`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "New ticket" button | Header | Create ticket | PARTIAL (toast only, `d.addTicket` exists but unused here) | — |
| Tabs (AMC Contracts/Tickets/Preventive Maintenance) | Body | Switch views | WORKING | — |
| Table rows | Body | Visual only (no click) | VISUAL ONLY | amc, tickets |
| PM checklist checkboxes | PM tab | Track maintenance checklist | VISUAL ONLY — `defaultChecked`, not stateful, resets on toggle back after refresh, not persisted or tied to any AMC record | — |

### Reports (`/reports`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "Save view" button | Header | Save report config | PARTIAL (toast only) | saved-views storage |
| "Export CSV" button | Header | Export | PARTIAL (toast only, no file produced) | — |
| "Print" button | Header | Print | WORKING (`window.print()` — real browser print) | — |
| Category tabs (6) | Body | Switch report category | PARTIAL — only "Executive" has real charts; **the other 5 (Project/Sales/Financial/Service and AMC/Compliance and Quality) are identical placeholder text panels** | needs real per-category dashboards |
| Charts (Executive tab) | Executive | Visual only | VISUAL ONLY (no drill-down) | devices, projects, hardcoded collections trend |

### Notifications (`/notifications`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| "Mark all read" button | Header | Bulk mark read | WORKING (local state only, resets on refresh) | — |
| Filter tabs (All/Unread/Projects/Payments/Materials/Approvals/Service) | Body | Filter list | **VISUAL ONLY/BROKEN** — `Tabs` has no `value`/`onValueChange` wired and no `TabsContent`, so clicking tabs does nothing at all; list below is always unfiltered | needs full tab wiring |
| "Open" button (per notification with a `path`) | List | Navigate to source | PARTIAL — most items have no `path` so button doesn't render; the one wired path (`/projects/P-041`) is a **dead link**: no route matches `/projects/P-041` (correct route pattern is `/projects/$id` i.e. `/projects/P-041` should actually work via dynamic route — confirm at runtime, flagged as risk below) | — |
| Notifications are a hardcoded static array (`NOTIFS`), unrelated to real overdue POs/AMC/tests shown elsewhere (e.g. Command Center's "Requires Attention") | List | — | **inconsistency** | should derive from same alerts logic as Command Center |

### Settings (`/settings`)

| Element | Location | Intent | Status | Data needed |
|---|---|---|---|---|
| Company Profile inputs (4) | Company tab | Edit company info | VISUAL ONLY — `defaultValue` only, not controlled, nothing saves | company profile record |
| Numbering Format inputs (4) | Numbering tab | Edit numbering scheme | VISUAL ONLY — same as above | — |
| Theme select | Appearance tab | Switch light/dark | WORKING — calls `setTheme`, toggles `dark` class on `<html>` | — |
| Language select | Language tab | Switch language | PARTIAL — `setLang` updates state and shows toast, but **no actual translation/RTL happens anywhere in the app** | i18n system (doesn't exist) |
| Notification preference checkboxes (5) | Notifications tab | Toggle alert types | VISUAL ONLY — `defaultChecked`, not stateful | — |
| "Export all data" button | Data tab | Export | PARTIAL (toast only) | — |

---

## 4. Data Inventory

All data lives in `src/lib/mock-data.ts` (487 lines) and is loaded once into `DataProvider` state (`src/lib/data-context.tsx`). There is **one shared source per entity type already** — no duplication was found across files; every route reads through `useData()`. The main risk is not duplication but **incompleteness**: several pages render hardcoded literals that look like data but aren't part of the shared model (flagged below).

| Dataset | Type | Approx. shape | Used by |
|---|---|---|---|
| `employees` | `Employee[]` | id, name, role, department, phone, workload, availability | Employees, Projects, Sales, Service, Field, shell search |
| `customers` | `Customer[]` | id, name, industry, contact, phone, email, address, since, status | Customers, Command Center, Sales, Service, shell search |
| `sites` | `Site[]` | id, customerId, name, address | Customer Detail, Projects, AMC |
| `surveys` | `SiteSurvey[]` | id, number, customerId, siteId, type, engineerId, scheduled, status, completeness, reportStatus, points[] (camera points) | Surveys, Calendar |
| `quotations` | `Quotation[]` | id, opportunityName, customerId, siteId, leadId, items[] (BOQ), salespersonId, notes | Project Detail (Scope & BOQ tab), `convertQuotationToProject` |
| `leads` | `Lead[]` | id, company, contactName, phone, email, value, stage, probability, source, salespersonId, dates, notes | Sales, Command Center pipeline metric, shell search |
| `devices` | `Device[]` (aliased from `wakrahDevices`) | id, projectId, label, brand, model, serial, mac, ip, building/floor/zone, switch/port, status, testResult | Equipment, Project Detail (Devices/Testing tabs), Command Center |
| `materials` | `Material[]` | id, projectId, sku, name, required/ordered/delivered/issued/installed/returned, critical | Project Detail (Materials tab), Field |
| `projects` | `Project[]` | id, number, name, customerId, siteId, phase, contractValue, costs, invoiced/collected/retention, plannedStart/End, pmId, teamIds[], progress | Nearly every page |
| `tasks` | `Task[]` | id, projectId, title, assigneeId, phase, due, priority, status | Project Detail, Employees, Field |
| `milestones` | `Milestone[]` | id, projectId, title, planned, actual, done | Project Detail, Calendar |
| `approvals` | `Approval[]` | id, projectId, title, requestedOn, status, owner, critical | Project Detail, health scoring |
| `variations` | `Variation[]` | id, projectId, number, description, amount, status, date | Project Detail (Variations tab) |
| `documents` | `Doc[]` | id, name, category, projectId?, customerId?, revision, status, expiresOn?, uploadedOn, tags[] | Documents, Project Detail, Customer Detail (unused there — see gap) |
| `payments` | `PaymentMilestone[]` | id, projectId, label, amount, dueDate, invoicedOn?, collectedOn?, status | Project Detail (Financials tab) |
| `amc` | `AMCContract[]` | id, number, customerId, siteId, equipment, start/end, value, sla, nextVisit, renewalStatus | Service, Command Center, Calendar |
| `tickets` | `ServiceTicket[]` | id, number, customerId, siteId, amcId?, title, priority, status, opened, assigneeId?, sla | Service, Calendar, shell search |
| `products` | `Product[]` | id, sku, category, brand, model, cost, price, stock, reserved, reorderLevel | Equipment |
| `purchaseRequests` | `PurchaseRequest[]` | id, number, projectId, requestDate, requiredDate, items, cost, priority, approvalStatus, procurementStatus | Procurement |
| `purchaseOrders` | `PurchaseOrder[]` | id, number, supplier, projectId, amount, orderDate, expectedDelivery, deliveryStatus, paymentStatus | Procurement, Command Center alerts |
| `siteActivities` | `SiteActivity[]` | id, projectId, date, teamPresent[], workCompleted, camerasInstalled, cableInstalled, devicesConfigured, issues, tomorrowPlan | Project Detail (Site Activity tab) |
| `communications` | `Communication[]` | id, projectId, date, owner, subject, status, relatedTaskId? | Project Detail (Client Communication tab) |
| `testRecords` | `TestRecord[]` (derived from `wakrahDevices`) | id, deviceId, projectId, checks{}, result, notes | Project Detail (Testing tab) |
| `handoverItems` | `HandoverItem[]` | id, section, label, done, projectId | Project Detail (Handover tab) |
| `complianceItems` | `ComplianceItem[]` | id, projectId, item, status, owner, expires? | Project Detail (Compliance tab) |

### Hardcoded literals NOT in the shared data model (flag for consolidation)

- **Notifications page** (`src/routes/notifications.tsx`): `NOTIFS` array is a standalone hardcoded list, disconnected from the alert logic already built in Command Center (`alerts` memo in `index.tsx` — derives from `projects`/`purchaseOrders`/`amc`). These two should share one source.
- **Command Center "Recent Operations" feed**: generated deterministically from `d.projects.slice(0,6)` with a fixed 6-item rotation of fake activity types — not a real events/activity log.
- **Command Center execution bar chart** (`execData`) and **Reports "Collections Trend"** (`collected`): both fully synthetic month-by-month series, not derived from `payments`/`milestones`.
- **Documents "Missing" tab**: 3 hardcoded document names, unrelated to `d.documents`.
- **Sales "Targets" tab**: quota values pseudo-randomly generated from employee id char codes, not a real target field on `Employee`.
- **Field Operations**: hardcoded user "Suresh Kumar" / employee id `"E-010"` and hardcoded `todayProject = P-041` — not derived from any logged-in-user concept (none exists).
- **Activity Log tab** (Project Detail → Documents section): 5 hardcoded log entries, same for every project regardless of `id`.
- **Calendar**: all dates hardcoded to July 2026 (`2026-07-DD`), so browsing to any other month/week isn't possible since only Month view renders and always shows the same fixed month.

---

## 5. Shared Components

From `src/components/app/common.tsx` (533 lines) — the design system used almost everywhere:

| Component | Purpose | Used on |
|---|---|---|
| `PageHeader` | Title/subtitle/eyebrow/actions header | All full pages except Command Center, Field |
| `Panel` / `PanelHead` | Card container with optional texture/accent | Nearly every page |
| `MetricCard` | Large KPI card with sparkline | Command Center, Sales, Surveys |
| `StatTile` | Compact stat block (grid of 4) | Nearly every list page |
| `TableShell` | Styled `<table>` wrapper | Customers, Documents, Employees, Equipment, Procurement, Service, Surveys, Command Center |
| `StatusPill` | Colored status badge | Everywhere (generic status) |
| `WorkStatusBadge` / `projectStatus` / `materialStatus` / `countStatus` | Standardized "Not Started/In Progress/Completed/Blocked" logic | Project Detail, Projects list, Field |
| `HealthBadge` | Project health (On Track/Watch/At Risk/…) badge | Command Center, Projects list, Project Detail |
| `MonoChip` | Monospace id/number chip | Nearly every table (project numbers, PO numbers, device labels) |
| `Segmented` | Segmented button control | Command Center (range), Projects (view), Calendar (view) |
| `AlertCard` | Severity-colored alert row | Command Center, Sales priority queue |
| `Donut` | Donut chart | Command Center |
| `Motif` | Decorative SVG background pattern | Projects grid cards |
| `QuickAction` | Icon quick-action tile | Command Center |
| `EmptyState` | "Nothing here" placeholder | Customer Detail (4 stub tabs), Documents, Projects (no results) |
| `axisProps` / `ChartTooltip` | Recharts styling helpers | Command Center, Reports, Sales |

**shadcn/Radix primitives** (`src/components/ui/*`, 45 files) used across the app: `Button`, `Input`, `Select`, `Tabs`, `Dialog`, `AlertDialog`, `DropdownMenu`, `Textarea`, `Card`, `Badge`, `Checkbox` (raw HTML `<input type=checkbox>` used instead of the shadcn `Checkbox` component in several places — inconsistency, see Gaps), `Sonner`(toast), `Sidebar`, and more (many, like `Accordion`, `Carousel`, `Calendar` (date-picker), `Command`, `Menubar`, `Resizable`, are installed but **not currently used anywhere** — available for the demo build-out).

**`AppShell`** (`src/components/app/shell.tsx`) is the single layout wrapper for every route except `/field`, which renders its own standalone mobile shell.

---

## 6. Gaps & Risks

1. **"New Project" dialog is non-functional** (`src/routes/projects.index.tsx`): the entire form is uncontrolled and disconnected from `d.addProject`; clicking "Create project" only closes the dialog and shows a toast. This is likely the single most visible gap for a demo since "Projects" is a primary nav item.
2. **Customer Detail has 4 dead tabs**: Contacts, AMC, Tickets, Documents always render `EmptyState` even though `d.amc`, `d.tickets`, `d.documents` all have `customerId` fields that could filter real data — an easy, high-value fix.
3. **Notifications tabs don't filter** — `Tabs` has no `value`/`onValueChange`/`TabsContent` wiring; the filter UI is fully decorative.
4. **Notifications dataset is disconnected** from the real alert-worthy conditions used elsewhere (overdue POs, expiring AMC, failed tests) — two different "what needs attention" lists exist in the app (Command Center's `alerts` vs. Notifications' `NOTIFS`) and they disagree.
5. **Field Operations task actions don't persist**: "Start"/"Complete" buttons only toast; they don't call `d.updateTask`, so a task marked complete in the field tab still shows as open in the desktop Project Detail Tasks tab — a serious consistency gap if this is demoed as one connected system.
6. **Calendar only implements the Month view**, and dates are hardcoded to July 2026 — Week/Day/Agenda tabs are dead ends.
7. **Reports has 1 real tab and 5 placeholder tabs** (Project/Sales/Financial/Service and AMC/Compliance and Quality all show the same "Reports in this category are available in the demo" filler text) — clear scope-narrowing opportunity or a to-do list for what "Reports" needs.
8. **Console-error risk**: `notifications.tsx` navigates to a literal path `nav({ to: n.path as never })` where `n.path = "/projects/P-041"`. TanStack Router's file-based routing generates `/projects/$id`; a hardcoded literal string bypassing the typed route helper is the one non-typesafe navigation call in the codebase and should be verified at runtime (dev server was not started per read-only constraint) — worth an explicit smoke test before demo.
9. **No persistence anywhere**: all mutations (`addTask`, `updateLead`, `markPaymentCollected`, etc.) live in in-memory React state (`useState` in `DataProvider`). A full page refresh during a live demo silently discards every change made. This is a structural decision to flag before the demo, not a bug to "fix" per se — but the person running the demo needs to know not to refresh.
10. **Inconsistent checkbox patterns**: some checklists use the shadcn `Checkbox` component pattern conceptually but actually use raw `<input type="checkbox">` with `defaultChecked` (Service PM checklist, Settings notification prefs) — these are **stateless and don't retain a toggle** across a session in any meaningful way (they re-render uncontrolled, so clicking works visually but nothing is stored, not even locally).
11. **Settings form fields are all uncontrolled** (`defaultValue`) — nothing under Company/Numbering settings can actually be changed and observed elsewhere (e.g., changing "Company name" doesn't update the sidebar logo or page titles).
12. **Role switcher has no effect on visible content** — picking "Technician" vs "Owner" doesn't hide/show/restrict anything, which may matter for a multi-tenant/role-aware demo narrative.
13. **TanStack Query is installed and provided but entirely unused** — if the real backend build-out plans to use it for data fetching, no route is set up as a reference pattern yet.
14. **No genuine multi-tenant concept exists** — single hardcoded company ("SecureX CCTV COMPANY"), single hardcoded user ("Yousef Al-Emadi" desktop / "Suresh Kumar" field). Worth flagging since the stated long-term goal is a multi-tenant platform.
15. **Two lockfiles present at repo root** (`bun.lock` and `package-lock.json`) — unrelated to UI but a known housekeeping item from the earlier local-setup pass; not touched here since this audit is read-only.

---

## 7. Demo Build Plan

Grouped by what a CCTV company owner would see first and care about most in a live demo, with relative build size (S = few hours, M = half-to-full day, L = multi-day).

### Module 1 — Command Center polish (S)
Make the dashboard feel "live": wire Quick Actions to actually open create dialogs (not just navigate), connect Notifications data source to the same `alerts` logic already computed here so the two don't disagree.

### Module 2 — Projects: make "New Project" real (S/M)
Wire the existing `d.addProject` mutator into the dialog form (control every field, validate, submit). This is the highest-visibility broken flow in the whole app.

### Module 3 — Project Detail: close the small loops (S)
Several tabs already have working mutators unused by their own "action buttons" (Update Project, Upload Document toast-only, Archive Project). Wire each to its existing `useData()` method for a consistent "everything here really works" feel — this section is already ~70% functional, it just needs the remaining buttons connected.

### Module 4 — Customer Detail: fill the 4 dead tabs (S)
Filter `d.amc`, `d.tickets`, `d.documents` (already have `customerId`) into the Contacts/AMC/Tickets/Documents tabs instead of static `EmptyState`. High perceived value for low effort since the data already exists.

### Module 5 — Field Operations ↔ Desktop sync (M)
Wire "Start"/"Complete" task buttons to `d.updateTask`, and check-in state to something visible from the desktop (e.g., an employee "on site" indicator). This sells the "one connected system" story, which matters a lot for a CCTV ops company evaluating whether field crews and the office are truly in sync.

### Module 6 — Sales pipeline finishing touches (S)
"Import leads" button currently has no handler at all — give it at least a toast/stub consistent with the rest of the app. Pipeline board and lead CRUD are already solid.

### Module 7 — Notifications: real filtering (S)
Wire the existing filter tabs to actually filter the (ideally now-shared) alert list.

### Module 8 — Calendar: expand beyond Month/July 2026 (M)
Either implement Week/Day/Agenda views or hide the switch until they exist; make dates relative to "today" rather than hardcoded to avoid an obviously stale calendar in a live demo.

### Module 9 — Reports: build out at least 1–2 more categories (M/L)
"Financial" and "Project" reports are natural next categories using data that already exists (`payments`, `projects`, `variations`).

### Module 10 — Settings: make Company Profile actually stick (M)
Control the form, persist to context/state, and reflect the company name in the sidebar/page titles — sells the "multi-tenant, configurable per company" story even before real multi-tenancy is built.

### Module 11 — Procurement & Equipment drill-downs (M)
Currently pure read-only tables with no row click; adding a detail dialog per PO/PR/product would match the interaction pattern already established elsewhere (Surveys, Sales leads).

### Module 12 — True persistence (L, likely out of scope for demo)
Everything above operates on in-memory state that resets on refresh. Not required for a scripted demo (refresh can simply be avoided), but flagged as the eventual real-backend milestone — this is presumably where Supabase/TanStack Query enter the picture per the project's stated direction.
