import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import {
  HealthBadge, MonoChip, ProgressBar, StatusPill, Ring, Panel, PanelHead, Segmented,
  AlertCard, TableShell, Donut, QuickAction, EmptyState, axisProps, ChartTooltip, ACCENT, Accent, Motif,
} from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Printer, Circle, ChevronRight, ChevronLeft, MoreHorizontal,
  LayoutGrid, Wrench, Coins, ShieldCheck, Flag, Camera, Package as PackageIcon, ClipboardCheck,
  Users, MessageSquare, CalendarClock, TrendingUp, TrendingDown, FileText, GraduationCap, ShieldAlert,
  PlusCircle, ClipboardList, Boxes, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ComposedChart, Line, Area, Bar, BarChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Project | AL HARIB CCTV COMPANY" }] }),
  component: ProjectDetail,
});

const PRIMARY = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "execution", label: "Execution", icon: Wrench },
  { id: "commercial", label: "Commercial", icon: Coins },
  { id: "quality", label: "Quality", icon: ShieldCheck },
  { id: "handover", label: "Handover", icon: Flag },
] as const;

const SUBS: Record<string, { v: string; l: string }[]> = {
  overview: [{ v: "summary", l: "Command Summary" }, { v: "milestones", l: "Milestones" }, { v: "activity", l: "Activity" }],
  execution: [
    { v: "scope", l: "Scope & BOQ" }, { v: "tasks", l: "Tasks" }, { v: "timeline", l: "Timeline" },
    { v: "site", l: "Site Activity" }, { v: "team", l: "Team" }, { v: "materials", l: "Materials" }, { v: "devices", l: "Devices" },
  ],
  commercial: [{ v: "fin", l: "Financials" }, { v: "payments", l: "Payments" }, { v: "vars", l: "Variations" }, { v: "costs", l: "Costs" }],
  quality: [{ v: "issues", l: "Issues" }, { v: "qaqc", l: "QA/QC" }, { v: "testing", l: "Testing" }, { v: "comp", l: "Compliance" }, { v: "docs", l: "Documents" }],
  handover: [{ v: "readiness", l: "Readiness" }, { v: "finaldocs", l: "Final Documents" }, { v: "training", l: "Client Training" }, { v: "warranty", l: "Warranty & AMC" }],
};

function sectionOf(sub: string) {
  for (const k of Object.keys(SUBS)) if (SUBS[k].some((s) => s.v === sub)) return k;
  return "overview";
}

