import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, WorkStatusBadge, MetricCard, Panel, PanelHead, TableShell, type WorkStatus } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarClock, Camera, FileCheck2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/surveys")({
  head: () => ({ meta: [{ title: "Site Surveys | SecureX CCTV COMPANY" }] }),
  component: SurveysPage,
});

function SurveysPage() {
  const d = useData();
  const [view, setView] = useState("list");
  const [detail, setDetail] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    if (d.pendingCreate?.type === "survey") { setNewOpen(true); d.clearPendingCreate(); }
  }, [d.pendingCreate]);

  const upcoming = d.surveys.filter((s) => s.status === "Scheduled" || s.status === "Requested").length;
  const completedSurveys = d.surveys.filter((s) => s.completeness >= 100).length;
  const totalPoints = d.surveys.reduce((s, x) => s + x.points.length, 0);
  const pendingReports = d.surveys.filter((s) => s.reportStatus !== "Approved").length;
  const surveyStatus = (s: { completeness: number; status: string }): WorkStatus =>
    s.completeness >= 100 ? "Completed" : s.completeness === 0 ? "Not Started" : s.status === "In Progress" ? "In Progress" : "Pending";

  return (
    <div>
      <PageHeader title="Site Surveys" subtitle="Camera point capture threads into BOQ, devices, and testing" actions={<Button size="sm" className="bg-signal text-white" onClick={() => setNewOpen(true)}>New survey</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Survey Schedule" value={upcoming} sub="requested or scheduled" icon={<CalendarClock className="w-4 h-4" />} accent="blue" motif="grid" />
        <MetricCard label="Surveys Completed" value={`${completedSurveys} / ${d.surveys.length}`} sub="fully captured sites" icon={<ShieldAlert className="w-4 h-4" />} accent="cyan" motif="waves" />
        <MetricCard label="Proposed Cameras" value={totalPoints} sub="camera points captured" icon={<Camera className="w-4 h-4" />} accent="purple" motif="camera" />
        <MetricCard label="Report Status" value={pendingReports} sub="pending review or draft" icon={<FileCheck2 className="w-4 h-4" />} accent="amber" motif="channels" />
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList className="bg-[#091321] border border-[rgba(133,164,204,0.12)] rounded-xl p-1"><TabsTrigger value="list">List</TabsTrigger><TabsTrigger value="cal">Calendar</TabsTrigger><TabsTrigger value="tpl">Templates</TabsTrigger></TabsList>
        <TabsContent value="list" className="mt-3">
          <Panel pad={false}>
            <TableShell>
              <thead><tr>{["Number","Client","Site","Type","Engineer","Scheduled","Status","Capture","Report",""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
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
                    <td className="w-32"><WorkStatusBadge status={surveyStatus(s)} /></td>
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
                <Button size="sm" variant="outline" className="mt-3 border-[rgba(133,164,204,0.18)]" onClick={() => {
                  const cust = d.customers[0];
                  const s = d.addSurvey({
                    number: `AHC-SUR-2026-${String(100 + d.surveys.length).padStart(3, "0")}`,
                    customerId: cust.id, siteId: d.sites.find((x) => x.customerId === cust.id)?.id ?? d.sites[0].id,
                    type: `${t} template survey`, engineerId: d.employees.find((e) => e.department === "Engineering")?.id ?? "E-008",
                    scheduled: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10), status: "Requested", completeness: 0,
                    reportStatus: "Draft", points: [], existingSystem: "To be assessed.", proposedSummary: `${t} standard layout applied.`,
                  });
                  toast.success(`${t} template applied — survey ${s.number} created.`);
                }}>Use template</Button>
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
                  <div className="panel-flat p-3"><div className="label-xs mb-1">Capture status</div><WorkStatusBadge status={surveyStatus(s)} /></div>
                </div>
                <div className="text-sm font-medium mb-2 text-foreground">Proposed Camera Points ({s.points.length})</div>
                <TableShell maxHeight={384}>
                  <thead><tr>{["CP","Building","Floor","Zone","Type","Mount","Height","Cable","Notes"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{s.points.map((p) => (
                    <tr key={p.id}><td><MonoChip>{p.id}</MonoChip></td><td>{p.building}</td><td>{p.floor}</td><td>{p.zone}</td><td>{p.cameraType}</td><td>{p.mountPos}</td><td className="num">{p.mountHeight}</td><td className="num">{p.cableLen}m</td><td className="text-muted-foreground">{p.notes || "-"}</td></tr>
                  ))}</tbody>
                </TableShell>
                <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button><Button className="bg-signal text-white" onClick={() => window.print()}>Print report</Button></DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <NewSurveyDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function NewSurveyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const d = useData();
  const blank = { customerId: "", siteId: "", type: "Full site survey", engineerId: d.employees.find((e) => e.department === "Engineering")?.id ?? "", scheduled: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10) };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(blank); }, [open]);
  const sites = d.sites.filter((s) => s.customerId === form.customerId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Survey</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label><span className="text-xs text-muted-foreground">Customer</span>
            <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v, siteId: "" })}>
              <SelectTrigger><SelectValue placeholder="Choose customer" /></SelectTrigger>
              <SelectContent>{d.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label><span className="text-xs text-muted-foreground">Site</span>
            <Select value={form.siteId} onValueChange={(v) => setForm({ ...form, siteId: v })}>
              <SelectTrigger><SelectValue placeholder="Choose site" /></SelectTrigger>
              <SelectContent>{(sites.length ? sites : d.sites).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label><span className="text-xs text-muted-foreground">Survey type</span><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Engineer</span>
            <Select value={form.engineerId} onValueChange={(v) => setForm({ ...form, engineerId: v })}>
              <SelectTrigger><SelectValue placeholder="Choose engineer" /></SelectTrigger>
              <SelectContent>{d.employees.filter((e) => e.department === "Engineering").map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Scheduled date</span><Input type="date" value={form.scheduled} onChange={(e) => setForm({ ...form, scheduled: e.target.value })} /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-signal text-white" onClick={() => {
            if (!form.customerId) { toast.error("Choose a customer"); return; }
            const s = d.addSurvey({
              number: `AHC-SUR-2026-${String(100 + d.surveys.length).padStart(3, "0")}`,
              customerId: form.customerId, siteId: form.siteId || d.sites.find((x) => x.customerId === form.customerId)!.id,
              type: form.type, engineerId: form.engineerId, scheduled: form.scheduled, status: "Requested",
              completeness: 0, reportStatus: "Draft", points: [], existingSystem: "To be assessed on site.", proposedSummary: "",
            });
            onOpenChange(false);
            toast.success(`Survey ${s.number} scheduled.`);
          }}>Schedule survey</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
