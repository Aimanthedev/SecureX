import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { KpiCard, PageHeader, HealthBadge, MonoChip, ProgressBar, StatusPill } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Projects | AL HARIB CCTV COMPANY" }, { name: "description", content: "Portfolio of active and delivered CCTV projects." }] }),
  component: ProjectsList,
});

function ProjectsList() {
  const d = useData();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [view, setView] = useState<"table"|"kanban"|"matrix">("table");
  const [newOpen, setNewOpen] = useState(false);

  const withHealth = useMemo(() => d.projects.map((p) => ({ p, h: d.computeHealth(p, d.approvals, d.devices, d.materials) })), [d]);
  const filtered = withHealth.filter(({ p, h }) =>
    (q === "" || (p.name + p.number).toLowerCase().includes(q.toLowerCase())) &&
    (phaseFilter === "all" || p.phase === phaseFilter) &&
    (healthFilter === "all" || h.label === healthFilter)
  );

  return (
    <div>
      <PageHeader title="Projects" subtitle="Portfolio, health, and delivery" actions={
        <>
          <Button variant="outline" size="sm" onClick={() => toast("CSV export prepared (demo)")}>Export</Button>
          <Button size="sm" onClick={() => setNewOpen(true)} className="bg-signal text-signal-foreground hover:bg-signal/90">New Project</Button>
        </>
      } />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <KpiCard label="Active" value={withHealth.length} />
        <KpiCard label="At Risk" value={withHealth.filter((x) => x.h.label === "At Risk" || x.h.label === "Delayed").length} tone="critical" />
        <KpiCard label="Watch" value={withHealth.filter((x) => x.h.label === "Watch").length} tone="warning" />
        <KpiCard label="On Track" value={withHealth.filter((x) => x.h.label === "On Track").length} tone="success" />
        <KpiCard label="Contract value" value={fmtQAR(withHealth.reduce((s,x)=>s+x.p.contractValue,0), { compact: true })} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search project or number." className="h-9 w-64" />
        <Select value={phaseFilter} onValueChange={setPhaseFilter}><SelectTrigger className="h-9 w-40"><SelectValue placeholder="Phase" /></SelectTrigger><SelectContent><SelectItem value="all">All phases</SelectItem>{Array.from(new Set(d.projects.map((p) => p.phase))).map((ph) => <SelectItem key={ph} value={ph}>{ph}</SelectItem>)}</SelectContent></Select>
        <Select value={healthFilter} onValueChange={setHealthFilter}><SelectTrigger className="h-9 w-40"><SelectValue placeholder="Health" /></SelectTrigger><SelectContent>{["all","On Track","Watch","At Risk","Awaiting Materials","Delayed"].map((h) => <SelectItem key={h} value={h}>{h === "all" ? "All health" : h}</SelectItem>)}</SelectContent></Select>
        <Tabs value={view} onValueChange={(v) => setView(v as never)} className="ml-auto"><TabsList><TabsTrigger value="table">Portfolio</TabsTrigger><TabsTrigger value="kanban">Kanban</TabsTrigger><TabsTrigger value="matrix">Health matrix</TabsTrigger></TabsList></Tabs>
      </div>

      {view === "table" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40">
                <tr>{["Project","Client","Site","PM","Phase","Planned/Actual","Value","Health","Start","End"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(({ p, h }) => {
                  const cust = d.customers.find((c) => c.id === p.customerId);
                  const site = d.sites.find((s) => s.id === p.siteId);
                  const pm = d.employees.find((e) => e.id === p.pmId);
                  return (
                    <tr key={p.id} className="border-t hairline hover:bg-muted/30 cursor-pointer" onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })}>
                      <td className="py-2.5 px-3"><div className="flex items-center gap-2"><MonoChip>{p.number}</MonoChip><span>{p.name}</span></div></td>
                      <td className="py-2.5 px-3">{cust?.name}</td>
                      <td className="py-2.5 px-3 text-xs">{site?.name}</td>
                      <td className="py-2.5 px-3 text-xs">{pm?.name}</td>
                      <td className="py-2.5 px-3"><StatusPill status={p.phase} tone="info" /></td>
                      <td className="py-2.5 px-3 w-52"><div className="flex items-center gap-2"><ProgressBar value={p.actualProgress} planned={p.plannedProgress} /><span className="num text-xs w-20 text-right">{p.actualProgress}/{p.plannedProgress}%</span></div></td>
                      <td className="py-2.5 px-3 num text-right">{fmtQAR(p.contractValue, { compact: true })}</td>
                      <td className="py-2.5 px-3"><HealthBadge label={h.label} /></td>
                      <td className="py-2.5 px-3 num text-xs">{fmtDate(p.plannedStart)}</td>
                      <td className="py-2.5 px-3 num text-xs">{fmtDate(p.plannedEnd)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from(new Set(d.projects.map((p) => p.phase))).map((phase) => (
            <div key={phase} className="bg-surface-2/50 border hairline rounded-lg p-2">
              <div className="text-xs uppercase tracking-wider font-medium mb-2 flex items-center justify-between"><span>{phase}</span><span className="num text-muted-foreground">{filtered.filter((x) => x.p.phase === phase).length}</span></div>
              <div className="space-y-2">
                {filtered.filter((x) => x.p.phase === phase).map(({ p, h }) => (
                  <button key={p.id} onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })} className="w-full text-left bg-card border hairline rounded-md p-2.5 hover:border-signal/40">
                    <div className="flex items-center justify-between"><MonoChip>{p.number}</MonoChip><HealthBadge label={h.label} /></div>
                    <div className="mt-1.5 text-sm font-medium truncate">{p.name}</div>
                    <div className="mt-2"><ProgressBar value={p.actualProgress} planned={p.plannedProgress} /></div>
                    <div className="mt-1 text-[11px] text-muted-foreground flex justify-between"><span className="num">{p.actualProgress}%</span><span className="num">{fmtQAR(p.contractValue, { compact: true })}</span></div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "matrix" && (
        <Card className="p-4">
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div />
            {["Setup","Design","Installation","Testing","Handover"].map((c) => <div key={c} className="text-center uppercase text-muted-foreground">{c}</div>)}
            {["Critical","High","Medium","Low"].map((row) => (
              <>
                <div key={row} className="uppercase text-muted-foreground">{row}</div>
                {[0,1,2,3,4].map((c) => <div key={c} className="h-16 border hairline rounded bg-muted/20" />)}
              </>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Drag project chips into cells to plan focus. Demo grid.</div>
        </Card>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2"><span className="text-xs text-muted-foreground">Project name</span><Input placeholder="e.g., West Bay Tower CCTV Upgrade" /></label>
            <label><span className="text-xs text-muted-foreground">Customer</span><Select><SelectTrigger><SelectValue placeholder="Choose customer" /></SelectTrigger><SelectContent>{d.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Site</span><Select><SelectTrigger><SelectValue placeholder="Choose site" /></SelectTrigger><SelectContent>{d.sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Contract value (QAR)</span><Input type="number" defaultValue={100000} /></label>
            <label><span className="text-xs text-muted-foreground">Project Manager</span><Select><SelectTrigger><SelectValue placeholder="Choose PM" /></SelectTrigger><SelectContent>{d.employees.filter((e)=>e.department==="Projects").map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="text-xs text-muted-foreground">Planned start</span><Input type="date" /></label>
            <label><span className="text-xs text-muted-foreground">Planned end</span><Input type="date" /></label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button className="bg-signal text-signal-foreground" onClick={() => { setNewOpen(false); toast.success("Project created (demo)."); }}>Create project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