function ProjectDetail() {
  const { id } = useParams({ from: "/projects/$id" });
  const d = useData();
  const p = d.projects.find((x) => x.id === id);
  if (!p) return (
    <div className="p-6">
      <Panel>Project not found. <Link to="/projects" className="text-signal">Back</Link></Panel>
    </div>
  );
  const health = d.computeHealth(p, d.approvals, d.devices, d.materials);
  const cust = d.customers.find((c) => c.id === p.customerId)!;
  const site = d.sites.find((s) => s.id === p.siteId)!;
  const pm = d.employees.find((e) => e.id === p.pmId)!;
  const projectTasks = d.tasks.filter((t) => t.projectId === p.id);
  const projectMs = d.milestones.filter((m) => m.projectId === p.id);
  const projectApprovals = d.approvals.filter((a) => a.projectId === p.id);
  const projectVars = d.variations.filter((v) => v.projectId === p.id);
  const projectDocs = d.documents.filter((doc) => doc.projectId === p.id);
  const projectPays = d.payments.filter((pay) => pay.projectId === p.id);
  const projectDevices = d.devices.filter((x) => x.projectId === p.id);
  const projectMats = d.materials.filter((m) => m.projectId === p.id);
  const projectComms = d.communications.filter((c) => c.projectId === p.id);
  const projectActs = d.siteActivities.filter((a) => a.projectId === p.id);
  const projectTests = d.testRecords.filter((t) => t.projectId === p.id);
  const projectHandover = d.handoverItems.filter((h) => h.projectId === p.id);
  const projectCompliance = d.complianceItems.filter((c) => c.projectId === p.id);

  const [tab, setTab] = useState("summary");
  const section = sectionOf(tab);
  const goTo = (sub: string) => setTab(sub);

  const collected = p.collected;
  const invoiced = Math.max(1, p.invoiced);
  const camsInstalled = projectDevices.filter((x) => x.status === "Installed" || x.status === "Configured" || x.status === "Tested" || x.status === "Handed Over").length;
  const configured = projectDevices.filter((x) => x.status === "Configured" || x.status === "Tested" || x.status === "Handed Over").length;
  const testsPassed = projectDevices.filter((x) => x.testResult === "Pass").length;
  const testsFailed = projectDevices.filter((x) => x.testResult === "Fail").length;
  const daysLeft = daysFromToday(p.plannedEnd);
  const scheduleGap = p.plannedProgress - p.actualProgress;
  const shortages = projectMats.filter((m) => m.critical && m.delivered < m.required);
  const inTransit = projectMats.reduce((s, m) => s + Math.max(0, m.ordered - m.delivered), 0);
  const nextDelivery = projectMats.filter((m) => m.ordered > m.delivered)[0];
  const pendingVars = projectVars.filter((v) => v.status === "Pending" || v.status === "Submitted");
  const profitForecast = p.contractValue + p.approvedVariations - p.estimatedCost;
  const marginPct = Math.round((profitForecast / Math.max(1, p.contractValue + p.approvedVariations)) * 100);
  const docsApproved = projectDocs.filter((doc) => doc.status === "Approved").length;

  const subScores = {
    schedule: Math.max(0, Math.min(100, 100 - scheduleGap * 4)),
    materials: p.materialReadiness,
    quality: projectDevices.length ? Math.round((testsPassed / projectDevices.length) * 100) : 100,
    commercial: Math.round((collected / invoiced) * 100),
    documents: projectDocs.length ? Math.round((docsApproved / projectDocs.length) * 100) : 100,
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Identity header */}
      <div className="rise panel-flat flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/projects" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[rgba(133,164,204,0.16)] text-muted-foreground hover:text-foreground hover:border-signal/40 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <MonoChip>{p.number}</MonoChip>
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold tracking-[-0.01em] text-foreground">{p.name}</div>
            <div className="truncate text-[11.5px] text-muted-foreground">{cust.name} · {site.name} · PM {pm.name}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={p.phase} tone="info" />
          <HealthBadge label={health.label} />
          {scheduleGap > 10 && <StatusPill status="High Priority" tone="critical" />}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 bg-signal text-white hover:bg-signal/90" onClick={() => toast.success("Project updated (demo)")}>Update Project</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => toast.success("Progress report generated (demo)")}><Printer className="w-3.5 h-3.5 mr-2" />Progress Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("docs")}>Upload Document</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Issue drafted (demo)")}>Add Issue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("vars")}>Add Variation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Site visit scheduled (demo)")}>Schedule Visit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("readiness")}>Handover Checklist</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast("Archived (demo)")} className="text-critical focus:text-critical">Archive Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metric cards */}
      <div className="rise rise-1 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ValueCard p={p} profitForecast={profitForecast} marginPct={marginPct} pendingVarsCount={pendingVars.length} onClick={() => goTo("fin")} />
        <CompletionCard p={p} scheduleGap={scheduleGap} daysLeft={daysLeft} onClick={() => goTo("timeline")} />
        <InstallationCard total={projectDevices.length} installed={camsInstalled} configured={configured} tested={testsPassed} failed={testsFailed} onClick={() => goTo("devices")} />
        <MaterialCard p={p} shortages={shortages.length} inTransit={inTransit} nextDelivery={nextDelivery} onClick={() => goTo("materials")} />
      </div>

      {/* Navigation */}
      <div className="rise rise-2 flex flex-col gap-2.5">
        <div className="overflow-x-auto no-scrollbar">
          <Segmented
            value={section}
            onChange={(v) => setTab(SUBS[v][0].v)}
            options={PRIMARY.map((s) => ({ value: s.id, label: s.label, icon: <s.icon className="h-3.5 w-3.5" /> }))}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SUBS[section].map((s) => (
            <button
              key={s.v}
              onClick={() => setTab(s.v)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                tab === s.v ? "border-signal/40 bg-[rgba(47,131,255,0.12)] text-signal" : "border-transparent text-muted-foreground hover:bg-[rgba(133,164,204,0.06)] hover:text-foreground",
              )}
            >
              {s.l}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="rise rise-3 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,68%)_minmax(0,32%)]">
        <div className="min-w-0 space-y-4">
          {section === "overview" && tab === "summary" && (
            <OverviewSummary p={p} health={health} projectDevices={projectDevices} projectMs={projectMs} shortages={shortages} projectMats={projectMats} scheduleGap={scheduleGap} projectVars={projectVars} onJump={goTo} />
          )}
          {section === "overview" && tab === "milestones" && <MilestonesPanel milestones={projectMs} />}
          {section === "overview" && tab === "activity" && <ActivityPanel comms={projectComms} />}

          {section === "execution" && tab === "scope" && <ScopePanel d={d} p={p} />}
          {section === "execution" && tab === "tasks" && <TasksTab projectId={p.id} tasks={projectTasks} />}
          {section === "execution" && tab === "timeline" && <TimelinePanel p={p} milestones={projectMs} />}
          {section === "execution" && tab === "site" && <SiteActivityTab projectId={p.id} activities={projectActs} />}
          {section === "execution" && tab === "team" && <TeamPanel pm={pm} teamIds={p.teamIds} d={d} />}
          {section === "execution" && tab === "materials" && <MaterialsPanel p={p} materials={projectMats} />}
          {section === "execution" && tab === "devices" && <DevicesTab devices={projectDevices} />}

          {section === "commercial" && tab === "fin" && <FinancialsPanel p={p} />}
          {section === "commercial" && tab === "payments" && <PaymentsPanel d={d} payments={projectPays} />}
          {section === "commercial" && tab === "vars" && <VariationsPanel variations={projectVars} />}
          {section === "commercial" && tab === "costs" && <CostsPanel p={p} />}

          {section === "quality" && tab === "issues" && <IssuesPanel devices={projectDevices} tests={projectTests} tasks={projectTasks} onJump={goTo} />}
          {section === "quality" && tab === "qaqc" && <QaQcPanel devices={projectDevices} tests={projectTests} />}
          {section === "quality" && tab === "testing" && <TestingTab devices={projectDevices} tests={projectTests} />}
          {section === "quality" && tab === "comp" && <CompliancePanel d={d} compliance={projectCompliance} />}
          {section === "quality" && tab === "docs" && <DocumentsPanel docs={projectDocs} />}

          {section === "handover" && tab === "readiness" && <HandoverTab items={projectHandover} />}
          {section === "handover" && tab === "finaldocs" && <FinalDocsPanel docs={projectDocs} />}
          {section === "handover" && tab === "training" && <TrainingPanel comms={projectComms} />}
          {section === "handover" && tab === "warranty" && <WarrantyPanel p={p} />}
        </div>

        {/* Intelligence rail */}
        <div className="space-y-3.5">
          <HealthRail health={health} subScores={subScores} />
          <QuickActionsRail onJump={goTo} />
          <CostPositionRail p={p} pendingVars={pendingVars} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ METRIC CARDS ══════════════════════════ */

function ValueCard({ p, profitForecast, marginPct, pendingVarsCount, onClick }: any) {
  const a = ACCENT.blue;
  const revised = p.contractValue + p.approvedVariations;
  return (
    <button onClick={onClick} className="panel card-lift relative overflow-hidden p-4 text-left">
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 100% 0%, ${a.from} 0%, transparent 60%)` }} />
      <Motif kind="channels" color={a.hex} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="label-xs">Project Value</div>
          <div className="grid h-7 w-7 place-items-center rounded-lg border" style={{ background: a.soft, borderColor: a.ring, color: a.hex }}><Coins className="h-3.5 w-3.5" /></div>
        </div>
        <div className="num mt-3 text-[26px] font-semibold leading-none tracking-[-0.03em]">{fmtQAR(revised, { compact: true })}</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div><div className="label-xs">Variations</div><div className="num mt-0.5 font-medium">{fmtQAR(p.approvedVariations, { compact: true })}<span className="text-muted-foreground"> · {pendingVarsCount} pending</span></div></div>
          <div><div className="label-xs">Profit Forecast</div><div className="num mt-0.5 font-medium" style={{ color: a.hex }}>{fmtQAR(profitForecast, { compact: true })} ({marginPct}%)</div></div>
        </div>
      </div>
    </button>
  );
}

function CompletionCard({ p, scheduleGap, daysLeft, onClick }: any) {
  return (
    <button onClick={onClick} className="panel card-lift relative overflow-hidden p-4 text-left">
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 100% 0%, ${ACCENT.cyan.from} 0%, transparent 60%)` }} />
      <Motif kind="waves" color={ACCENT.cyan.hex} />
      <div className="relative flex items-start gap-3.5">
        <Ring value={p.actualProgress} size={62} thickness={6} accent="cyan" />
        <div className="min-w-0 flex-1">
          <div className="label-xs">Project Completion</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="num text-[20px] font-semibold" style={{ color: ACCENT.cyan.hex }}>{p.actualProgress}%</span>
            <span className="text-[11px] text-muted-foreground">of {p.plannedProgress}% planned</span>
          </div>
          <div className="mt-1.5 text-[11px]" style={{ color: scheduleGap > 0 ? ACCENT.amber.hex : ACCENT.green.hex }}>
            {scheduleGap > 0 ? `${scheduleGap}% behind schedule` : "On or ahead of plan"}
          </div>
          <div className="mt-1 text-[10.5px] text-muted-foreground">Forecast finish {fmtDate(p.plannedEnd)} · {daysLeft}d left</div>
        </div>
      </div>
    </button>
  );
}

