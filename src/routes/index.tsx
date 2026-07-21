import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useData } from "@/lib/data-context";
import { KpiCard, PageHeader, HealthBadge, ProgressBar, MonoChip, StatusPill, Ring } from "@/components/app/common";
import { fmtQAR, fmtNum, fmtDate, daysFromToday } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardCheck, Package, Users2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Command Center | AL HARIB CCTV COMPANY" }, { name: "description", content: "Live operations overview for AL HARIB CCTV COMPANY." }] }),
  component: CommandCenter,
});

function CommandCenter() {
  const d = useData();
  const nav = useNavigate();
  const projectsWithHealth = useMemo(() => d.projects.map((p) => ({ p, h: d.computeHealth(p, d.approvals, d.devices, d.materials) })), [d]);
  const active = projectsWithHealth.length;
  const atRisk = projectsWithHealth.filter((x) => x.h.label === "At Risk" || x.h.label === "Delayed" || x.h.label === "Awaiting Materials").length;
  const delayed = projectsWithHealth.filter((x) => x.h.label === "Delayed").length;
  const openQuotes = d.quotations.filter((q) => q.status === "Sent" || q.status === "Draft" || (q.status as string) === "Negotiation").length;
  const pipeline = d.leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").reduce((s, l) => s + l.value * (l.probability / 100), 0);
  const revenue = d.projects.reduce((s, p) => s + p.contractValue, 0);
  const outstanding = d.projects.reduce((s, p) => s + (p.invoiced - p.collected), 0);
  const activeAmc = d.amc.filter((a) => a.renewalStatus !== "Expired").length;

  const alerts = useMemo(() => {
    const items: { severity: "critical"|"warning"|"info"; title: string; sub: string; owner: string; action: string; go: () => void }[] = [];
    projectsWithHealth.forEach(({ p, h }) => {
      h.drivers.filter((x) => x.severity !== "info").forEach((dr) => {
        items.push({ severity: dr.severity, title: dr.text, sub: `${p.number} · ${p.name}`, owner: d.employees.find((e) => e.id === p.pmId)?.name || "", action: "Open project", go: () => nav({ to: "/projects/$id", params: { id: p.id } }) });
      });
    });
    d.purchaseOrders.filter((po) => po.deliveryStatus === "Overdue").forEach((po) => items.push({ severity: "critical", title: `PO ${po.number} overdue`, sub: `${po.supplier} · ${fmtQAR(po.amount)}`, owner: "Aisha Rahman", action: "Open PO", go: () => nav({ to: "/procurement" }) }));
    d.amc.filter((a) => a.renewalStatus === "Expiring Soon" || a.renewalStatus === "Expired").forEach((a) => {
      const days = daysFromToday(a.end);
      items.push({ severity: days < 0 ? "critical" : "warning", title: `AMC ${a.number} ${days < 0 ? "expired" : `expires in ${days} days`}`, sub: `${d.customers.find((c) => c.id === a.customerId)?.name || ""}`, owner: "Bilal Farooq", action: "Open AMC", go: () => nav({ to: "/service" }) });
    });
    d.approvals.filter((a) => a.status === "Pending" && a.critical).forEach((a) => items.push({ severity: "warning", title: `Approval pending: ${a.title}`, sub: `Owner: ${a.owner}`, owner: a.owner, action: "Open approval", go: () => nav({ to: "/projects/$id", params: { id: a.projectId } }) }));
    return items.sort((a, b) => (a.severity === "critical" ? -1 : 0) - (b.severity === "critical" ? -1 : 0)).slice(0, 12);
  }, [projectsWithHealth, d, nav]);

  const stackData = useMemo(() => {
    const byPhase: Record<string, number> = {};
    d.projects.forEach((p) => { byPhase[p.phase] = (byPhase[p.phase] || 0) + 1; });
    return Object.entries(byPhase).map(([phase, count]) => ({ phase, count }));
  }, [d.projects]);

  const funnelData = useMemo(() => {
    const stages = ["Qualified","Site Survey Scheduled","Survey Completed","Quotation Sent","Negotiation","Verbal Approval","Won"] as const;
    return stages.map((s, i) => ({ name: s, value: 100 - i * 12, fill: ["#3b82c4","#4f8fc9","#65a5c9","#7bb0c5","#8dbdc0","#a2c8b2","#1f9d63"][i] }));
  }, []);

  const totalCameras = d.devices.length;
  const installed = d.devices.filter((x) => x.status !== "Faulty").length;
  const configured = d.devices.filter((x) => x.status === "Configured" || x.status === "Tested" || x.status === "Handed Over").length;
  const tested = d.devices.filter((x) => x.status === "Tested" || x.status === "Handed Over").length;
  const failed = d.devices.filter((x) => x.testResult === "Fail").length;

  return (
    <div>
      <PageHeader title="Command Center" subtitle="Today, 20 Jul 2026 · Live view of sales, projects, service, and financials"
        actions={<><Button variant="outline" size="sm">Last 30 days</Button><Button size="sm" className="bg-signal text-signal-foreground hover:bg-signal/90">Weekly briefing</Button></>} />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="Active projects" value={active} delta="+1" spark={[3,4,4,3,4]} onClick={() => nav({ to: "/projects" })} />
        <KpiCard label="Projects at risk" value={atRisk} sub="Review recommended" tone="critical" spark={[0,1,1,2,2]} onClick={() => nav({ to: "/projects" })} />
        <KpiCard label="Delayed" value={delayed} tone="warning" spark={[0,0,1,1,0]} />
        <KpiCard label="Open quotations" value={openQuotes} delta="+2" spark={[1,2,3,3,4]} onClick={() => nav({ to: "/quotations" })} />
        <KpiCard label="Weighted pipeline" value={fmtQAR(pipeline, { compact: true })} delta="+8%" spark={[6,7,7,8,9]} onClick={() => nav({ to: "/sales" })} />
        <KpiCard label="Revenue under execution" value={fmtQAR(revenue, { compact: true })} spark={[10,10,11,12,12]} />
        <KpiCard label="Outstanding collections" value={fmtQAR(outstanding, { compact: true })} tone="warning" sub="12 items aged" spark={[3,3,4,4,4]} />
        <KpiCard label="Active AMC" value={activeAmc} spark={[2,2,2,3,3]} onClick={() => nav({ to: "/service" })} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        <Card className="xl:col-span-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display font-semibold text-lg">Requires Attention</h3>
              <p className="text-xs text-muted-foreground">Prioritized signals from projects, procurement, service, and approvals.</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="divide-y hairline">
            {alerts.map((a, i) => (
              <div key={i} className="py-3 flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.severity === "critical" ? "bg-critical" : a.severity === "warning" ? "bg-warning" : "bg-signal"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.sub} · Owner: {a.owner}</div>
                </div>
                <StatusPill status={a.severity === "critical" ? "Critical" : a.severity === "warning" ? "Warning" : "Info"} tone={a.severity === "critical" ? "critical" : a.severity === "warning" ? "warning" : "info"} />
                <Button variant="ghost" size="sm" onClick={a.go} className="shrink-0">{a.action} <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3">Portfolio Health</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="phase" width={120} fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="count" fill="var(--signal)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-xs text-muted-foreground">On Track</div><div className="num text-lg font-semibold text-success">{projectsWithHealth.filter((x) => x.h.label === "On Track").length}</div></div>
            <div><div className="text-xs text-muted-foreground">Watch</div><div className="num text-lg font-semibold text-warning">{projectsWithHealth.filter((x) => x.h.label === "Watch").length}</div></div>
            <div><div className="text-xs text-muted-foreground">At Risk</div><div className="num text-lg font-semibold text-critical">{projectsWithHealth.filter((x) => x.h.label === "At Risk" || x.h.label === "Delayed").length}</div></div>
          </div>
        </Card>
      </div>

      <Card className="p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-lg">Project Progress</h3>
          <Button variant="ghost" size="sm" onClick={() => nav({ to: "/projects" })}>Open Projects</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b hairline">
              <tr><th className="text-left py-2 pr-3">Project</th><th className="text-left py-2 pr-3">Client</th><th className="text-left py-2 pr-3">PM</th><th className="text-left py-2 pr-3">Phase</th><th className="text-left py-2 pr-3 w-52">Planned vs Actual</th><th className="text-right py-2 pr-3">Value</th><th className="text-left py-2 pr-3">Health</th><th className="text-left py-2 pr-3">Next milestone</th><th className="py-2"></th></tr>
            </thead>
            <tbody>
              {projectsWithHealth.map(({ p, h }) => {
                const cust = d.customers.find((c) => c.id === p.customerId)!;
                const pm = d.employees.find((e) => e.id === p.pmId)!;
                const nextMs = d.milestones.filter((m) => m.projectId === p.id && !m.done)[0];
                return (
                  <tr key={p.id} className="border-b hairline hover:bg-muted/40 cursor-pointer" onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })}>
                    <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><MonoChip>{p.number}</MonoChip><span className="text-sm">{p.name}</span></div></td>
                    <td className="py-2.5 pr-3 text-sm">{cust.name}</td>
                    <td className="py-2.5 pr-3 text-sm">{pm.name}</td>
                    <td className="py-2.5 pr-3"><StatusPill status={p.phase} tone="info" /></td>
                    <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><ProgressBar value={p.actualProgress} planned={p.plannedProgress} /><span className="num text-xs w-16 text-right">{p.actualProgress}% / {p.plannedProgress}%</span></div></td>
                    <td className="py-2.5 pr-3 num text-right text-sm">{fmtQAR(p.contractValue, { compact: true })}</td>
                    <td className="py-2.5 pr-3"><HealthBadge label={h.label} /></td>
                    <td className="py-2.5 pr-3 text-xs">{nextMs ? <>{nextMs.title} · <span className="num">{fmtDate(nextMs.planned)}</span></> : "-"}</td>
                    <td className="py-2.5"><ArrowRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Users2 className="w-4 h-4" /> Today's Operations</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[{ l: "Teams on site", v: 3 }, { l: "Visits today", v: 5 }, { l: "Installs today", v: 6 }, { l: "Testing today", v: 4 }, { l: "Materials due", v: 2 }, { l: "Overdue tasks", v: 3 }].map((x) => (
              <div key={x.l} className="border hairline rounded-md p-2"><div className="text-[10px] uppercase text-muted-foreground">{x.l}</div><div className="num text-xl font-semibold">{x.v}</div></div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3">Sales Funnel</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart><Tooltip contentStyle={{ fontSize: 12 }} /><Funnel dataKey="value" data={funnelData} isAnimationActive><LabelList position="right" fill="var(--foreground)" stroke="none" dataKey="name" fontSize={11} /></Funnel></FunnelChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Installation Progress</h3>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <Ring value={(installed / totalCameras) * 100} label="Installed" />
            <Ring value={(configured / totalCameras) * 100} label="Configured" />
            <Ring value={(tested / totalCameras) * 100} label="Tested" />
          </div>
          <div className="mt-4 text-xs text-muted-foreground flex items-center justify-between">
            <span>Planned <span className="num text-foreground">{totalCameras}</span></span>
            <span>Failed <span className="num text-critical">{failed}</span></span>
            <span>Handed <span className="num text-foreground">0</span></span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3">Financial Snapshot</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Kpi label="Contracted" v={fmtQAR(d.projects.reduce((s,p)=>s+p.contractValue,0), { compact: true })} />
            <Kpi label="Invoiced" v={fmtQAR(d.projects.reduce((s,p)=>s+p.invoiced,0), { compact: true })} />
            <Kpi label="Collected" v={fmtQAR(d.projects.reduce((s,p)=>s+p.collected,0), { compact: true })} />
            <Kpi label="Outstanding" v={fmtQAR(outstanding, { compact: true })} tone="warning" />
            <Kpi label="Expected this month" v={fmtQAR(153000, { compact: true })} />
            <Kpi label="Forecast margin" v="28.4%" tone="success" />
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3">Payment Aging</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ b: "0-30", v: 92000 }, { b: "31-60", v: 48000 }, { b: "61-90", v: 22000 }, { b: "90+", v: 12000 }]}>
                <XAxis dataKey="b" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => fmtQAR(v)} />
                <Bar dataKey="v" fill="var(--warning)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
function Kpi({ label, v, tone }: { label: string; v: React.ReactNode; tone?: "success"|"warning" }) {
  return <div className="border hairline rounded-md p-2"><div className="text-[10px] uppercase text-muted-foreground">{label}</div><div className={`num text-lg font-semibold ${tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : ""}`}>{v}</div></div>;
}
