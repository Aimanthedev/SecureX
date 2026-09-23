import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { MonoChip, StatusPill, WorkStatusBadge, countStatus, HealthBadge, EmptyState } from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Printer, Circle, ChevronRight, MoreHorizontal, LayoutGrid,
  Wrench, Coins, ShieldCheck, FolderOpen, Flag, Camera, Package as PackageIcon, ClipboardCheck, TrendingDown,
  Users, MessageSquare, CalendarClock, Settings2, Phone, Mail, ExternalLink, Trash2, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DOC_CATEGORIES, PROJECT_PHASES, PROJECT_ROLES, ISSUE_CATEGORIES, type ProjectPhase, type ProjectRole } from "@/lib/mock-data";
import {
  getProjectHealth, getProjectCurrentValue, getProjectApprovedVariationsTotal, getProjectPendingVariationsTotal,
  getProjectInvoiced, getProjectCollected, getProjectOutstanding, getProjectForecastMargin, getProjectForecastCost,
  getProjectPlannedProgress, getProjectActualProgress, getProjectMaterialStatus, getProjectTestSummary,
  getProjectNextTask, getProjectNextMilestone, getProjectHandoverReadiness, getAssignableEmployees, type SelectorCtx,
} from "@/lib/project-selectors";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({ meta: [{ title: "Project | SecureX CCTV COMPANY" }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = useParams({ from: "/projects/$id" });
  const d = useData();
  const p = d.projects.find((x) => x.id === id);
  if (!p) return <div className="p-6"><Card className="p-6">Project not found. <Link to="/projects" className="text-signal">Back</Link></Card></div>;
  const ctx = d.selectorCtx;
  const health = getProjectHealth(ctx, p.id);
  const cust = d.customers.find((c) => c.id === p.customerId)!;
  const site = d.sites.find((s) => s.id === p.siteId)!;
  const pm = d.employees.find((e) => e.id === p.pmId)!;
  const survey = p.surveyId ? d.surveys.find((s) => s.id === p.surveyId) : undefined;
  const quotation = p.quotationId ? d.quotations.find((q) => q.id === p.quotationId) : undefined;
  const amc = p.amcId ? d.amc.find((a) => a.id === p.amcId) : d.amc.find((a) => a.projectId === p.id);

  const projectTasks = d.tasks.filter((t) => t.projectId === p.id);
  const projectMs = d.milestones.filter((m) => m.projectId === p.id);
  const projectApprovals = d.approvals.filter((a) => a.projectId === p.id);
  const projectVars = d.variations.filter((v) => v.projectId === p.id);
  const projectDocs = d.documents.filter((doc) => doc.projectId === p.id);
  const projectPays = d.payments.filter((pay) => pay.projectId === p.id);
  const projectDevices = d.devices.filter((x) => x.projectId === p.id);
  const projectMats = d.materials.filter((m) => m.projectId === p.id);
  const projectBOQ = d.projectBOQItems.filter((b) => b.projectId === p.id);
  const projectComms = d.communications.filter((c) => c.projectId === p.id);
  const projectActs = d.siteActivities.filter((a) => a.projectId === p.id);
  const projectTests = d.testRecords.filter((t) => t.projectId === p.id);
  const projectHandover = d.handoverItems.filter((h) => h.projectId === p.id);
  const projectCompliance = d.complianceItems.filter((c) => c.projectId === p.id);
  const projectIssues = d.projectIssues.filter((i) => i.projectId === p.id);
  const projectTeam = d.projectTeamMembers.filter((t) => t.projectId === p.id);
  const projectActivity = [...d.projectActivities.filter((a) => a.projectId === p.id)].sort((a, b) => b.ts.localeCompare(a.ts));

  const SECTIONS = useMemo(() => [
    { id: "overview",   label: "Overview",   icon: LayoutGrid,     subs: [{ v: "overview", l: "Summary" }] },
    { id: "execution",  label: "Execution",  icon: Wrench,         subs: [
      { v: "scope", l: "Scope & BOQ" }, { v: "tasks", l: "Tasks" }, { v: "timeline", l: "Timeline" },
      { v: "site", l: "Site Activity" }, { v: "team", l: "Team" }, { v: "materials", l: "Materials" },
      { v: "devices", l: "Device Register" }, { v: "issues", l: "Issues & Snags" },
    ] },
    { id: "commercial", label: "Commercial", icon: Coins,          subs: [{ v: "fin", l: "Financials" }, { v: "vars", l: "Variations" }] },
    { id: "quality",    label: "Quality",    icon: ShieldCheck,    subs: [{ v: "testing", l: "Testing" }, { v: "comp", l: "Compliance" }] },
    { id: "documents",  label: "Documents",  icon: FolderOpen,     subs: [{ v: "docs", l: "Project Documents" }, { v: "comm", l: "Client Communication" }, { v: "log", l: "Activity Log" }] },
    { id: "handover",   label: "Handover",   icon: Flag,           subs: [{ v: "handover", l: "Readiness Checklist" }, { v: "warranty", l: "Warranty & AMC" }] },
  ] as const, []);
  const [section, setSection] = useState<string>("overview");
  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [varOpen, setVarOpen] = useState(false);
  const [commOpen, setCommOpen] = useState(false);
  const activeSection = SECTIONS.find((s) => s.id === section) || SECTIONS[0];
  const goTo = (sub: string) => {
    const sec = SECTIONS.find((s) => s.subs.some((x) => x.v === sub));
    if (sec) setSection(sec.id);
    setTab(sub);
  };

  useEffect(() => {
    if (d.pendingCreate?.projectId === p.id) {
      if (d.pendingCreate.type === "task") goTo("tasks");
      if (d.pendingCreate.type === "issue") goTo("issues");
      d.clearPendingCreate();
    }
  }, [d.pendingCreate]);

  const collected = getProjectCollected(ctx, p.id);
  const invoiced = Math.max(1, getProjectInvoiced(ctx, p.id));
  const currentValue = getProjectCurrentValue(ctx, p.id);
  const forecast = getProjectForecastMargin(ctx, p.id);
  const camsInstalled = projectDevices.filter((x) => x.status !== "Faulty").length;
  const testSummary = getProjectTestSummary(ctx, p.id);
  const daysLeft = daysFromToday(p.plannedEnd);
  const planned = getProjectPlannedProgress(ctx, p.id);
  const actual = getProjectActualProgress(ctx, p.id);
  const scheduleGap = planned - actual;
  const materialStatus = getProjectMaterialStatus(ctx, p.id);
  const nextTask = getProjectNextTask(ctx, p.id);
  const nextMs = getProjectNextMilestone(ctx, p.id);
  const handoverReadiness = getProjectHandoverReadiness(ctx, p.id);
  const isTerminal = ["Handover", "Warranty", "AMC", "Completed", "Cancelled"].includes(p.phase);

  return (
    <div className="space-y-4">
      {/* LAYER 1 — Identity Header */}
      <div className="rounded-2xl border hairline bg-gradient-to-br from-card via-card to-surface-2/60 p-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-5 items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <MonoChip>{p.number}</MonoChip>
              <span className="rounded-full border border-[rgba(133,164,204,0.2)] bg-[rgba(133,164,204,0.08)] px-2.5 py-1 text-[11px] font-medium text-foreground/80">{p.phase}</span>
              <HealthBadge label={health.label} />
              {p.archivedAt && <span className="rounded-full border border-[rgba(133,164,204,0.2)] px-2.5 py-1 text-[10.5px] text-muted-foreground">Archived</span>}
            </div>
            <h1 className="text-2xl md:text-[26px] font-display font-semibold tracking-tight truncate">{p.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span><span className="text-foreground/70">Customer:</span> <Link to="/customers/$id" params={{ id: cust.id }} className="hover:text-signal hover:underline">{cust.name}</Link></span>
              <span><span className="text-foreground/70">Site:</span> {site.name}</span>
              <span><span className="text-foreground/70">PM:</span> {pm.name}</span>
              <span><span className="text-foreground/70">Type:</span> CCTV Installation</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-0">
            <MiniStat label="Current value" value={fmtQAR(currentValue, { compact: true })} sub={getProjectPendingVariationsTotal(ctx, p.id) > 0 ? `+${fmtQAR(getProjectPendingVariationsTotal(ctx, p.id), { compact: true })} pending` : undefined} />
            <MiniStat label="Phase" value={p.phase} accent="signal" />
            <MiniStat label="Planned end" value={fmtDate(p.plannedEnd)} sub={isTerminal ? undefined : daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days over`} accent={!isTerminal && daysLeft < 0 ? "critical" : undefined} />
            <MiniStat label="Materials" value={materialStatus} accent={materialStatus === "Ready" ? "success" : materialStatus === "Shortage" ? "critical" : "warning"} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t hairline">
          <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setSetupOpen(true)}><Settings2 className="w-3.5 h-3.5" />Project Setup</Button>
          <Button size="sm" className="bg-signal text-signal-foreground hover:bg-signal/90 h-8" onClick={() => setEditOpen(true)}>Update Project</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => { d.requestCreate("task", p.id); goTo("tasks"); }}>Add Task</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => goTo("site")}>Add Site Report</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => setCommOpen(true)}>Client Update</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 gap-1"><MoreHorizontal className="w-4 h-4" /> More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => window.print()}><Printer className="w-3.5 h-3.5 mr-2" />Progress Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("docs")}>Upload Document</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { d.requestCreate("issue", p.id); goTo("issues"); }}>Add Issue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("vars")}>Add Variation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("site")}>Schedule Visit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("handover")}>Handover Checklist</DropdownMenuItem>
              <DropdownMenuSeparator />
              {!p.archivedAt ? (
                <DropdownMenuItem onClick={() => setArchiveOpen(true)}>Archive Project</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => { d.unarchiveProject(p.id); toast.success("Project restored."); }}>Restore from Archive</DropdownMenuItem>
              )}
              {p.phase !== "Cancelled" && <DropdownMenuItem onClick={() => setCancelOpen(true)} className="text-critical focus:text-critical">Cancel Project</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* LAYER 2 — Command Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <CommandTile label="Execution" value={`${actual}%`} sub={scheduleGap > 0 ? `${scheduleGap}% behind plan` : "On or ahead of plan"} tone={scheduleGap > 15 ? "critical" : scheduleGap > 5 ? "warning" : "success"} onClick={() => goTo("overview")} />
        <CommandTile label="Schedule" value={isTerminal ? p.phase : daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days over`} sub={`Planned end ${fmtDate(p.plannedEnd)}`} tone={!isTerminal && daysLeft < 0 ? "critical" : "info"} onClick={() => goTo("timeline")} />
        <CommandTile label="Material Status" value={materialStatus} sub={`${projectMats.filter((m) => m.critical && m.delivered < m.required).length} critical items`} tone={materialStatus === "Ready" ? "success" : materialStatus === "Shortage" ? "critical" : "warning"} onClick={() => goTo("materials")} />
        <CommandTile label="Cameras Installed" value={projectDevices.length ? `${camsInstalled} / ${projectDevices.length}` : "Not registered"} sub={projectDevices.length ? `${projectDevices.length - camsInstalled} remaining` : "Awaiting delivery"} tone="info" icon={Camera} onClick={() => goTo("devices")} />
        <CommandTile label="Tests Passed" value={testSummary.total ? `${testSummary.pass} / ${testSummary.total}` : "Not started"} sub={testSummary.fail ? `${testSummary.fail} failures` : testSummary.total ? "No failures" : "No devices yet"} tone={testSummary.fail ? "critical" : testSummary.total ? "success" : "info"} icon={ClipboardCheck} onClick={() => goTo("testing")} />
        <CommandTile label="Collected" value={fmtQAR(collected, { compact: true })} sub={`of ${fmtQAR(invoiced, { compact: true })} invoiced`} tone="success" icon={Coins} onClick={() => goTo("fin")} />
      </div>

      {/* LAYER 3 — Primary Section Nav */}
      <div className="rounded-xl border hairline bg-card/60 p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setSection(s.id); setTab(s.subs[0].v); }}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all",
                active ? "bg-signal text-signal-foreground shadow-sm shadow-signal/20" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
              )}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* LAYER 4 — Contextual Sub-nav */}
      {activeSection.subs.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[12px] px-1 -mt-2">
          {activeSection.subs.map((s) => {
            const active = tab === s.v;
            return (
              <button
                key={s.v}
                onClick={() => setTab(s.v)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-md transition-colors border",
                  active ? "bg-signal-soft text-signal border-signal/30" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2"
                )}
              >
                {s.l}
              </button>
            );
          })}
        </div>
      )}

      {/* LAYER 5 — Workspace with intelligence rail */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="min-w-0">
      <Tabs value={tab} onValueChange={setTab}>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2">
              <h3 className="font-display font-semibold text-lg mb-2">Health Drivers</h3>
              <p className="text-xs text-muted-foreground mb-3">Reasons behind this project's health score. Computed from schedule variance, material readiness, open approvals, failed tests, overdue tasks/milestones, and open critical issues.</p>
              <div className="space-y-2">{health.drivers.map((dr, i) => (
                <div key={i} className="flex items-start gap-2 p-2 border hairline rounded-md">
                  {dr.severity === "critical" ? <AlertTriangle className="w-4 h-4 text-critical mt-0.5" /> : dr.severity === "warning" ? <AlertTriangle className="w-4 h-4 text-warning mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />}
                  <div className="text-sm">{dr.text}</div>
                </div>
              ))}</div>
            </Card>
            <Card className="p-4 space-y-3">
              <h3 className="font-display font-semibold text-lg">Site & Client</h3>
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Site</div>
                <div className="text-foreground">{site.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{site.address}</div>
              </div>
              {(site.contact || cust.contact) && (
                <div className="text-sm">
                  <div className="text-xs text-muted-foreground">Site contact</div>
                  <div className="text-foreground">{site.contact ?? cust.contact}</div>
                  <div className="mt-1 flex gap-2">
                    <a href={`tel:${(site.contactPhone ?? cust.phone).replace(/\s/g, "")}`} className="inline-flex items-center gap-1 rounded-md border hairline px-2 py-1 text-[11px] text-signal"><Phone className="w-3 h-3" />Call</a>
                    <a href={`mailto:${cust.email}`} className="inline-flex items-center gap-1 rounded-md border hairline px-2 py-1 text-[11px] text-signal"><Mail className="w-3 h-3" />Email</a>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t hairline text-xs">
                <div>
                  <div className="text-muted-foreground">Survey</div>
                  {survey ? <button onClick={() => setSetupOpen(true)} className="text-signal hover:underline inline-flex items-center gap-1">{survey.number}<ExternalLink className="w-3 h-3" /></button> : <span className="text-muted-foreground">Not linked</span>}
                </div>
                <div>
                  <div className="text-muted-foreground">Quotation</div>
                  {quotation ? <button onClick={() => setSetupOpen(true)} className="text-signal hover:underline inline-flex items-center gap-1">{quotation.number}<ExternalLink className="w-3 h-3" /></button> : <span className="text-muted-foreground">Not linked</span>}
                </div>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-display font-semibold text-lg mb-3">Next Up</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 border hairline rounded-md">
                  <span className="text-muted-foreground">Next task</span>
                  <span className="text-foreground font-medium">{nextTask ? nextTask.title : "No open tasks"}</span>
                </div>
                <div className="flex items-center justify-between p-2 border hairline rounded-md">
                  <span className="text-muted-foreground">Next milestone</span>
                  <span className="text-foreground font-medium">{nextMs ? `${nextMs.title} · ${fmtDate(nextMs.planned)}` : "None remaining"}</span>
                </div>
                <div className="flex items-center justify-between p-2 border hairline rounded-md">
                  <span className="text-muted-foreground">Team on site</span>
                  <span className="text-foreground font-medium">{projectTeam.length} member{projectTeam.length === 1 ? "" : "s"}</span>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-display font-semibold text-lg mb-3">Milestones</h3>
              {projectMs.length === 0 ? <EmptyState title="No milestones yet" hint="Add one from the Timeline tab." /> : (
                <div className="divide-y hairline">{projectMs.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center gap-3">
                    {m.done ? <CheckCircle2 className="w-4 h-4 text-success" /> : daysFromToday(m.planned) < 0 ? <AlertTriangle className="w-4 h-4 text-warning" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                    <div className="flex-1 text-sm">{m.title}</div>
                    <div className="text-xs text-muted-foreground">Planned <span className="num">{fmtDate(m.planned)}</span> {m.actual && <>· Actual <span className="num">{fmtDate(m.actual)}</span></>}</div>
                  </div>
                ))}</div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scope" className="mt-4"><BOQTab project={p} items={projectBOQ} quotation={quotation} /></TabsContent>

        <TabsContent value="tasks" className="mt-4"><TasksTab projectId={p.id} tasks={projectTasks} /></TabsContent>

        <TabsContent value="timeline" className="mt-4"><TimelineTab project={p} milestones={projectMs} /></TabsContent>

        <TabsContent value="site" className="mt-4"><SiteActivityTab projectId={p.id} activities={projectActs} /></TabsContent>

        <TabsContent value="team" className="mt-4"><TeamTab projectId={p.id} team={projectTeam} pmId={p.pmId} /></TabsContent>

        <TabsContent value="materials" className="mt-4"><Card className="p-0">
          <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Materials</h3><WorkStatusBadge status={materialStatus === "Ready" ? "Completed" : materialStatus === "Shortage" ? "Blocked" : materialStatus === "Not Started" ? "Not Started" : "In Progress"} /></div>
          {projectMats.length === 0 ? <div className="p-4"><EmptyState title="No material requirements logged yet" hint="Material tracking starts once the BOQ is imported and a purchase request is raised." action={<Button size="sm" onClick={() => goTo("scope")}>Go to Scope & BOQ</Button>} /></div> : (
            <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["SKU","Item","Req","Ord","Del","Iss","Inst","Ret","Status"].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr></thead>
              <tbody>{projectMats.map((m) => (<tr key={m.id} className="border-t hairline"><td className="py-2 px-2 num text-xs">{m.sku}</td><td className="py-2 px-2 text-xs">{m.name}</td><td className="py-2 px-2 num text-xs">{m.required}</td><td className="py-2 px-2 num text-xs">{m.ordered}</td><td className="py-2 px-2 num text-xs">{m.delivered}</td><td className="py-2 px-2 num text-xs">{m.issued}</td><td className="py-2 px-2 num text-xs">{m.installed}</td><td className="py-2 px-2 num text-xs">{m.returned}</td><td className="py-2 px-2">{m.critical && m.delivered < m.required ? <StatusPill status="Shortage" tone="critical" /> : m.installed === m.required ? <StatusPill status="Complete" tone="success" /> : <StatusPill status="In flight" tone="info" />}</td></tr>))}</tbody>
            </table>
          )}
          <div className="p-3 border-t hairline">
            <Button size="sm" variant="outline" onClick={() => {
              const pr = d.addPurchaseRequest({ number: `AHC-PR-2026-${String(104 + d.purchaseRequests.length).padStart(3, "0")}`, projectId: p.id, requestedBy: p.pmId, requestDate: new Date().toISOString().slice(0, 10), requiredDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10), items: Math.max(1, projectMats.filter((m) => m.delivered < m.required).length), cost: 0, priority: "Medium", approvalStatus: "Pending", procurementStatus: "Requested" });
              toast.success(`Purchase request ${pr.number} raised — continue it in Procurement.`);
            }}>Create Purchase Request</Button>
          </div>
        </Card></TabsContent>

        <TabsContent value="devices" className="mt-4"><DevicesTab project={p} devices={projectDevices} boq={projectBOQ} /></TabsContent>

        <TabsContent value="issues" className="mt-4"><IssuesTab projectId={p.id} issues={projectIssues} devices={projectDevices} /></TabsContent>

        <TabsContent value="docs" className="mt-4"><DocsTab project={p} docs={projectDocs} /></TabsContent>

        <TabsContent value="vars" className="mt-4"><Card className="p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-display font-semibold text-lg">Variations</h3><Button size="sm" onClick={() => setVarOpen(true)}>New variation</Button></div>
          <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Approved total: <span className="num text-foreground font-medium">{fmtQAR(getProjectApprovedVariationsTotal(ctx, p.id))}</span></span>
            <span>Pending approval: <span className="num text-foreground font-medium">{fmtQAR(getProjectPendingVariationsTotal(ctx, p.id))}</span></span>
          </div>
          {projectVars.length === 0 ? <EmptyState title="No variations recorded" /> : (
          <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground"><tr>{["Number","Description","Amount","Status","Date",""].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
            <tbody>{projectVars.map((v) => (<tr key={v.id} className="border-t hairline">
              <td className="py-2 num">{v.number}</td><td className="py-2">{v.description}</td><td className="py-2 num">{fmtQAR(v.amount)}</td>
              <td className="py-2"><StatusPill status={v.status} tone={v.status==="Approved"?"success":v.status==="Rejected"?"critical":"info"} /></td>
              <td className="py-2 num text-xs">{fmtDate(v.date)}</td>
              <td className="py-2">{v.status === "Submitted" && <Button size="sm" variant="ghost" onClick={() => { d.updateVariation(v.id, { status: "Approved" }); toast.success(`${v.number} approved.`); }}>Approve</Button>}</td>
            </tr>))}</tbody>
          </table>
          )}
        </Card></TabsContent>

        <TabsContent value="testing" className="mt-4"><TestingTab projectId={p.id} devices={projectDevices} tests={projectTests} /></TabsContent>

        <TabsContent value="fin" className="mt-4 space-y-4"><FinancialsTab project={p} payments={projectPays} /></TabsContent>

        <TabsContent value="comm" className="mt-4"><CommTab projectId={p.id} comms={projectComms} onLog={() => setCommOpen(true)} /></TabsContent>

        <TabsContent value="comp" className="mt-4"><ComplianceTab projectId={p.id} items={projectCompliance} /></TabsContent>

        <TabsContent value="handover" className="mt-4"><HandoverTab project={p} items={projectHandover} readiness={handoverReadiness} /></TabsContent>

        <TabsContent value="warranty" className="mt-4"><WarrantyTab project={p} amc={amc} /></TabsContent>

        <TabsContent value="log" className="mt-4"><ActivityLogTab projectId={p.id} activity={projectActivity} /></TabsContent>
      </Tabs>
        </div>
        {/* Intelligence Rail */}
        <IntelligenceRail
          section={section}
          project={p}
          ctx={ctx}
          health={health}
          milestones={projectMs}
          materials={projectMats}
          tasks={projectTasks}
          devices={projectDevices}
          payments={projectPays}
          docs={projectDocs}
          handoverItems={projectHandover}
          comms={projectComms}
          issues={projectIssues}
          teamCount={projectTeam.length}
          onJump={goTo}
        />
      </div>

      <ProjectSetupSheet open={setupOpen} onOpenChange={setSetupOpen} project={p} survey={survey} quotation={quotation} boqCount={projectBOQ.length} teamCount={projectTeam.length} msCount={projectMs.length} />
      <EditProjectDialog open={editOpen} onOpenChange={setEditOpen} project={p} />
      <NewVariationDialog open={varOpen} onOpenChange={setVarOpen} projectId={p.id} nextNumber={`VO-${String(projectVars.length + 1).padStart(2, "0")}`} />
      <LogCommDialog open={commOpen} onOpenChange={setCommOpen} projectId={p.id} />
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Archive this project?</AlertDialogTitle><AlertDialogDescription>Archived projects are hidden from the active portfolio view but kept for history — this is not the same as cancelling. You can restore it any time from the More menu.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { d.archiveProject(p.id); setArchiveOpen(false); toast.success("Project archived."); }}>Archive</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CancelProjectDialog open={cancelOpen} onOpenChange={setCancelOpen} projectId={p.id} />
    </div>
  );
}

function MiniStat({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: "signal"|"warning"|"success"|"critical" }) {
  const accentCls = accent === "warning" ? "text-warning" : accent === "success" ? "text-success" : accent === "critical" ? "text-critical" : accent === "signal" ? "text-signal" : "text-foreground";
  return (
    <div className="rounded-lg bg-surface-2/70 border hairline px-3 py-2 min-w-[110px]">
      <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-medium">{label}</div>
      <div className={cn("num text-[15px] font-semibold mt-0.5 truncate", accentCls)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

function CommandTile({ label, value, sub, tone = "info", icon: Icon, onClick }: {
  label: string; value: React.ReactNode; sub?: string;
  tone?: "success"|"warning"|"critical"|"info";
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  const toneText = tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-signal";
  return (
    <button onClick={onClick} className="group text-left rounded-xl border hairline bg-card p-3.5 hover:border-signal/40 hover:shadow-md hover:shadow-signal/10 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{label}</div>
        {Icon && <Icon className={cn("w-3.5 h-3.5", toneText)} />}
      </div>
      <div className="mt-2 min-w-0 flex-1">
        <div className="num text-[20px] font-display font-semibold leading-none tabular-nums truncate">{value}</div>
        {sub && <div className={cn("text-[10.5px] mt-1 truncate", toneText)}>{sub}</div>}
      </div>
    </button>
  );
}

function IntelligenceRail({ section, project, ctx, health, milestones, materials, tasks, devices, payments, docs, handoverItems, comms, issues, teamCount, onJump }: {
  section: string;
  project: import("@/lib/mock-data").Project;
  ctx: SelectorCtx;
  health: ReturnType<typeof getProjectHealth>;
  milestones: import("@/lib/mock-data").Milestone[];
  materials: import("@/lib/mock-data").Material[];
  tasks: import("@/lib/mock-data").Task[];
  devices: import("@/lib/mock-data").Device[];
  payments: import("@/lib/mock-data").PaymentMilestone[];
  docs: import("@/lib/mock-data").Doc[];
  handoverItems: import("@/lib/mock-data").HandoverItem[];
  comms: import("@/lib/mock-data").Communication[];
  issues: import("@/lib/mock-data").ProjectIssue[];
  teamCount: number;
  onJump: (v: string) => void;
}) {
  const nextMs = milestones.find((m) => !m.done);
  const shortages = materials.filter((m) => m.critical && m.delivered < m.required);
  const overdue = tasks.filter((t) => daysFromToday(t.due) < 0 && t.status !== "Completed");
  const failedTests = devices.filter((d) => d.testResult === "Fail");
  const overduePay = payments.filter((p) => daysFromToday(p.dueDate) < 0 && p.status !== "Collected");
  const pendingDocs = docs.filter((d) => d.status !== "Approved");
  const remainingHandover = handoverItems.filter((h) => !h.done);
  const lastComm = comms[comms.length - 1];
  const openIssues = issues.filter((i) => i.status !== "Resolved" && i.status !== "Closed");
  const forecast = getProjectForecastMargin(ctx, project.id);
  const outstanding = getProjectOutstanding(ctx, project.id);

  return (
    <aside className="hidden xl:block space-y-3 sticky top-16 self-start">
      <div className="rounded-xl border hairline bg-card p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">Health Score</div>
          <HealthBadge label={health.label} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <div className="num text-3xl font-display font-bold">{health.score}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
      </div>

      {section === "overview" && (
        <>
          {nextMs && (
            <RailCard title="Next Milestone" icon={CalendarClock} onClick={() => onJump("timeline")}>
              <div className="text-sm font-medium truncate">{nextMs.title}</div>
              <div className="text-[11px] text-muted-foreground num mt-0.5">{fmtDate(nextMs.planned)}</div>
            </RailCard>
          )}
          <RailCard title="Current Blockers" icon={AlertTriangle} tone={shortages.length || openIssues.length ? "critical" : "success"}>
            {shortages.length === 0 && openIssues.length === 0 ? <div className="text-xs text-muted-foreground">No critical blockers.</div> : (
              <>
                {shortages.slice(0, 2).map((m) => (
                  <div key={m.id} className="text-xs py-1 border-b hairline last:border-0">
                    <div className="truncate">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground num">{m.delivered} / {m.required}</div>
                  </div>
                ))}
                {openIssues.slice(0, 2).map((i) => (
                  <div key={i.id} className="text-xs py-1 border-b hairline last:border-0 truncate">{i.title}</div>
                ))}
              </>
            )}
          </RailCard>
          {lastComm && (
            <RailCard title="Latest Client Message" icon={MessageSquare} onClick={() => onJump("comm")}>
              <div className="text-xs truncate">{lastComm.subject}</div>
              <div className="text-[10px] text-muted-foreground num mt-0.5">{fmtDate(lastComm.date)} · {lastComm.owner}</div>
            </RailCard>
          )}
        </>
      )}

      {section === "execution" && (
        <>
          {materials.length > 0 && (
            <RailCard title="Material Shortages" icon={PackageIcon} tone={shortages.length ? "critical" : "success"} onClick={() => onJump("materials")}>
              <div className="num text-2xl font-display font-bold">{shortages.length}</div>
              <div className="text-[11px] text-muted-foreground">critical items missing</div>
            </RailCard>
          )}
          <RailCard title="Overdue Tasks" icon={TrendingDown} tone={overdue.length ? "warning" : "success"} onClick={() => onJump("tasks")}>
            <div className="num text-2xl font-display font-bold">{overdue.length}</div>
            <div className="text-[11px] text-muted-foreground">need attention</div>
          </RailCard>
          <RailCard title="Team" icon={Users} onClick={() => onJump("team")}>
            <div className="num text-2xl font-display font-bold">{teamCount}</div>
            <div className="text-[11px] text-muted-foreground">assigned members</div>
          </RailCard>
          {openIssues.length > 0 && (
            <RailCard title="Open Issues" icon={ShieldAlert} tone="warning" onClick={() => onJump("issues")}>
              <div className="num text-2xl font-display font-bold">{openIssues.length}</div>
              <div className="text-[11px] text-muted-foreground">snags/issues open</div>
            </RailCard>
          )}
        </>
      )}

      {section === "commercial" && (
        <>
          <RailCard title="Outstanding" icon={Coins} tone={outstanding > 0 ? "warning" : "success"} onClick={() => onJump("fin")}>
            <div className="num text-2xl font-display font-bold">{fmtQAR(outstanding, { compact: true })}</div>
            <div className="text-[11px] text-muted-foreground">to be collected</div>
          </RailCard>
          <RailCard title="Overdue Invoices" icon={AlertTriangle} tone={overduePay.length ? "critical" : "success"} onClick={() => onJump("fin")}>
            <div className="num text-2xl font-display font-bold">{overduePay.length}</div>
          </RailCard>
          <RailCard title="Forecast Margin" icon={TrendingDown} tone={forecast.pct < 10 ? "warning" : "success"}>
            <div className={cn("num text-2xl font-display font-bold", forecast.pct < 10 ? "text-warning" : "text-success")}>{forecast.pct.toFixed(1)}%</div>
          </RailCard>
        </>
      )}

      {section === "quality" && (
        <>
          <RailCard title="Failed Tests" icon={XCircle} tone={failedTests.length ? "critical" : "success"} onClick={() => onJump("testing")}>
            <div className="num text-2xl font-display font-bold">{failedTests.length}</div>
            <div className="text-[11px] text-muted-foreground">to retest</div>
          </RailCard>
          <RailCard title="Compliance" icon={ShieldCheck} onClick={() => onJump("comp")}>
            <div className="text-xs text-muted-foreground">Track internal approvals and permits.</div>
          </RailCard>
        </>
      )}

      {section === "documents" && (
        <>
          <RailCard title="Pending Approvals" icon={FolderOpen} tone={pendingDocs.length ? "warning" : "success"} onClick={() => onJump("docs")}>
            <div className="num text-2xl font-display font-bold">{pendingDocs.length}</div>
          </RailCard>
          {docs.length > 0 && (
            <RailCard title="Recently Uploaded" icon={FolderOpen}>
              {docs.slice(0, 3).map((d) => (
                <div key={d.id} className="text-xs py-1 border-b hairline last:border-0 truncate">{d.name}</div>
              ))}
            </RailCard>
          )}
        </>
      )}

      {section === "handover" && (
        <>
          <RailCard title="Checklist Remaining" icon={ClipboardCheck} tone={remainingHandover.length ? "warning" : "success"}>
            <div className="num text-2xl font-display font-bold">{remainingHandover.length}</div>
            <div className="text-[11px] text-muted-foreground">of {handoverItems.length} items</div>
          </RailCard>
          <RailCard title="Retention Held" icon={Coins}>
            <div className="num text-lg font-display font-bold">{fmtQAR(project.retention, { compact: true })}</div>
            <div className="text-[11px] text-muted-foreground">released on final sign-off</div>
          </RailCard>
        </>
      )}
    </aside>
  );
}

function RailCard({ title, icon: Icon, tone, onClick, children }: {
  title: string; icon: React.ComponentType<{ className?: string }>;
  tone?: "success"|"warning"|"critical"; onClick?: () => void; children: React.ReactNode;
}) {
  const toneText = tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-signal";
  return (
    <button onClick={onClick} className={cn("w-full text-left rounded-xl border hairline bg-card p-3.5 hover:border-signal/40 transition-all block", !onClick && "cursor-default")}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold flex items-center gap-1.5"><Icon className={cn("w-3 h-3", toneText)} />{title}</div>
        {onClick && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
      </div>
      {children}
    </button>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return <div className="border hairline rounded-lg p-3 min-w-[140px]"><div className="text-[10px] uppercase text-muted-foreground">{label}</div><div className="num text-lg font-semibold">{value}</div>{sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}</div>;
}

// ---------- Project Setup ----------

function ProjectSetupSheet({ open, onOpenChange, project, survey, quotation, boqCount, teamCount, msCount }: {
  open: boolean; onOpenChange: (o: boolean) => void; project: import("@/lib/mock-data").Project;
  survey?: import("@/lib/mock-data").SiteSurvey; quotation?: import("@/lib/mock-data").Quotation;
  boqCount: number; teamCount: number; msCount: number;
}) {
  const d = useData();
  const cust = d.customers.find((c) => c.id === project.customerId)!;
  const site = d.sites.find((s) => s.id === project.siteId)!;
  const rows: { label: string; done: boolean; hint?: string; action?: { label: string; go: () => void } }[] = [
    { label: "Client & Site", done: true },
    { label: "Linked Site Survey", done: !!survey, hint: survey ? survey.number : "No survey linked yet" },
    { label: "Approved Quotation", done: !!quotation, hint: quotation ? quotation.number : "No quotation linked yet" },
    { label: "Project BOQ", done: boqCount > 0, hint: boqCount > 0 ? `${boqCount} line items` : "Not created yet" },
    { label: "Project Team", done: teamCount > 1, hint: `${teamCount} member${teamCount === 1 ? "" : "s"} assigned` },
    { label: "Milestones", done: msCount > 0, hint: msCount > 0 ? `${msCount} milestones` : "None scheduled" },
    { label: "Commercial Baseline", done: project.estimatedCost > 0, hint: project.estimatedCost > 0 ? "Set" : "Missing estimated cost" },
    { label: "Handover Setup", done: ["Handover", "Warranty", "AMC", "Completed"].includes(project.phase) ? true : false, hint: ["Handover", "Warranty", "AMC", "Completed"].includes(project.phase) ? "In progress" : "Not required yet" },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle>Project Setup — {project.number}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border hairline p-3">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-1.5 border-b hairline last:border-0 text-sm">
                <span className="text-foreground">{r.label}</span>
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{r.hint}</span>
                  <StatusPill status={r.done ? "Complete" : "Needs attention"} tone={r.done ? "success" : "warning"} />
                </span>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Client & Site</div>
            <div className="rounded-lg border hairline p-3 text-sm space-y-1">
              <div>Client: <Link to="/customers/$id" params={{ id: cust.id }} className="text-signal hover:underline">{cust.name}</Link></div>
              <div className="text-xs text-muted-foreground">{site.name} · {site.address}</div>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Origin / Commercial Source</div>
            <div className="rounded-lg border hairline p-3 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Site survey</span>
                {survey ? <span className="text-foreground">{survey.number}</span> : <span className="text-muted-foreground">Not linked</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Approved quotation</span>
                {quotation ? <span className="text-foreground">{quotation.number}</span> : <span className="text-muted-foreground">Not linked</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contract value</span>
                <span className="num text-foreground">{fmtQAR(project.contractValue)}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">Use the Execution and Commercial tabs to build out the team, BOQ, milestones, and commercial baseline in detail.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EditProjectDialog({ open, onOpenChange, project }: { open: boolean; onOpenChange: (o: boolean) => void; project: import("@/lib/mock-data").Project }) {
  const d = useData();
  const [form, setForm] = useState({ name: project.name, phase: project.phase, plannedStart: project.plannedStart, plannedEnd: project.plannedEnd, contractValue: project.contractValue });
  useEffect(() => { if (open) setForm({ name: project.name, phase: project.phase, plannedStart: project.plannedStart, plannedEnd: project.plannedEnd, contractValue: project.contractValue }); }, [open, project]);
  const TERMINAL: ProjectPhase[] = ["Handover", "Warranty", "AMC", "Completed"];
  const attemptingBigJump = TERMINAL.includes(form.phase) && !TERMINAL.includes(project.phase);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Project</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Project name</span><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Phase</span>
            <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v as ProjectPhase })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROJECT_PHASES.filter((ph) => ph !== "Cancelled").map((ph) => <SelectItem key={ph} value={ph}>{ph}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label><span className="text-xs text-muted-foreground">Planned start</span><Input type="date" value={form.plannedStart} onChange={(e) => setForm({ ...form, plannedStart: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Planned end</span><Input type="date" value={form.plannedEnd} onChange={(e) => setForm({ ...form, plannedEnd: e.target.value })} /></label>
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Contract value (QAR)</span><Input type="number" value={form.contractValue} onChange={(e) => setForm({ ...form, contractValue: Number(e.target.value) })} /></label>
        </div>
        {attemptingBigJump && (
          <div className="mt-2 rounded-md border border-warning/40 bg-warning/10 p-2.5 text-xs text-warning">
            Moving straight to "{form.phase}" skips the normal installation/testing progression. This will be recorded, but double-check the project is really ready — currently {getProjectActualProgress(d.selectorCtx, project.id)}% complete on record.
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (form.plannedEnd < form.plannedStart) { toast.error("Planned end cannot be before planned start"); return; }
            if (form.phase !== project.phase) d.setProjectPhase(project.id, form.phase);
            d.updateProject(project.id, { name: form.name, plannedStart: form.plannedStart, plannedEnd: form.plannedEnd, contractValue: form.contractValue });
            onOpenChange(false);
            toast.success("Project updated.");
          }}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelProjectDialog({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (o: boolean) => void; projectId: string }) {
  const d = useData();
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Cancel this project?</AlertDialogTitle><AlertDialogDescription>Cancelling stops the project's lifecycle — this is different from archiving, which only hides a finished project from active views. This cannot be undone from here.</AlertDialogDescription></AlertDialogHeader>
        <Input placeholder="Reason for cancellation" value={reason} onChange={(e) => setReason(e.target.value)} />
        <AlertDialogFooter><AlertDialogCancel>Back</AlertDialogCancel><AlertDialogAction onClick={() => { d.cancelProject(projectId, reason || "Not specified"); onOpenChange(false); toast.success("Project cancelled."); }}>Cancel project</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------- Scope & BOQ ----------

function BOQTab({ project, items, quotation }: { project: import("@/lib/mock-data").Project; items: import("@/lib/mock-data").ProjectBOQItem[]; quotation?: import("@/lib/mock-data").Quotation }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ sku: "", description: "", category: "Camera", unit: "pcs", qty: 1, unitPrice: 0 });
  if (items.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          title="No project BOQ has been created yet"
          hint="Import the awarded scope from the linked quotation, or start building it manually."
          action={
            <div className="flex gap-2">
              {quotation && quotation.items.length > 0 && (
                <Button size="sm" onClick={() => { const n = d.importBOQFromQuotation(project.id); toast.success(`Imported ${n} BOQ lines from ${quotation.number}.`); }}>Import from Quotation</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>+ Add BOQ Item</Button>
            </div>
          }
        />
        <BOQAddDialog open={addOpen} onOpenChange={setAddOpen} projectId={project.id} form={form} setForm={setForm} />
      </Card>
    );
  }
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-3 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-display font-semibold text-lg">Scope & BOQ</h3>
        <div className="flex gap-2">
          {quotation && quotation.items.length > 0 && <Button size="sm" variant="outline" onClick={() => { const n = d.importBOQFromQuotation(project.id); toast.success(`Imported ${n} more line(s) from ${quotation.number}.`); }}>Re-import from Quotation</Button>}
          <Button size="sm" onClick={() => setAddOpen(true)}>+ Add BOQ Item</Button>
        </div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["SKU","Description","Category","Qty","Unit Price","Delivered","Status",""].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr></thead>
        <tbody>{items.map((it) => (
          <tr key={it.id} className="border-t hairline">
            <td className="py-2 px-2 num text-xs">{it.sku}</td>
            <td className="py-2 px-2 text-xs">{it.description}</td>
            <td className="py-2 px-2 text-xs">{it.category}</td>
            <td className="py-2 px-2 num text-xs">{it.qty} {it.unit}</td>
            <td className="py-2 px-2 num text-xs">{fmtQAR(it.unitPrice)}</td>
            <td className="py-2 px-2 num text-xs">{it.delivered} / {it.qty}</td>
            <td className="py-2 px-2 w-32"><WorkStatusBadge status={countStatus(it.delivered, it.qty)} /></td>
            <td className="py-2 px-2"><Button size="sm" variant="ghost" className="text-critical" onClick={() => d.deleteBOQItem(it.id)}><Trash2 className="w-3.5 h-3.5" /></Button></td>
          </tr>
        ))}</tbody>
      </table></div>
      <BOQAddDialog open={addOpen} onOpenChange={setAddOpen} projectId={project.id} form={form} setForm={setForm} />
    </Card>
  );
}

function BOQAddDialog({ open, onOpenChange, projectId, form, setForm }: { open: boolean; onOpenChange: (o: boolean) => void; projectId: string; form: { sku: string; description: string; category: string; unit: string; qty: number; unitPrice: number }; setForm: (f: any) => void }) {
  const d = useData();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add BOQ Item</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label><span className="text-xs text-muted-foreground">SKU</span><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Category</span>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Camera", "Recorder", "Storage", "Network", "Cabling", "Rack", "Access Control", "Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Description</span><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Quantity</span><Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} /></label>
          <label><span className="text-xs text-muted-foreground">Unit price (QAR)</span><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!form.sku.trim() || !form.description.trim()) { toast.error("SKU and description are required"); return; }
            if (form.qty <= 0) { toast.error("Quantity must be greater than 0"); return; }
            d.addBOQItem({ projectId, sku: form.sku.trim(), description: form.description.trim(), category: form.category, unit: form.unit || "pcs", qty: form.qty, unitPrice: form.unitPrice, delivered: 0 });
            onOpenChange(false);
            toast.success("BOQ item added.");
          }}>Add item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Timeline / Milestones (date-driven) ----------

function TimelineTab({ project, milestones }: { project: import("@/lib/mock-data").Project; milestones: import("@/lib/mock-data").Milestone[] }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", planned: project.plannedEnd, owner: project.pmId, notes: "" });
  const dates = [project.plannedStart, project.plannedEnd, ...milestones.map((m) => m.planned), ...milestones.filter((m) => m.actual).map((m) => m.actual!)];
  const rangeStart = dates.reduce((a, b) => (a < b ? a : b));
  const rangeEnd = dates.reduce((a, b) => (a > b ? a : b));
  const totalDays = Math.max(1, daysFromToday(rangeEnd) - daysFromToday(rangeStart));
  const posOf = (iso: string) => Math.min(100, Math.max(0, ((daysFromToday(iso) - daysFromToday(rangeStart)) / totalDays) * 100));
  const todayPos = posOf(new Date().toISOString().slice(0, 10));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-lg">Timeline</h3>
        <Button size="sm" onClick={() => { setForm({ title: "", planned: project.plannedEnd, owner: project.pmId, notes: "" }); setAddOpen(true); }}>+ Add Milestone</Button>
      </div>
      {milestones.length === 0 ? <EmptyState title="No milestones scheduled" hint="Add key delivery checkpoints for this project." /> : (
        <div className="space-y-2.5">
          <div className="relative h-5 mb-1">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
            <div className="absolute top-0 bottom-0 w-px bg-signal" style={{ left: `${todayPos}%` }} title="Today" />
          </div>
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-xs group">
              <div className="w-44 truncate">{m.title}</div>
              <div className="flex-1 h-5 relative">
                <div className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-muted w-full" />
                <div
                  className={cn("absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2", m.done ? "bg-success border-success" : daysFromToday(m.planned) < 0 ? "bg-critical border-critical" : "bg-signal border-signal")}
                  style={{ left: `calc(${posOf(m.planned)}% - 6px)` }}
                  title={fmtDate(m.planned)}
                />
              </div>
              <div className="num w-24 text-right">{fmtDate(m.planned)}</div>
              <div className="w-24 text-right">
                {!m.done ? <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => { d.completeMilestone(m.id); toast.success("Milestone completed."); }}>Complete</Button> : <StatusPill status="Done" tone="success" />}
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <label className="block"><span className="text-xs text-muted-foreground">Title</span><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Planned date</span><Input type="date" value={form.planned} onChange={(e) => setForm({ ...form, planned: e.target.value })} /></label>
            <label className="block"><span className="text-xs text-muted-foreground">Owner</span>
              <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{getAssignableEmployees(d.employees).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.title.trim()) { toast.error("Title is required"); return; }
              d.addMilestone({ projectId: project.id, title: form.title.trim(), planned: form.planned, done: false, owner: form.owner });
              setAddOpen(false);
              toast.success("Milestone added.");
            }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Tasks (role-filtered assignees) ----------

function TasksTab({ projectId, tasks }: { projectId: string; tasks: import("@/lib/mock-data").Task[] }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const assignable = getAssignableEmployees(d.employees);
  const [newT, setNewT] = useState({ title: "", assigneeId: assignable[0]?.id ?? "E-010", phase: "Installation", due: new Date().toISOString().slice(0,10), priority: "Medium" as const });
  useEffect(() => {
    if (d.pendingCreate?.type === "task" && d.pendingCreate.projectId === projectId) { setAddOpen(true); d.clearPendingCreate(); }
  }, [d.pendingCreate]);
  return (
    <Card className="p-0">
      <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Tasks</h3><Button size="sm" onClick={() => setAddOpen(true)}>+ Add Task</Button></div>
      {tasks.length === 0 ? <div className="p-4"><EmptyState title="No tasks yet" /></div> : (
      <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Task","Assignee","Phase","Priority","Due","Status",""].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
        <tbody>{tasks.map((t) => {
          const emp = d.employees.find((e) => e.id === t.assigneeId);
          const overdue = daysFromToday(t.due) < 0 && t.status !== "Completed";
          return (<tr key={t.id} className="border-t hairline">
            <td className="py-2 px-3 text-sm">{t.title}</td><td className="py-2 px-3 text-xs">{emp?.name}</td><td className="py-2 px-3 text-xs">{t.phase}</td>
            <td className="py-2 px-3"><StatusPill status={t.priority} tone={t.priority==="Critical"?"critical":t.priority==="High"?"warning":"neutral"} /></td>
            <td className={cn("py-2 px-3 num text-xs", overdue && "text-critical")}>{fmtDate(t.due)}{overdue && " (overdue)"}</td>
            <td className="py-2 px-3"><Select value={t.status} onValueChange={(v) => { d.updateTask(t.id, { status: v as never }); toast(`Task status: ${v}`); }}><SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger><SelectContent>{["Not Started","Ready","In Progress","Blocked","Awaiting Client","Awaiting Material","Under Review","Completed"].map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select></td>
            <td className="py-2 px-3"><Button size="sm" variant="ghost" onClick={() => setConfirmDel(t.id)} className="text-critical">Delete</Button></td>
          </tr>);
        })}</tbody>
      </table>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add task</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Title</span><Input value={newT.title} onChange={(e) => setNewT({ ...newT, title: e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Assignee</span><Select value={newT.assigneeId} onValueChange={(v) => setNewT({ ...newT, assigneeId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{assignable.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.role}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Priority</span><Select value={newT.priority} onValueChange={(v) => setNewT({ ...newT, priority: v as never })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Low","Medium","High","Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Due</span><Input type="date" value={newT.due} onChange={(e) => setNewT({ ...newT, due: e.target.value })} /></label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => { if (!newT.title) { toast.error("Title is required"); return; } d.addTask({ projectId, ...newT, status: "Not Started", progress: 0 }); setAddOpen(false); toast.success("Task added."); setNewT({ ...newT, title: "" }); }}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete task?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (confirmDel) { d.deleteTask(confirmDel); toast.success("Task deleted."); } setConfirmDel(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ---------- Team ----------

function TeamTab({ projectId, team, pmId }: { projectId: string; team: import("@/lib/mock-data").ProjectTeamMember[]; pmId: string }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const assignable = getAssignableEmployees(d.employees);
  const [form, setForm] = useState<{ employeeId: string; role: ProjectRole }>({ employeeId: assignable[0]?.id ?? "", role: "CCTV Technician" });
  return (
    <Card className="p-0">
      <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Team</h3><Button size="sm" onClick={() => setAddOpen(true)}>Manage Team</Button></div>
      {team.length === 0 ? <div className="p-4"><EmptyState title="No team assigned yet" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 pt-2">
          {team.map((m) => {
            const e = d.employees.find((x) => x.id === m.employeeId);
            if (!e) return null;
            return (
              <div key={m.id} className="border hairline rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-signal/15 text-signal grid place-items-center text-sm font-semibold shrink-0">{e.name.split(" ").map((n) => n[0]).slice(0,2).join("")}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}{m.employeeId === pmId ? " · PM" : ""}</div>
                </div>
                {m.employeeId !== pmId && (
                  <Button size="sm" variant="ghost" className="text-critical shrink-0" onClick={() => { d.removeTeamMember(m.id); toast.success(`${e.name} removed.`); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label><span className="text-xs text-muted-foreground">Employee</span>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{assignable.filter((e) => !team.some((t) => t.employeeId === e.id)).map((e) => <SelectItem key={e.id} value={e.id}>{e.name} · {e.role}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label><span className="text-xs text-muted-foreground">Project role</span>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as ProjectRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROJECT_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Close</Button>
            <Button onClick={() => {
              if (!form.employeeId) { toast.error("Choose an employee"); return; }
              d.addTeamMember(projectId, form.employeeId, form.role);
              toast.success("Team member added.");
            }}>Add to team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Devices ----------

function DevicesTab({ project, devices, boq }: { project: import("@/lib/mock-data").Project; devices: import("@/lib/mock-data").Device[]; boq: import("@/lib/mock-data").ProjectBOQItem[] }) {
  const d = useData();
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const filt = devices.filter((dv) => (dv.label + dv.ip + dv.serial + dv.mac).toLowerCase().includes(q.toLowerCase()));
  const cameraQty = boq.filter((b) => b.category === "Camera").reduce((s, b) => s + b.qty, 0);
  const [form, setForm] = useState({ label: "", brand: "Hikvision", model: "", serial: "", zone: "" });

  if (devices.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          title="No devices registered yet"
          hint={cameraQty > 0 ? `BOQ calls for ${cameraQty} camera(s). Register devices once materials arrive on site.` : "Register devices once materials arrive on site."}
          action={<Button size="sm" onClick={() => setAddOpen(true)}>+ Add Device</Button>}
        />
        <DeviceAddDialog open={addOpen} onOpenChange={setAddOpen} projectId={project.id} form={form} setForm={setForm} />
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-3 flex items-center gap-2 flex-wrap">
        <h3 className="font-display font-semibold text-lg">Device Register</h3>
        {cameraQty > 0 && <span className="text-xs text-muted-foreground">{devices.length} of {cameraQty} BOQ cameras registered</span>}
        <Input placeholder="Search label, IP, serial, MAC." value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-64 ml-auto" />
        <Button size="sm" onClick={() => setAddOpen(true)}>+ Add Device</Button>
      </div>
      <div className="overflow-x-auto max-h-[520px]">
        <table className="w-full text-xs"><thead className="text-[10px] uppercase text-muted-foreground bg-muted/40 sticky top-0"><tr>{["Label","Brand","Model","Serial","MAC","IP","Building","Floor","Zone","Switch","Port","Ch","Install","Test","Status"].map((h) => <th key={h} className="text-left py-2 px-2 whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{filt.map((dv) => (<tr key={dv.id} className="border-t hairline hover:bg-muted/30">
            <td className="py-1.5 px-2"><MonoChip>{dv.label}</MonoChip></td><td className="py-1.5 px-2">{dv.brand}</td><td className="py-1.5 px-2">{dv.model}</td>
            <td className="py-1.5 px-2 num">{dv.serial}</td><td className="py-1.5 px-2 num">{dv.mac}</td><td className="py-1.5 px-2 num">{dv.ip}</td>
            <td className="py-1.5 px-2">{dv.building}</td><td className="py-1.5 px-2">{dv.floor}</td><td className="py-1.5 px-2">{dv.zone}</td>
            <td className="py-1.5 px-2 num">{dv.switch}</td><td className="py-1.5 px-2 num">{dv.switchPort}</td><td className="py-1.5 px-2 num">{dv.recorderChannel}</td>
            <td className="py-1.5 px-2 num">{dv.installDate ? fmtDate(dv.installDate) : "-"}</td>
            <td className="py-1.5 px-2"><StatusPill status={dv.testResult} tone={dv.testResult==="Pass"?"success":dv.testResult==="Fail"?"critical":"warning"} /></td>
            <td className="py-1.5 px-2"><StatusPill status={dv.status} tone={dv.status==="Faulty"?"critical":dv.status==="Tested"?"success":"info"} /></td>
          </tr>))}</tbody>
        </table>
      </div>
      <DeviceAddDialog open={addOpen} onOpenChange={setAddOpen} projectId={project.id} form={form} setForm={setForm} />
    </Card>
  );
}

function DeviceAddDialog({ open, onOpenChange, projectId, form, setForm }: { open: boolean; onOpenChange: (o: boolean) => void; projectId: string; form: { label: string; brand: string; model: string; serial: string; zone: string }; setForm: (f: any) => void }) {
  const d = useData();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Device</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label><span className="text-xs text-muted-foreground">Label (e.g. CP-01)</span><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Zone</span><Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Brand</span><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Model</span><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></label>
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Serial number</span><Input value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} placeholder="Serial can be logged before IP is assigned" /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!form.label.trim()) { toast.error("Label is required"); return; }
            d.addDevice({ projectId, label: form.label.trim(), brand: form.brand, model: form.model, serial: form.serial, mac: "", ip: "", building: "", floor: "", zone: form.zone, indoor: true, switch: "", switchPort: "", recorder: "", recorderChannel: "", testResult: "Pending", warranty: "3 years", status: "Installed" });
            onOpenChange(false);
            toast.success("Device registered.");
          }}>Add device</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Testing ----------

function TestingTab({ projectId, devices, tests }: { projectId: string; devices: import("@/lib/mock-data").Device[]; tests: import("@/lib/mock-data").TestRecord[] }) {
  const d = useData();
  const failed = devices.filter((x) => x.testResult === "Fail");
  const pass = devices.filter((x) => x.testResult === "Pass").length;
  const pending = devices.filter((x) => x.testResult === "Pending" || x.testResult === "Retest").length;
  const checks = ["power","network","ip","image","focus","angle","day","night","recording","playback","storage","time","motion","analytics","mounting","label"];

  if (devices.length === 0) {
    return <Card className="p-6"><EmptyState title="Testing has not started" hint="Devices will appear here once they're registered in the Device Register." /></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total" value={devices.length} /><Stat label="Passed" value={pass} /><Stat label="Failed" value={failed.length} sub={failed.length ? "Open until retested" : ""} /><Stat label="Pending" value={pending} sub={pending ? "Awaiting first test" : ""} />
      </div>
      {failed.length === 0 && pending === 0 && (
        <Card className="p-4 border-success/40"><div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /><span className="text-sm text-foreground">All {devices.length} devices passed testing.</span></div></Card>
      )}
      {failed.length > 0 && (<Card className="p-4 border-critical/40">
        <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-critical" /><h3 className="font-display font-semibold text-lg">Failed Test Queue</h3></div>
        <table className="w-full text-sm"><thead className="text-[10px] uppercase text-muted-foreground"><tr>{["Label","Reason","Tested by","Action"].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
          <tbody>{failed.map((dev) => {
            const rec = tests.find((t) => t.deviceId === dev.id);
            return (<tr key={dev.id} className="border-t hairline">
              <td className="py-2"><MonoChip>{dev.label}</MonoChip></td>
              <td className="py-2 text-xs">{rec?.notes || "Failed inspection"}</td>
              <td className="py-2 text-xs">{d.employees.find((e) => e.id === rec?.testedBy)?.name ?? "—"}</td>
              <td className="py-2"><Button size="sm" variant="outline" onClick={() => { d.recordDeviceTest(dev.id, "Pass"); toast.success(`${dev.label} retest passed.`); }}><RefreshCw className="w-3 h-3 mr-1" />Retest as pass</Button></td>
            </tr>);
          })}</tbody>
        </table>
      </Card>)}
      {pending > 0 && (<Card className="p-4">
        <div className="flex items-center gap-2 mb-3"><ClipboardCheck className="w-4 h-4 text-signal" /><h3 className="font-display font-semibold text-lg">Awaiting First Test</h3></div>
        <div className="flex flex-wrap gap-2">
          {devices.filter((x) => x.testResult === "Pending" || x.testResult === "Retest").map((dev) => (
            <div key={dev.id} className="flex items-center gap-2 rounded-lg border hairline px-2.5 py-1.5 text-xs">
              <MonoChip>{dev.label}</MonoChip>
              <Button size="sm" variant="ghost" className="h-6 px-1.5 text-success" onClick={() => { d.recordDeviceTest(dev.id, "Pass"); toast.success(`${dev.label} passed.`); }}>Pass</Button>
              <Button size="sm" variant="ghost" className="h-6 px-1.5 text-critical" onClick={() => { d.recordDeviceTest(dev.id, "Fail", "Failed inspection"); toast("Marked as failed."); }}>Fail</Button>
            </div>
          ))}
        </div>
      </Card>)}
      <Card className="p-0">
        <div className="p-3"><h3 className="font-display font-semibold text-lg">Per-device Checklist</h3></div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs"><thead className="text-[10px] uppercase text-muted-foreground bg-muted/40 sticky top-0"><tr><th className="text-left py-2 px-2">Device</th>{checks.map((c) => <th key={c} className="text-center py-2 px-1 capitalize">{c}</th>)}<th className="py-2 px-2">Result</th></tr></thead>
            <tbody>{tests.map((t) => { const dev = devices.find((x) => x.id === t.deviceId); return (
              <tr key={t.id} className="border-t hairline">
                <td className="py-1.5 px-2"><MonoChip>{dev?.label}</MonoChip></td>
                {checks.map((c) => { const v = t.checks[c]; return <td key={c} className="text-center">{v === "Pass" ? <CheckCircle2 className="w-3 h-3 text-success inline" /> : v === "Fail" ? <XCircle className="w-3 h-3 text-critical inline" /> : <Circle className="w-3 h-3 text-muted-foreground inline" />}</td>; })}
                <td className="py-1.5 px-2"><StatusPill status={t.result} tone={t.result==="Pass"?"success":t.result==="Fail"?"critical":"warning"} /></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ---------- Issues & Snags ----------

function IssuesTab({ projectId, issues, devices }: { projectId: string; issues: import("@/lib/mock-data").ProjectIssue[]; devices: import("@/lib/mock-data").Device[] }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const assignable = getAssignableEmployees(d.employees);
  const blank = { title: "", category: ISSUE_CATEGORIES[0], description: "", priority: "Medium" as const, assignedTo: assignable[0]?.id ?? "", relatedDeviceId: "none" };
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (d.pendingCreate?.type === "issue" && d.pendingCreate.projectId === projectId) { setForm(blank); setAddOpen(true); d.clearPendingCreate(); }
  }, [d.pendingCreate]);
  const open = issues.filter((i) => i.status !== "Resolved" && i.status !== "Closed");
  const closed = issues.filter((i) => i.status === "Resolved" || i.status === "Closed");

  return (
    <Card className="p-0">
      <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Issues & Snags</h3><Button size="sm" onClick={() => { setForm(blank); setAddOpen(true); }}>+ Add Issue</Button></div>
      {issues.length === 0 ? <div className="p-4"><EmptyState title="No issues logged" hint="Nothing outstanding — snags raised during installation or QA will show here." /></div> : (
        <div className="p-3 pt-0 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Open ({open.length})</div>
            {open.length === 0 ? <div className="text-xs text-muted-foreground">Nothing open.</div> : (
              <div className="space-y-2">{open.map((i) => (
                <div key={i.id} className="border hairline rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><MonoChip>{i.number}</MonoChip><span className="text-sm font-medium text-foreground">{i.title}</span></div>
                    <StatusPill status={i.priority} tone={i.priority === "Critical" ? "critical" : i.priority === "High" ? "warning" : "neutral"} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{i.description}</p>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                    <span>{i.category}{i.zone ? ` · ${i.zone}` : ""} · Raised by {i.raisedBy}</span>
                    <div className="flex items-center gap-2">
                      <Select value={i.status} onValueChange={(v) => d.updateIssue(i.id, { status: v as never, resolvedOn: (v === "Resolved" || v === "Closed") ? new Date().toISOString().slice(0,10) : undefined })}>
                        <SelectTrigger className="h-6 text-[11px] w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>{["Open","Assigned","In Progress","Resolved","Closed"].map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
          {closed.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Resolved ({closed.length})</div>
              <div className="space-y-1.5">{closed.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-xs border-b hairline pb-1.5">
                  <span className="text-muted-foreground line-through">{i.title}</span>
                  <span className="text-muted-foreground">{i.resolvedOn ? fmtDate(i.resolvedOn) : ""}</span>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Issue / Snag</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Title</span><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Camera CP-14 loose mount" /></label>
            <label><span className="text-xs text-muted-foreground">Category</span><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ISSUE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Priority</span><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as never })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Low","Medium","High","Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Assigned to</span><Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{assignable.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></label>
            {devices.length > 0 && (
              <label><span className="text-xs text-muted-foreground">Related device</span>
                <Select value={form.relatedDeviceId} onValueChange={(v) => setForm({ ...form, relatedDeviceId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="none">None</SelectItem>{devices.map((dv) => <SelectItem key={dv.id} value={dv.id}>{dv.label}</SelectItem>)}</SelectContent>
                </Select>
              </label>
            )}
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Description</span><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!form.title.trim()) { toast.error("Title is required"); return; }
              d.addIssue({ projectId, number: `ISS-${projectId}-${String(issues.length + 1).padStart(2, "0")}`, title: form.title.trim(), category: form.category, description: form.description, priority: form.priority, status: "Open", raisedBy: "You", assignedTo: form.assignedTo, raisedOn: new Date().toISOString().slice(0,10), relatedDeviceId: form.relatedDeviceId !== "none" ? form.relatedDeviceId : undefined });
              setAddOpen(false);
              toast.success("Issue logged.");
            }}>Add issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Financials ----------

function FinancialsTab({ project, payments }: { project: import("@/lib/mock-data").Project; payments: import("@/lib/mock-data").PaymentMilestone[] }) {
  const d = useData();
  const ctx = d.selectorCtx;
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const currentValue = getProjectCurrentValue(ctx, project.id);
  const invoiced = getProjectInvoiced(ctx, project.id);
  const collected = getProjectCollected(ctx, project.id);
  const forecast = getProjectForecastMargin(ctx, project.id);
  const forecastCost = getProjectForecastCost(ctx, project.id);
  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>Edit Commercials</Button>
        <Button size="sm" onClick={() => setPayOpen(true)}>+ Payment Milestone</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Original contract" value={fmtQAR(project.contractValue, {compact:true})} />
        <Stat label="Approved variations" value={fmtQAR(getProjectApprovedVariationsTotal(ctx, project.id), {compact:true})} />
        <Stat label="Current contract value" value={fmtQAR(currentValue, {compact:true})} />
        <Stat label="Forecast cost" value={fmtQAR(forecastCost, {compact:true})} sub={project.actualCost > 0 ? "From actuals" : "From estimate"} />
        <Stat label="Invoiced" value={fmtQAR(invoiced, {compact:true})} />
        <Stat label="Collected" value={fmtQAR(collected, {compact:true})} sub={`Outstanding ${fmtQAR(invoiced-collected,{compact:true})}`} />
        <Stat label="Retention" value={fmtQAR(project.retention, {compact:true})} />
        <Stat label="Forecast margin" value={`${forecast.pct.toFixed(1)}%`} sub={fmtQAR(forecast.profit, { compact: true })} />
      </div>
      <Card className="p-0"><div className="p-3"><h3 className="font-display font-semibold text-lg">Payment Schedule</h3></div>
        {payments.length === 0 ? <div className="p-4"><EmptyState title="No payment milestones yet" /></div> : (
        <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Milestone","Amount","Due","Invoiced","Collected","Status","Action"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
          <tbody>{payments.map((pay) => {
            const overdue = pay.status !== "Collected" && daysFromToday(pay.dueDate) < 0;
            return (<tr key={pay.id} className="border-t hairline">
              <td className="py-2 px-3">{pay.label}</td><td className="py-2 px-3 num">{fmtQAR(pay.amount)}</td><td className={cn("py-2 px-3 num text-xs", overdue && "text-critical")}>{fmtDate(pay.dueDate)}</td>
              <td className="py-2 px-3 num text-xs">{pay.invoicedOn ? fmtDate(pay.invoicedOn) : "-"}</td><td className="py-2 px-3 num text-xs">{pay.collectedOn ? fmtDate(pay.collectedOn) : "-"}</td>
              <td className="py-2 px-3"><StatusPill status={overdue ? "Overdue" : pay.status} tone={pay.status==="Collected"?"success":overdue?"critical":pay.status==="Invoiced"?"info":"warning"} /></td>
              <td className="py-2 px-3 flex gap-1">
                {pay.status === "Pending" && <Button size="sm" variant="ghost" onClick={() => { d.markPaymentInvoiced(pay.id); toast.success("Marked invoiced."); }}>Invoice</Button>}
                {pay.status !== "Collected" && <Button size="sm" variant="ghost" onClick={() => { d.markPaymentCollected(pay.id); toast.success("Marked collected."); }}>Collect</Button>}
              </td>
            </tr>);
          })}</tbody>
          </table>
        )}
      </Card>
      <EditCommercialDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <AddPaymentDialog open={payOpen} onOpenChange={setPayOpen} projectId={project.id} />
    </>
  );
}

function EditCommercialDialog({ open, onOpenChange, project }: { open: boolean; onOpenChange: (o: boolean) => void; project: import("@/lib/mock-data").Project }) {
  const d = useData();
  const [form, setForm] = useState({ estimatedCost: project.estimatedCost, committedCost: project.committedCost, actualCost: project.actualCost, retention: project.retention });
  useEffect(() => { if (open) setForm({ estimatedCost: project.estimatedCost, committedCost: project.committedCost, actualCost: project.actualCost, retention: project.retention }); }, [open, project]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Commercial Baseline</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label><span className="text-xs text-muted-foreground">Estimated cost (QAR)</span><Input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: Number(e.target.value) })} /></label>
          <label><span className="text-xs text-muted-foreground">Committed cost (QAR)</span><Input type="number" value={form.committedCost} onChange={(e) => setForm({ ...form, committedCost: Number(e.target.value) })} /></label>
          <label><span className="text-xs text-muted-foreground">Actual cost (QAR)</span><Input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: Number(e.target.value) })} /></label>
          <label><span className="text-xs text-muted-foreground">Retention (QAR)</span><Input type="number" value={form.retention} onChange={(e) => setForm({ ...form, retention: Number(e.target.value) })} /></label>
        </div>
        <p className="text-[11px] text-muted-foreground">Forecast margin recalculates automatically from these numbers — it is never entered directly.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { d.updateProjectCommercial(project.id, form); onOpenChange(false); toast.success("Commercial baseline updated."); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPaymentDialog({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (o: boolean) => void; projectId: string }) {
  const d = useData();
  const [form, setForm] = useState({ label: "", amount: 0, dueDate: new Date().toISOString().slice(0,10) });
  useEffect(() => { if (open) setForm({ label: "", amount: 0, dueDate: new Date().toISOString().slice(0,10) }); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Payment Milestone</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <label className="block"><span className="text-xs text-muted-foreground">Label</span><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g., Testing milestone 20%" /></label>
          <label className="block"><span className="text-xs text-muted-foreground">Amount (QAR)</span><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></label>
          <label className="block"><span className="text-xs text-muted-foreground">Due date</span><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!form.label.trim() || form.amount <= 0) { toast.error("Label and a positive amount are required"); return; }
            d.addPaymentMilestone({ projectId, label: form.label.trim(), amount: form.amount, dueDate: form.dueDate, status: "Pending" });
            onOpenChange(false);
            toast.success("Payment milestone added.");
          }}>Add milestone</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Compliance ----------

function ComplianceTab({ projectId, items }: { projectId: string; items: import("@/lib/mock-data").ComplianceItem[] }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [text, setText] = useState("");
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div><h3 className="font-display font-semibold text-lg">Compliance Tracker</h3><p className="text-xs text-muted-foreground">Internal checklist for Qatar CCTV project approvals. Not legal advice.</p></div>
        <Button size="sm" variant="outline" onClick={() => { setText(""); setAddOpen(true); }}>+ Add Requirement</Button>
      </div>
      {items.length === 0 ? <EmptyState title="No compliance items tracked yet" /> : (
        <div className="space-y-2">{items.map((c) => (<div key={c.id} className="flex items-center gap-3 p-2 border hairline rounded-md"><StatusPill status={c.status} tone={c.status==="Approved"?"success":c.status==="Rejected"?"critical":c.status==="Submitted"?"info":"warning"} /><div className="flex-1 text-sm">{c.item}</div><div className="text-xs text-muted-foreground">{c.owner}</div>{c.expires && <div className="text-xs num text-muted-foreground">expires {fmtDate(c.expires)}</div>}<Button size="sm" variant="ghost" onClick={() => { d.toggleCompliance(c.id); toast("Status toggled."); }}>Toggle</Button></div>))}</div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Compliance Requirement</DialogTitle></DialogHeader>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Fire safety coordination sign-off" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!text.trim()) { toast.error("Description required"); return; } d.addComplianceItem({ projectId, item: text.trim(), status: "Not Started", owner: "Company" }); setAddOpen(false); toast.success("Requirement added."); }}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Documents ----------

function DocsTab({ project, docs }: { project: import("@/lib/mock-data").Project; docs: import("@/lib/mock-data").Doc[] }) {
  const d = useData();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [category, setCategory] = useState(DOC_CATEGORIES[0]);
  return (
    <Card className="p-0">
      <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Documents</h3><Button size="sm" onClick={() => { setCategory(DOC_CATEGORIES[0]); setUploadOpen(true); }}>Upload</Button></div>
      {docs.length === 0 ? <div className="p-4"><EmptyState title="No documents uploaded yet" /></div> : (
      <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Document","Category","Revision","Status","Uploaded"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
        <tbody>{docs.map((doc) => (<tr key={doc.id} className="border-t hairline"><td className="py-2 px-3">{doc.name}</td><td className="py-2 px-3 text-xs">{doc.category}</td><td className="py-2 px-3 num text-xs">{doc.revision}</td><td className="py-2 px-3"><StatusPill status={doc.status} tone={doc.status === "Approved" ? "success" : "warning"} /></td><td className="py-2 px-3 num text-xs">{fmtDate(doc.uploadedOn)}</td></tr>))}</tbody>
      </table>
      )}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <label className="block"><span className="text-xs text-muted-foreground">File</span>
              <input type="file" className="mt-1.5 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-signal file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white" />
              <span className="mt-1 block text-[10.5px] text-muted-foreground">Local demo: file metadata is stored, not the binary content.</span>
            </label>
            <label className="block"><span className="text-xs text-muted-foreground">Category</span>
              <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DOC_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={() => { d.addDocument({ name: `${project.number} ${category}.pdf`, category, projectId: project.id, revision: "R1", status: "Draft", uploadedOn: new Date().toISOString().slice(0,10), tags: [] }); setUploadOpen(false); toast.success("Document uploaded."); }}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------- Client Communication ----------

function CommTab({ projectId, comms, onLog }: { projectId: string; comms: import("@/lib/mock-data").Communication[]; onLog: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3"><h3 className="font-display font-semibold text-lg">Client Communication</h3><Button size="sm" onClick={onLog}>Log Update</Button></div>
      {comms.length === 0 ? <EmptyState title="No client communication logged yet" /> : (
        <div className="divide-y hairline">{comms.map((c) => (
          <div key={c.id} className="py-2.5">
            <div className="flex items-center gap-3">
              <div className="text-xs num text-muted-foreground w-24">{fmtDate(c.date)}</div>
              <div className="flex-1 text-sm"><div>{c.subject}</div><div className="text-xs text-muted-foreground">{c.owner}{c.method ? ` · ${c.method}` : ""}</div></div>
              <StatusPill status={c.status} tone={c.status==="Confirmed"?"success":c.status==="Pending"?"warning":"info"} />
            </div>
            {c.summary && <div className="mt-1.5 ml-[6.5rem] text-xs text-muted-foreground">{c.summary}</div>}
            {c.nextAction && <div className="mt-0.5 ml-[6.5rem] text-xs text-signal">Next: {c.nextAction}{c.followUpDate ? ` by ${fmtDate(c.followUpDate)}` : ""}</div>}
          </div>
        ))}</div>
      )}
    </Card>
  );
}

function LogCommDialog({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (o: boolean) => void; projectId: string }) {
  const d = useData();
  const blank = { subject: "", method: "Call" as const, summary: "", nextAction: "", followUpDate: "" };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(blank); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Log Client Update</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Subject</span><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Method</span>
            <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Call","WhatsApp","Email","Meeting","Site Meeting"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label><span className="text-xs text-muted-foreground">Follow-up date (optional)</span><Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></label>
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Summary</span><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></label>
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Next action</span><Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!form.subject.trim()) { toast.error("Subject is required"); return; }
            d.addCommunication({ projectId, date: new Date().toISOString().slice(0,10), owner: "You", subject: form.subject.trim(), status: "Sent", method: form.method, summary: form.summary || undefined, nextAction: form.nextAction || undefined, followUpDate: form.followUpDate || undefined });
            onOpenChange(false);
            toast.success("Client update logged.");
          }}>Log update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Activity Log ----------

function ActivityLogTab({ projectId, activity }: { projectId: string; activity: import("@/lib/mock-data").ProjectActivity[] }) {
  const d = useData();
  const [note, setNote] = useState("");
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-lg">Activity Log</h3>
      </div>
      <div className="flex gap-2 mb-4">
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note to this project's log…" className="flex-1" />
        <Button size="sm" onClick={() => { if (!note.trim()) return; d.addNote(projectId, note.trim(), "You"); setNote(""); toast.success("Note added."); }}>+ Add Note</Button>
      </div>
      {activity.length === 0 ? <EmptyState title="No activity yet" /> : (
        <ol className="relative border-l hairline ml-2 space-y-4">{activity.map((e) => (
          <li key={e.id} className="ml-4">
            <div className="absolute w-2 h-2 rounded-full bg-signal -left-1 mt-1.5" />
            <div className="text-sm">{e.message}</div>
            <div className="text-xs text-muted-foreground num">{new Date(e.ts).toLocaleString()}{e.actor ? ` · ${e.actor}` : ""}</div>
          </li>
        ))}</ol>
      )}
    </Card>
  );
}

// ---------- Handover ----------

function HandoverTab({ project, items, readiness }: { project: import("@/lib/mock-data").Project; items: import("@/lib/mock-data").HandoverItem[]; readiness: { ready: boolean; remaining: string[] } }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [section, setSection] = useState<import("@/lib/mock-data").HandoverItem["section"]>("Technical");
  const doneCount = items.filter((i) => i.done).length;
  const sections: import("@/lib/mock-data").HandoverItem["section"][] = ["Technical","Documentation","Commercial","Client"];
  const canComplete = project.phase === "Handover";

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState title="Handover setup has not started" hint="The checklist can be prepared now, or built automatically once the project enters Handover." action={<Button size="sm" onClick={() => setAddOpen(true)}>+ Add Checklist Item</Button>} />
        <HandoverAddDialog open={addOpen} onOpenChange={setAddOpen} projectId={project.id} label={label} setLabel={setLabel} section={section} setSection={setSection} />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-display font-semibold text-lg">Handover Readiness</h3><p className="text-xs text-muted-foreground">Critical items must be completed before handover can be marked complete.</p></div>
        <div className="text-right"><div className="num text-3xl font-display font-bold">{doneCount} / {items.length}</div><WorkStatusBadge status={countStatus(doneCount, items.length)} /></div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">{sections.map((sec) => (
        <div key={sec} className="border hairline rounded-lg p-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{sec}</div>
          {items.filter((i) => i.section === sec).map((i) => (
            <label key={i.id} className="flex items-start gap-2 py-1.5 cursor-pointer">
              <input type="checkbox" checked={i.done} onChange={() => { d.toggleHandover(i.id); }} className="mt-1 accent-signal" />
              <span className={`text-sm ${i.done ? "line-through text-muted-foreground" : ""}`}>{i.label}{i.critical && !i.done && <span className="ml-1.5 text-[10px] text-critical">critical</span>}</span>
            </label>
          ))}
        </div>
      ))}</div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>+ Add Checklist Item</Button>
        {canComplete ? (
          readiness.ready ? (
            <Button size="sm" className="bg-signal text-white" onClick={() => { const r = d.completeProject(project.id); if (r.ok) toast.success("Project marked complete."); else toast.error(r.remaining[0] ?? "Not ready"); }}>Complete Handover</Button>
          ) : (
            <div className="text-right">
              <Button size="sm" disabled className="opacity-60">Complete Handover</Button>
              <div className="mt-1 text-[11px] text-warning max-w-xs">{readiness.remaining.slice(0, 3).join("; ")}{readiness.remaining.length > 3 ? "…" : ""}</div>
            </div>
          )
        ) : (
          <span className="text-[11px] text-muted-foreground">Move the project to the Handover phase to enable completion.</span>
        )}
      </div>
      <HandoverAddDialog open={addOpen} onOpenChange={setAddOpen} projectId={project.id} label={label} setLabel={setLabel} section={section} setSection={setSection} />
    </Card>
  );
}

function HandoverAddDialog({ open, onOpenChange, projectId, label, setLabel, section, setSection }: {
  open: boolean; onOpenChange: (o: boolean) => void; projectId: string; label: string; setLabel: (s: string) => void;
  section: import("@/lib/mock-data").HandoverItem["section"]; setSection: (s: import("@/lib/mock-data").HandoverItem["section"]) => void;
}) {
  const d = useData();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Checklist Item</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Item</span><Input value={label} onChange={(e) => setLabel(e.target.value)} /></label>
          <label><span className="text-xs text-muted-foreground">Section</span>
            <Select value={section} onValueChange={(v) => setSection(v as never)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Technical","Documentation","Commercial","Client"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { if (!label.trim()) { toast.error("Item text required"); return; } d.addHandoverItem({ projectId, section, label: label.trim(), done: false }); onOpenChange(false); toast.success("Checklist item added."); }}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Warranty & AMC ----------

function WarrantyTab({ project, amc }: { project: import("@/lib/mock-data").Project; amc?: import("@/lib/mock-data").AMCContract }) {
  const d = useData();
  const eligible = ["Handover", "Warranty", "AMC", "Completed"].includes(project.phase);
  if (!eligible) {
    return <Card className="p-6"><EmptyState title="Warranty and AMC apply after handover" hint="This section activates once the project reaches the Handover phase." /></Card>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4">
        <h3 className="font-display font-semibold text-lg mb-3">Warranty</h3>
        {project.warrantyStart && project.warrantyEnd ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span className="num text-foreground">{fmtDate(project.warrantyStart)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">End</span><span className="num text-foreground">{fmtDate(project.warrantyEnd)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusPill status={daysFromToday(project.warrantyEnd) < 0 ? "Expired" : "Active"} tone={daysFromToday(project.warrantyEnd) < 0 ? "critical" : "success"} /></div>
          </div>
        ) : (
          <EmptyState title="Warranty not yet started" hint="Set once the project is handed over." action={<Button size="sm" onClick={() => { d.updateProject(project.id, { warrantyStart: new Date().toISOString().slice(0,10), warrantyEnd: new Date(Date.now() + 365 * 864e5).toISOString().slice(0,10) }); toast.success("Warranty period set (1 year)."); }}>Start 1-year warranty</Button>} />
        )}
      </Card>
      <Card className="p-4">
        <h3 className="font-display font-semibold text-lg mb-3">AMC Contract</h3>
        {amc ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Contract</span><Link to="/service" className="text-signal hover:underline">{amc.number}</Link></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span className="num text-foreground">{fmtDate(amc.start)} – {fmtDate(amc.end)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Value</span><span className="num text-foreground">{fmtQAR(amc.value)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusPill status={amc.renewalStatus} tone={amc.renewalStatus === "Active" ? "success" : amc.renewalStatus === "Expiring Soon" ? "warning" : "critical"} /></div>
          </div>
        ) : (
          <EmptyState title="No AMC linked" hint="Create an after-sales maintenance contract for this project." action={<Button size="sm" onClick={() => {
            const a = d.addAMC({ number: `AHC-AMC-2026-${String(20 + d.amc.length).padStart(3, "0")}`, customerId: project.customerId, siteId: project.siteId, projectId: project.id, equipment: `${project.name} — device fleet`, start: new Date().toISOString().slice(0,10), end: new Date(Date.now() + 365 * 864e5).toISOString().slice(0,10), visitFrequency: "Quarterly", value: Math.round(project.contractValue * 0.08), sla: "24h response", engineerId: "E-013", nextVisit: new Date(Date.now() + 90 * 864e5).toISOString().slice(0,10), renewalStatus: "Active" });
            d.updateProject(project.id, { amcId: a.id });
            toast.success(`AMC ${a.number} created.`);
          }}>Create AMC</Button>} />
        )}
      </Card>
    </div>
  );
}

// ---------- Variations ----------

function NewVariationDialog({ open, onOpenChange, projectId, nextNumber }: { open: boolean; onOpenChange: (o: boolean) => void; projectId: string; nextNumber: string }) {
  const d = useData();
  const [form, setForm] = useState({ description: "", amount: 0 });
  useEffect(() => { if (open) setForm({ description: "", amount: 0 }); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Variation — {nextNumber}</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <label className="block"><span className="text-xs text-muted-foreground">Description</span><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g., Additional 4 cameras at loading dock" /></label>
          <label className="block"><span className="text-xs text-muted-foreground">Amount (QAR)</span><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            if (!form.description.trim()) { toast.error("Description required"); return; }
            d.addVariation({ projectId, number: nextNumber, description: form.description.trim(), amount: form.amount, status: "Submitted", date: new Date().toISOString().slice(0, 10) });
            onOpenChange(false);
            toast.success(`Variation ${nextNumber} submitted.`);
          }}>Submit variation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Site Activity ----------

function SiteActivityTab({ projectId, activities }: { projectId: string; activities: import("@/lib/mock-data").SiteActivity[] }) {
  const d = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), teamPresent: [] as string[], workCompleted: "", camerasInstalled: 0, cableInstalled: 0, devicesConfigured: 0, issues: "", tomorrowPlan: "" });
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => setOpen(true)}>+ New Daily Report</Button></div>
      {activities.length === 0 ? <Card className="p-6"><EmptyState title="No site reports logged yet" /></Card> : activities.map((a) => (<Card key={a.id} className="p-4">
        <div className="flex items-center justify-between mb-3"><div className="text-sm font-medium">Site Activity — <span className="num">{fmtDate(a.date)}</span></div><div className="text-xs text-muted-foreground">{a.teamPresent.map((id) => d.employees.find((e) => e.id === id)?.name).join(", ")}</div></div>
        <div className="grid grid-cols-3 gap-3 mb-3"><Stat label="Cameras installed" value={a.camerasInstalled} /><Stat label="Cable installed (m)" value={a.cableInstalled} /><Stat label="Devices configured" value={a.devicesConfigured} /></div>
        <div className="text-sm"><div className="text-muted-foreground text-xs uppercase mb-1">Work completed</div>{a.workCompleted}</div>
        <div className="text-sm mt-2"><div className="text-muted-foreground text-xs uppercase mb-1">Issues</div>{a.issues || "None."}</div>
        <div className="text-sm mt-2"><div className="text-muted-foreground text-xs uppercase mb-1">Tomorrow's plan</div>{a.tomorrowPlan}</div>
      </Card>))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>New Daily Site Report</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label><span className="text-xs text-muted-foreground">Date</span><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Cameras installed</span><Input type="number" value={form.camerasInstalled} onChange={(e) => setForm({ ...form, camerasInstalled: +e.target.value })} /></label>
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Work completed</span><Textarea value={form.workCompleted} onChange={(e) => setForm({ ...form, workCompleted: e.target.value })} /></label>
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Issues</span><Textarea value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })} /></label>
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Tomorrow's plan</span><Textarea value={form.tomorrowPlan} onChange={(e) => setForm({ ...form, tomorrowPlan: e.target.value })} /></label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { d.addSiteActivity({ projectId, ...form }); setOpen(false); toast.success("Site report submitted."); }}>Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