function InstallationCard({ total, installed, configured, tested, failed, onClick }: any) {
  const a = ACCENT.purple;
  return (
    <button onClick={onClick} className="panel card-lift relative overflow-hidden p-4 text-left">
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 100% 0%, ${a.from} 0%, transparent 55%), radial-gradient(90% 90% at 0% 100%, ${ACCENT.magenta.from} 0%, transparent 60%)` }} />
      <Motif kind="camera" color={a.hex} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="label-xs">Installation</div>
          <div className="grid h-7 w-7 place-items-center rounded-lg border" style={{ background: a.soft, borderColor: a.ring, color: a.hex }}><Camera className="h-3.5 w-3.5" /></div>
        </div>
        <div className="num mt-3 text-[26px] font-semibold leading-none">{installed}<span className="text-muted-foreground text-[16px]"> / {total}</span></div>
        <div className="mt-2.5"><ProgressBar value={total ? (installed / total) * 100 : 0} accent="purple" height={6} /></div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10.5px]">
          <div className="rounded-lg px-2 py-1.5" style={{ background: ACCENT.purple.soft }}><div className="label-xs">Config'd</div><div className="num font-semibold" style={{ color: ACCENT.purple.hex }}>{configured}</div></div>
          <div className="rounded-lg px-2 py-1.5" style={{ background: ACCENT.green.soft }}><div className="label-xs">Tested</div><div className="num font-semibold" style={{ color: ACCENT.green.hex }}>{tested}</div></div>
          <div className="rounded-lg px-2 py-1.5" style={{ background: ACCENT.red.soft }}><div className="label-xs">Failed</div><div className="num font-semibold" style={{ color: ACCENT.red.hex }}>{failed}</div></div>
        </div>
      </div>
    </button>
  );
}

function MaterialCard({ p, shortages, inTransit, nextDelivery, onClick }: any) {
  const accent: Accent = p.materialReadiness < 80 ? "amber" : "green";
  const a = ACCENT[accent];
  return (
    <button onClick={onClick} className="panel card-lift relative overflow-hidden p-4 text-left">
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 100% 0%, ${a.from} 0%, transparent 55%), radial-gradient(90% 90% at 0% 100%, ${ACCENT.cyan.from} 0%, transparent 60%)` }} />
      <Motif kind="grid" color={a.hex} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="label-xs">Material Readiness</div>
          <div className="grid h-7 w-7 place-items-center rounded-lg border" style={{ background: a.soft, borderColor: a.ring, color: a.hex }}><Boxes className="h-3.5 w-3.5" /></div>
        </div>
        <div className="num mt-3 text-[26px] font-semibold leading-none" style={{ color: a.hex }}>{p.materialReadiness}%</div>
        <div className="mt-2.5"><ProgressBar value={p.materialReadiness} accent={accent} height={6} /></div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className={shortages ? "text-critical" : "text-muted-foreground"}>{shortages} shortages</span>
          <span className="text-muted-foreground">{inTransit} in transit</span>
        </div>
        {nextDelivery && <div className="mt-1 truncate text-[10.5px] text-muted-foreground">Next: {nextDelivery.name}</div>}
      </div>
    </button>
  );
}

/* ══════════════════════════ INTELLIGENCE RAIL ══════════════════════════ */

