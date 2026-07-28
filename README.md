# Remix of Al Harib Operations Hub

Build a complete, premium, UI-only operations platform for AL HARIB CCTV COMPANY, a CCTV and security systems contractor based in Qatar. This is a frontend-only interactive prototype for client review. Realistic mock data and local React state only. No backend, no Supabase, no auth, no API calls. Every important button must do something visual: open modals and drawers, change statuses, add and edit and delete records with confirmation, search, filter, sort, switch tabs and views, drag cards between stages, show toasts, update progress bars, preview and print documents. No dead buttons.

WRITING RULE: never use an em dash anywhere, in code, comments, or UI copy. Use periods, commas, colons.

STACK: React, Vite, TypeScript, Tailwind, shadcn/ui, lucide-react icons, recharts for charts. Static SPA, no SSR. Must build cleanly with npm run build to a normal Vite dist. Create vercel.json with an SPA rewrite so every route survives refresh:

{ "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ] }

Remove all Lovable branding, default favicons, and preview metadata. Browser title: "AL HARIB CCTV COMPANY | Operations Command Center".

THE ONE THING THAT MAKES THIS NOT A TEMPLATE: a single shared mock data layer of connected records. Do not build twelve disconnected mini apps. Every module reads from one in-memory dataset where these entities are linked by id: Customer, Site, Lead, SiteSurvey, CameraPoint, Quotation, Project, BOQItem, Task, Milestone, Material, Device, TestRecord, Approval, Variation, Document, PaymentMilestone, AMCContract, ServiceTicket, Employee.

THE GOLDEN THREAD, make this visible and real:

- A CameraPoint captured in a Site Survey (id like CP-01) carries the same id when it becomes a BOQ line, then an installed Device, then a TestRecord, then a Handover checklist item. Show that same CP id as a small mono chip on the Survey page, the Project Device Register, the Testing tab, and the Handover tab, so the user can see one point travel across the whole system.

- A won Lead converts into a Project and inherits customer, site, scope, BOQ, value, payment terms, salesperson, and survey, with zero re-entry. Build a working "Convert to Project" action on an approved quotation that opens the new project pre-filled.

- Clicking a Command Center alert routes to the exact record it refers to.

COMPUTED PROJECT HEALTH, not a hand-typed label: derive each project's health from four inputs stored on the project: schedule variance (actual completion minus planned), material readiness percent, count of open client approvals, count of failed device tests. Produce a label (On Track, Watch, At Risk, Awaiting Materials, Delayed) AND a "Health Drivers" panel that lists the actual reasons, for example "Installation 15% behind schedule", "Two critical materials not delivered", "1 client approval pending", "3 devices failed testing". Never show a single bare percentage with no explanation.

VISUAL IDENTITY, deliberately not the generic enterprise look. Define everything as CSS variables and Tailwind theme tokens so a rebrand is one change. Provide a light and dark mode toggle.

- Layout: graphite ink sidebar (near #12161c), light workspace (#f6f7f9) in light mode, white cards, subtle hairline borders. In dark mode: bg #0d1117, surface #151b23.

- Primary brand and critical accent: a confident signal red (#d1343b) used sparingly for the logo mark and critical states only, not everywhere.

- Working interactive accent: a cool slate blue (#3b82c4) for links, active nav, selected states, primary buttons.

- Semantics: success #1f9d63, warning #d9a227, critical red as above. Each with a soft background tint variant.

- Typography with intent: a slightly condensed grotesque for headings and big numbers to give a technical industrial feel (use "Barlow Semi Condensed" or similar), Inter for body, and JetBrains Mono for ALL technical data: project numbers, camera ids, IP addresses, MAC addresses, serial numbers, quantities. This mono-for-device-data treatment is a signature of the product, apply it consistently.

- Dense but readable tables, compact and comfortable density toggle, strong page hierarchy, action-oriented alerts. No stock photos, no decorative gradients, no oversized empty cards.

- Qatar formatting: QAR currency shown as "340,000 QAR", 24-hour time, dates like "20 Jul 2026", Qatar phone format, RTL-ready layout with an Arabic language toggle stub.

APP SHELL:

Left sidebar, collapsible, wordmark "AL HARIB" in the condensed display face with "CCTV COMPANY" small beneath in brand red. Nav in this exact order: Command Center, Sales, Quotations, Site Surveys, Projects, Field Operations, Calendar, Customers, Equipment, Procurement, Service and AMC, Documents, Employees, Reports, Notifications, Settings. Active item uses the slate-blue accent. Bottom of sidebar: current user, role, company name, log out, collapse button.

Top header: breadcrumbs, global search, Quick Create button, date range selector, notifications bell, help, user profile, and a UI-only Role Preview switcher (Owner, Operations Manager, Project Manager, Salesperson, Site Engineer, Technician, Accounts Viewer) that changes which widgets and nav emphasis show. No real auth.

Quick Create menu: New lead, New quotation, New site survey, New project, New task, New site visit, New service ticket, New purchase request, Upload document.

Global search modal: grouped keyboard-navigable results across projects, leads, customers, quotations, equipment, camera ids, serial numbers, employees, documents, tickets.

Now build every module below with real tables, filters, KPIs, detail pages or drawers, and working interactions.

COMMAND CENTER: KPI row (Active projects, Projects at risk, Projects delayed, Open quotations, Weighted pipeline, Revenue under execution, Outstanding collections, Active AMC), each with value, period change, small sparkline, and click-to-filter. A large "Requires Attention" panel of prioritized alerts, each with severity, related project or customer, owner, due date, recommended next action, and Open button. A Project Portfolio Health stacked bar by status with a clickable legend. A project progress table (Project number, name, client, site, PM, current phase, planned progress, actual progress, variance, value, health, next milestone, days remaining, actions). A "Today's Operations" strip (teams on site, visits today, installs today, testing, materials due, overdue tasks). A sales snapshot with a funnel and salesperson leaderboard. An installation progress block (planned cameras, installed, configured, tested, handed over, failed) with progress rings. A financial snapshot (contracted, invoiced, collected, outstanding, expected this month, forecast margin) with a collection chart and payment aging.

SALES: subviews Pipeline, Leads, Follow-Ups, Activities, Targets, Analytics. Drag-and-drop Kanban with stages New Enquiry, Contacted, Qualified, Site Survey Required, Site Survey Scheduled, Survey Completed, Quotation Draft, Quotation Sent, Negotiation, Verbal Approval, Won, Lost. Lead cards show company, contact, value, source, salesperson, next follow-up, days in stage, probability, and an inactivity warning. Views: Kanban, Table, Forecast. Full leads table with the fields and filters a CCTV sales team needs. New Lead form with company and opportunity sections and system types (IP CCTV, Analog CCTV, NVR upgrade, VMS, control room, access control, intercom, structured cabling, maintenance, mixed). Lead detail page with tabs Overview, Timeline, Activities, Site Surveys, Quotations, Documents, Notes, and a chronological activity timeline. Follow-up queue grouped Due today, Overdue, Upcoming, No next action, Inactive. Lost reason capture on marking lost.

QUOTATIONS: keep the module present and navigable but do not over-invest, per client direction it is a lighter area. Provide a quotations dashboard with KPI cards and status tabs (Draft, Internal Approval, Sent, Approved, Rejected, Expired), a quotations table (number, client, opportunity, site, salesperson, revision, created, valid until, total, cost, margin, status, actions), a read-only quotation preview with print view, revision history, and the working Convert Approved Quotation to Project action described above. A full drag-to-build line-item editor is not the priority: a simple line-item table with add and remove and auto totals is enough.

SITE SURVEYS: views Calendar, List, Templates. Surveys table (survey number, client, site, type, engineer, scheduled date, status, completeness, report status, actions) with statuses Requested, Scheduled, In Progress, Completed, Report Pending, Report Approved. Full survey form with general, existing system, and proposed system sections. A repeatable Proposed Camera Point section where each point has id, building, floor, zone, area, indoor or outdoor, camera type, coverage objective, mounting position, mounting height, cable length estimate, power source, network route, notes, photo placeholder, drawing marker placeholder. A survey checklist and a professional survey report preview. Remember the camera point ids thread into the project.

PROJECTS, the most important and comprehensive module. Do not reduce it to a task board. Projects command center with KPIs and view options (Portfolio table, Kanban by phase, Timeline, Gantt, Health matrix). Detailed phases: Project Setup, Design and Planning, Client Approval, Mobilization, Procurement, Material Delivery, Installation, Configuration, Testing, Training, Inspection and Compliance, Handover, Warranty, AMC, plus On Hold, Delayed, Awaiting Client, Awaiting Materials, Rework, Cancelled. New Project wizard (identity, commercial, scope, schedule, team, materials and documents). 

Project detail workspace with a header (name, number, client, site, phase, health, completion, value, dates, PM, quick actions) and these tabs: Overview, Scope and BOQ, Tasks, Timeline and Gantt, Site Activity, Team, Materials, Device Register, Documents, Issues and RFIs, Variations, QA/QC, Testing, Financials, Client Communication, Compliance, Handover, Activity Log.

- Overview: the computed Health Drivers panel, planned vs actual bars, installation and testing completion, material readiness, document completeness, payment collection, open issues, pending approvals, and a milestone list with planned and actual dates.

- Scope and BOQ: table with planned, ordered, delivered, issued, installed, tested, remaining per item, with row-level progress bars.

- Tasks: list and board and Gantt, full task fields and statuses (Not Started, Ready, In Progress, Blocked, Awaiting Client, Awaiting Material, Under Review, Completed).

- Site Activity: daily site report form and log (team present, work completed, cameras installed, cable installed, devices configured, materials used, issues, client instructions, tomorrow's plan).

- Materials: movement sections Required through Installed and Returned, material readiness percent, critical shortage flags.

- Device Register: full installed-device table (device id, camera label, brand, model, serial, MAC, IP, building, floor, zone, indoor or outdoor, switch, switch port, recorder, recorder channel, install date, installer, test result, warranty, status). Camera labels reuse the survey camera point ids. Never put real passwords in mock data, mask any credential field as a secure reference placeholder only.

- Testing: a per-device test checklist (power, network, IP, image, focus, angle, day, night, recording, playback, storage, time, motion, analytics, mounting, label), a failed-test queue that stays open until retested, bulk testing, retest, evidence attachment.

- Financials: project-level commercial tracking (contract value, approved variations, revised value, estimated cost, committed cost, actual cost, invoiced, collected, outstanding, retention, forecast profit and margin) and a payment schedule table with statuses.

- Client Communication: chronological log with owner, due date, related task, confirmation status.

- Compliance: a configurable Qatar-focused tracker, presented as an internal checklist not legal advice, covering required approvals, camera location and quantity schedules, drawing submission, inspection request and result, corrective actions, conformity certificate status, and approval expiry.

- Handover: a readiness checklist across Technical, Documentation, Commercial, and Client sections, with a computed overall handover readiness percentage.

FIELD OPERATIONS: a simplified field interface with today's assigned sites, tasks, check-in and check-out, work instructions, materials issued, installation quantities, testing checklist, raise issue, upload evidence, complete task, client signature placeholder. Provide a mobile layout with a bottom nav (Today, Projects, Tasks, Materials, Profile) and large touch targets. This screen must look simpler and calmer than the management screens.

CALENDAR: month, week, day, agenda views with colored events for follow-ups, surveys, milestones, installs, testing, inspections, meetings, service visits, AMC renewals, payment due dates. Filter by employee, team, project, activity type.

CUSTOMERS: table (customer, industry, main contact, phone, active projects, completed, open quotations, contracted value, outstanding, active AMC, last activity, status) and a detail page with tabs Overview, Contacts, Sites, Opportunities, Quotations, Projects, Equipment, Service History, AMC, Financial Summary, Documents. Support multiple sites per customer.

EQUIPMENT: a product catalogue (SKU, category, brand, model, spec, unit, cost, selling price, markup, stock, reserved, available, reorder level, supplier, warranty, status) across cameras, recorders, storage, switches, racks, monitors, UPS, cabling, accessories, access control. Plus a serialized equipment view linking serials to projects and sites.

PROCUREMENT: purchase requests table (request number, project, requested by, request date, required date, items, cost, priority, approval status, procurement status) and purchase orders table (PO number, supplier, project, amount, order date, expected delivery, delivery status, payment status). A procurement pipeline Requested through Delivered and Closed. Include one overdue PO in critical color.

SERVICE AND AMC: AMC dashboard KPIs (active contracts, expiring within 30 and 90 days, preventive visits due, open tickets, SLA breaches, renewal pipeline, annual value). AMC contract fields (number, customer, site, covered equipment, start, end, visit frequency, value, SLA, assigned engineer, next visit, renewal status). Service tickets with statuses New through Closed and full fields. A preventive maintenance checklist.

DOCUMENTS: a centralized library with folders, tags, categories, projects, customers, revisions, approval statuses, expiry tracking, search, preview, upload simulation, plus a Missing Documents view and an Expiring Documents view.

EMPLOYEES: table (employee, role, department, phone, current project, workload, availability, tasks due, status) and a detail page with tabs Overview, Schedule, Assigned Projects, Tasks, Site Attendance, Productivity, Documents. Departments Management, Sales, Projects, Engineering, Installation, Service, Procurement, Accounts.

REPORTS: a report command center with date and comparison and entity filters, save view, print, CSV export simulation. Build report categories Executive, Project, Sales, Financial, Service and AMC, Compliance and Quality, each with the specific reports a CCTV contractor needs (funnel, planned vs actual, delay reasons, material readiness, cameras planned vs installed vs tested, handover readiness, project profitability, win rate, follow-up compliance, invoiced vs collected, payment aging, AMC expiration forecast, SLA compliance, testing pass and fail rate, failed device report). Use KPI cards, line, bar, stacked bar, funnel, donut, progress rings, ranked tables. Every chart has a title, unit, tooltip, legend where needed, empty state, and clickable drill-down. No decorative charts, each answers a business question.

NOTIFICATIONS: a center grouped by Projects, Sales, Materials, Payments, Service, Approvals, Compliance, System, with read and unread, priority, mark all read, filter, open related record.

SETTINGS: company profile and logo, currency and number and date formats, tax config defaulted to zero, quotation and project and invoice numbering, editable project phases and lead stages and task statuses, product and document categories, employee roles, permissions preview, notification preferences, appearance, language, data export placeholder.

MOCK DATA, Qatar-based and coherent, no lorem ipsum. Locations Doha, West Bay, Lusail, Al Wakrah, Al Rayyan, Industrial Area, The Pearl, Msheireb. Numbering AHC-PRO-2026-001, AHC-QTN-2026-001. Seed at least these four projects so the story reads true across the whole system:

1. AHC-PRO-2026-041 Al Wakrah Warehouse CCTV, Al Wakra Logistics Hub, phase Installation, 62% actual vs 77% planned, material readiness 78% with 16-port PoE switch and 8TB HDD short, 1 approval pending, 3 failed device tests, health At Risk. Camera points CP-01 to CP-24 thread into its device register and testing.

2. AHC-PRO-2026-038 Msheireb Office Tower, phase Testing, 84%, health On Track.

3. AHC-PRO-2026-044 Katara Villa 12, phase Procurement, 25%, health Awaiting Materials.

4. AHC-PRO-2026-035 Lusail Retail Unit, phase Handover, 96%, health On Track, near handover.

Seed matching leads, quotations, surveys, devices, tickets, an AMC expiring in 12 days, and an overdue PO-338, so Command Center alerts point to real records.

QUALITY BAR: this must feel like a serious custom operations platform for a Qatar CCTV contractor, not a generic PM template. Strong hierarchy, fast navigation, clear ownership, real CCTV terminology, connected records throughout. Polished loading, empty, and error states, confirmation dialogs for destructive actions, success toasts. Fully responsive: dense tables and split panels on desktop, scrollable tables on tablet, stacked cards and bottom nav on mobile.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df1a5d4d-b303-418e-8a70-70e80647199a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
