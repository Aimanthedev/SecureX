import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import {
  PageHeader, StatusPill, MetricCard, Panel, PanelHead, TableShell, AlertCard,
  axisProps, ChartTooltip,
} from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { LEAD_STAGES, type Lead, type LeadStage } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { GripVertical, Trash2, TrendingUp, Target, Clock, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [
    { title: "Sales | SecureX CCTV COMPANY" },
    { name: "description", content: "Lead pipeline, forecasts, and follow-ups." },
    { property: "og:title", content: "Sales | SecureX CCTV COMPANY" },
    { property: "og:description", content: "Lead pipeline, forecasts, and follow-ups." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SalesPage,
});

const SYSTEMS = ["IP CCTV","Analog CCTV","NVR upgrade","VMS","Control room","Access Control","Intercom","Structured Cabling","Maintenance","Mixed"];

function SalesPage() {
  const d = useData();
  const [view, setView] = useState<"pipeline"|"leads"|"followups"|"activities"|"targets"|"analytics">("pipeline");
  const [newOpen, setNewOpen] = useState(false);
  const active = d.leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost");
  const weighted = active.reduce((s, l) => s + l.value * (l.probability / 100), 0);
  const wonThisMonth = d.leads.filter((l) => l.stage === "Won").reduce((s, l) => s + l.value, 0);
  const followupsToday = d.leads.filter((l) => l.nextFollowUp && daysFromToday(l.nextFollowUp) <= 0 && l.stage !== "Won" && l.stage !== "Lost").length;

  return (
    <div>
      <PageHeader title="Sales" subtitle="Pipeline, leads, and forecast for SecureX CCTV COMPANY"
        actions={<><Button variant="outline" size="sm" className="border-input">Import leads</Button><Button size="sm" onClick={() => setNewOpen(true)} className="bg-signal text-white hover:bg-signal/90">New lead</Button></>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Open Pipeline" value={active.length} sub="active opportunities" icon={<TrendingUp className="w-4 h-4" />} accent="blue" motif="nodes" />
        <MetricCard label="Weighted Forecast" value={fmtQAR(weighted, { compact: true })} sub="probability-adjusted" icon={<Target className="w-4 h-4" />} accent="cyan" motif="waves" />
        <MetricCard label="Follow-Ups Today" value={followupsToday} sub="due or overdue" icon={<Clock className="w-4 h-4" />} accent="amber" motif="grid" />
        <MetricCard label="Won This Month" value={fmtQAR(wonThisMonth, { compact: true })} sub="closed-won value" icon={<Trophy className="w-4 h-4" />} accent="green" motif="channels" />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as never)}>
        <TabsList className="bg-surface border border-border rounded-xl p-1">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger><TabsTrigger value="leads">Leads</TabsTrigger><TabsTrigger value="followups">Follow-Ups</TabsTrigger><TabsTrigger value="activities">Activities</TabsTrigger><TabsTrigger value="targets">Targets</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <StageChart />
            </div>
            <MonthlyTarget />
          </div>
          <PipelineBoard />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <PriorityQueue />
            <Leaderboard />
          </div>
          <LeadSourceChart />
        </TabsContent>

        <TabsContent value="leads" className="mt-4"><LeadsTable /></TabsContent>
        <TabsContent value="followups" className="mt-4"><FollowUps /></TabsContent>
        <TabsContent value="activities" className="mt-4">
          <Panel texture="dots">
            <PanelHead title="Recent Activities" sub="Latest lead touches across the pipeline" accent="purple" />
            <ol className="relative ml-2 space-y-4 border-l border-border">
              {d.leads.slice(0, 10).map((l) => (
                <li key={l.id} className="ml-4 relative">
                  <div className="absolute w-2 h-2 rounded-full bg-signal -left-[21px] mt-1.5" style={{ boxShadow: "0 0 8px rgba(47,131,255,0.6)" }} />
                  <div className="text-[13px] text-foreground">{l.company} · <span className="text-muted-foreground">{l.stage}</span></div>
                  <div className="text-[11px] num text-muted-foreground">{fmtDate(l.lastActivity)}</div>
                </li>
              ))}
            </ol>
          </Panel>
        </TabsContent>
        <TabsContent value="targets" className="mt-4">
          <Panel texture="grid">
            <PanelHead title="Quarterly Targets" sub="Sales team quota attainment" accent="green" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {d.employees.filter((e) => e.department === "Sales").map((e) => {
                const val = 320000 + ((e.id.charCodeAt(2) || 1) * 5137) % 400000;
                return (
                  <div key={e.id} className="panel-flat p-4">
                    <div className="text-[13px] font-medium text-foreground">{e.name}</div>
                    <div className="text-[11px] text-muted-foreground">{e.role}</div>
                    <div className="num mt-3 text-2xl font-semibold text-foreground">{fmtQAR(val, { compact: true })}</div>
                    <div className="text-[11px] text-muted-foreground mb-2">of {fmtQAR(1000000, { compact: true })} target</div>
                    <StatusPill status={val >= 1000000 ? "Target met" : "In Progress"} tone={val >= 1000000 ? "success" : "info"} />
                  </div>
                );
              })}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="analytics" className="mt-4"><StageChart tall /></TabsContent>
      </Tabs>

      <NewLeadDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function StageChart({ tall }: { tall?: boolean }) {
  const d = useData();
  const data = LEAD_STAGES.filter((s) => s !== "Won" && s !== "Lost").map((s) => ({ stage: s, count: d.leads.filter((l) => l.stage === s).length }));
  return (
    <Panel texture="grid" accent="blue" className="h-full">
      <PanelHead title="Pipeline by Stage" sub="Active lead count across the funnel" accent="blue" />
      <div className={tall ? "h-96" : "h-72"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
            <XAxis dataKey="stage" {...axisProps} angle={-25} textAnchor="end" height={70} />
            <YAxis {...axisProps} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(47,131,255,0.06)" }} />
            <Bar dataKey="count" fill="#2F83FF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function MonthlyTarget() {
  const d = useData();
  const won = d.leads.filter((l) => l.stage === "Won").reduce((s, l) => s + l.value, 0);
  const target = 2500000;
  return (
    <Panel accent="green" texture="dots" className="h-full flex flex-col">
      <PanelHead title="Monthly Target" sub="Team quota position" accent="green" />
      <div className="flex-1 grid place-items-center py-4">
        <div className="text-center">
          <div className="num text-4xl font-semibold text-foreground">{fmtQAR(won, { compact: true })}</div>
          <div className="mt-2"><StatusPill status={won >= target ? "Completed" : "In Progress"} tone={won >= target ? "success" : "info"} /></div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-[12px]"><span className="text-muted-foreground">Closed-won</span><span className="num font-medium text-foreground">{fmtQAR(won, { compact: true })}</span></div>
        <div className="flex justify-between text-[12px]"><span className="text-muted-foreground">Target</span><span className="num font-medium text-foreground">{fmtQAR(target, { compact: true })}</span></div>
        <div className="flex justify-between text-[12px]"><span className="text-muted-foreground">Remaining</span><span className="num font-medium text-foreground">{fmtQAR(Math.max(0, target - won), { compact: true })}</span></div>
      </div>
    </Panel>
  );
}

function PriorityQueue() {
  const d = useData();
  const items = useMemo(() => {
    return d.leads
      .filter((l) => l.stage !== "Won" && l.stage !== "Lost")
      .map((l) => ({ l, overdue: l.nextFollowUp ? daysFromToday(l.nextFollowUp) : 999 }))
      .filter((x) => x.overdue <= 2)
      .sort((a, b) => a.overdue - b.overdue)
      .slice(0, 6);
  }, [d.leads]);
  return (
    <Panel>
      <PanelHead title="Priority Action Queue" sub="Leads needing attention now" accent="amber" />
      <div className="space-y-2.5">
        {items.length === 0 && <div className="text-[12.5px] text-muted-foreground">All caught up. No urgent follow-ups.</div>}
        {items.map(({ l, overdue }) => (
          <AlertCard key={l.id} severity={overdue < 0 ? "critical" : "warning"} title={`${l.company} — ${l.stage}`}
            meta={[
              { k: "Value", v: fmtQAR(l.value, { compact: true }) },
              { k: "Due", v: overdue < 0 ? `${Math.abs(overdue)}d overdue` : overdue === 0 ? "Today" : `in ${overdue}d` },
            ]}
          />
        ))}
      </div>
    </Panel>
  );
}

function Leaderboard() {
  const d = useData();
  const rows = useMemo(() => {
    const sales = d.employees.filter((e) => e.department === "Sales");
    return sales.map((e) => {
      const leads = d.leads.filter((l) => l.salespersonId === e.id);
      const won = leads.filter((l) => l.stage === "Won").reduce((s, l) => s + l.value, 0);
      return { e, won, count: leads.length };
    }).sort((a, b) => b.won - a.won);
  }, [d.leads, d.employees]);
  return (
    <Panel>
      <PanelHead title="Salesperson Leaderboard" sub="Ranked by closed-won value" accent="purple" />
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.e.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2">
            <div className="w-6 text-[12px] num text-muted-foreground">#{i + 1}</div>
            <div className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{r.e.name}</div>
            <div className="num text-[11.5px] text-muted-foreground">{r.count} leads</div>
            <div className="num text-[12.5px] font-medium text-foreground">{fmtQAR(r.won, { compact: true })}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LeadSourceChart() {
  const d = useData();
  const sources = useMemo(() => {
    const map: Record<string, number> = {};
    d.leads.forEach((l) => { map[l.source] = (map[l.source] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [d.leads]);
  const colors = ["#2F83FF", "#18D5FF", "#9654FF", "#E447C4", "#20D39A", "#FFAA2C"];
  return (
    <Panel>
      <PanelHead title="Lead Source Mix" sub="Where opportunities originate" accent="magenta" />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sources} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
              {sources.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function PipelineBoard() {
  const d = useData();
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
    <Panel pad={false}>
      <div className="p-4 md:p-5">
        <PanelHead title="Pipeline Board" sub="Drag leads across stages" accent="blue" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {LEAD_STAGES.map((stage) => {
            const leads = d.leads.filter((l) => l.stage === stage);
            return (
              <div key={stage} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(stage)} className="shrink-0 w-72 rounded-xl border border-border bg-surface p-2">
                <div className="flex items-center justify-between px-1 py-1 mb-2">
                  <div className="label-xs">{stage}</div>
                  <div className="text-[10px] text-muted-foreground num">{leads.length} · {fmtQAR(stageValue(stage), { compact: true })}</div>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {leads.map((l) => {
                    const sp = d.employees.find((e) => e.id === l.salespersonId);
                    const dueDays = l.nextFollowUp ? daysFromToday(l.nextFollowUp) : null;
                    const inactive = daysFromToday(l.lastActivity) < -14;
                    return (
                      <div key={l.id} draggable onDragStart={() => setDraggingId(l.id)} onDragEnd={() => setDraggingId(null)} onClick={() => setDetail(l)}
                        className="panel-flat p-2.5 text-xs cursor-grab active:cursor-grabbing hover:border-[rgba(47,131,255,0.4)] transition-colors">
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate text-[13px] text-foreground">{l.company}</div>
                            <div className="text-muted-foreground truncate">{l.contactName}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="num font-semibold text-foreground">{fmtQAR(l.value, { compact: true })}</div>
                          <div className="text-[10px] text-muted-foreground">{l.stage}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{sp?.name?.split(" ")[0]}</span>
                          {dueDays !== null && <span className={`num ${dueDays < 0 ? "text-[#FF4664]" : dueDays <= 2 ? "text-[#FFAA2C]" : ""}`}>{dueDays < 0 ? `${Math.abs(dueDays)}d over` : `${dueDays}d`}</span>}
                        </div>
                        {inactive && l.stage !== "Won" && l.stage !== "Lost" && <div className="mt-1 text-[10px] text-[#FFAA2C]">Inactive 14+ days</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
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
                  <Field label="Next follow-up" v={detail.nextFollowUp ? fmtDate(detail.nextFollowUp) : "-"} />
                  <Field label="Stage" v={detail.stage} />
                  <Field label="Salesperson" v={d.employees.find((e) => e.id === detail.salespersonId)?.name || ""} />
                  <Field label="Source" v={detail.source} />
                  <Field label="Next follow-up" v={detail.nextFollowUp ? fmtDate(detail.nextFollowUp) : "-"} />
                </div>
                <div><div className="text-xs uppercase text-muted-foreground">Notes</div><div>{detail.notes || "-"}</div></div>
                {detail.lostReason && <div className="text-[#FF4664] text-xs">Lost reason: {detail.lostReason}</div>}
              </TabsContent>
              <TabsContent value="tl" className="mt-3"><ol className="relative ml-2 space-y-3 border-l border-border">{[detail.createdAt, detail.lastActivity].map((dt, i) => <li key={i} className="ml-4 relative"><div className="absolute w-2 h-2 rounded-full bg-signal -left-[21px] mt-1.5" /><div className="text-sm num">{fmtDate(dt)}</div><div className="text-xs text-muted-foreground">{i === 0 ? "Lead created" : "Last activity"}</div></li>)}</ol></TabsContent>
              <TabsContent value="notes" className="mt-3"><div className="text-sm">{detail.notes || "No notes."}</div></TabsContent>
            </Tabs>
            <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
const stageProb = (s: LeadStage): number => ({ "New Enquiry": 10, "Contacted": 20, "Qualified": 30, "Site Survey Required": 35, "Site Survey Scheduled": 40, "Survey Completed": 55, "Quotation Draft": 55, "Quotation Sent": 65, "Negotiation": 75, "Verbal Approval": 90, "Won": 100, "Lost": 0 }[s]);

function LeadsTable() {
  const d = useData();
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);
  const filtered = d.leads.filter((l) => (l.company + l.contactName + l.systemType).toLowerCase().includes(q.toLowerCase()));
  return (
    <Panel pad={false}>
      <div className="p-3 flex items-center gap-2"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads." className="h-9 w-64 bg-card" /></div>
      <TableShell>
        <thead><tr>{["Company","Contact","System","Value","Stage","Prob","Salesperson","Next follow","Last activity",""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map((l) => {
          const sp = d.employees.find((e) => e.id === l.salespersonId);
          return (
            <tr key={l.id}>
              <td className="font-medium text-foreground">{l.company}</td>
              <td className="text-xs">{l.contactName}<div className="text-[10px] num text-muted-foreground">{l.phone}</div></td>
              <td className="text-xs">{l.systemType}</td>
              <td className="num">{fmtQAR(l.value, {compact:true})}</td>
              <td><StatusPill status={l.stage} tone={l.stage==="Won"?"success":l.stage==="Lost"?"critical":"info"} /></td>
              
              <td className="text-xs">{sp?.name}</td>
              <td className="num text-xs">{l.nextFollowUp ? fmtDate(l.nextFollowUp) : "-"}</td>
              <td className="num text-xs text-muted-foreground">{fmtDate(l.lastActivity)}</td>
              <td><Button variant="ghost" size="sm" onClick={() => setConfirm(l.id)} className="text-[#FF4664]"><Trash2 className="w-3 h-3" /></Button></td>
            </tr>
          );
        })}</tbody>
      </TableShell>
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete lead?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (confirm) { d.deleteLead(confirm); toast.success("Lead deleted."); } setConfirm(null); }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </Panel>
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
        <Panel key={label}>
          <div className="label-xs mb-2 flex items-center justify-between"><span>{label}</span><span className="num">{list.length}</span></div>
          <div className="space-y-2">
            {list.slice(0, 8).map((l) => (<div key={l.id} className="panel-flat p-2 text-xs"><div className="font-medium truncate text-foreground">{l.company}</div><div className="text-muted-foreground">{l.stage}</div>{l.nextFollowUp && <div className="num mt-1">{fmtDate(l.nextFollowUp)}</div>}</div>))}
            {list.length===0 && <div className="text-xs text-muted-foreground">Nothing here.</div>}
          </div>
        </Panel>
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
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={() => { if (!form.company) { toast.error("Company required"); return; } d.addLead({ ...form, probability: stageProb(form.stage), createdAt: new Date().toISOString().slice(0,10), lastActivity: new Date().toISOString().slice(0,10), notes: "" }); onOpenChange(false); toast.success("Lead created."); }} className="bg-signal text-white">Create lead</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, v }: { label: string; v: React.ReactNode }) {
  return <div className="panel-flat p-2"><div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div><div className="text-sm text-foreground">{v}</div></div>;
}
