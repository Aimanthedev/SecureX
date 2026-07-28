import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, ProgressBar, MetricCard, Panel, PanelHead, TableShell } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarClock, Camera, FileCheck2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/surveys")({
  head: () => ({ meta: [{ title: "Site Surveys | AL HARIB CCTV COMPANY" }] }),
  component: SurveysPage,
});

function SurveysPage() {
  const d = useData();
  const [view, setView] = useState("list");
  const [detail, setDetail] = useState<string | null>(null);

  const upcoming = d.surveys.filter((s) => s.status === "Scheduled" || s.status === "Requested").length;
  const avgCompleteness = Math.round(d.surveys.reduce((s, x) => s + x.completeness, 0) / (d.surveys.length || 1));
  const totalPoints = d.surveys.reduce((s, x) => s + x.points.length, 0);
  const pendingReports = d.surveys.filter((s) => s.reportStatus !== "Approved").length;

  return (
    <div>
      <PageHeader title="Site Surveys" subtitle="Camera point capture threads into BOQ, devices, and testing" actions={<Button size="sm" className="bg-signal text-white" onClick={() => toast.success("Survey scheduled (demo)")}>New survey</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Survey Schedule" value={upcoming} sub="requested or scheduled" icon={<CalendarClock className="w-4 h-4" />} accent="blue" motif="grid" />
        <MetricCard label="Survey Completeness" value={`${avgCompleteness}%`} sub="avg across active surveys" icon={<ShieldAlert className="w-4 h-4" />} accent="cyan" motif="waves" />
        <MetricCard label="Proposed Cameras" value={totalPoints} sub="camera points captured" icon={<Camera className="w-4 h-4" />} accent="purple" motif="camera" />
        <MetricCard label="Report Status" value={pendingReports} sub="pending review or draft" icon={<FileCheck2 className="w-4 h-4" />} accent="amber" motif="channels" />
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList className="bg-[#091321] border border-[rgba(133,164,204,0.12)] rounded-xl p-1"><TabsTrigger value="list">List</TabsTrigger><TabsTrigger value="cal">Calendar</TabsTrigger><TabsTrigger value="tpl">Templates</TabsTrigger></TabsList>
        <TabsContent value="list" className="mt-3">
          <Panel pad={false}>
            <TableShell>
              <thead><tr>{["Number","Client","Site","Type","Engineer","Scheduled","Status","Completeness","Report",""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{d.surveys.map((s) => {
                const cust = d.customers.find((c) => c.id === s.customerId);
                const site = d.sites.find((x) => x.id === s.siteId);
                const eng = d.employees.find((e) => e.id === s.engineerId);
                return (
                  <tr key={s.id} className="cursor-pointer" onClick={() => setDetail(s.id)}>
                    <td><MonoChip>{s.number}</MonoChip></td>
                    <td className="text-foreground">{cust?.name}</td>
                    <td className="text-xs">{site?.name || "-"}</td>
                    <td className="text-xs">{s.type}</td>
                    <td className="text-xs">{eng?.name}</td>
                    <td className="num text-xs">{fmtDate(s.scheduled)}</td>
                    <td><StatusPill status={s.status} tone={s.status.includes("Approved") ? "success" : s.status === "In Progress" ? "info" : "warning"} /></td>
                    <td className="w-32"><ProgressBar value={s.completeness} accent="cyan" /></td>
                    <td><StatusPill status={s.reportStatus} tone={s.reportStatus==="Approved"?"success":"info"} /></td>
                    <td><Button size="sm" variant="ghost">Open</Button></td>
                  </tr>
                );
              })}</tbody>
            </TableShell>
          </Panel>
        </TabsContent>
        <TabsContent value="cal" className="mt-3">
          <Panel texture="grid">
            <PanelHead title="Survey Calendar" sub="Scheduled site visits this cycle" accent="blue" />
            <div className="grid grid-cols-7 gap-1.5 text-xs">
              {Array.from({length: 35}, (_, i) => (
                <div key={i} className="panel-flat aspect-square p-1.5">
                  <div className="text-[10px] text-muted-foreground num">{((i%30)+1)}</div>
                  {d.surveys.find((s) => new Date(s.scheduled).getDate() === (i%30)+1) && <div className="mt-1 text-[9px] rounded px-1 py-0.5" style={{ background: "rgba(47,131,255,0.14)", color: "#2F83FF" }}>Survey</div>}
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="tpl" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["Warehouse","Office Tower","Retail","Villa","Hotel","Sports Facility"].map((t) => (
              <Panel key={t} texture="dots" accent="purple">
                <div className="text-sm font-medium text-foreground">{t} template</div>
                <div className="text-xs text-muted-foreground mt-1">Prefilled sections and typical camera point layouts.</div>
                <Button size="sm" variant="outline" className="mt-3 border-[rgba(133,164,204,0.18)]" onClick={() => toast.success(`Applied ${t} template.`)}>Use template</Button>
              </Panel>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-4xl bg-[#0B1524] border-[rgba(133,164,204,0.14)]">
          {detail && (() => {
            const s = d.surveys.find((x) => x.id === detail)!;
            return (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><MonoChip>{s.number}</MonoChip> {s.type}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                  <div className="panel-flat p-3"><div className="label-xs mb-1">Existing system</div><div className="text-foreground">{s.existingSystem}</div></div>
                  <div className="panel-flat p-3"><div className="label-xs mb-1">Proposed system</div><div className="text-foreground">{s.proposedSummary}</div></div>
                  <div className="panel-flat p-3"><div className="label-xs mb-1">Completeness</div><ProgressBar value={s.completeness} accent="cyan" /></div>
                </div>
                <div className="text-sm font-medium mb-2 text-foreground">Proposed Camera Points ({s.points.length})</div>
                <TableShell maxHeight={384}>
                  <thead><tr>{["CP","Building","Floor","Zone","Type","Mount","Height","Cable","Notes"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{s.points.map((p) => (
                    <tr key={p.id}><td><MonoChip>{p.id}</MonoChip></td><td>{p.building}</td><td>{p.floor}</td><td>{p.zone}</td><td>{p.cameraType}</td><td>{p.mountPos}</td><td className="num">{p.mountHeight}</td><td className="num">{p.cableLen}m</td><td className="text-muted-foreground">{p.notes || "-"}</td></tr>
                  ))}</tbody>
                </TableShell>
                <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button><Button className="bg-signal text-white" onClick={() => toast.success("Report printed (demo).")}>Print report</Button></DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
