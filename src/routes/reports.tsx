import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, StatTile, Panel, PanelHead, axisProps, ChartTooltip } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { fmtQAR } from "@/lib/format";
import { TableShell, MonoChip, StatusPill } from "@/components/app/common";
import { getProjectCurrentValue, getProjectCollected, getProjectOutstanding, getProjectPlannedProgress, getProjectActualProgress } from "@/lib/project-selectors";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [
    { title: "Reports | SecureX CCTV COMPANY" },
    { name: "description", content: "Executive, project, sales, financial and compliance analytics across the business." },
    { property: "og:title", content: "Reports | SecureX CCTV COMPANY" },
    { property: "og:description", content: "Executive, project, sales, financial and compliance analytics across the business." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ReportsPage,
});

const CATS = ["Executive", "Project", "Sales", "Financial", "Service and AMC", "Compliance and Quality"];

function ReportsPage() {
  const d = useData();
  const planActual = d.projects.map((p) => {
    const devs = d.devices.filter((x) => x.projectId === p.id);
    return {
      name: p.number.split("-").pop(),
      planned: devs.length,
      actual: devs.filter((x) => x.status === "Installed" || x.status === "Configured" || x.status === "Tested" || x.status === "Handed Over").length,
    };
  });
  const cams = [
    { name: "Planned", v: d.devices.length },
    { name: "Installed", v: d.devices.filter((x) => x.status !== "Faulty").length },
    { name: "Tested", v: d.devices.filter((x) => x.testResult === "Pass").length },
    { name: "Failed", v: d.devices.filter((x) => x.testResult === "Fail").length },
  ];
  const collected = [{ m: "Feb", v: 120000 }, { m: "Mar", v: 180000 }, { m: "Apr", v: 260000 }, { m: "May", v: 340000 }, { m: "Jun", v: 410000 }, { m: "Jul", v: 305000 }];
  const totalContract = d.projects.reduce((s, p) => s + getProjectCurrentValue(d.selectorCtx, p.id), 0);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#2F83FF] shadow-[0_0_8px_#2F83FF]" />Business Intelligence</>}
        title="Reports"
        subtitle="Business answers, not decoration"
        actions={
          <>
            <Button variant="outline" size="sm" className="border-input bg-transparent" onClick={() => toast("Saved view")}>Save view</Button>
            <Button variant="outline" size="sm" className="border-input bg-transparent" onClick={() => toast("CSV exported (demo)")}>Export CSV</Button>
            <Button size="sm" className="bg-signal text-white hover:bg-signal/90" onClick={() => window.print()}>Print</Button>
          </>
        }
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Projects" value={d.projects.length} accent="blue" />
        <StatTile label="Contract Value" value={fmtQAR(totalContract, { compact: true })} accent="purple" />
        <StatTile label="Cameras Tested" value={cams[2].v} accent="cyan" />
        <StatTile label="Test Failures" value={cams[3].v} accent="red" />
      </div>

      <Tabs defaultValue={CATS[0]} className="rise rise-2">
        <TabsList>{CATS.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}</TabsList>

        <TabsContent value="Executive" className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel accent="blue" texture="grid">
            <PanelHead title="Planned vs Installed Devices" sub="By project" accent="blue" />
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={planActual}>
                  <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(47,131,255,0.06)" }} />
                  <Bar dataKey="planned" fill="rgba(133,164,204,0.35)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="actual" fill="#2F83FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel accent="purple" texture="grid">
            <PanelHead title="Camera Funnel" sub="Planned vs installed vs tested" accent="purple" />
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={cams}>
                  <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(150,84,255,0.06)" }} />
                  <Bar dataKey="v" fill="#9654FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel accent="cyan" texture="grid" className="lg:col-span-2">
            <PanelHead title="Collections Trend" sub="Monthly cash collected" accent="cyan" />
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={collected}>
                  <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
                  <XAxis dataKey="m" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip content={<ChartTooltip formatter={(v: number) => fmtQAR(v)} />} cursor={{ fill: "rgba(24,213,255,0.06)" }} />
                  <Line type="monotone" dataKey="v" stroke="#18D5FF" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="Project" className="mt-3">
          <TableShell>
            <thead><tr>{["Project", "Customer", "Phase", "Planned %", "Actual %", "Variance", "Cameras", "Tests passed"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr></thead>
            <tbody>{d.projects.map((p) => {
              const cust = d.customers.find((c) => c.id === p.customerId);
              const devs = d.devices.filter((x) => x.projectId === p.id);
              const passed = devs.filter((x) => x.testResult === "Pass").length;
              const planned = getProjectPlannedProgress(d.selectorCtx, p.id);
              const actual = getProjectActualProgress(d.selectorCtx, p.id);
              const variance = actual - planned;
              return (
                <tr key={p.id}>
                  <td><MonoChip>{p.number}</MonoChip> <span className="ml-1 text-foreground">{p.name}</span></td>
                  <td className="text-xs text-muted-foreground">{cust?.name}</td>
                  <td><StatusPill status={p.phase} tone="info" /></td>
                  <td className="num text-xs">{planned}%</td>
                  <td className="num text-xs">{actual}%</td>
                  <td className="num text-xs" style={{ color: variance < 0 ? "#FF4664" : "#20D39A" }}>{variance > 0 ? "+" : ""}{variance}%</td>
                  <td className="num text-xs">{devs.length}</td>
                  <td className="num text-xs">{passed}/{devs.length}</td>
                </tr>
              );
            })}</tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="Financial" className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel accent="green" texture="grid">
            <PanelHead title="Contract Value vs Collected" sub="By project" accent="green" />
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={d.projects.map((p) => ({ name: p.number.split("-").pop(), contract: getProjectCurrentValue(d.selectorCtx, p.id), collected: getProjectCollected(d.selectorCtx, p.id) }))}>
                  <CartesianGrid stroke="rgba(133,164,204,0.07)" vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={(v) => fmtQAR(v, { compact: true })} />
                  <Tooltip content={<ChartTooltip formatter={(v: number) => fmtQAR(v)} />} cursor={{ fill: "rgba(32,211,154,0.06)" }} />
                  <Bar dataKey="contract" fill="rgba(133,164,204,0.35)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="collected" fill="#20D39A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel accent="amber" texture="grid">
            <PanelHead title="Outstanding by Project" sub="Invoiced minus collected" accent="amber" />
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={d.projects.map((p) => ({ name: p.number.split("-").pop(), value: Math.max(0, getProjectOutstanding(d.selectorCtx, p.id)) }))} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {d.projects.map((_, i) => <Cell key={i} fill={["#FFAA2C", "#FF4664", "#2F83FF", "#9654FF"][i % 4]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip formatter={(v: number) => fmtQAR(v)} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel accent="blue" texture="dots" className="lg:col-span-2">
            <PanelHead title="Payment Milestones" sub="Status across all projects" accent="blue" />
            <TableShell>
              <thead><tr>{["Project", "Milestone", "Amount", "Due", "Status"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr></thead>
              <tbody>{d.payments.map((pay) => {
                const proj = d.projects.find((p) => p.id === pay.projectId);
                return (
                  <tr key={pay.id}>
                    <td><MonoChip>{proj?.number}</MonoChip></td>
                    <td className="text-xs text-muted-foreground">{pay.label}</td>
                    <td className="num text-xs">{fmtQAR(pay.amount)}</td>
                    <td className="num text-xs">{pay.dueDate}</td>
                    <td><StatusPill status={pay.status} tone={pay.status === "Collected" ? "success" : pay.status === "Overdue" ? "critical" : "warning"} /></td>
                  </tr>
                );
              })}</tbody>
            </TableShell>
          </Panel>
        </TabsContent>

        {["Sales", "Service and AMC", "Compliance and Quality"].map((c) => (
          <TabsContent key={c} value={c} className="mt-3">
            <Panel accent="blue" texture="dots">
              <p className="text-sm text-muted-foreground">This category reuses the pipeline / AMC / compliance data already tracked on the Sales, Service and Project pages — open those modules for full drill-down. A dedicated chart set for this category is the next reporting build-out.</p>
            </Panel>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