function HealthRail({ health, subScores }: { health: any; subScores: Record<string, number> }) {
  const rows: { k: string; l: string; accent: Accent }[] = [
    { k: "schedule", l: "Schedule", accent: "cyan" },
    { k: "materials", l: "Materials", accent: "green" },
    { k: "quality", l: "Quality", accent: "purple" },
    { k: "commercial", l: "Commercial", accent: "blue" },
    { k: "documents", l: "Documents", accent: "amber" },
  ];
  return (
    <Panel accent="purple" texture="grid">
      <div className="flex items-center justify-between">
        <div className="label-xs">Project Health</div>
        <HealthBadge label={health.label} />
      </div>
      <div className="mt-3 flex items-center gap-4">
        <Ring value={health.score} size={72} thickness={7} accent={health.score >= 75 ? "green" : health.score >= 55 ? "amber" : "red"} />
        <div className="min-w-0 flex-1 space-y-1.5">
          {health.drivers.slice(0, 3).map((dr: any, i: number) => (
            <div key={i} className="flex items-start gap-1.5 text-[10.5px] text-muted-foreground">
              {dr.severity === "critical" ? <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-critical" /> : dr.severity === "warning" ? <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" /> : <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />}
              <span className="truncate">{dr.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-2.5">
            <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{r.l}</span>
            <ProgressBar value={subScores[r.k]} accent={r.accent} height={6} />
            <span className="num w-9 shrink-0 text-right text-[11px] font-medium">{Math.round(subScores[r.k])}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function QuickActionsRail({ onJump }: { onJump: (v: string) => void }) {
  return (
    <Panel>
      <div className="label-xs mb-3.5">Quick Actions</div>
      <div className="grid grid-cols-4 gap-1.5">
        <QuickAction icon={<PlusCircle className="h-5 w-5" />} label="Add Task" accent="blue" onClick={() => onJump("tasks")} />
        <QuickAction icon={<ClipboardList className="h-5 w-5" />} label="Site Report" accent="cyan" onClick={() => onJump("site")} />
        <QuickAction icon={<PackageIcon className="h-5 w-5" />} label="Material Request" accent="amber" onClick={() => toast.success("Material request drafted (demo)")} />
        <QuickAction icon={<Send className="h-5 w-5" />} label="Client Update" accent="purple" onClick={() => onJump("activity")} />
      </div>
    </Panel>
  );
}

function CostPositionRail({ p, pendingVars }: { p: import("@/lib/mock-data").Project; pendingVars: import("@/lib/mock-data").Variation[] }) {
  const outstanding = Math.max(0, p.invoiced - p.collected);
  const unapproved = pendingVars.reduce((s, v) => s + v.amount, 0);
  const data = [
    { name: "Collected", value: p.collected, color: ACCENT.green.hex },
    { name: "Outstanding", value: outstanding, color: ACCENT.amber.hex },
    { name: "Retention", value: p.retention, color: ACCENT.cyan.hex },
    { name: "Unapproved Var.", value: unapproved, color: ACCENT.purple.hex },
  ];
  const total = data.reduce((s, x) => s + x.value, 0);
  return (
    <Panel>
      <div className="label-xs mb-3">Project Cost Position</div>
      <Donut data={data} size={160} centerValue={fmtQAR(total, { compact: true })} centerLabel="Total" />
    </Panel>
  );
}

/* ══════════════════════════ OVERVIEW ══════════════════════════ */

function OverviewSummary({ p, health, projectDevices, projectMs, shortages, projectMats, scheduleGap, projectVars, onJump }: any) {
  const [range, setRange] = useState<"weekly" | "monthly" | "full">("monthly");
  const chartData = useMemo(() => {
    const points = range === "weekly" ? 8 : range === "monthly" ? 6 : 10;
    return Array.from({ length: points }).map((_, i) => {
      const t = i / (points - 1);
      const planned = Math.round(t * p.plannedProgress);
      const actual = i < points - 2 ? Math.round(t * p.actualProgress) : null;
      const forecast = Math.round(p.actualProgress + t * (100 - p.actualProgress) * 0.6);
      return { i: `P${i + 1}`, planned, actual: actual ?? undefined, forecast };
    });
  }, [range, p]);

  const phases = [
    { l: "Planning", pct: 100, date: p.plannedStart, status: "success" as const },
    { l: "Procurement", pct: Math.min(100, p.materialReadiness), date: p.plannedStart, status: p.materialReadiness < 80 ? "warning" as const : "success" as const },
    { l: "Installation", pct: p.actualProgress, date: p.plannedEnd, status: scheduleGap > 10 ? "critical" as const : "info" as const },
    { l: "Testing", pct: projectDevices.length ? Math.round((projectDevices.filter((x: any) => x.testResult === "Pass").length / projectDevices.length) * 100) : 0, date: p.plannedEnd, status: "info" as const },
    { l: "Handover", pct: p.actualProgress >= 95 ? 40 : 0, date: p.plannedEnd, status: "neutral" as const },
  ];

  const risks = [
    shortages.length > 0 && { severity: "critical" as const, title: `${shortages.length} critical material shortages blocking installation`, meta: [{ k: "Owner", v: "Procurement" }, { k: "Impact", v: "Schedule delay" }], action: "View", onAction: () => onJump("materials") },
    scheduleGap > 10 && { severity: "warning" as const, title: `Schedule slipping — ${scheduleGap}% behind plan`, meta: [{ k: "Owner", v: "PM" }, { k: "Impact", v: "Handover date at risk" }], action: "Timeline", onAction: () => onJump("timeline") },
    projectVars.filter((v: any) => v.status === "Pending").length > 0 && { severity: "info" as const, title: `${projectVars.filter((v: any) => v.status === "Pending").length} variation(s) awaiting approval`, meta: [{ k: "Owner", v: "Commercial" }], action: "Review", onAction: () => onJump("vars") },
  ].filter(Boolean) as any[];

  const lifecycle = ["Planned", "Mounted", "Configured", "Tested", "Approved", "Handed Over"];
  const lifeIdx = Math.min(lifecycle.length - 1, Math.round((p.actualProgress / 100) * (lifecycle.length - 1)));
  const zones = Array.from(new Set(projectDevices.map((x: any) => x.zone))).slice(0, 6);

  return (
    <div className="space-y-4">
      <Panel texture="grid" accent="blue">
        <PanelHead
          title="Project Performance"
          sub="Planned vs actual progress with forecast trajectory"
          icon={<TrendingUp className="h-4 w-4" />}
          right={<Segmented size="sm" value={range} onChange={setRange} options={[{ value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }, { value: "full", label: "Full Project" }]} />}
        />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fcArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT.purple.hex} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ACCENT.purple.hex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
              <XAxis dataKey="i" {...axisProps} />
              <YAxis {...axisProps} width={32} />
              <Tooltip content={<ChartTooltip formatter={(v: number) => `${v}%`} />} cursor={{ fill: "rgba(47,131,255,0.06)" }} />
              <Area type="monotone" dataKey="forecast" stroke={ACCENT.purple.hex} strokeWidth={1.5} strokeDasharray="4 3" fill="url(#fcArea)" name="Forecast" />
              <Line type="monotone" dataKey="planned" stroke={ACCENT.cyan.hex} strokeWidth={2} dot={false} name="Planned" />
              <Line type="monotone" dataKey="actual" stroke={ACCENT.blue.hex} strokeWidth={2.5} dot={{ r: 3, fill: ACCENT.blue.hex }} name="Actual" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <div className="label-xs mb-3">Project Phase Strip</div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
          {phases.map((ph) => (
            <div key={ph.l} className="panel-flat p-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium">{ph.l}</span>
                <StatusPill status={ph.status === "success" ? "Done" : ph.status === "critical" ? "At Risk" : ph.status === "warning" ? "Watch" : ph.status === "info" ? "Active" : "Pending"} tone={ph.status} />
              </div>
              <div className="mt-2.5"><ProgressBar value={ph.pct} accent={ph.status === "critical" ? "red" : ph.status === "warning" ? "amber" : "blue"} height={6} /></div>
              <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-muted-foreground"><span className="num">{ph.pct}%</span><span className="num">{fmtDate(ph.date)}</span></div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel accent="red">
        <PanelHead title="Risks & Blockers" sub="Live issues requiring action" icon={<ShieldAlert className="h-4 w-4" />} accent="red" />
        {risks.length === 0 ? <EmptyState title="No active risks" hint="This project has no open blockers." /> : (
          <div className="space-y-2">{risks.map((r, i) => <AlertCard key={i} {...r} />)}</div>
        )}
      </Panel>

      <Panel accent="green">
        <PanelHead title="Upcoming Milestones" icon={<CalendarClock className="h-4 w-4" />} accent="green" />
        <div className="space-y-0">
          {projectMs.map((m: any, i: number) => {
            const overdue = !m.done && daysFromToday(m.planned) < 0;
            const accent: Accent = m.done ? "green" : overdue ? "red" : i === projectMs.findIndex((x: any) => !x.done) ? "blue" : "amber";
            const a = ACCENT[accent];
            return (
              <div key={m.id} className="relative flex gap-3 pb-4 pl-1 last:pb-0">
                {i < projectMs.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px" style={{ background: "rgba(133,164,204,0.14)" }} />}
                <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ borderColor: a.hex, background: m.done ? a.hex : "transparent", boxShadow: `0 0 8px ${a.ring}` }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium">{m.title}</span>
                    <StatusPill status={m.done ? "Completed" : overdue ? "Delayed" : "Planned"} tone={m.done ? "success" : overdue ? "critical" : "neutral"} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Planned <span className="num">{fmtDate(m.planned)}</span>{m.actual && <> · Actual <span className="num">{fmtDate(m.actual)}</span></>}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel texture="dots" accent="purple">
        <PanelHead title="Installation Lifecycle" sub="Fleet-wide device progression" icon={<Camera className="h-4 w-4" />} accent="purple" />
        <div className="flex items-center overflow-x-auto no-scrollbar pb-2">
          {lifecycle.map((stage, i) => (
            <div key={stage} className="flex items-center">
              <div className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-medium whitespace-nowrap", i <= lifeIdx ? "text-white" : "text-muted-foreground")} style={i <= lifeIdx ? { background: ACCENT.purple.hex, borderColor: ACCENT.purple.hex, boxShadow: `0 0 14px ${ACCENT.purple.ring}` } : { borderColor: "rgba(133,164,204,0.16)" }}>
                {stage}
              </div>
              {i < lifecycle.length - 1 && <span className="mx-1.5 h-[2px] w-8 shrink-0" style={{ background: i < lifeIdx ? ACCENT.purple.hex : "rgba(133,164,204,0.14)" }} />}
            </div>
          ))}
        </div>
        {zones.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {zones.map((z: any) => {
              const zd = projectDevices.filter((x: any) => x.zone === z);
              const done = zd.filter((x: any) => x.status === "Tested" || x.status === "Handed Over").length;
              return (
                <div key={z} className="panel-flat p-2.5">
                  <div className="truncate text-[11.5px] font-medium">{z}</div>
                  <div className="mt-1.5"><ProgressBar value={zd.length ? (done / zd.length) * 100 : 0} accent="purple" height={5} /></div>
                  <div className="mt-1 text-[10.5px] text-muted-foreground num">{done}/{zd.length} zone cameras</div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel accent="cyan">
        <PanelHead title="Material Readiness" sub={`${p.materialReadiness}% ready overall`} icon={<Boxes className="h-4 w-4" />} accent="cyan" />
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniKpi label="Delivered" value={projectMats.reduce((s: number, m: any) => s + m.delivered, 0)} accent="green" />
          <MiniKpi label="In Transit" value={projectMats.reduce((s: number, m: any) => s + Math.max(0, m.ordered - m.delivered), 0)} accent="cyan" />
          <MiniKpi label="Missing" value={projectMats.filter((m: any) => m.delivered < m.required).length} accent="amber" />
          <MiniKpi label="Delayed" value={shortages.length} accent="red" />
        </div>
        <TableShell maxHeight={280}>
          <thead><tr>{["SKU", "Item", "Required", "Delivered", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {projectMats.map((m: any) => {
              const critical = m.critical && m.delivered < m.required;
              return (
                <tr key={m.id} className={critical ? "bg-[rgba(255,70,100,0.06)]" : undefined}>
                  <td className="num">{m.sku}</td><td>{m.name}</td><td className="num">{m.required}</td><td className="num">{m.delivered}</td>
                  <td>{critical ? <StatusPill status="Critical shortage" tone="critical" /> : m.installed === m.required ? <StatusPill status="Complete" tone="success" /> : <StatusPill status="In flight" tone="info" />}</td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}

function MiniKpi({ label, value, accent }: { label: string; value: React.ReactNode; accent: Accent }) {
  const a = ACCENT[accent];
  return (
    <div className="panel-flat p-2.5">
      <div className="label-xs truncate">{label}</div>
      <div className="num mt-1 text-[17px] font-semibold" style={{ color: a.hex }}>{value}</div>
    </div>
  );
}

function MilestonesPanel({ milestones }: { milestones: import("@/lib/mock-data").Milestone[] }) {
  return (
    <Panel accent="green">
      <PanelHead title="Milestones" icon={<Flag className="h-4 w-4" />} accent="green" />
      <TableShell>
        <thead><tr>{["Milestone", "Status", "Planned", "Actual"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.id}>
              <td className="flex items-center gap-2">{m.done ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}{m.title}</td>
              <td><StatusPill status={m.done ? "Completed" : "Planned"} tone={m.done ? "success" : "neutral"} /></td>
              <td className="num">{fmtDate(m.planned)}</td>
              <td className="num">{m.actual ? fmtDate(m.actual) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function ActivityPanel({ comms }: { comms: import("@/lib/mock-data").Communication[] }) {
  const log = [
    { t: "Site activity logged", d: "2026-07-20 08:15", w: "Rakesh Nair" },
    { t: "Test result: FAIL on CP-13", d: "2026-07-19 16:40", w: "Ahmed Sobhi" },
    { t: "Materials issued", d: "2026-07-19 11:20", w: "Aisha Rahman" },
    { t: "Progress cert 3 invoiced", d: "2026-07-18 14:00", w: "Hasan Barzani" },
    { t: "Variation VO-02 submitted", d: "2026-07-14 10:12", w: "Anitha Verghese" },
  ];
  return (
    <div className="space-y-4">
      <Panel accent="blue">
        <PanelHead title="Client Communication" icon={<MessageSquare className="h-4 w-4" />} accent="blue" />
        <div className="divide-y divide-[rgba(133,164,204,0.10)]">
          {comms.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-2.5">
              <div className="num w-24 shrink-0 text-[11px] text-muted-foreground">{fmtDate(c.date)}</div>
              <div className="min-w-0 flex-1"><div className="truncate text-[13px]">{c.subject}</div><div className="text-[11px] text-muted-foreground">{c.owner}</div></div>
              <StatusPill status={c.status} tone={c.status === "Confirmed" ? "success" : c.status === "Pending" ? "warning" : "info"} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <PanelHead title="Activity Log" icon={<ClipboardList className="h-4 w-4" />} />
        <ol className="relative ml-2 space-y-4 border-l border-[rgba(133,164,204,0.14)]">
          {log.map((e, i) => (
            <li key={i} className="ml-4">
              <div className="absolute -ml-[21px] mt-1.5 h-2 w-2 rounded-full bg-signal" style={{ boxShadow: "0 0 8px rgba(47,131,255,0.5)" }} />
              <div className="text-[13px]">{e.t}</div>
              <div className="num text-[11px] text-muted-foreground">{e.d} · {e.w}</div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

/* ══════════════════════════ EXECUTION ══════════════════════════ */

function ScopePanel({ d, p }: any) {
  const items = d.quotations.find((q: any) => q.id === p.quotationId)?.items || [];
  return (
    <Panel accent="blue" texture="grid">
      <PanelHead title="Scope & BOQ" sub="Bill of quantities and progression per camera point" icon={<ClipboardList className="h-4 w-4" />} accent="blue" />
      <TableShell maxHeight={520}>
        <thead><tr>{["CP", "SKU", "Description", "Category", "Qty", "Ord", "Del", "Iss", "Inst", "Test", "Progress"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {items.map((it: any) => {
            const pct = Math.round((it.tested / (it.qty || 1)) * 100);
            return (
              <tr key={it.id}>
                <td>{it.cameraPointId ? <MonoChip>{it.cameraPointId}</MonoChip> : ""}</td>
                <td className="num">{it.sku}</td><td>{it.description}</td><td>{it.category}</td>
                <td className="num">{it.qty}</td><td className="num">{it.ordered}</td><td className="num">{it.delivered}</td>
                <td className="num">{it.issued}</td><td className="num">{it.installed}</td><td className="num">{it.tested}</td>
                <td className="w-32"><ProgressBar value={pct} accent="blue" height={6} /></td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function TimelinePanel({ p, milestones }: any) {
  return (
    <Panel accent="cyan" texture="grid">
      <PanelHead title="Timeline" sub="Milestone schedule" icon={<CalendarClock className="h-4 w-4" />} accent="cyan" />
      <div className="space-y-2">
        {milestones.map((m: any, i: number) => {
          const total = Math.max(1, daysFromToday(p.plannedEnd) + 60);
          const start = Math.max(0, i * 12);
          const dur = 15 + (i * 3) % 20;
          return (
            <div key={m.id} className="flex items-center gap-2.5 text-[11.5px]">
              <div className="w-36 shrink-0 truncate">{m.title}</div>
              <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[rgba(133,164,204,0.10)]">
                <div className="absolute inset-y-0 rounded-full" style={{ left: `${(start / total) * 100}%`, width: `${(dur / total) * 100}%`, background: m.done ? ACCENT.green.hex : ACCENT.cyan.hex, boxShadow: `0 0 10px ${m.done ? ACCENT.green.ring : ACCENT.cyan.ring}` }} />
              </div>
              <div className="num w-24 shrink-0 text-right text-muted-foreground">{fmtDate(m.planned)}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TeamPanel({ pm, teamIds, d }: any) {
  const members = [pm, ...teamIds.map((t: string) => d.employees.find((e: any) => e.id === t))].filter(Boolean);
  return (
    <Panel accent="purple">
      <PanelHead title="Team" sub={`${members.length} members deployed`} icon={<Users className="h-4 w-4" />} accent="purple" />
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {members.map((e: any, i: number) => (
          <div key={e.id + i} className="panel-flat flex items-center gap-3 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold" style={{ background: ACCENT.purple.soft, color: ACCENT.purple.hex }}>
              {e.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0"><div className="truncate text-[13px] font-medium">{e.name}</div><div className="truncate text-[11px] text-muted-foreground">{e.role}</div></div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MaterialsPanel({ p, materials }: any) {
  return (
    <Panel accent="green">
      <PanelHead title="Materials" sub="Full material register" icon={<Boxes className="h-4 w-4" />} accent="green" right={<div className="text-right"><div className="label-xs">Readiness</div><div className="num text-lg font-semibold" style={{ color: ACCENT.green.hex }}>{p.materialReadiness}%</div></div>} />
      <TableShell maxHeight={520}>
        <thead><tr>{["SKU", "Item", "Req", "Ord", "Del", "Iss", "Inst", "Ret", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {materials.map((m: any) => (
            <tr key={m.id}>
              <td className="num">{m.sku}</td><td>{m.name}</td><td className="num">{m.required}</td><td className="num">{m.ordered}</td>
              <td className="num">{m.delivered}</td><td className="num">{m.issued}</td><td className="num">{m.installed}</td><td className="num">{m.returned}</td>
              <td>{m.critical && m.delivered < m.required ? <StatusPill status="Critical shortage" tone="critical" /> : m.installed === m.required ? <StatusPill status="Complete" tone="success" /> : <StatusPill status="In flight" tone="info" />}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

/* ══════════════════════════ COMMERCIAL ══════════════════════════ */

function FinancialsPanel({ p }: any) {
  const outstanding = Math.max(0, p.invoiced - p.collected);
  const chartData = [
    { name: "Contract", revenue: p.contractValue, cost: p.estimatedCost },
    { name: "Revised", revenue: p.contractValue + p.approvedVariations, cost: p.committedCost },
    { name: "Actual", revenue: p.invoiced, cost: p.actualCost },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <MiniKpi label="Contract value" value={fmtQAR(p.contractValue, { compact: true })} accent="blue" />
        <MiniKpi label="Approved variations" value={fmtQAR(p.approvedVariations, { compact: true })} accent="purple" />
        <MiniKpi label="Estimated cost" value={fmtQAR(p.estimatedCost, { compact: true })} accent="amber" />
        <MiniKpi label="Actual cost" value={fmtQAR(p.actualCost, { compact: true })} accent="red" />
        <MiniKpi label="Invoiced" value={fmtQAR(p.invoiced, { compact: true })} accent="cyan" />
        <MiniKpi label="Collected" value={fmtQAR(p.collected, { compact: true })} accent="green" />
        <MiniKpi label="Retention" value={fmtQAR(p.retention, { compact: true })} accent="blue" />
        <MiniKpi label="Outstanding" value={fmtQAR(outstanding, { compact: true })} accent="amber" />
      </div>
      <Panel accent="green" texture="grid">
        <PanelHead title="Revenue vs Cost" icon={<Coins className="h-4 w-4" />} accent="green" />
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} width={40} />
              <Tooltip content={<ChartTooltip formatter={(v: number) => fmtQAR(v, { compact: true })} />} cursor={{ fill: "rgba(47,131,255,0.06)" }} />
              <Bar dataKey="revenue" name="Revenue" fill={ACCENT.green.hex} radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill={ACCENT.blue.hex} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel accent="cyan">
        <PanelHead title="Collection Position" icon={<TrendingUp className="h-4 w-4" />} accent="cyan" />
        <Donut data={[{ name: "Collected", value: p.collected, color: ACCENT.green.hex }, { name: "Outstanding", value: outstanding, color: ACCENT.amber.hex }]} centerValue={`${Math.round((p.collected / Math.max(1, p.invoiced)) * 100)}%`} centerLabel="Collected" size={160} />
      </Panel>
    </div>
  );
}

function PaymentsPanel({ d, payments }: any) {
  return (
    <Panel accent="blue">
      <PanelHead title="Payment Schedule" icon={<Coins className="h-4 w-4" />} accent="blue" />
      <TableShell>
        <thead><tr>{["Milestone", "Amount", "Due", "Invoiced", "Collected", "Status", "Action"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {payments.map((pay: any) => (
            <tr key={pay.id}>
              <td>{pay.label}</td><td className="num">{fmtQAR(pay.amount)}</td><td className="num">{fmtDate(pay.dueDate)}</td>
              <td className="num">{pay.invoicedOn ? fmtDate(pay.invoicedOn) : "-"}</td><td className="num">{pay.collectedOn ? fmtDate(pay.collectedOn) : "-"}</td>
              <td><StatusPill status={pay.status} tone={pay.status === "Collected" ? "success" : pay.status === "Overdue" ? "critical" : pay.status === "Invoiced" ? "info" : "warning"} /></td>
              <td>{pay.status !== "Collected" && <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { d.markPaymentCollected(pay.id); toast.success("Marked collected."); }}>Mark collected</Button>}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function VariationsPanel({ variations }: any) {
  return (
    <Panel accent="purple">
      <PanelHead title="Variations" icon={<FileText className="h-4 w-4" />} accent="purple" right={<Button size="sm" className="h-8 bg-signal text-white" onClick={() => toast.success("Variation drafted (demo)")}>New variation</Button>} />
      <TableShell>
        <thead><tr>{["Number", "Description", "Amount", "Status", "Date"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {variations.map((v: any) => (
            <tr key={v.id}>
              <td className="num">{v.number}</td><td>{v.description}</td><td className="num">{fmtQAR(v.amount)}</td>
              <td><StatusPill status={v.status} tone={v.status === "Approved" ? "success" : v.status === "Rejected" ? "critical" : "info"} /></td>
              <td className="num">{fmtDate(v.date)}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function CostsPanel({ p }: any) {
  const data = [
    { name: "Estimated", value: p.estimatedCost, color: ACCENT.blue.hex },
    { name: "Committed", value: p.committedCost, color: ACCENT.cyan.hex },
    { name: "Actual", value: p.actualCost, color: ACCENT.amber.hex },
  ];
  const variance = p.actualCost - p.estimatedCost;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {data.map((x) => <MiniKpi key={x.name} label={x.name} value={fmtQAR(x.value, { compact: true })} accent={x.name === "Estimated" ? "blue" : x.name === "Committed" ? "cyan" : "amber"} />)}
      </div>
      <Panel accent={variance > 0 ? "red" : "green"}>
        <PanelHead title="Cost Variance" icon={<TrendingDown className="h-4 w-4" />} accent={variance > 0 ? "red" : "green"} />
        <div className="num text-3xl font-semibold" style={{ color: variance > 0 ? ACCENT.red.hex : ACCENT.green.hex }}>{variance > 0 ? "+" : ""}{fmtQAR(variance, { compact: true })}</div>
        <div className="mt-1 text-[12px] text-muted-foreground">{variance > 0 ? "Over estimated cost" : "Under estimated cost"}</div>
      </Panel>
    </div>
  );
}

/* ══════════════════════════ QUALITY ══════════════════════════ */

function IssuesPanel({ devices, tests, tasks, onJump }: any) {
  const failed = devices.filter((x: any) => x.testResult === "Fail");
  const overdue = tasks.filter((t: any) => new Date(t.due) < new Date() && t.status !== "Completed");
  const issues = [
    ...failed.map((dev: any) => ({ severity: "critical" as const, title: `${dev.label} failed test inspection`, meta: [{ k: "Reason", v: tests.find((t: any) => t.deviceId === dev.id)?.notes || "Failed inspection" }], action: "Open Testing", onAction: () => onJump("testing") })),
    ...overdue.map((t: any) => ({ severity: "warning" as const, title: `Task overdue: ${t.title}`, meta: [{ k: "Due", v: fmtDate(t.due) }], action: "Open Tasks", onAction: () => onJump("tasks") })),
  ];
  return (
    <Panel accent="red">
      <PanelHead title="Open Issues" sub="Failed tests and overdue actions requiring attention" icon={<AlertTriangle className="h-4 w-4" />} accent="red" />
      {issues.length === 0 ? <EmptyState title="No open issues" hint="Everything is on track." /> : <div className="space-y-2">{issues.map((it, i) => <AlertCard key={i} {...it} />)}</div>}
    </Panel>
  );
}

function QaQcPanel({ devices, tests }: any) {
  const checks = ["power", "network", "ip", "image", "focus", "angle", "day", "night", "recording", "playback", "storage", "time", "motion", "analytics", "mounting", "label"];
  return (
    <Panel accent="amber">
      <PanelHead title="QA/QC Checklist" sub="Per-device inspection checklist" icon={<ClipboardCheck className="h-4 w-4" />} accent="amber" />
      <TableShell maxHeight={420}>
        <thead><tr><th>Device</th>{checks.map((c) => <th key={c} className="text-center capitalize">{c}</th>)}<th>Result</th></tr></thead>
        <tbody>
          {tests.map((t: any) => {
            const dev = devices.find((x: any) => x.id === t.deviceId);
            return (
              <tr key={t.id}>
                <td><MonoChip>{dev?.label}</MonoChip></td>
                {checks.map((c) => {
                  const v = t.checks[c];
                  return <td key={c} className="text-center">{v === "Pass" ? <CheckCircle2 className="inline h-3 w-3 text-success" /> : v === "Fail" ? <XCircle className="inline h-3 w-3 text-critical" /> : <Circle className="inline h-3 w-3 text-muted-foreground" />}</td>;
                })}
                <td><StatusPill status={t.result} tone={t.result === "Pass" ? "success" : t.result === "Fail" ? "critical" : "warning"} /></td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function CompliancePanel({ d, compliance }: any) {
  return (
    <Panel accent="cyan">
      <PanelHead title="Compliance Tracker" sub="Internal checklist for Qatar CCTV project approvals. Not legal advice." icon={<ShieldCheck className="h-4 w-4" />} accent="cyan" />
      <div className="space-y-2">
        {compliance.map((c: any) => (
          <div key={c.id} className="panel-flat flex items-center gap-3 p-2.5">
            <StatusPill status={c.status} tone={c.status === "Approved" ? "success" : c.status === "Rejected" ? "critical" : c.status === "Submitted" ? "info" : "warning"} />
            <div className="min-w-0 flex-1 truncate text-[13px]">{c.item}</div>
            <div className="text-[11px] text-muted-foreground">{c.owner}</div>
            {c.expires && <div className="num text-[11px] text-muted-foreground">expires {fmtDate(c.expires)}</div>}
            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { d.toggleCompliance(c.id); toast("Status toggled."); }}>Toggle</Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DocumentsPanel({ docs }: any) {
  return (
    <Panel accent="blue">
      <PanelHead title="Documents" icon={<FileText className="h-4 w-4" />} accent="blue" right={<Button size="sm" className="h-8 bg-signal text-white" onClick={() => toast.success("Document uploaded (demo)")}>Upload</Button>} />
      <TableShell>
        <thead><tr>{["Document", "Category", "Revision", "Status", "Uploaded"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {docs.map((doc: any) => (
            <tr key={doc.id}>
              <td>{doc.name}</td><td>{doc.category}</td><td className="num">{doc.revision}</td>
              <td><StatusPill status={doc.status} tone={doc.status === "Approved" ? "success" : "warning"} /></td>
              <td className="num">{fmtDate(doc.uploadedOn)}</td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

/* ══════════════════════════ HANDOVER ══════════════════════════ */

function FinalDocsPanel({ docs }: any) {
  const finalDocs = docs.filter((doc: any) => ["As-Built", "O&M Manual", "Warranty", "Test Certificate"].includes(doc.category)) || [];
  const list = finalDocs.length ? finalDocs : docs;
  return (
    <Panel accent="green">
      <PanelHead title="Final Documents" sub="Handover documentation package" icon={<FileText className="h-4 w-4" />} accent="green" />
      {list.length === 0 ? <EmptyState title="No final documents yet" /> : (
        <TableShell>
          <thead><tr>{["Document", "Category", "Status", "Uploaded"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{list.map((doc: any) => (
            <tr key={doc.id}><td>{doc.name}</td><td>{doc.category}</td><td><StatusPill status={doc.status} tone={doc.status === "Approved" ? "success" : "warning"} /></td><td className="num">{fmtDate(doc.uploadedOn)}</td></tr>
          ))}</tbody>
        </TableShell>
      )}
    </Panel>
  );
}

function TrainingPanel({ comms }: any) {
  const trainingComms = comms.filter((c: any) => /train/i.test(c.subject));
  return (
    <Panel accent="cyan">
      <PanelHead title="Client Training" sub="System handover and operator training sessions" icon={<GraduationCap className="h-4 w-4" />} accent="cyan" />
      {trainingComms.length === 0 ? (
        <EmptyState title="No training sessions scheduled" hint="Schedule an operator training session before final handover." action={<Button size="sm" className="bg-signal text-white" onClick={() => toast.success("Training session scheduled (demo)")}>Schedule Training</Button>} />
      ) : (
        <div className="space-y-2">{trainingComms.map((c: any) => (
          <div key={c.id} className="panel-flat flex items-center gap-3 p-2.5">
            <div className="num w-24 shrink-0 text-[11px] text-muted-foreground">{fmtDate(c.date)}</div>
            <div className="min-w-0 flex-1 truncate text-[13px]">{c.subject}</div>
            <StatusPill status={c.status} tone={c.status === "Confirmed" ? "success" : "warning"} />
          </div>
        ))}</div>
      )}
    </Panel>
  );
}

function WarrantyPanel({ p }: any) {
  return (
    <Panel accent="blue" texture="grid">
      <PanelHead title="Warranty & AMC" sub="Post-handover coverage and retention" icon={<ShieldCheck className="h-4 w-4" />} accent="blue" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MiniKpi label="Retention held" value={fmtQAR(p.retention, { compact: true })} accent="blue" />
        <MiniKpi label="Warranty period" value="24 months" accent="cyan" />
        <MiniKpi label="AMC status" value="Not signed" accent="amber" />
      </div>
      <div className="mt-4"><EmptyState title="AMC proposal pending" hint="Prepare an Annual Maintenance Contract proposal ahead of handover." action={<Button size="sm" className="bg-signal text-white" onClick={() => toast.success("AMC proposal drafted (demo)")}>Draft AMC Proposal</Button>} /></div>
    </Panel>
  );
}

/* ══════════════════════════ SHARED / LEGACY TAB WIDGETS ══════════════════════════ */

function TasksTab({ projectId, tasks }: { projectId: string; tasks: import("@/lib/mock-data").Task[] }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [newT, setNewT] = useState({ title: "", assigneeId: "E-010", phase: "Installation", due: new Date().toISOString().slice(0, 10), priority: "Medium" as const });
  return (
    <Panel accent="blue">
      <PanelHead title="Tasks" icon={<ClipboardList className="h-4 w-4" />} accent="blue" right={<Button size="sm" className="h-8 bg-signal text-white" onClick={() => setAddOpen(true)}>Add task</Button>} />
      <TableShell>
        <thead><tr>{["Task", "Assignee", "Phase", "Priority", "Due", "Status", "Progress", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {tasks.map((t) => {
            const emp = d.employees.find((e) => e.id === t.assigneeId);
            return (
              <tr key={t.id}>
                <td>{t.title}</td><td>{emp?.name}</td><td>{t.phase}</td>
                <td><StatusPill status={t.priority} tone={t.priority === "Critical" ? "critical" : t.priority === "High" ? "warning" : "neutral"} /></td>
                <td className="num">{fmtDate(t.due)}</td>
                <td>
                  <Select value={t.status} onValueChange={(v) => { d.updateTask(t.id, { status: v as never }); toast(`Task status: ${v}`); }}>
                    <SelectTrigger className="h-7 w-40 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Not Started", "Ready", "In Progress", "Blocked", "Awaiting Client", "Awaiting Material", "Under Review", "Completed"].map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="w-32"><ProgressBar value={t.progress} accent="blue" height={6} /></td>
                <td><Button size="sm" variant="ghost" className="h-7 text-[11px] text-critical" onClick={() => setConfirmDel(t.id)}>Delete</Button></td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add task</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Title</span><Input value={newT.title} onChange={(e) => setNewT({ ...newT, title: e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Assignee</span><Select value={newT.assigneeId} onValueChange={(v) => setNewT({ ...newT, assigneeId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{d.employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Due</span><Input type="date" value={newT.due} onChange={(e) => setNewT({ ...newT, due: e.target.value })} /></label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={() => { if (!newT.title) { toast.error("Title is required"); return; } d.addTask({ projectId, ...newT, status: "Not Started", progress: 0 }); setAddOpen(false); toast.success("Task added."); setNewT({ ...newT, title: "" }); }}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete task?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (confirmDel) { d.deleteTask(confirmDel); toast.success("Task deleted."); } setConfirmDel(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}

function DevicesTab({ devices }: { devices: import("@/lib/mock-data").Device[] }) {
  const [q, setQ] = useState("");
  const filt = devices.filter((d) => (d.label + d.ip + d.serial + d.mac).toLowerCase().includes(q.toLowerCase()));
  return (
    <Panel accent="purple">
      <PanelHead title="Device Register" sub="Camera labels reuse survey point ids" icon={<Camera className="h-4 w-4" />} accent="purple" right={<Input placeholder="Search label, IP, serial, MAC." value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-64" />} />
      <TableShell maxHeight={520}>
        <thead><tr>{["Label", "Brand", "Model", "Serial", "MAC", "IP", "Building", "Floor", "Zone", "Switch", "Port", "Ch", "Install", "Test", "Status"].map((h) => <th key={h} className="whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>
          {filt.map((d) => (
            <tr key={d.id}>
              <td><MonoChip>{d.label}</MonoChip></td><td>{d.brand}</td><td>{d.model}</td>
              <td className="num">{d.serial}</td><td className="num">{d.mac}</td><td className="num">{d.ip}</td>
              <td>{d.building}</td><td>{d.floor}</td><td>{d.zone}</td>
              <td className="num">{d.switch}</td><td className="num">{d.switchPort}</td><td className="num">{d.recorderChannel}</td>
              <td className="num">{d.installDate ? fmtDate(d.installDate) : "-"}</td>
              <td><StatusPill status={d.testResult} tone={d.testResult === "Pass" ? "success" : d.testResult === "Fail" ? "critical" : "warning"} /></td>
              <td><StatusPill status={d.status} tone={d.status === "Faulty" ? "critical" : d.status === "Tested" ? "success" : "info"} /></td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </Panel>
  );
}

function TestingTab({ devices, tests }: { devices: import("@/lib/mock-data").Device[]; tests: import("@/lib/mock-data").TestRecord[] }) {
  const d = useData();
  const failed = devices.filter((x) => x.testResult === "Fail");
  const pass = devices.filter((x) => x.testResult === "Pass").length;
  const pending = devices.filter((x) => x.testResult === "Pending").length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <MiniKpi label="Total" value={devices.length} accent="blue" />
        <MiniKpi label="Passed" value={pass} accent="green" />
        <MiniKpi label="Failed" value={failed.length} accent="red" />
        <MiniKpi label="Pending" value={pending} accent="amber" />
      </div>
      {failed.length > 0 && (
        <Panel accent="red">
          <PanelHead title="Failed Test Queue" icon={<AlertTriangle className="h-4 w-4" />} accent="red" />
          <TableShell>
            <thead><tr>{["Label", "Reason", "Tested by", "Action"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {failed.map((dev) => (
                <tr key={dev.id}>
                  <td><MonoChip>{dev.label}</MonoChip></td>
                  <td>{tests.find((t) => t.deviceId === dev.id)?.notes || "Failed inspection"}</td>
                  <td>Ahmed Sobhi</td>
                  <td><Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { d.updateDevice(dev.id, { testResult: "Pass", status: "Tested" }); toast.success(`${dev.label} retest passed.`); }}><RefreshCw className="mr-1 h-3 w-3" />Retest as pass</Button></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}

function HandoverTab({ items }: { items: import("@/lib/mock-data").HandoverItem[] }) {
  const d = useData();
  const readiness = items.length ? Math.round((items.filter((i) => i.done).length / items.length) * 100) : 0;
  const sections: import("@/lib/mock-data").HandoverItem["section"][] = ["Technical", "Documentation", "Commercial", "Client"];
  const accentBySection: Record<string, Accent> = { Technical: "purple", Documentation: "blue", Commercial: "green", Client: "cyan" };
  return (
    <Panel texture="grid" accent="cyan">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="label-xs mb-1">Handover Readiness</div>
          <div className="text-[12px] text-muted-foreground">All items must be completed before handover.</div>
        </div>
        <div className="text-right">
          <div className="num text-4xl font-bold leading-none" style={{ color: ACCENT.cyan.hex }}>{readiness}%</div>
          <StatusPill status={readiness === 100 ? "Ready" : readiness > 70 ? "Nearly ready" : "In progress"} tone={readiness === 100 ? "success" : readiness > 70 ? "info" : "warning"} />
        </div>
      </div>
      <div className="mt-3"><ProgressBar value={readiness} accent="cyan" height={8} /></div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {sections.map((sec) => (
          <div key={sec} className="panel-flat p-3">
            <div className="label-xs mb-2" style={{ color: ACCENT[accentBySection[sec]].hex }}>{sec}</div>
            {items.filter((i) => i.section === sec).map((i) => (
              <label key={i.id} className="flex cursor-pointer items-start gap-2 py-1.5">
                <input type="checkbox" checked={i.done} onChange={() => { d.toggleHandover(i.id); toast(i.done ? "Item unchecked." : "Item completed."); }} className="mt-1 accent-signal" />
                <span className={cn("text-[13px]", i.done && "text-muted-foreground line-through")}>{i.label}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SiteActivityTab({ projectId, activities }: { projectId: string; activities: import("@/lib/mock-data").SiteActivity[] }) {
  const d = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), teamPresent: [] as string[], workCompleted: "", camerasInstalled: 0, cableInstalled: 0, devicesConfigured: 0, issues: "", tomorrowPlan: "" });
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" className="h-8 bg-signal text-white" onClick={() => setOpen(true)}>New daily report</Button></div>
      {activities.map((a) => (
        <Panel key={a.id} accent="cyan">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[13px] font-medium">Site Activity — <span className="num">{fmtDate(a.date)}</span></div>
            <div className="text-[11px] text-muted-foreground">{a.teamPresent.map((id) => d.employees.find((e) => e.id === id)?.name).join(", ")}</div>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2.5">
            <MiniKpi label="Cameras installed" value={a.camerasInstalled} accent="purple" />
            <MiniKpi label="Cable installed (m)" value={a.cableInstalled} accent="cyan" />
            <MiniKpi label="Devices configured" value={a.devicesConfigured} accent="blue" />
          </div>
          <div className="text-[13px]"><div className="label-xs mb-1">Work completed</div>{a.workCompleted}</div>
          <div className="mt-2 text-[13px]"><div className="label-xs mb-1">Issues</div>{a.issues || "None."}</div>
          <div className="mt-2 text-[13px]"><div className="label-xs mb-1">Tomorrow's plan</div>{a.tomorrowPlan}</div>
        </Panel>
      ))}
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
