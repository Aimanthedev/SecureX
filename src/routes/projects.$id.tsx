import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { HealthBadge, MonoChip, ProgressBar, StatusPill, Ring } from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Printer, Circle, ChevronRight, MoreHorizontal, LayoutGrid, Wrench, Coins, ShieldCheck, FolderOpen, Flag, Camera, Package as PackageIcon, ClipboardCheck, TrendingDown, Users, MessageSquare, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({ meta: [{ title: "Project | AL HARIB CCTV COMPANY" }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = useParams({ from: "/projects/$id" });
  const d = useData();
  const p = d.projects.find((x) => x.id === id);
  if (!p) return <div className="p-6"><Card className="p-6">Project not found. <Link to="/projects" className="text-signal">Back</Link></Card></div>;
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
  const SECTIONS = useMemo(() => [
    { id: "overview",   label: "Overview",   icon: LayoutGrid,     subs: [{ v: "overview", l: "Summary" }] },
    { id: "execution",  label: "Execution",  icon: Wrench,         subs: [
      { v: "scope", l: "Scope & BOQ" }, { v: "tasks", l: "Tasks" }, { v: "timeline", l: "Timeline" },
      { v: "site", l: "Site Activity" }, { v: "team", l: "Team" }, { v: "materials", l: "Materials" },
      { v: "devices", l: "Device Register" },
    ] },
    { id: "commercial", label: "Commercial", icon: Coins,          subs: [{ v: "fin", l: "Financials" }, { v: "vars", l: "Variations" }] },
    { id: "quality",    label: "Quality",    icon: ShieldCheck,    subs: [{ v: "testing", l: "Testing" }, { v: "comp", l: "Compliance" }] },
    { id: "documents",  label: "Documents",  icon: FolderOpen,     subs: [{ v: "docs", l: "Project Documents" }, { v: "comm", l: "Client Communication" }, { v: "log", l: "Activity Log" }] },
    { id: "handover",   label: "Handover",   icon: Flag,           subs: [{ v: "handover", l: "Readiness Checklist" }] },
  ] as const, []);
  const [section, setSection] = useState<string>("overview");
  const [tab, setTab] = useState("overview");
  const activeSection = SECTIONS.find((s) => s.id === section) || SECTIONS[0];
  const goTo = (sub: string) => {
    const sec = SECTIONS.find((s) => s.subs.some((x) => x.v === sub));
    if (sec) setSection(sec.id);
    setTab(sub);
  };
  const collected = p.collected; const invoiced = Math.max(1, p.invoiced);
  const camsInstalled = projectDevices.filter((x) => x.status === "Installed" || x.status === "Configured" || x.status === "Tested" || x.status === "Handed Over").length;
  const testsPassed = projectDevices.filter((x) => x.testResult === "Pass").length;
  const testsFailed = projectDevices.filter((x) => x.testResult === "Fail").length;
  const daysLeft = daysFromToday(p.plannedEnd);
  const scheduleGap = p.plannedProgress - p.actualProgress;

  return (
    <div className="space-y-4">
      {/* LAYER 1 — Identity Header */}
      <div className="rounded-2xl border hairline bg-gradient-to-br from-card via-card to-surface-2/60 p-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-5 items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <MonoChip>{p.number}</MonoChip>
              <HealthBadge label={health.label} />
              <StatusPill status={p.phase} tone="info" />
              {scheduleGap > 10 && <StatusPill status="High Priority" tone="warning" />}
            </div>
            <h1 className="text-2xl md:text-[26px] font-display font-semibold tracking-tight truncate">{p.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span><span className="text-foreground/70">Customer:</span> {cust.name}</span>
              <span><span className="text-foreground/70">Site:</span> {site.name}</span>
              <span><span className="text-foreground/70">PM:</span> {pm.name}</span>
              <span><span className="text-foreground/70">Type:</span> CCTV Installation</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-0">
            <MiniStat label="Value" value={fmtQAR(p.contractValue + p.approvedVariations, { compact: true })} />
            <MiniStat label="Completion" value={`${p.actualProgress}%`} accent="signal" />
            <MiniStat label="Planned end" value={fmtDate(p.plannedEnd)} sub={`${daysLeft} days left`} />
            <MiniStat label="Materials" value={`${p.materialReadiness}%`} accent={p.materialReadiness < 80 ? "warning" : "success"} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t hairline">
          <Button size="sm" className="bg-signal text-signal-foreground hover:bg-signal/90 h-8" onClick={() => toast.success("Project updated (demo)")}>Update Project</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => goTo("tasks")}>Add Task</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => goTo("site")}>Add Site Report</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => goTo("comm")}>Client Update</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 gap-1"><MoreHorizontal className="w-4 h-4" /> More</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => toast.success("Progress report generated (demo)")}><Printer className="w-3.5 h-3.5 mr-2" />Progress Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("docs")}>Upload Document</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Issue drafted (demo)")}>Add Issue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("vars")}>Add Variation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Site visit scheduled (demo)")}>Schedule Visit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => goTo("handover")}>Handover Checklist</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast("Archived (demo)")} className="text-critical focus:text-critical">Archive Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* LAYER 2 — Command Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <CommandTile label="Actual Progress" value={`${p.actualProgress}%`} sub={scheduleGap > 0 ? `${scheduleGap}% behind plan` : "On plan"} tone={scheduleGap > 10 ? "critical" : scheduleGap > 0 ? "warning" : "success"} kind="ring" ring={p.actualProgress} onClick={() => goTo("overview")} />
        <CommandTile label="Planned Progress" value={`${p.plannedProgress}%`} sub="Expected today" tone="info" kind="ring" ring={p.plannedProgress} onClick={() => goTo("timeline")} />
        <CommandTile label="Material Readiness" value={`${p.materialReadiness}%`} sub={`${projectMats.filter((m) => m.critical && m.delivered < m.required).length} critical items`} tone={p.materialReadiness < 80 ? "warning" : "success"} kind="bar" bar={p.materialReadiness} onClick={() => goTo("materials")} />
        <CommandTile label="Cameras Installed" value={`${camsInstalled} / ${projectDevices.length}`} sub={`${projectDevices.length - camsInstalled} remaining`} tone="info" kind="bar" bar={projectDevices.length ? (camsInstalled / projectDevices.length) * 100 : 0} icon={Camera} onClick={() => goTo("devices")} />
        <CommandTile label="Tests Passed" value={`${testsPassed} / ${projectDevices.length}`} sub={testsFailed ? `${testsFailed} failures` : "No failures"} tone={testsFailed ? "critical" : "success"} kind="counter" icon={ClipboardCheck} onClick={() => goTo("testing")} />
        <CommandTile label="Collected" value={`${fmtQAR(collected, { compact: true })}`} sub={`${Math.round((collected / invoiced) * 100)}% of invoiced`} tone="success" kind="bar" bar={(collected / invoiced) * 100} icon={Coins} onClick={() => goTo("fin")} />
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
              <p className="text-xs text-muted-foreground mb-3">Reasons behind this project's status. Computed from schedule variance, material readiness, open approvals, and failed tests.</p>
              <div className="space-y-2">{health.drivers.map((dr, i) => (
                <div key={i} className="flex items-start gap-2 p-2 border hairline rounded-md">
                  {dr.severity === "critical" ? <AlertTriangle className="w-4 h-4 text-critical mt-0.5" /> : dr.severity === "warning" ? <AlertTriangle className="w-4 h-4 text-warning mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />}
                  <div className="text-sm">{dr.text}</div>
                </div>
              ))}</div>
            </Card>
            <Card className="p-4">
              <h3 className="font-display font-semibold text-lg mb-3">Progress</h3>
              <div className="grid grid-cols-3 gap-3"><Ring value={p.actualProgress} label="Actual" /><Ring value={p.plannedProgress} label="Planned" /><Ring value={p.materialReadiness} label="Materials" /></div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Cameras installed</span><span className="num">{projectDevices.filter((x)=>x.status!=="Faulty").length} / {projectDevices.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tests passed</span><span className="num">{projectDevices.filter((x)=>x.testResult==="Pass").length} / {projectDevices.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Approvals pending</span><span className="num">{projectApprovals.filter((a)=>a.status==="Pending").length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span className="num">{fmtQAR(p.collected,{compact:true})} of {fmtQAR(p.invoiced,{compact:true})}</span></div>
              </div>
            </Card>
          </div>
          <Card className="p-4">
            <h3 className="font-display font-semibold text-lg mb-3">Milestones</h3>
            <div className="divide-y hairline">{projectMs.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center gap-3">
                {m.done ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                <div className="flex-1 text-sm">{m.title}</div>
                <div className="text-xs text-muted-foreground">Planned <span className="num">{fmtDate(m.planned)}</span> {m.actual && <>· Actual <span className="num">{fmtDate(m.actual)}</span></>}</div>
              </div>
            ))}</div>
          </Card>
        </TabsContent>

        <TabsContent value="scope" className="mt-4">
          <Card className="p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["CP","SKU","Description","Category","Qty","Ord","Del","Iss","Inst","Test","Progress"].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr></thead>
            <tbody>{(d.quotations.find((q) => q.id === p.quotationId)?.items || []).map((it) => {
              const pct = Math.round((it.tested / (it.qty || 1)) * 100);
              return (<tr key={it.id} className="border-t hairline">
                <td className="py-2 px-2">{it.cameraPointId ? <MonoChip>{it.cameraPointId}</MonoChip> : ""}</td>
                <td className="py-2 px-2 num text-xs">{it.sku}</td>
                <td className="py-2 px-2 text-xs">{it.description}</td>
                <td className="py-2 px-2 text-xs">{it.category}</td>
                <td className="py-2 px-2 num text-xs">{it.qty}</td>
                <td className="py-2 px-2 num text-xs">{it.ordered}</td>
                <td className="py-2 px-2 num text-xs">{it.delivered}</td>
                <td className="py-2 px-2 num text-xs">{it.issued}</td>
                <td className="py-2 px-2 num text-xs">{it.installed}</td>
                <td className="py-2 px-2 num text-xs">{it.tested}</td>
                <td className="py-2 px-2 w-32"><ProgressBar value={pct} /></td>
              </tr>);
            })}</tbody>
          </table></div></Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4"><TasksTab projectId={p.id} tasks={projectTasks} /></TabsContent>

        <TabsContent value="timeline" className="mt-4"><Card className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3">Gantt</h3>
          <div className="space-y-1.5">{projectMs.map((m, i) => {
            const total = Math.max(1, daysFromToday(p.plannedEnd) + 60);
            const start = Math.max(0, i * 12); const dur = 15 + (i * 3) % 20;
            return (<div key={m.id} className="flex items-center gap-2 text-xs">
              <div className="w-40 truncate">{m.title}</div>
              <div className="flex-1 h-4 bg-muted rounded relative"><div className={`absolute h-full rounded ${m.done ? "bg-success" : "bg-signal"}`} style={{ left: `${(start / total) * 100}%`, width: `${(dur / total) * 100}%` }} /></div>
              <div className="num w-24 text-right">{fmtDate(m.planned)}</div>
            </div>);
          })}</div>
        </Card></TabsContent>

        <TabsContent value="site" className="mt-4"><SiteActivityTab projectId={p.id} activities={projectActs} /></TabsContent>

        <TabsContent value="team" className="mt-4"><Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[pm, ...p.teamIds.map((t) => d.employees.find((e) => e.id === t)!)].filter(Boolean).map((e, i) => (
            <div key={e.id + i} className="border hairline rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-signal/15 text-signal grid place-items-center text-sm font-semibold">{e.name.split(" ").map((n) => n[0]).slice(0,2).join("")}</div>
              <div className="min-w-0"><div className="text-sm font-medium truncate">{e.name}</div><div className="text-xs text-muted-foreground">{e.role}</div></div>
            </div>
          ))}</div>
        </Card></TabsContent>

        <TabsContent value="materials" className="mt-4"><Card className="p-0">
          <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Materials</h3><div className="text-xs">Readiness <span className="num text-lg font-semibold">{p.materialReadiness}%</span></div></div>
          <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["SKU","Item","Req","Ord","Del","Iss","Inst","Ret","Status"].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr></thead>
            <tbody>{projectMats.map((m) => (<tr key={m.id} className="border-t hairline"><td className="py-2 px-2 num text-xs">{m.sku}</td><td className="py-2 px-2 text-xs">{m.name}</td><td className="py-2 px-2 num text-xs">{m.required}</td><td className="py-2 px-2 num text-xs">{m.ordered}</td><td className="py-2 px-2 num text-xs">{m.delivered}</td><td className="py-2 px-2 num text-xs">{m.issued}</td><td className="py-2 px-2 num text-xs">{m.installed}</td><td className="py-2 px-2 num text-xs">{m.returned}</td><td className="py-2 px-2">{m.critical && m.delivered < m.required ? <StatusPill status="Critical shortage" tone="critical" /> : m.installed === m.required ? <StatusPill status="Complete" tone="success" /> : <StatusPill status="In flight" tone="info" />}</td></tr>))}</tbody>
          </table>
        </Card></TabsContent>

        <TabsContent value="devices" className="mt-4"><DevicesTab devices={projectDevices} /></TabsContent>

        <TabsContent value="docs" className="mt-4"><Card className="p-0">
          <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Documents</h3><Button size="sm" onClick={() => toast.success("Document uploaded (demo)")}>Upload</Button></div>
          <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Document","Category","Revision","Status","Uploaded"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
            <tbody>{projectDocs.map((doc) => (<tr key={doc.id} className="border-t hairline"><td className="py-2 px-3">{doc.name}</td><td className="py-2 px-3 text-xs">{doc.category}</td><td className="py-2 px-3 num text-xs">{doc.revision}</td><td className="py-2 px-3"><StatusPill status={doc.status} tone={doc.status === "Approved" ? "success" : "warning"} /></td><td className="py-2 px-3 num text-xs">{fmtDate(doc.uploadedOn)}</td></tr>))}</tbody>
          </table>
        </Card></TabsContent>

        <TabsContent value="vars" className="mt-4"><Card className="p-4">
          <div className="flex items-center justify-between mb-3"><h3 className="font-display font-semibold text-lg">Variations</h3><Button size="sm" onClick={() => toast.success("Variation drafted (demo)")}>New variation</Button></div>
          <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground"><tr>{["Number","Description","Amount","Status","Date"].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
            <tbody>{projectVars.map((v) => (<tr key={v.id} className="border-t hairline"><td className="py-2 num">{v.number}</td><td className="py-2">{v.description}</td><td className="py-2 num">{fmtQAR(v.amount)}</td><td className="py-2"><StatusPill status={v.status} tone={v.status==="Approved"?"success":v.status==="Rejected"?"critical":"info"} /></td><td className="py-2 num text-xs">{fmtDate(v.date)}</td></tr>))}</tbody>
          </table>
        </Card></TabsContent>

        <TabsContent value="testing" className="mt-4"><TestingTab devices={projectDevices} tests={projectTests} /></TabsContent>

        <TabsContent value="fin" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Contract value" value={fmtQAR(p.contractValue, {compact:true})} />
            <Stat label="Approved variations" value={fmtQAR(p.approvedVariations, {compact:true})} />
            <Stat label="Estimated cost" value={fmtQAR(p.estimatedCost, {compact:true})} />
            <Stat label="Actual cost" value={fmtQAR(p.actualCost, {compact:true})} />
            <Stat label="Invoiced" value={fmtQAR(p.invoiced, {compact:true})} />
            <Stat label="Collected" value={fmtQAR(p.collected, {compact:true})} sub={`Outstanding ${fmtQAR(p.invoiced-p.collected,{compact:true})}`} />
            <Stat label="Retention" value={fmtQAR(p.retention, {compact:true})} />
            <Stat label="Forecast margin" value="28%" />
          </div>
          <Card className="p-0"><div className="p-3"><h3 className="font-display font-semibold text-lg">Payment Schedule</h3></div>
            <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Milestone","Amount","Due","Invoiced","Collected","Status","Action"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
              <tbody>{projectPays.map((pay) => (<tr key={pay.id} className="border-t hairline">
                <td className="py-2 px-3">{pay.label}</td><td className="py-2 px-3 num">{fmtQAR(pay.amount)}</td><td className="py-2 px-3 num text-xs">{fmtDate(pay.dueDate)}</td>
                <td className="py-2 px-3 num text-xs">{pay.invoicedOn ? fmtDate(pay.invoicedOn) : "-"}</td><td className="py-2 px-3 num text-xs">{pay.collectedOn ? fmtDate(pay.collectedOn) : "-"}</td>
                <td className="py-2 px-3"><StatusPill status={pay.status} tone={pay.status==="Collected"?"success":pay.status==="Overdue"?"critical":pay.status==="Invoiced"?"info":"warning"} /></td>
                <td className="py-2 px-3">{pay.status !== "Collected" && <Button size="sm" variant="ghost" onClick={() => { d.markPaymentCollected(pay.id); toast.success("Marked collected."); }}>Mark collected</Button>}</td>
              </tr>))}</tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="comm" className="mt-4"><Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">Client Communication</h3>
          <div className="divide-y hairline">{projectComms.map((c) => (<div key={c.id} className="py-2.5 flex items-center gap-3"><div className="text-xs num text-muted-foreground w-24">{fmtDate(c.date)}</div><div className="flex-1 text-sm"><div>{c.subject}</div><div className="text-xs text-muted-foreground">{c.owner}</div></div><StatusPill status={c.status} tone={c.status==="Confirmed"?"success":c.status==="Pending"?"warning":"info"} /></div>))}</div>
        </Card></TabsContent>

        <TabsContent value="comp" className="mt-4"><Card className="p-4">
          <div className="mb-3"><h3 className="font-display font-semibold text-lg">Compliance Tracker</h3><p className="text-xs text-muted-foreground">Internal checklist for Qatar CCTV project approvals. Not legal advice.</p></div>
          <div className="space-y-2">{projectCompliance.map((c) => (<div key={c.id} className="flex items-center gap-3 p-2 border hairline rounded-md"><StatusPill status={c.status} tone={c.status==="Approved"?"success":c.status==="Rejected"?"critical":c.status==="Submitted"?"info":"warning"} /><div className="flex-1 text-sm">{c.item}</div><div className="text-xs text-muted-foreground">{c.owner}</div>{c.expires && <div className="text-xs num text-muted-foreground">expires {fmtDate(c.expires)}</div>}<Button size="sm" variant="ghost" onClick={() => { d.toggleCompliance(c.id); toast("Status toggled."); }}>Toggle</Button></div>))}</div>
        </Card></TabsContent>

        <TabsContent value="handover" className="mt-4"><HandoverTab items={projectHandover} /></TabsContent>

        <TabsContent value="log" className="mt-4"><Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">Activity Log</h3>
          <ol className="relative border-l hairline ml-2 space-y-4">{[{t:"Site activity logged",d:"2026-07-20 08:15",w:"Rakesh Nair"},{t:"Test result: FAIL on CP-13",d:"2026-07-19 16:40",w:"Ahmed Sobhi"},{t:"Materials issued",d:"2026-07-19 11:20",w:"Aisha Rahman"},{t:"Progress cert 3 invoiced",d:"2026-07-18 14:00",w:"Hasan Barzani"},{t:"Variation VO-02 submitted",d:"2026-07-14 10:12",w:"Anitha Verghese"}].map((e, i) => (<li key={i} className="ml-4"><div className="absolute w-2 h-2 rounded-full bg-signal -left-1 mt-1.5" /><div className="text-sm">{e.t}</div><div className="text-xs text-muted-foreground num">{e.d} · {e.w}</div></li>))}</ol>
        </Card></TabsContent>
      </Tabs>
        </div>
        {/* Intelligence Rail */}
        <IntelligenceRail
          section={section}
          project={p}
          health={health}
          milestones={projectMs}
          materials={projectMats}
          tasks={projectTasks}
          approvals={projectApprovals}
          devices={projectDevices}
          payments={projectPays}
          docs={projectDocs}
          handoverItems={projectHandover}
          comms={projectComms}
          onJump={goTo}
        />
      </div>
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

function CommandTile({ label, value, sub, tone = "info", kind, ring, bar, icon: Icon, onClick }: {
  label: string; value: React.ReactNode; sub?: string;
  tone?: "success"|"warning"|"critical"|"info";
  kind: "ring"|"bar"|"counter";
  ring?: number; bar?: number;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  const toneVar = tone === "critical" ? "var(--critical)" : tone === "warning" ? "var(--warning)" : tone === "success" ? "var(--success)" : "var(--signal)";
  const toneText = tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-signal";
  return (
    <button onClick={onClick} className="group text-left rounded-xl border hairline bg-card p-3.5 hover:border-signal/40 hover:shadow-md hover:shadow-signal/10 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{label}</div>
        {Icon && <Icon className={cn("w-3.5 h-3.5", toneText)} />}
      </div>
      <div className="mt-2 flex items-end gap-2.5">
        {kind === "ring" && ring !== undefined && (
          <svg width="42" height="42" className="-rotate-90 shrink-0">
            <circle cx="21" cy="21" r="17" strokeWidth="3.5" stroke="var(--muted)" fill="none" />
            <circle cx="21" cy="21" r="17" strokeWidth="3.5" stroke={toneVar} fill="none" strokeDasharray={2 * Math.PI * 17} strokeDashoffset={2 * Math.PI * 17 - (Math.min(100, Math.max(0, ring)) / 100) * 2 * Math.PI * 17} strokeLinecap="round" />
          </svg>
        )}
        <div className="min-w-0 flex-1">
          <div className="num text-[22px] font-display font-semibold leading-none tabular-nums truncate">{value}</div>
          {sub && <div className={cn("text-[10.5px] mt-1 truncate", toneText)}>{sub}</div>}
        </div>
      </div>
      {kind === "bar" && bar !== undefined && (
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, bar))}%`, backgroundColor: toneVar }} />
        </div>
      )}
    </button>
  );
}

function IntelligenceRail({ section, project, health, milestones, materials, tasks, devices, payments, docs, handoverItems, comms, onJump }: {
  section: string;
  project: import("@/lib/mock-data").Project;
  health: ReturnType<typeof import("@/lib/mock-data").computeHealth>;
  milestones: import("@/lib/mock-data").Milestone[];
  materials: import("@/lib/mock-data").Material[];
  tasks: import("@/lib/mock-data").Task[];
  approvals: import("@/lib/mock-data").Approval[];
  devices: import("@/lib/mock-data").Device[];
  payments: import("@/lib/mock-data").PaymentMilestone[];
  docs: import("@/lib/mock-data").Doc[];
  handoverItems: import("@/lib/mock-data").HandoverItem[];
  comms: import("@/lib/mock-data").Communication[];
  onJump: (v: string) => void;
}) {
  const nextMs = milestones.find((m) => !m.done);
  const shortages = materials.filter((m) => m.critical && m.delivered < m.required);
  const overdue = tasks.filter((t) => new Date(t.due) < new Date() && t.status !== "Completed");
  const failedTests = devices.filter((d) => d.testResult === "Fail");
  const overduePay = payments.filter((p) => p.status === "Overdue");
  const pendingDocs = docs.filter((d) => d.status !== "Approved");
  const remainingHandover = handoverItems.filter((h) => !h.done);
  const lastComm = comms[comms.length - 1];

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
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-signal to-chart-5" style={{ width: `${health.score}%` }} />
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
          <RailCard title="Current Blockers" icon={AlertTriangle} tone={shortages.length ? "critical" : "success"}>
            {shortages.length === 0 ? <div className="text-xs text-muted-foreground">No critical blockers.</div> :
              shortages.slice(0, 3).map((m) => (
                <div key={m.id} className="text-xs py-1 border-b hairline last:border-0">
                  <div className="truncate">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground num">{m.delivered} / {m.required}</div>
                </div>
              ))}
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
          <RailCard title="Material Shortages" icon={PackageIcon} tone={shortages.length ? "critical" : "success"} onClick={() => onJump("materials")}>
            <div className="num text-2xl font-display font-bold">{shortages.length}</div>
            <div className="text-[11px] text-muted-foreground">critical items missing</div>
          </RailCard>
          <RailCard title="Overdue Tasks" icon={TrendingDown} tone={overdue.length ? "warning" : "success"} onClick={() => onJump("tasks")}>
            <div className="num text-2xl font-display font-bold">{overdue.length}</div>
            <div className="text-[11px] text-muted-foreground">need attention</div>
          </RailCard>
          <RailCard title="Team on Site" icon={Users} onClick={() => onJump("team")}>
            <div className="num text-2xl font-display font-bold">{project.teamIds.length + 1}</div>
            <div className="text-[11px] text-muted-foreground">active members</div>
          </RailCard>
        </>
      )}

      {section === "commercial" && (
        <>
          <RailCard title="Outstanding" icon={Coins} tone="warning" onClick={() => onJump("fin")}>
            <div className="num text-2xl font-display font-bold">{fmtQAR(project.invoiced - project.collected, { compact: true })}</div>
            <div className="text-[11px] text-muted-foreground">to be collected</div>
          </RailCard>
          <RailCard title="Overdue Invoices" icon={AlertTriangle} tone={overduePay.length ? "critical" : "success"} onClick={() => onJump("fin")}>
            <div className="num text-2xl font-display font-bold">{overduePay.length}</div>
          </RailCard>
          <RailCard title="Forecast Margin" icon={TrendingDown}>
            <div className="num text-2xl font-display font-bold text-success">28%</div>
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
          <RailCard title="Recently Uploaded" icon={FolderOpen}>
            {docs.slice(0, 3).map((d) => (
              <div key={d.id} className="text-xs py-1 border-b hairline last:border-0 truncate">{d.name}</div>
            ))}
          </RailCard>
        </>
      )}

      {section === "handover" && (
        <>
          <RailCard title="Checklist Remaining" icon={ClipboardCheck} tone={remainingHandover.length ? "warning" : "success"}>
            <div className="num text-2xl font-display font-bold">{remainingHandover.length}</div>
            <div className="text-[11px] text-muted-foreground">of {handoverItems.length} items</div>
          </RailCard>
          <RailCard title="Final Payment" icon={Coins}>
            <div className="num text-lg font-display font-bold">{fmtQAR(project.retention, { compact: true })}</div>
            <div className="text-[11px] text-muted-foreground">retention</div>
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

function TasksTab({ projectId, tasks }: { projectId: string; tasks: import("@/lib/mock-data").Task[] }) {
  const d = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [newT, setNewT] = useState({ title: "", assigneeId: "E-010", phase: "Installation", due: new Date().toISOString().slice(0,10), priority: "Medium" as const });
  return (
    <Card className="p-0">
      <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Tasks</h3><Button size="sm" onClick={() => setAddOpen(true)}>Add task</Button></div>
      <table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Task","Assignee","Phase","Priority","Due","Status","Progress",""].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
        <tbody>{tasks.map((t) => {
          const emp = d.employees.find((e) => e.id === t.assigneeId);
          return (<tr key={t.id} className="border-t hairline">
            <td className="py-2 px-3 text-sm">{t.title}</td><td className="py-2 px-3 text-xs">{emp?.name}</td><td className="py-2 px-3 text-xs">{t.phase}</td>
            <td className="py-2 px-3"><StatusPill status={t.priority} tone={t.priority==="Critical"?"critical":t.priority==="High"?"warning":"neutral"} /></td>
            <td className="py-2 px-3 num text-xs">{fmtDate(t.due)}</td>
            <td className="py-2 px-3"><Select value={t.status} onValueChange={(v) => { d.updateTask(t.id, { status: v as never }); toast(`Task status: ${v}`); }}><SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger><SelectContent>{["Not Started","Ready","In Progress","Blocked","Awaiting Client","Awaiting Material","Under Review","Completed"].map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select></td>
            <td className="py-2 px-3 w-32"><ProgressBar value={t.progress} /></td>
            <td className="py-2 px-3"><Button size="sm" variant="ghost" onClick={() => setConfirmDel(t.id)} className="text-critical">Delete</Button></td>
          </tr>);
        })}</tbody>
      </table>
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
    </Card>
  );
}

function DevicesTab({ devices }: { devices: import("@/lib/mock-data").Device[] }) {
  const [q, setQ] = useState("");
  const filt = devices.filter((d) => (d.label + d.ip + d.serial + d.mac).toLowerCase().includes(q.toLowerCase()));
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-3 flex items-center gap-2 flex-wrap"><h3 className="font-display font-semibold text-lg">Device Register</h3><span className="text-xs text-muted-foreground">Camera labels reuse survey point ids.</span><Input placeholder="Search label, IP, serial, MAC." value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-64 ml-auto" /></div>
      <div className="overflow-x-auto max-h-[520px]">
        <table className="w-full text-xs"><thead className="text-[10px] uppercase text-muted-foreground bg-muted/40 sticky top-0"><tr>{["Label","Brand","Model","Serial","MAC","IP","Building","Floor","Zone","Switch","Port","Ch","Install","Test","Status"].map((h) => <th key={h} className="text-left py-2 px-2 whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{filt.map((d) => (<tr key={d.id} className="border-t hairline hover:bg-muted/30">
            <td className="py-1.5 px-2"><MonoChip>{d.label}</MonoChip></td><td className="py-1.5 px-2">{d.brand}</td><td className="py-1.5 px-2">{d.model}</td>
            <td className="py-1.5 px-2 num">{d.serial}</td><td className="py-1.5 px-2 num">{d.mac}</td><td className="py-1.5 px-2 num">{d.ip}</td>
            <td className="py-1.5 px-2">{d.building}</td><td className="py-1.5 px-2">{d.floor}</td><td className="py-1.5 px-2">{d.zone}</td>
            <td className="py-1.5 px-2 num">{d.switch}</td><td className="py-1.5 px-2 num">{d.switchPort}</td><td className="py-1.5 px-2 num">{d.recorderChannel}</td>
            <td className="py-1.5 px-2 num">{d.installDate ? fmtDate(d.installDate) : "-"}</td>
            <td className="py-1.5 px-2"><StatusPill status={d.testResult} tone={d.testResult==="Pass"?"success":d.testResult==="Fail"?"critical":"warning"} /></td>
            <td className="py-1.5 px-2"><StatusPill status={d.status} tone={d.status==="Faulty"?"critical":d.status==="Tested"?"success":"info"} /></td>
          </tr>))}</tbody>
        </table>
      </div>
    </Card>
  );
}

function TestingTab({ devices, tests }: { devices: import("@/lib/mock-data").Device[]; tests: import("@/lib/mock-data").TestRecord[] }) {
  const d = useData();
  const failed = devices.filter((x) => x.testResult === "Fail");
  const pass = devices.filter((x) => x.testResult === "Pass").length;
  const pending = devices.filter((x) => x.testResult === "Pending").length;
  const checks = ["power","network","ip","image","focus","angle","day","night","recording","playback","storage","time","motion","analytics","mounting","label"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total" value={devices.length} /><Stat label="Passed" value={pass} /><Stat label="Failed" value={failed.length} sub={failed.length ? "Open until retested" : ""} /><Stat label="Pending" value={pending} />
      </div>
      {failed.length > 0 && (<Card className="p-4 border-critical/40">
        <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-critical" /><h3 className="font-display font-semibold text-lg">Failed Test Queue</h3></div>
        <table className="w-full text-sm"><thead className="text-[10px] uppercase text-muted-foreground"><tr>{["Label","Reason","Tested by","Action"].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
          <tbody>{failed.map((dev) => (<tr key={dev.id} className="border-t hairline">
            <td className="py-2"><MonoChip>{dev.label}</MonoChip></td>
            <td className="py-2 text-xs">{tests.find((t) => t.deviceId === dev.id)?.notes || "Failed inspection"}</td>
            <td className="py-2 text-xs">Ahmed Sobhi</td>
            <td className="py-2"><Button size="sm" variant="outline" onClick={() => { d.updateDevice(dev.id, { testResult: "Pass", status: "Tested" }); toast.success(`${dev.label} retest passed.`); }}><RefreshCw className="w-3 h-3 mr-1" />Retest as pass</Button></td>
          </tr>))}</tbody>
        </table>
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

function HandoverTab({ items }: { items: import("@/lib/mock-data").HandoverItem[] }) {
  const d = useData();
  const readiness = items.length ? Math.round((items.filter((i) => i.done).length / items.length) * 100) : 0;
  const sections: import("@/lib/mock-data").HandoverItem["section"][] = ["Technical","Documentation","Commercial","Client"];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4"><div><h3 className="font-display font-semibold text-lg">Handover Readiness</h3><p className="text-xs text-muted-foreground">All items must be completed before handover.</p></div><div className="text-right"><div className="num text-3xl font-display font-bold">{readiness}%</div><StatusPill status={readiness === 100 ? "Ready" : readiness > 70 ? "Nearly ready" : "In progress"} tone={readiness === 100 ? "success" : readiness > 70 ? "info" : "warning"} /></div></div>
      <ProgressBar value={readiness} />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">{sections.map((sec) => (
        <div key={sec} className="border hairline rounded-lg p-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{sec}</div>
          {items.filter((i) => i.section === sec).map((i) => (
            <label key={i.id} className="flex items-start gap-2 py-1.5 cursor-pointer">
              <input type="checkbox" checked={i.done} onChange={() => { d.toggleHandover(i.id); toast(i.done ? "Item unchecked." : "Item completed."); }} className="mt-1 accent-signal" />
              <span className={`text-sm ${i.done ? "line-through text-muted-foreground" : ""}`}>{i.label}</span>
            </label>
          ))}
        </div>
      ))}</div>
    </Card>
  );
}

function SiteActivityTab({ projectId, activities }: { projectId: string; activities: import("@/lib/mock-data").SiteActivity[] }) {
  const d = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), teamPresent: [] as string[], workCompleted: "", camerasInstalled: 0, cableInstalled: 0, devicesConfigured: 0, issues: "", tomorrowPlan: "" });
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => setOpen(true)}>New daily report</Button></div>
      {activities.map((a) => (<Card key={a.id} className="p-4">
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
