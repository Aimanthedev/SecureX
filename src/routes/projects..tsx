import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, HealthBadge, MonoChip, ProgressBar, StatusPill, Ring } from "@/components/app/common";
import { fmtQAR, fmtDate, fmtNum, daysFromToday } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Printer, ChevronRight, Circle } from "lucide-react";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({ meta: [{ title: "Project | AL HARIB CCTV COMPANY" }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = useParams({ from: "/projects/$id" });
  const d = useData();
  const nav = useNavigate();
  const p = d.projects.find((x) => x.id === id);
  if (!p) return <div className="p-6"><Card className="p-6">Project not found. <Link to="/projects" className="text-signal">Back to projects</Link></Card></div>;
  const health = d.computeHealth(p, d.approvals, d.devices, d.materials);
  const cust = d.customers.find((c) => c.id === p.customerId)!;
  const site = d.sites.find((s) => s.id === p.siteId)!;
  const pm = d.employees.find((e) => e.id === p.pmId)!;
  const projectTasks = d.tasks.filter((t) => t.projectId === p.id);
  const projectMs = d.milestones.filter((m) => m.projectId === p.id);
  const projectApprovals = d.approvals.filter((a) => a.projectId === p.id);
  const projectVars = d.variations.filter((v) => v.projectId === p.id);
  const projectDocs = d.documents.filter((doc) => doc.projectId === p.id);
  const projectPays = d.payments.filter((pm) => pm.projectId === p.id);
  const projectDevices = d.devices.filter((x) => x.projectId === p.id);
  const projectMats = d.materials.filter((m) => m.projectId === p.id);
  const projectComms = d.communications.filter((c) => c.projectId === p.id);
  const projectActs = d.siteActivities.filter((a) => a.projectId === p.id);
  const projectTests = d.testRecords.filter((t) => t.projectId === p.id);
  const projectHandover = d.handoverItems.filter((h) => h.projectId === p.id);
  const projectCompliance = d.complianceItems.filter((c) => c.projectId === p.id);
  const survey = d.surveys.find((s) => s.id === p.surveyId);

  const [tab, setTab] = useState("overview");

  return (
    <div>
      {/* Header */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1"><MonoChip>{p.number}</MonoChip><HealthBadge label={health.label} /><StatusPill status={p.phase} tone="info" /></div>
            <h1 className="text-2xl font-display font-semibold">{p.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{cust.name} · {site.name} · PM {pm.name}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <Stat label="Value" value={fmtQAR(p.contractValue + p.approvedVariations, { compact: true })} />
            <Stat label="Completion" value={`${p.actualProgress}%`} sub={`Planned ${p.plannedProgress}%`} />
            <Stat label="Planned end" value={fmtDate(p.plannedEnd)} sub={`${daysFromToday(p.plannedEnd)} days`} />
            <Stat label="Material readiness" value={`${p.materialReadiness}%`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => toast.success("Progress report generated (demo)")}><Printer className="w-3.5 h-3.5 mr-1" /> Progress report</Button>
          <Button size="sm" variant="outline" onClick={() => setTab("comm")}>Client update</Button>
          <Button size="sm" variant="outline" onClick={() => setTab("tasks")}>Add task</Button>
          <Button size="sm" variant="outline" onClick={() => setTab("issues")}>Raise issue</Button>
          <Button size="sm" variant="outline" onClick={() => setTab("handover")}>Handover checklist</Button>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          {[
            ["overview","Overview"],["scope","Scope & BOQ"],["tasks","Tasks"],["timeline","Timeline"],["site","Site Activity"],["team","Team"],["materials","Materials"],["devices","Device Register"],["docs","Documents"],["issues","Issues / RFIs"],["vars","Variations"],["qaqc","QA/QC"],["testing","Testing"],["fin","Financials"],["comm","Client Communication"],["comp","Compliance"],["handover","Handover"],["log","Activity Log"]
          ].map(([v,l]) => <TabsTrigger key={v} value={v} className="text-xs">{l}</TabsTrigger>)}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2">
              <h3 className="font-display font-semibold text-lg mb-2">Health Drivers</h3>
              <p className="text-xs text-muted-foreground mb-3">Reasons behind this project's status. Computed from schedule variance, material readiness, open approvals, and failed tests.</p>
              <div className="space-y-2">
                {health.drivers.map((dr, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 border hairline rounded-md">
                    {dr.severity === "critical" ? <AlertTriangle className="w-4 h-4 text-critical mt-0.5" /> : dr.severity === "warning" ? <AlertTriangle className="w-4 h-4 text-warning mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />}
                    <div className="text-sm">{dr.text}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-display font-semibold text-lg mb-3">Progress</h3>
              <div className="grid grid-cols-3 gap-3">
                <Ring value={p.actualProgress} label="Actual" />
                <Ring value={p.plannedProgress} label="Planned" />
                <Ring value={p.materialReadiness} label="Materials" />
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Cameras installed</span><span className="num">{projectDevices.filter((x)=>x.status!=="Faulty").length} / {projectDevices.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tests passed</span><span className="num">{projectDevices.filter((x)=>x.testResult==="Pass").length} / {projectDevices.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Approvals pending</span><span className="num">{projectApprovals.filter((a)=>a.status==="Pending").length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span className="num">{fmtQAR(p.collected, {compact:true})} of {fmtQAR(p.invoiced, {compact:true})}</span></div>
              </div>
            </Card>
          </div>
          <Card className="p-4">
            <h3 className="font-display font-semibold text-lg mb-3">Milestones</h3>
            <div className="divide-y hairline">
              {projectMs.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center gap-3">
                  {m.done ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                  <div className="flex-1 text-sm">{m.title}</div>
                  <div className="text-xs text-muted-foreground">Planned <span className="num">{fmtDate(m.planned)}</span> {m.actual && <>· Actual <span className="num">{fmtDate(m.actual)}</span></>}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* SCOPE / BOQ */}
        <TabsContent value="scope" className="mt-4">
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>{["CP","SKU","Description","Category","Qty","Ordered","Delivered","Issued","Installed","Tested","Progress"].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {survey?.points ? (d.quotations.find((q) => q.id === p.quotationId)?.items || []).map((it) => {
                    const pct = Math.round((it.tested / (it.qty || 1)) * 100);
                    return (
                      <tr key={it.id} className="border-t hairline">
                        <td className="py-2 px-2">{it.cameraPointId ? <MonoChip>{it.cameraPointId}</MonoChip> : ""}</td>
                        <td className="py-2 px-2 num text-xs">{it.sku}</td>
                        <td className="py-2 px-2 text-xs">{it.description}</td>
                        <td className="py-2 px-2 text-xs">{it.category}</td>
                        {["qty","ordered","delivered","issued","installed","tested"].map((k) => <td key={k} className="py-2 px-2 num text-xs">{(it as any)[k]}</td>)}
                        <td className="py-2 px-2 w-32"><ProgressBar value={pct} /></td>
                      </tr>
                    );
                  }) : <tr><td colSpan={11} className="p-6 text-center text-muted-foreground text-sm">No BOQ items for this project.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TASKS */}
        <TabsContent value="tasks" className="mt-4">
          <TasksTab projectId={p.id} tasks={projectTasks} />
        </TabsContent>

        {/* TIMELINE */}
        <TabsContent value="timeline" className="mt-4">
          <Card className="p-4">
            <h3 className="font-display font-semibold text-lg mb-3">Gantt (simplified)</h3>
            <div className="space-y-1.5">
              {projectMs.map((m, i) => {
                const total = Math.max(1, daysFromToday(p.plannedEnd) + 60);
                const start = Math.max(0, i * 12);
                const dur = 15 + (i * 3) % 20;
                return (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <div className="w-40 truncate">{m.title}</div>
                    <div className="flex-1 h-4 bg-muted rounded relative">
                      <div className={`absolute h-full rounded ${m.done ? "bg-success" : "bg-signal"}`} style={{ left: `${(start / total) * 100}%`, width: `${(dur / total) * 100}%` }} />
                    </div>
                    <div className="num w-24 text-right">{fmtDate(m.planned)}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* SITE ACTIVITY */}
        <TabsContent value="site" className="mt-4">
          <SiteActivityTab projectId={p.id} activities={projectActs} />
        </TabsContent>

        {/* TEAM */}
        <TabsContent value="team" className="mt-4">
          <Card className="p-4">
            <h3 className="font-display font-semibold text-lg mb-3">Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[pm, ...p.teamIds.map((t) => d.employees.find((e) => e.id === t)!)].filter(Boolean).map((e, i) => (
                <div key={e.id + i} className="border hairline rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-signal/15 text-signal grid place-items-center text-sm font-semibold">{e.name.split(" ").map((n) => n[0]).slice(0,2).join("")}</div>
                  <div className="min-w-0"><div className="text-sm font-medium truncate">{e.name}</div><div className="text-xs text-muted-foreground">{e.role}</div></div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* MATERIALS */}
        <TabsContent value="materials" className="mt-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-3 flex items-center justify-between">
              <div><h3 className="font-display font-semibold text-lg">Materials</h3><p className="text-xs text-muted-foreground">Movement from required to installed</p></div>
              <div className="text-xs">Readiness <span className="num text-lg font-semibold">{p.materialReadiness}%</span></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <tr>{["SKU","Item","Required","Ordered","Delivered","Issued","Installed","Returned","Status"].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {projectMats.map((m) => (
                    <tr key={m.id} className="border-t hairline">
                      <td className="py-2 px-2 num text-xs">{m.sku}</td>
                      <td className="py-2 px-2 text-xs">{m.name}</td>
                      {["required","ordered","delivered","issued","installed","returned"].map((k) => <td key={k} className="py-2 px-2 num text-xs">{(m as any)[k]}</td>)}
                      <td className="py-2 px-2">{m.critical && m.delivered < m.required ? <StatusPill status="Critical shortage" tone="critical" /> : m.installed === m.required ? <StatusPill status="Complete" tone="success" /> : <StatusPill status="In flight" tone="info" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* DEVICE REGISTER */}
        <TabsContent value="devices" className="mt-4">
          <DevicesTab projectId={p.id} devices={projectDevices} />
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="docs" className="mt-4">
          <Card className="p-0">
            <div className="p-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg">Documents</h3>
              <Button size="sm" onClick={() => toast.success("Document uploaded (demo)")}>Upload</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40"><tr>{["Document","Category","Revision","Status","Uploaded"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
              <tbody>{projectDocs.map((doc) => (
                <tr key={doc.id} className="border-t hairline">
                  <td className="py-2 px-3">{doc.name}</td><td className="py-2 px-3 text-xs">{doc.category}</td><td className="py-2 px-3 num text-xs">{doc.revision}</td><td className="py-2 px-3"><StatusPill status={doc.status} tone={doc.status === "Approved" ? "success" : doc.status === "Pending" ? "warning" : "info"} /></td><td className="py-2 px-3 num text-xs">{fmtDate(doc.uploadedOn)}</td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        </TabsContent>

        {/* ISSUES */}
        <TabsContent value="issues" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="font-display font-semibold text-lg">Issues and RFIs</h3><Button size="sm" onClick={() => toast.success("RFI logged (demo)")}>Raise RFI</Button></div>
            <div className="divide-y hairline">
              {[{ t: "Confirm NVR retention policy: 30 or 45 days", s: "Open", o: "Client" }, { t: "Loading bay ceiling height affects PTZ mounting", s: "In Progress", o: "Engineering" }, { t: "Confirm cable route through fire barrier", s: "Resolved", o: "Client" }].map((i, ix) => (
                <div key={ix} className="py-2.5 flex items-center gap-3 text-sm"><div className="flex-1">{i.t}</div><StatusPill status={i.s} tone={i.s === "Resolved" ? "success" : i.s === "In Progress" ? "info" : "warning"} /><div className="text-xs text-muted-foreground w-24">{i.o}</div></div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* VARIATIONS */}
        <TabsContent value="vars" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="font-display font-semibold text-lg">Variations</h3><Button size="sm" onClick={() => toast.success("Variation drafted (demo)")}>New variation</Button></div>
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase text-muted-foreground"><tr>{["Number","Description","Amount","Status","Date"].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
              <tbody>{projectVars.map((v) => (
                <tr key={v.id} className="border-t hairline"><td className="py-2 num">{v.number}</td><td className="py-2">{v.description}</td><td className="py-2 num">{fmtQAR(v.amount)}</td><td className="py-2"><StatusPill status={v.status} tone={v.status==="Approved"?"success":v.status==="Rejected"?"critical":"info"} /></td><td className="py-2 num text-xs">{fmtDate(v.date)}</td></tr>
              ))}</tbody>
            </table>
          </Card>
        </TabsContent>

        {/* QA/QC */}
        <TabsContent value="qaqc" className="mt-4">
          <Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">QA/QC Inspections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[
              {t: "Cable routing inspection", s: "Passed", d: "2026-07-12"},
              {t: "Cabinet grounding", s: "Passed", d: "2026-07-14"},
              {t: "Camera alignment", s: "Pending", d: "2026-07-23"},
            ].map((i) => <div key={i.t} className="border hairline rounded-lg p-3"><div className="text-sm font-medium">{i.t}</div><div className="mt-1 flex items-center justify-between text-xs"><StatusPill status={i.s} tone={i.s==="Passed"?"success":"warning"} /><span className="num text-muted-foreground">{fmtDate(i.d)}</span></div></div>)}</div>
          </Card>
        </TabsContent>

        {/* TESTING */}
        <TabsContent value="testing" className="mt-4">
          <TestingTab projectId={p.id} devices={projectDevices} tests={projectTests} />
        </TabsContent>

        {/* FINANCIALS */}
        <TabsContent value="fin" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Contract value" value={fmtQAR(p.contractValue, {compact:true})} />
            <Stat label="Approved variations" value={fmtQAR(p.approvedVariations, {compact:true})} />
            <Stat label="Revised value" value={fmtQAR(p.contractValue + p.approvedVariations, {compact:true})} />
            <Stat label="Estimated cost" value={fmtQAR(p.estimatedCost, {compact:true})} />
            <Stat label="Committed cost" value={fmtQAR(p.committedCost, {compact:true})} />
            <Stat label="Actual cost" value={fmtQAR(p.actualCost, {compact:true})} />
            <Stat label="Invoiced" value={fmtQAR(p.invoiced, {compact:true})} />
            <Stat label="Collected" value={fmtQAR(p.collected, {compact:true})} sub={`Outstanding ${fmtQAR(p.invoiced-p.collected,{compact:true})}`} />
          </div>
          <Card className="p-0">
            <div className="p-3 flex items-center justify-between"><h3 className="font-display font-semibold text-lg">Payment Schedule</h3></div>
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Milestone","Amount","Due","Invoiced","Collected","Status","Action"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
              <tbody>{projectPays.map((pay) => (
                <tr key={pay.id} className="border-t hairline">
                  <td className="py-2 px-3">{pay.label}</td>
                  <td className="py-2 px-3 num">{fmtQAR(pay.amount)}</td>
                  <td className="py-2 px-3 num text-xs">{fmtDate(pay.dueDate)}</td>
                  <td className="py-2 px-3 num text-xs">{pay.invoicedOn ? fmtDate(pay.invoicedOn) : "-"}</td>
                  <td className="py-2 px-3 num text-xs">{pay.collectedOn ? fmtDate(pay.collectedOn) : "-"}</td>
                  <td className="py-2 px-3"><StatusPill status={pay.status} tone={pay.status==="Collected"?"success":pay.status==="Overdue"?"critical":pay.status==="Invoiced"?"info":"warning"} /></td>
                  <td className="py-2 px-3">{pay.status !== "Collected" && <Button size="sm" variant="ghost" onClick={() => { d.markPaymentCollected(pay.id); toast.success("Marked collected."); }}>Mark collected</Button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        </TabsContent>

        {/* COMMUNICATION */}
        <TabsContent value="comm" className="mt-4">
          <Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">Client Communication</h3>
            <div className="divide-y hairline">{projectComms.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center gap-3"><div className="text-xs num text-muted-foreground w-24">{fmtDate(c.date)}</div><div className="flex-1 text-sm"><div>{c.subject}</div><div className="text-xs text-muted-foreground">{c.owner}</div></div><StatusPill status={c.status} tone={c.status==="Confirmed"?"success":c.status==="Pending"?"warning":"info"} /></div>
            ))}</div>
          </Card>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="comp" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3"><div><h3 className="font-display font-semibold text-lg">Compliance Tracker</h3><p className="text-xs text-muted-foreground">Internal checklist for Qatar CCTV project approvals. Not legal advice.</p></div></div>
            <div className="space-y-2">{projectCompliance.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-2 border hairline rounded-md"><StatusPill status={c.status} tone={c.status==="Approved"?"success":c.status==="Rejected"?"critical":c.status==="Submitted"?"info":"warning"} /><div className="flex-1 text-sm">{c.item}</div><div className="text-xs text-muted-foreground">{c.owner}</div>{c.expires && <div className="text-xs num text-muted-foreground">expires {fmtDate(c.expires)}</div>}<Button size="sm" variant="ghost" onClick={() => { d.toggleCompliance(c.id); toast("Compliance status toggled."); }}>Toggle</Button></div>
            ))}</div>
          </Card>
        </TabsContent>

        {/* HANDOVER */}
        <TabsContent value="handover" className="mt-4">
          <HandoverTab projectId={p.id} items={projectHandover} />
        </TabsContent>

        {/* ACTIVITY LOG */}
        <TabsContent value="log" className="mt-4">
          <Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">Activity Log</h3>
            <ol className="relative border-l hairline ml-2 space-y-4">
              {[
                {t: "Site activity logged", d: "2026-07-20 08:15", w: "Rakesh Nair"},
                {t: "Test result: FAIL on CP-13", d: "2026-07-19 16:40", w: "Ahmed Sobhi"},
                {t: "Materials issued (2 x Cat6 box)", d: "2026-07-19 11:20", w: "Aisha Rahman"},
                {t: "Progress cert 3 invoiced", d: "2026-07-18 14:00", w: "Hasan Barzani"},
                {t: "Variation VO-02 submitted", d: "2026-07-14 10:12", w: "Anitha Verghese"},
              ].map((e, i) => (
                <li key={i} className="ml-4"><div className="absolute w-2 h-2 rounded-full bg-signal -left-1 mt-1.5" /><div className="text-sm">{e.t}</div><div className="text-xs text-muted-foreground num">{e.d} · {e.w}</div></li>
              ))}
            </ol>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Task","Assignee","Phase","Priority","Due","Status","Progress",""].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
        <tbody>{tasks.map((t) => {
          const emp = d.employees.find((e) => e.id === t.assigneeId);
          return (
            <tr key={t.id} className="border-t hairline">
              <td className="py-2 px-3 text-sm">{t.title}</td>
              <td className="py-2 px-3 text-xs">{emp?.name}</td>
              <td className="py-2 px-3 text-xs">{t.phase}</td>
              <td className="py-2 px-3"><StatusPill status={t.priority} tone={t.priority==="Critical"?"critical":t.priority==="High"?"warning":"neutral"} /></td>
              <td className="py-2 px-3 num text-xs">{fmtDate(t.due)}</td>
              <td className="py-2 px-3"><Select value={t.status} onValueChange={(v) => { d.updateTask(t.id, { status: v as never }); toast(`Task status: ${v}`); }}><SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger><SelectContent>{["Not Started","Ready","In Progress","Blocked","Awaiting Client","Awaiting Material","Under Review","Completed"].map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent></Select></td>
              <td className="py-2 px-3 w-32"><ProgressBar value={t.progress} /></td>
              <td className="py-2 px-3"><Button size="sm" variant="ghost" onClick={() => setConfirmDel(t.id)} className="text-critical">Delete</Button></td>
            </tr>
          );
        })}</tbody>
      </table>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add task</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Title</span><Input value={newT.title} onChange={(e) => setNewT({ ...newT, title: e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Assignee</span><Select value={newT.assigneeId} onValueChange={(v) => setNewT({ ...newT, assigneeId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{d.employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Due</span><Input type="date" value={newT.due} onChange={(e) => setNewT({ ...newT, due: e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Phase</span><Input value={newT.phase} onChange={(e) => setNewT({ ...newT, phase: e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Priority</span><Select value={newT.priority} onValueChange={(v) => setNewT({ ...newT, priority: v as never })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Low","Medium","High","Critical"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></label>
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

function DevicesTab({ projectId, devices }: { projectId: string; devices: import("@/lib/mock-data").Device[] }) {
  const [q, setQ] = useState("");
  const filt = devices.filter((d) => (d.label + d.ip + d.serial + d.mac).toLowerCase().includes(q.toLowerCase()));
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-3 flex items-center gap-2 flex-wrap"><h3 className="font-display font-semibold text-lg">Device Register</h3><span className="text-xs text-muted-foreground">Camera labels reuse survey point ids.</span><Input placeholder="Search label, IP, serial, MAC." value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-64 ml-auto" /></div>
      <div className="overflow-x-auto max-h-[520px]">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase text-muted-foreground bg-muted/40 sticky top-0"><tr>{["Label (CP)","Brand","Model","Serial","MAC","IP","Building","Floor","Zone","Switch","Port","NVR Ch","Install","Test","Status"].map((h) => <th key={h} className="text-left py-2 px-2 whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{filt.map((d) => (
            <tr key={d.id} className="border-t hairline hover:bg-muted/30">
              <td className="py-1.5 px-2"><MonoChip>{d.label}</MonoChip></td>
              <td className="py-1.5 px-2">{d.brand}</td><td className="py-1.5 px-2">{d.model}</td>
              <td className="py-1.5 px-2 num">{d.serial}</td><td className="py-1.5 px-2 num">{d.mac}</td><td className="py-1.5 px-2 num">{d.ip}</td>
              <td className="py-1.5 px-2">{d.building}</td><td className="py-1.5 px-2">{d.floor}</td><td className="py-1.5 px-2">{d.zone}</td>
              <td className="py-1.5 px-2 num">{d.switch}</td><td className="py-1.5 px-2 num">{d.switchPort}</td><td className="py-1.5 px-2 num">{d.recorderChannel}</td>
              <td className="py-1.5 px-2 num">{d.installDate ? fmtDate(d.installDate) : "-"}</td>
              <td className="py-1.5 px-2"><StatusPill status={d.testResult} tone={d.testResult==="Pass"?"success":d.testResult==="Fail"?"critical":"warning"} /></td>
              <td className="py-1.5 px-2"><StatusPill status={d.status} tone={d.status==="Faulty"?"critical":d.status==="Tested"?"success":"info"} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}

function TestingTab({ projectId, devices, tests }: { projectId: string; devices: import("@/lib/mock-data").Device[]; tests: import("@/lib/mock-data").TestRecord[] }) {
  const d = useData();
  const failed = devices.filter((x) => x.testResult === "Fail");
  const pass = devices.filter((x) => x.testResult === "Pass").length;
  const pending = devices.filter((x) => x.testResult === "Pending").length;
  const checks = ["power","network","ip","image","focus","angle","day","night","recording","playback","storage","time","motion","analytics","mounting","label"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total devices" value={devices.length} />
        <Stat label="Passed" value={pass} />
        <Stat label="Failed" value={failed.length} sub={failed.length ? "Stays open until retested" : ""} />
        <Stat label="Pending" value={pending} />
      </div>
      {failed.length > 0 && (
        <Card className="p-4 border-critical/40">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-critical" /><h3 className="font-display font-semibold text-lg">Failed Test Queue</h3></div>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase text-muted-foreground"><tr>{["Label","Reason","Tested by","Action"].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
            <tbody>{failed.map((dev) => (
              <tr key={dev.id} className="border-t hairline">
                <td className="py-2"><MonoChip>{dev.label}</MonoChip></td>
                <td className="py-2 text-xs">{tests.find((t) => t.deviceId === dev.id)?.notes || "Failed inspection"}</td>
                <td className="py-2 text-xs">Ahmed Sobhi</td>
                <td className="py-2"><Button size="sm" variant="outline" onClick={() => { d.updateDevice(dev.id, { testResult: "Pass", status: "Tested" }); toast.success(`${dev.label} retest passed.`); }}><RefreshCw className="w-3 h-3 mr-1" />Retest as pass</Button></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      )}
      <Card className="p-0">
        <div className="p-3"><h3 className="font-display font-semibold text-lg">Per-device Checklist</h3></div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-muted-foreground bg-muted/40 sticky top-0"><tr><th className="text-left py-2 px-2">Device</th>{checks.map((c) => <th key={c} className="text-center py-2 px-1 capitalize">{c}</th>)}<th className="py-2 px-2">Result</th></tr></thead>
            <tbody>{tests.map((t) => {
              const dev = devices.find((x) => x.id === t.deviceId);
              return (
                <tr key={t.id} className="border-t hairline">
                  <td className="py-1.5 px-2"><MonoChip>{dev?.label}</MonoChip></td>
                  {checks.map((c) => { const v = t.checks[c]; return <td key={c} className="text-center">{v === "Pass" ? <CheckCircle2 className="w-3 h-3 text-success inline" /> : v === "Fail" ? <XCircle className="w-3 h-3 text-critical inline" /> : <Circle className="w-3 h-3 text-muted-foreground inline" />}</td>; })}
                  <td className="py-1.5 px-2"><StatusPill status={t.result} tone={t.result==="Pass"?"success":t.result==="Fail"?"critical":"warning"} /></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function HandoverTab({ projectId, items }: { projectId: string; items: import("@/lib/mock-data").HandoverItem[] }) {
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
      {activities.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-medium">Site Activity — <span className="num">{fmtDate(a.date)}</span></div><div className="text-xs text-muted-foreground">{a.teamPresent.map((id) => d.employees.find((e) => e.id === id)?.name).join(", ")}</div></div>
          <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
            <Stat label="Cameras installed" value={a.camerasInstalled} />
            <Stat label="Cable installed (m)" value={a.cableInstalled} />
            <Stat label="Devices configured" value={a.devicesConfigured} />
          </div>
          <div className="text-sm"><div className="text-muted-foreground text-xs uppercase mb-1">Work completed</div>{a.workCompleted}</div>
          <div className="text-sm mt-2"><div className="text-muted-foreground text-xs uppercase mb-1">Issues</div>{a.issues || "None."}</div>
          <div className="text-sm mt-2"><div className="text-muted-foreground text-xs uppercase mb-1">Tomorrow's plan</div>{a.tomorrowPlan}</div>
        </Card>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>New Daily Site Report</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label><span className="text-xs text-muted-foreground">Date</span><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Cameras installed</span><Input type="number" value={form.camerasInstalled} onChange={(e) => setForm({ ...form, camerasInstalled: +e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Cable installed (m)</span><Input type="number" value={form.cableInstalled} onChange={(e) => setForm({ ...form, cableInstalled: +e.target.value })} /></label>
            <label><span className="text-xs text-muted-foreground">Devices configured</span><Input type="number" value={form.devicesConfigured} onChange={(e) => setForm({ ...form, devicesConfigured: +e.target.value })} /></label>
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
