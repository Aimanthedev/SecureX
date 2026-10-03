import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import {
  PageHeader, MonoChip, WorkStatusBadge, projectStatus, materialStatus, StatusPill, HealthBadge, StatTile, Segmented,
  TableShell, EmptyState, ACCENT, Motif, type Accent,
} from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { ProjectHealth } from "@/lib/mock-data";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [
    { title: "Projects | SecureX CCTV COMPANY" },
    { name: "description", content: "Live portfolio view of CCTV projects, materials and cameras across sites." },
    { property: "og:title", content: "Projects | SecureX CCTV COMPANY" },
    { property: "og:description", content: "Live portfolio view of CCTV projects, materials and cameras across sites." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ProjectsList,
});

const healthAccent: Record<ProjectHealth, Accent> = {
  "On Track": "green",
  "Watch": "amber",
  "At Risk": "red",
  "Awaiting Materials": "amber",
  "Delayed": "red",
};

const phaseMotif: Record<string, "grid" | "camera" | "nodes" | "channels" | "waves"> = {
  "Testing": "waves",
  "Handover": "nodes",
  "Installation": "camera",
};

function ProjectsList() {
  const d = useData();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table" | "kanban" | "timeline">("grid");
  const [newOpen, setNewOpen] = useState(false);

  const withHealth = useMemo(
    () => d.projects.map((p) => ({ p, h: d.computeHealth(p, d.approvals, d.devices, d.materials) })),
    [d]
  );

  const filtered = withHealth.filter(({ p, h }) =>
    (q === "" || (p.name + p.number).toLowerCase().includes(q.toLowerCase())) &&
    (phaseFilter === "all" || p.phase === phaseFilter) &&
    (healthFilter === "all" || h.label === healthFilter)
  );

  const counts = {
    active: withHealth.filter((x) => x.p.phase !== "Handover" && x.p.phase !== "Warranty" && x.p.phase !== "AMC" && x.p.phase !== "Cancelled").length,
    atRisk: withHealth.filter((x) => x.h.label === "At Risk").length,
    delayed: withHealth.filter((x) => x.h.label === "Delayed" || x.p.phase === "Delayed").length,
    awaitingMaterials: withHealth.filter((x) => x.h.label === "Awaiting Materials").length,
    readyForHandover: withHealth.filter((x) => x.p.phase === "Handover" || x.p.phase === "Inspection and Compliance").length,
    completed: withHealth.filter((x) => x.p.phase === "Warranty" || x.p.phase === "AMC").length,
  };

  const totalValue = withHealth.reduce((s, x) => s + x.p.contractValue, 0);
  const phases = Array.from(new Set(d.projects.map((p) => p.phase)));

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#20D39A] shadow-[0_0_8px_#20D39A]" />Portfolio Command</>}
        title="Projects"
        subtitle={`${withHealth.length} active engagements · ${fmtQAR(totalValue, { compact: true })} contract value under management across Qatar.`}
        actions={
          <>
            <Button variant="outline" size="sm" className="border-input bg-transparent hover:bg-[rgba(133,164,204,0.08)]" onClick={() => toast("CSV export prepared (demo)")}>
              Export
            </Button>
            <Button size="sm" onClick={() => setNewOpen(true)} className="bg-signal text-white hover:bg-signal/90 shadow-[0_10px_28px_-12px_var(--glow)]">
              + New Project
            </Button>
          </>
        }
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Active" value={counts.active} accent="blue" />
        <StatTile label="At Risk" value={counts.atRisk} accent="red" />
        <StatTile label="Delayed" value={counts.delayed} accent="red" />
        <StatTile label="Awaiting Materials" value={counts.awaitingMaterials} accent="amber" />
        <StatTile label="Ready for Handover" value={counts.readyForHandover} accent="cyan" />
        <StatTile label="Completed" value={counts.completed} accent="green" />
      </div>

      <div className="rise rise-2 mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search project or number…"
          className="h-9 w-full border-input bg-surface sm:w-64"
        />
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="h-9 w-40 border-input bg-surface"><SelectValue placeholder="Phase" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All phases</SelectItem>
            {phases.map((ph) => <SelectItem key={ph} value={ph}>{ph}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={healthFilter} onValueChange={setHealthFilter}>
          <SelectTrigger className="h-9 w-44 border-input bg-surface"><SelectValue placeholder="Health" /></SelectTrigger>
          <SelectContent>
            {["all", "On Track", "Watch", "At Risk", "Awaiting Materials", "Delayed"].map((h) => (
              <SelectItem key={h} value={h}>{h === "all" ? "All health" : h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: "Grid" },
              { value: "table", label: "Table" },
              { value: "kanban", label: "Kanban" },
              { value: "timeline", label: "Timeline" },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No projects match your filters" hint="Try clearing search or resetting phase / health filters." />
      )}

      {filtered.length > 0 && view === "grid" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ p, h }, i) => {
            const cust = d.customers.find((c) => c.id === p.customerId);
            const site = d.sites.find((s) => s.id === p.siteId);
            const pm = d.employees.find((e) => e.id === p.pmId);
            const cams = d.devices.filter((dv) => dv.projectId === p.id);
            const installed = cams.filter((dv) => dv.status !== "Faulty").length;
            const accent = healthAccent[h.label];
            const nextTask = d.tasks.find((t) => t.projectId === p.id && t.status !== "Ready");
            return (
              <button
                key={p.id}
                onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })}
                className={`rise rise-${(i % 6) + 1} panel card-lift relative overflow-hidden p-4 text-left`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: `radial-gradient(120% 120% at 100% 0%, ${ACCENT[accent].from} 0%, transparent 58%)` }} />
                <Motif kind={phaseMotif[p.phase] ?? "grid"} color={ACCENT[accent].hex} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><MonoChip>{p.number}</MonoChip><StatusPill status={p.phase} tone="info" /></div>
                      <div className="mt-2 truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">{p.name}</div>
                      <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{cust?.name} · {site?.name}</div>
                    </div>
                    <HealthBadge label={h.label} />
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-2.5 py-2">
                    <span className="label-xs">Status</span>
                    <WorkStatusBadge status={projectStatus(p, h.label)} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                      <div className="label-xs">Material</div>
                      <div className="mt-1"><WorkStatusBadge status={materialStatus(d.materials.filter((m) => m.projectId === p.id))} /></div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                      <div className="label-xs">Cameras</div>
                      <div className="num mt-1 font-semibold text-foreground">{installed}/{cams.length || "—"}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                      <div className="label-xs">Value</div>
                      <div className="num mt-1 font-semibold text-foreground">{fmtQAR(p.contractValue, { compact: true })}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11.5px]">
                    <div className="min-w-0">
                      <div className="label-xs">Project manager</div>
                      <div className="truncate text-foreground/90">{pm?.name ?? "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="label-xs">Planned end</div>
                      <div className="num text-foreground/90">{fmtDate(p.plannedEnd)}</div>
                    </div>
                  </div>

                  {nextTask && (
                    <div className="mt-2.5 truncate rounded-lg border border-border bg-[rgba(47,131,255,0.06)] px-2.5 py-1.5 text-[11px] text-muted-foreground">
                      <span className="label-xs mr-1.5 inline text-[10px]">Next</span>{nextTask.title}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && view === "table" && (
        <div className="rise rise-2">
          <TableShell>
            <thead>
              <tr>
                {["Project", "Client", "Site", "PM", "Phase", "Status", "Value", "Health", "Start", "End"].map((h) => (
                  <th key={h} className={h === "Value" || h === "Start" || h === "End" ? "text-right" : "text-left"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ p, h }) => {
                const cust = d.customers.find((c) => c.id === p.customerId);
                const site = d.sites.find((s) => s.id === p.siteId);
                const pm = d.employees.find((e) => e.id === p.pmId);
                return (
                  <tr key={p.id} className="cursor-pointer" onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })}>
                    <td><div className="flex items-center gap-2"><MonoChip>{p.number}</MonoChip><span className="text-foreground">{p.name}</span></div></td>
                    <td>{cust?.name}</td>
                    <td className="text-xs text-muted-foreground">{site?.name}</td>
                    <td className="text-xs text-muted-foreground">{pm?.name}</td>
                    <td><StatusPill status={p.phase} tone="info" /></td>
                    <td className="w-40"><WorkStatusBadge status={projectStatus(p, h.label)} /></td>
                    <td className="num text-right">{fmtQAR(p.contractValue, { compact: true })}</td>
                    <td><HealthBadge label={h.label} /></td>
                    <td className="num text-right text-xs">{fmtDate(p.plannedStart)}</td>
                    <td className="num text-right text-xs">{fmtDate(p.plannedEnd)}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </div>
      )}

      {filtered.length > 0 && view === "kanban" && (
        <div className="rise rise-2 grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
          {phases.map((phase) => {
            const items = filtered.filter((x) => x.p.phase === phase);
            return (
              <div key={phase} className="panel-flat p-2.5">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="label-xs">{phase}</span>
                  <span className="num rounded-md bg-[rgba(133,164,204,0.08)] px-1.5 py-0.5 text-[11px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(({ p, h }) => (
                    <button
                      key={p.id}
                      onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })}
                      className="panel-flat card-lift w-full p-2.5 text-left"
                    >
                      <div className="flex items-center justify-between gap-2"><MonoChip>{p.number}</MonoChip><HealthBadge label={h.label} /></div>
                      <div className="mt-1.5 truncate text-[13px] font-medium text-foreground">{p.name}</div>
                      <div className="mt-2"><WorkStatusBadge status={projectStatus(p, h.label)} /></div>
                      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground"><span>{fmtDate(p.plannedEnd)}</span><span className="num">{fmtQAR(p.contractValue, { compact: true })}</span></div>
                    </button>
                  ))}
                  {items.length === 0 && <div className="rounded-lg border border-dashed border-border py-6 text-center text-[11px] text-muted-foreground">Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && view === "timeline" && (
        <div className="rise rise-2 panel overflow-x-auto p-4">
          <div className="min-w-[720px] space-y-3">
            {filtered.map(({ p, h }) => (
              <button
                key={p.id}
                onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })}
                className="grid w-full grid-cols-[180px_1fr_90px] items-center gap-3 rounded-xl border border-[rgba(133,164,204,0.08)] p-2 text-left transition-colors hover:border-[rgba(133,164,204,0.22)]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5"><MonoChip>{p.number}</MonoChip></div>
                  <div className="mt-0.5 truncate text-[12.5px] font-medium text-foreground">{p.name}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
                  <WorkStatusBadge status={projectStatus(p, h.label)} />
                  <span className="num">{fmtDate(p.plannedStart)} → {fmtDate(p.plannedEnd)}</span>
                </div>
                <div className="text-right"><HealthBadge label={h.label} /></div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Planned start and planned end dates for each project.
          </div>
        </div>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-2xl border-border bg-surface">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2"><span className="label-xs">Project name</span><Input placeholder="e.g., West Bay Tower CCTV Upgrade" /></label>
            <label><span className="label-xs">Customer</span><Select><SelectTrigger><SelectValue placeholder="Choose customer" /></SelectTrigger><SelectContent>{d.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="label-xs">Site</span><Select><SelectTrigger><SelectValue placeholder="Choose site" /></SelectTrigger><SelectContent>{d.sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="label-xs">Contract value (QAR)</span><Input type="number" defaultValue={100000} /></label>
            <label><span className="label-xs">Project Manager</span><Select><SelectTrigger><SelectValue placeholder="Choose PM" /></SelectTrigger><SelectContent>{d.employees.filter((e) => e.department === "Projects").map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></label>
            <label><span className="label-xs">Planned start</span><Input type="date" /></label>
            <label><span className="label-xs">Planned end</span><Input type="date" /></label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button className="bg-signal text-white hover:bg-signal/90" onClick={() => { setNewOpen(false); toast.success("Project created (demo)."); }}>Create project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
