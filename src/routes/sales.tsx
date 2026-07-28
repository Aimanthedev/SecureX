import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { KpiCard, PageHeader, MonoChip, StatusPill } from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { LEAD_STAGES, type Lead, type LeadStage } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { GripVertical, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [{ title: "Sales | AL HARIB CCTV COMPANY" }, { name: "description", content: "Lead pipeline, forecasts, and follow-ups." }] }),
  component: SalesPage,
});

const SYSTEMS = ["IP CCTV","Analog CCTV","NVR upgrade","VMS","Control room","Access Control","Intercom","Structured Cabling","Maintenance","Mixed"];

function SalesPage() {
  const d = useData();
  const [view, setView] = useState<"pipeline"|"leads"|"followups"|"activities"|"targets"|"analytics">("pipeline");
  const [newOpen, setNewOpen] = useState(false);
  const active = d.leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost");
  const weighted = active.reduce((s, l) => s + l.value * (l.probability / 100), 0);

  return (
    <div>
      <PageHeader title="Sales" subtitle="Pipeline, leads, and forecast for AL HARIB CCTV COMPANY"
        actions={<><Button variant="outline" size="sm">Import leads</Button><Button size="sm" onClick={() => setNewOpen(true)} className="bg-signal text-signal-foreground hover:bg-signal/90">New lead</Button></>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Active leads" value={active.length} />
        <KpiCard label="Weighted pipeline" value={fmtQAR(weighted, { compact: true })} tone="success" />
        <KpiCard label="Won this month" value={fmtQAR(d.leads.filter((l) => l.stage === "Won").reduce((s, l) => s + l.value, 0), { compact: true })} />
        <KpiCard label="Win rate" value="62%" />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as never)}>
        <TabsList><TabsTrigger value="pipeline">Pipeline</TabsTrigger><TabsTrigger value="leads">Leads</TabsTrigger><TabsTrigger value="followups">Follow-Ups</TabsTrigger><TabsTrigger value="activities">Activities</TabsTrigger><TabsTrigger value="targets">Targets</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>

        <TabsContent value="pipeline" className="mt-4"><PipelineBoard /></TabsContent>
        <TabsContent value="leads" className="mt-4"><LeadsTable /></TabsContent>
        <TabsContent value="followups" className="mt-4"><FollowUps /></TabsContent>
        <TabsContent value="activities" className="mt-4"><Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">Recent Activities</h3><ol className="relative border-l hairline ml-2 space-y-4">{d.leads.slice(0, 10).map((l) => (<li key={l.id} className="ml-4"><div className="absolute w-2 h-2 rounded-full bg-signal -left-1 mt-1.5" /><div className="text-sm">{l.company} · {l.stage}</div><div className="text-xs text-muted-foreground num">{fmtDate(l.lastActivity)}</div></li>))}</ol></Card></TabsContent>
        <TabsContent value="targets" className="mt-4"><Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">Quarterly Targets</h3><div className="grid grid-cols-3 gap-3">{d.employees.filter((e)=>e.department==="Sales").map((e) => (<div key={e.id} className="border hairline rounded-lg p-3"><div className="text-sm font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{e.role}</div><div className="mt-2 text-2xl font-display num">{fmtQAR(320000 + Math.random() * 400000, {compact:true})}</div><div className="text-xs text-muted-foreground">of {fmtQAR(1000000, {compact:true})} target</div></div>))}</div></Card></TabsContent>
        <TabsContent value="analytics" className="mt-4"><Card className="p-4"><h3 className="font-display font-semibold text-lg mb-3">Stage distribution</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={LEAD_STAGES.map((s) => ({ stage: s, count: d.leads.filter((l) => l.stage === s).length }))}><XAxis dataKey="stage" fontSize={10} angle={-25} textAnchor="end" height={80} /><YAxis fontSize={11} /><Tooltip contentStyle={{fontSize:12}} /><Bar dataKey="count" fill="var(--signal)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></Card></TabsContent>
      </Tabs>

      <NewLeadDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function PipelineBoard() {
  const d = useData();
  const nav = useNavigate();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [lostOpen, setLostOpen] = useState<{ id: string; reason: string } | null>(null);
  const [detail, setDetail] = useState<Lead | null>(null);
  const stageValue = (s: LeadStage) => d.leads.filter((l) => l.stage === s).reduce((sum, l) => sum + l.value, 0);
  const onDrop = (stage: LeadStage) => {
    if (!draggingId) return;
    if (stage === "Lost") { setLostOpen({ id: draggingId, reason: "" }); setDraggingId(null); return; }
    d.updateLead(draggingId, { stage, probability: stageProb(stage) });
    toast.success(`Moved to ${stage}`);
    setDraggingId(null);
  };
  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {LEAD_STAGES.map((stage) => {
          const leads = d.leads.filter((l) => l.stage === stage);
          return (
            <div key={stage} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(stage)} className="shrink-0 w-72 bg-surface-2/60 border hairline rounded-lg p-2">
              <div className="flex items-center justify-between px-1 py-1 mb-2">
                <div className="text-xs font-medium uppercase tracking-wider">{stage}</div>
                <div className="text-[10px] text-muted-foreground num">{leads.length} · {fmtQAR(stageValue(stage), { compact: true })}</div>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {leads.map((l) => {
                  const sp = d.employees.find((e) => e.id === l.salespersonId);
                  const dueDays = l.nextFollowUp ? daysFromToday(l.nextFollowUp) : null;
                  const inactive = daysFromToday(l.lastActivity) < -14;
                  return (
                    <div key={l.id} draggable onDragStart={() => setDraggingId(l.id)} onDragEnd={() => setDraggingId(null)} onClick={() => setDetail(l)}
                      className="bg-card border hairline rounded-md p-2.5 text-xs cursor-grab active:cursor-grabbing hover:border-signal/40">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate text-[13px]">{l.company}</div>
                          <div className="text-muted-foreground truncate">{l.contactName}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="num font-semibold">{fmtQAR(l.value, { compact: true })}</div>
                        <div className="text-[10px] text-muted-foreground">{l.probability}%</div>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{sp?.name?.split(" ")[0]}</span>
                        {dueDays !== null && <span className={`num ${dueDays < 0 ? "text-critical" : dueDays <= 2 ? "text-warning" : ""}`}>{dueDays < 0 ? `${Math.abs(dueDays)}d over` : `${dueDays}d`}</span>}
                      </div>
                      {inactive && l.stage !== "Won" && l.stage !== "Lost" && <div className="mt-1 text-[10px] text-warning">Inactive 14+ days</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <AlertDialog open={!!lostOpen} onOpenChange={(o) => !o && setLostOpen(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Mark lead as Lost</AlertDialogTitle></AlertDialogHeader>
          <Input placeholder="Reason (competitor, price, no budget, no response.)" value={lostOpen?.reason || ""} onChange={(e) => setLostOpen((v) => v ? { ...v, reason: e.target.value } : null)} />
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (lostOpen) { d.updateLead(lostOpen.id, { stage: "Lost", probability: 0, lostReason: lostOpen.reason || "Unspecified" }); toast("Lead moved to Lost."); } setLostOpen(null); }}>Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          {detail && <>
            <DialogHeader><DialogTitle>{detail.company}</DialogTitle></DialogHeader>
            <Tabs defaultValue="ov">
              <TabsList><TabsTrigger value="ov">Overview</TabsTrigger><TabsTrigger value="tl">Timeline</TabsTrigger><TabsTrigger value="notes">Notes</TabsTrigger></TabsList>
              <TabsContent value="ov" className="mt-3 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Contact" v={detail.contactName} />
                  <Field label="Phone" v={detail.phone} />
                  <Field label="Email" v={detail.email} />
                  <Field label="System type" v={detail.systemType} />
                  <Field label="Value" v={fmtQAR(detail.value)} />
                  <Field label="Probability" v={`${detail.probability}%`} />
                  <Field label="Stage" v={detail.stage} />
                  <Field label="Salesperson" v={d.employees.find((e) => e.id === detail.salespersonId)?.name || ""} />
                  <Field label="Source" v={detail.source} />
                  <Field label="Next follow-up" v={detail.nextFollowUp ? fmtDate(detail.nextFollowUp) : "-"} />
                </div>
                <div><div className="text-xs uppercase text-muted-foreground">Notes</div><div>{detail.notes || "-"}</div></div>
                {detail.lostReason && <div className="text-critical text-xs">Lost reason: {detail.lostReason}</div>}
              </TabsContent>
              <TabsContent value="tl" className="mt-3"><ol className="relative border-l hairline ml-2 space-y-3">{[detail.createdAt, detail.lastActivity].map((dt, i) => <li key={i} className="ml-4"><div className="absolute w-2 h-2 rounded-full bg-signal -left-1 mt-1.5" /><div className="text-sm num">{fmtDate(dt)}</div><div className="text-xs text-muted-foreground">{i === 0 ? "Lead created" : "Last activity"}</div></li>)}</ol></TabsContent>
              <TabsContent value="notes" className="mt-3"><div className="text-sm">{detail.notes || "No notes."}</div></TabsContent>
            </Tabs>
            <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
    </>
  );
}
const stageProb = (s: LeadStage): number => ({ "New Enquiry": 10, "Contacted": 20, "Qualified": 30, "Site Survey Required": 35, "Site Survey Scheduled": 40, "Survey Completed": 55, "Quotation Draft": 55, "Quotation Sent": 65, "Negotiation": 75, "Verbal Approval": 90, "Won": 100, "Lost": 0 }[s]);

function LeadsTable() {
  const d = useData();
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const filtered = d.leads.filter((l) => (l.company + l.contactName + l.systemType).toLowerCase().includes(q.toLowerCase()));
  return (
    <Card className="p-0">
      <div className="p-3 flex items-center gap-2"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads." className="h-9 w-64" /></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Company","Contact","System","Value","Stage","Prob","Salesperson","Next follow","Last activity",""].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
          <tbody>{filtered.map((l) => {
            const sp = d.employees.find((e) => e.id === l.salespersonId);
            return (
              <tr key={l.id} className="border-t hairline hover:bg-muted/30">
                <td className="py-2 px-3">{l.company}</td>
                <td className="py-2 px-3 text-xs">{l.contactName}<div className="text-[10px] num text-muted-foreground">{l.phone}</div></td>
                <td className="py-2 px-3 text-xs">{l.systemType}</td>
                <td className="py-2 px-3 num">{fmtQAR(l.value, {compact:true})}</td>
                <td className="py-2 px-3"><StatusPill status={l.stage} tone={l.stage==="Won"?"success":l.stage==="Lost"?"critical":"info"} /></td>
                <td className="py-2 px-3 num text-xs">{l.probability}%</td>
                <td className="py-2 px-3 text-xs">{sp?.name}</td>
                <td className="py-2 px-3 num text-xs">{l.nextFollowUp ? fmtDate(l.nextFollowUp) : "-"}</td>
                <td className="py-2 px-3 num text-xs text-muted-foreground">{fmtDate(l.lastActivity)}</td>
                <td className="py-2 px-3"><Button variant="ghost" size="sm" onClick={() => setConfirm(l.id)} className="text-critical"><Trash2 className="w-3 h-3" /></Button></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete lead?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (confirm) { d.deleteLead(confirm); toast.success("Lead deleted."); } setConfirm(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function FollowUps() {
  const d = useData();
  const groups = useMemo(() => {
    const g = { "Overdue": [] as Lead[], "Due today": [] as Lead[], "Upcoming": [] as Lead[], "No next action": [] as Lead[], "Inactive": [] as Lead[] };
    d.leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").forEach((l) => {
      if (!l.nextFollowUp) g["No next action"].push(l);
      else {
        const dd = daysFromToday(l.nextFollowUp);
        if (dd < 0) g["Overdue"].push(l);
        else if (dd === 0) g["Due today"].push(l);
        else g["Upcoming"].push(l);
      }
      if (daysFromToday(l.lastActivity) < -14 && !g["Inactive"].includes(l)) g["Inactive"].push(l);
    });
    return g;
  }, [d.leads]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      {Object.entries(groups).map(([label, list]) => (
        <Card key={label} className="p-3"><div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between"><span>{label}</span><span className="num">{list.length}</span></div><div className="space-y-2">{list.slice(0, 8).map((l) => (<div key={l.id} className="border hairline rounded-md p-2 text-xs"><div className="font-medium truncate">{l.company}</div><div className="text-muted-foreground">{l.stage}</div>{l.nextFollowUp && <div className="num mt-1">{fmtDate(l.nextFollowUp)}</div>}</div>))}{list.length===0 && <div className="text-xs text-muted-foreground">Nothing here.</div>}</div></Card>
      ))}
    </div>
  );
}

function NewLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const d = useData();
  const [form, setForm] = useState({ company: "", contactName: "", phone: "", email: "", value: 100000, systemType: "IP CCTV", source: "Website", salespersonId: "E-006", stage: "New Enquiry" as LeadStage });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Company</span><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g., Souq Waqif Boutique Hotel" /></label>
          <label><span className="text-xs text-muted-foreground">Contact name</span><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Phone</span><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+974 " /></label>
          <label><span className="text-xs text-muted-foreground">Email</span><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Estimated value (QAR)</span><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">System type</span><Select value={form.systemType} onValueChange={(v) => setForm({ ...form, systemType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SYSTEMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></label>
          <label><span className="text-xs text-muted-foreground">Source</span><Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Website","Referral","Tender","Cold outreach","Repeat"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></label>
          <label><span className="text-xs text-muted-foreground">Salesperson</span><Select value={form.salespersonId} onValueChange={(v) => setForm({ ...form, salespersonId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{d.employees.filter((e)=>e.department==="Sales").map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></label>
          <label><span className="text-xs text-muted-foreground">Stage</span><Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as LeadStage })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LEAD_STAGES.filter((s) => s !== "Won" && s !== "Lost").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></label>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={() => { if (!form.company) { toast.error("Company required"); return; } d.addLead({ ...form, probability: stageProb(form.stage), createdAt: new Date().toISOString().slice(0,10), lastActivity: new Date().toISOString().slice(0,10), notes: "" }); onOpenChange(false); toast.success("Lead created."); }} className="bg-signal text-signal-foreground">Create lead</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, v }: { label: string; v: React.ReactNode }) {
  return <div className="border hairline rounded p-2"><div className="text-[10px] uppercase text-muted-foreground">{label}</div><div className="text-sm">{v}</div></div>;
}
