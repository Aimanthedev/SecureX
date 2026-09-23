import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import {
  MetricCard, Panel, PanelHead, Donut, StatusPill, HealthBadge, MonoChip, WorkStatusBadge, projectStatus,
  Segmented, QuickAction, AlertCard, TableShell, axisProps, ChartTooltip, ACCENT,
} from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { buildAlerts } from "@/lib/alerts";
import {
  ArrowRight, Wallet, TrendingUp, Banknote, HardHat, Camera, ClipboardCheck, Package,
  FileSignature, CircleDollarSign, AlertTriangle, Plus, FileBarChart, Radio, Building2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Command Center | SecureX CCTV COMPANY" },
    { name: "description", content: "Live operations command center for SecureX CCTV COMPANY — projects, pipeline, collections and field execution." },
    { property: "og:title", content: "Command Center | SecureX CCTV COMPANY" },
    { property: "og:description", content: "Live operations command center for SecureX CCTV COMPANY." },
  ] }),
  component: CommandCenter,
});

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS = ALL_MONTHS.slice(1, 8);

function CommandCenter() {
  const d = useData();
  const nav = useNavigate();
  const [month, setMonth] = useState("Jul");
  const [range, setRange] = useState<"m" | "q" | "y">("q");

  const projectsWithHealth = useMemo(
    () => d.projects.map((p) => ({ p, h: d.computeHealth(p, d.approvals, d.devices, d.materials) })),
    [d],
  );
  const active = projectsWithHealth.length;
  const atRisk = projectsWithHealth.filter((x) => x.h.label !== "On Track").length;
  const pipeline = d.leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").reduce((s, l) => s + l.value * (l.probability / 100), 0);
  const revenue = d.projects.reduce((s, p) => s + p.contractValue, 0);
  const invoiced = d.projects.reduce((s, p) => s + p.invoiced, 0);
  const collected = d.projects.reduce((s, p) => s + p.collected, 0);
  const outstanding = invoiced - collected;
  const inProgressCount = projectsWithHealth.filter((x) => projectStatus(x.p, x.h.label) === "In Progress").length;
  const completedCount = projectsWithHealth.filter((x) => projectStatus(x.p, x.h.label) === "Completed").length;

  const execData = useMemo(() => {
    const months = range === "m" ? ALL_MONTHS.slice(5, 8) : range === "y" ? ALL_MONTHS : MONTHS;
    return months.map((m, i) => ({
      m,
      planned: 12 + i * 2 + ((i * 13) % 4),
      actual: 9 + i * 2 + ((i * 7) % 5),
      completed: 120 + i * 26,
      delayed: 60 - i * 5 + ((i * 11) % 14),
    }));
  }, [range]);

  const distribution = useMemo(() => {
    const byPhase: Record<string, number> = {};
    d.projects.forEach((p) => { byPhase[p.phase] = (byPhase[p.phase] || 0) + 1; });
    const order = ["Installation", "Testing", "Procurement", "Handover", "Maintenance"];
    const colors = ["#2F83FF", "#18D5FF", "#9654FF", "#E447C4", "#20D39A"];
    const known = order.map((name, i) => ({ name, value: byPhase[name] || 0, color: colors[i] }));
    Object.entries(byPhase).filter(([k]) => !order.includes(k)).forEach(([name, value], i) => {
      known.push({ name, value, color: colors[(order.length + i) % colors.length] });
    });
    return known.filter((x) => x.value > 0);
  }, [d.projects]);

  const alerts = useMemo(() => buildAlerts(d).slice(0, 6).map((a) => ({
    severity: a.severity === "info" ? "warning" as const : a.severity,
    title: a.title, sub: a.sub, owner: a.owner, action: "Open",
    go: () => { if (a.path) nav({ to: a.path as never }); },
  })), [d, nav]);

  const totalCameras = d.devices.length;
  const tested = d.devices.filter((x) => x.status === "Tested" || x.status === "Handed Over").length;

  const recent = useMemo(() => {
    const rows: { icon: any; accent: keyof typeof ACCENT; title: string; activity: string; owner: string; value: string; status: string; tone: any; time: string }[] = [];
    d.projects.slice(0, 6).forEach((p, i) => {
      const pm = d.employees.find((e) => e.id === p.pmId)?.name || "—";
      const set = [
        { icon: Camera, accent: "blue" as const, activity: "Cameras installed", value: `${8 + i * 2} units`, status: "Completed", tone: "success", time: `${i + 1}h ago` },
        { icon: ClipboardCheck, accent: "cyan" as const, activity: "Site survey completed", value: "24 points", status: "Reviewed", tone: "info", time: `${i + 3}h ago` },
        { icon: Package, accent: "purple" as const, activity: "Material request approved", value: fmtQAR(18400 + i * 3100, { compact: true }), status: "Approved", tone: "purple", time: `${i + 5}h ago` },
        { icon: FileSignature, accent: "magenta" as const, activity: "Work order issued", value: fmtQAR(126000 + i * 8400, { compact: true }), status: "In Progress", tone: "info", time: "Yesterday" },
        { icon: CircleDollarSign, accent: "green" as const, activity: "Client payment received", value: fmtQAR(74000 + i * 5200, { compact: true }), status: "Cleared", tone: "success", time: "Yesterday" },
        { icon: AlertTriangle, accent: "red" as const, activity: "Testing failure reported", value: "2 devices", status: "Open", tone: "critical", time: "2 days ago" },
      ][i % 6];
      rows.push({ ...set, title: p.name, owner: pm });
    });
    return rows;
  }, [d]);

  return (
    <div className="space-y-4">
      {/* Top metric row */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rise rise-1 h-full"><MetricCard label="Active project value" value={fmtQAR(revenue, { compact: true })} delta="+12.4%" sub="vs last quarter" accent="blue" motif="camera" icon={<Wallet className="h-3.5 w-3.5" />} spark={[8, 9, 9, 10, 11, 12, 13]} onClick={() => nav({ to: "/projects" })} /></div>
        <div className="rise rise-2 h-full"><MetricCard label="Open sales pipeline" value={fmtQAR(pipeline, { compact: true })} delta="+8.1%" sub="weighted forecast" accent="purple" motif="nodes" icon={<TrendingUp className="h-3.5 w-3.5" />} spark={[6, 7, 6, 8, 9, 9, 11]} onClick={() => nav({ to: "/sales" })} /></div>
        <div className="rise rise-3 h-full"><MetricCard label="Outstanding collections" value={fmtQAR(outstanding, { compact: true })} delta="-3.2%" sub="12 invoices aged" accent="amber" motif="channels" icon={<Banknote className="h-3.5 w-3.5" />} spark={[9, 9, 8, 8, 7, 7, 6]} onClick={() => nav({ to: "/reports" })} /></div>
        <div className="rise rise-4 h-full"><MetricCard label="Active projects" value={String(active)} delta="+1" sub={`${atRisk} need attention`} accent="cyan" motif="waves" icon={<HardHat className="h-3.5 w-3.5" />} spark={[4, 4, 5, 5, 6, 6, 6]} onClick={() => nav({ to: "/projects" })} /></div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Main analytics */}
        <div className="space-y-4 xl:col-span-8">
          <Panel className="rise rise-2" texture="grid">
            <PanelHead
              title="Project Execution Performance"
              sub="Planned versus completed delivery milestones each month"
              icon={<BarChart3Icon />}
              right={<Segmented size="sm" value={range} onChange={setRange} options={[{ value: "m", label: "Month" }, { value: "q", label: "Quarter" }, { value: "y", label: "Year" }]} />}
            />
            <div className="mb-4 flex flex-wrap gap-6">
              <Legend color="#2F83FF" label="Projects in progress" value={String(inProgressCount)} />
              <Legend color="rgba(133,164,204,0.35)" label="Projects completed" value={String(completedCount)} />
              <Legend color="#20D39A" label="Completed value" value={fmtQAR(collected, { compact: true })} />
              <Legend color="#FF4664" label="Delayed value" value={fmtQAR(outstanding * 0.4, { compact: true })} />
            </div>
            <div className="h-[248px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={execData} barGap={4} onClick={(e: any) => e?.activeLabel && setMonth(e.activeLabel)}>
                  <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
                  <XAxis dataKey="m" {...axisProps} />
                  <YAxis {...axisProps} width={34} />
                  <Tooltip cursor={{ fill: "rgba(47,131,255,0.06)" }} content={<ChartTooltip formatter={(v: number) => `${v} milestones`} />} />
                  <Bar dataKey="planned" name="Planned" radius={[6, 6, 0, 0]} maxBarSize={16}>
                    {execData.map((r) => <Cell key={r.m} fill="rgba(133,164,204,0.16)" />)}
                  </Bar>
                  <Bar dataKey="actual" name="Actual" radius={[6, 6, 0, 0]} maxBarSize={16}>
                    {execData.map((r) => <Cell key={r.m} fill={r.m === month ? "#2F83FF" : "rgba(47,131,255,0.35)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Recent operations */}
          <Panel className="rise rise-4" pad={false}>
            <div className="p-4 md:p-5 pb-0">
              <PanelHead
                title="Recent Operations"
                sub="Latest execution, commercial and field activity"
                icon={<Radio className="h-4 w-4" />}
                accent="cyan"
                right={<button onClick={() => nav({ to: "/projects" })} className="text-[11.5px] font-medium text-signal hover:underline">View all</button>}
              />
            </div>
            <div className="divide-y divide-[rgba(133,164,204,0.07)]">
              {recent.map((r, i) => {
                const a = ACCENT[r.accent];
                const Icon = r.icon;
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[rgba(47,131,255,0.05)] md:px-5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border" style={{ background: a.soft, borderColor: a.ring, color: a.hex }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{r.activity}</div>
                      <div className="truncate text-[11px] text-[#66778D]">{r.title} · {r.owner}</div>
                    </div>
                    <div className="num hidden w-28 shrink-0 text-right text-[12.5px] font-semibold sm:block">{r.value}</div>
                    <div className="hidden shrink-0 sm:block"><StatusPill status={r.status} tone={r.tone} /></div>
                    <div className="w-16 shrink-0 text-right text-[10.5px] text-[#66778D]">{r.time}</div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Portfolio table */}
          <Panel className="rise rise-5" pad={false}>
            <div className="p-4 md:p-5 pb-4">
              <PanelHead title="Live Project Portfolio" sub="Planned versus actual delivery across all active contracts" icon={<Building2 className="h-4 w-4" />} accent="purple" />
            </div>
            <TableShell className="rounded-none border-0">
              <thead>
                <tr>
                  <th>Project</th><th>Customer</th><th>Phase</th><th className="w-40">Status</th>
                  <th className="ta-right">Value</th><th>Health</th><th>Next milestone</th><th />
                </tr>
              </thead>
              <tbody>
                {projectsWithHealth.map(({ p, h }) => {
                  const cust = d.customers.find((c) => c.id === p.customerId);
                  const nextMs = d.milestones.filter((m) => m.projectId === p.id && !m.done)[0];
                  return (
                    <tr key={p.id} className="cursor-pointer" onClick={() => nav({ to: "/projects/$id", params: { id: p.id } })}>
                      <td><div className="flex items-center gap-2"><MonoChip>{p.number}</MonoChip><span className="font-medium">{p.name}</span></div></td>
                      <td className="text-muted-foreground">{cust?.name}</td>
                      <td><StatusPill status={p.phase} tone="info" /></td>
                      <td><WorkStatusBadge status={projectStatus(p, h.label)} /></td>
                      <td className="num ta-right font-semibold">{fmtQAR(p.contractValue, { compact: true })}</td>
                      <td><HealthBadge label={h.label} /></td>
                      <td className="text-[11.5px] text-muted-foreground">{nextMs ? <>{nextMs.title} · <span className="num">{fmtDate(nextMs.planned)}</span></> : "—"}</td>
                      <td><ArrowRight className="h-3.5 w-3.5 text-[#66778D]" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </TableShell>
          </Panel>
        </div>

        {/* Right intelligence column */}
        <div className="space-y-4 xl:col-span-4">
          {/* Portfolio card */}
          <div className="rise rise-3 relative overflow-hidden rounded-[22px] p-5 text-white"
            style={{ background: "linear-gradient(150deg,#2F83FF 0%,#5B4BE8 46%,#9654FF 100%)", boxShadow: "0 30px 60px -32px rgba(47,131,255,0.8)" }}>
            <div className="pointer-events-none absolute inset-0 opacity-30" style={{
              backgroundImage: "radial-gradient(circle at 85% 12%, rgba(24,213,255,0.75), transparent 42%), radial-gradient(circle at 10% 100%, rgba(228,71,196,0.5), transparent 45%)",
            }} />
            <svg className="pointer-events-none absolute -right-6 bottom-0 h-32 w-48 opacity-25" viewBox="0 0 190 120" fill="none" stroke="white" strokeWidth="1">
              <path d="M10 110 a90 90 0 0 1 150 -66" /><path d="M34 110 a66 66 0 0 1 110 -48" /><path d="M58 110 a42 42 0 0 1 70 -30" />
            </svg>
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-white/70">Project portfolio</div>
                  <div className="num mt-2 text-[30px] font-semibold leading-none">{fmtQAR(revenue, { compact: true })}</div>
                  <div className="mt-1 text-[11.5px] text-white/75">Total active contract value</div>
                </div>
                <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                  {atRisk > 2 ? "Watch" : "Healthy"}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] text-white/80">
                <span>Portfolio status</span>
                <span className="num font-semibold text-white">{inProgressCount} in progress · {completedCount} completed</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[{ l: "Active sites", v: String(active) }, { l: "At risk", v: String(atRisk) }, { l: "Deadlines", v: String(d.milestones.filter((m) => !m.done).length) }].map((x) => (
                  <div key={x.l} className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-2">
                    <div className="num text-lg font-semibold leading-none">{x.v}</div>
                    <div className="mt-1 text-[9.5px] uppercase tracking-wider text-white/70">{x.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Panel className="rise rise-4">
            <PanelHead title="Quick Actions" sub="Most used operations" icon={<Plus className="h-4 w-4" />} />
            <div className="grid grid-cols-4 gap-2">
              <QuickAction icon={<HardHat className="h-5 w-5" />} label="New Project" accent="blue" onClick={() => { d.requestCreate("project"); nav({ to: "/projects" }); }} />
              <QuickAction icon={<Camera className="h-5 w-5" />} label="Site Update" accent="cyan" onClick={() => nav({ to: "/field" })} />
              <QuickAction icon={<FileBarChart className="h-5 w-5" />} label="Report" accent="purple" onClick={() => nav({ to: "/reports" })} />
              <QuickAction icon={<AlertTriangle className="h-5 w-5" />} label="Alert" accent="red" onClick={() => nav({ to: "/notifications" })} />
            </div>
          </Panel>

          <Panel className="rise rise-5" accent="purple">
            <PanelHead title="Project Distribution" sub="Portfolio by delivery phase" icon={<Building2 className="h-4 w-4" />} accent="purple" />
            <Donut data={distribution} size={150} centerValue={String(active)} centerLabel="Projects" />
          </Panel>

          <Panel className="rise rise-6" accent="red">
            <PanelHead
              title="Requires Attention"
              sub="Prioritised operational signals"
              icon={<AlertTriangle className="h-4 w-4" />}
              accent="red"
            />
            <div className="space-y-2.5">
              {alerts.map((a, i) => (
                <AlertCard
                  key={i}
                  severity={a.severity}
                  title={a.title}
                  meta={[{ k: "Owner", v: a.owner }, { k: "Ref", v: a.sub }]}
                  action={a.action}
                  onAction={a.go}
                />
              ))}
            </div>
          </Panel>

          <Panel className="rise rise-6" accent="cyan" texture="dots">
            <PanelHead title="Installation Lifecycle" sub="Device counts across the portfolio" icon={<Camera className="h-4 w-4" />} accent="cyan" />
            <div className="space-y-2">
              {[
                { l: "Planned", v: totalCameras, a: "blue" as const },
                { l: "Mounted", v: d.devices.filter((x) => x.status !== "Faulty").length, a: "cyan" as const },
                { l: "Configured", v: d.devices.filter((x) => ["Configured", "Tested", "Handed Over"].includes(x.status)).length, a: "purple" as const },
                { l: "Tested", v: tested, a: "magenta" as const },
                { l: "Failed", v: d.devices.filter((x) => x.testResult === "Fail").length, a: "red" as const },
              ].map((s) => (
                <div key={s.l} className="flex items-center justify-between rounded-xl border border-[rgba(133,164,204,0.10)] bg-[rgba(133,164,204,0.04)] px-3 py-2 text-[11.5px]">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT[s.a].hex, boxShadow: `0 0 8px ${ACCENT[s.a].hex}` }} />
                    {s.l}
                  </span>
                  <span className="num font-semibold text-foreground">{s.v} of {totalCameras}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#66778D]">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}
      </div>
      <div className="num mt-1 text-[15px] font-semibold">{value}</div>
    </div>
  );
}

function BarChart3Icon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21h18" /><path d="M7 21V9" /><path d="M12 21V4" /><path d="M17 21v-7" /></svg>;
}
