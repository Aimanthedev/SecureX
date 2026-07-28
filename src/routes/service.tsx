import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { KpiCard, PageHeader, MonoChip, StatusPill } from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
export const Route = createFileRoute("/service")({ head: () => ({ meta: [{ title: "Service and AMC | AL HARIB CCTV COMPANY" }] }), component: ServicePage });
function ServicePage() {
  const d = useData();
  return (
    <div>
      <PageHeader title="Service and AMC" subtitle="Contracts, tickets, and SLA" actions={<Button size="sm" onClick={() => toast.success("Ticket created (demo)")}>New ticket</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Active AMC" value={d.amc.filter((a) => a.renewalStatus !== "Expired").length} tone="success" />
        <KpiCard label="Expiring 30d" value={d.amc.filter((a) => daysFromToday(a.end) >= 0 && daysFromToday(a.end) <= 30).length} tone="warning" />
        <KpiCard label="Open tickets" value={d.tickets.filter((t) => t.status !== "Closed" && t.status !== "Resolved").length} />
        <KpiCard label="Annual AMC value" value={fmtQAR(d.amc.reduce((s,a)=>s+a.value,0), { compact: true })} />
      </div>
      <Tabs defaultValue="amc"><TabsList><TabsTrigger value="amc">AMC Contracts</TabsTrigger><TabsTrigger value="tk">Tickets</TabsTrigger><TabsTrigger value="pm">Preventive Maintenance</TabsTrigger></TabsList>
        <TabsContent value="amc" className="mt-3"><Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Contract","Customer","Equipment","Start","End","Frequency","Value","Next visit","Renewal"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{d.amc.map((a) => (<tr key={a.id} className="border-t hairline"><td className="py-2 px-3"><MonoChip>{a.number}</MonoChip></td><td className="py-2 px-3">{d.customers.find((c)=>c.id===a.customerId)?.name}</td><td className="py-2 px-3 text-xs">{a.equipment}</td><td className="py-2 px-3 num text-xs">{fmtDate(a.start)}</td><td className="py-2 px-3 num text-xs">{fmtDate(a.end)}</td><td className="py-2 px-3 text-xs">{a.visitFrequency}</td><td className="py-2 px-3 num">{fmtQAR(a.value, {compact:true})}</td><td className="py-2 px-3 num text-xs">{fmtDate(a.nextVisit)}</td><td className="py-2 px-3"><StatusPill status={a.renewalStatus} tone={a.renewalStatus==="Active"?"success":a.renewalStatus==="Expiring Soon"?"warning":a.renewalStatus==="Expired"?"critical":"info"} /></td></tr>))}</tbody></table></Card></TabsContent>
        <TabsContent value="tk" className="mt-3"><Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Ticket","Customer","Title","Priority","Assigned","Opened","SLA","Status"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{d.tickets.map((t) => (<tr key={t.id} className="border-t hairline"><td className="py-2 px-3"><MonoChip>{t.number}</MonoChip></td><td className="py-2 px-3">{d.customers.find((c)=>c.id===t.customerId)?.name}</td><td className="py-2 px-3 text-xs">{t.title}</td><td className="py-2 px-3"><StatusPill status={t.priority} tone={t.priority==="Critical"?"critical":t.priority==="High"?"warning":"neutral"} /></td><td className="py-2 px-3 text-xs">{d.employees.find((e)=>e.id===t.assigneeId)?.name || "-"}</td><td className="py-2 px-3 num text-xs">{fmtDate(t.opened)}</td><td className="py-2 px-3 num text-xs">{t.sla}</td><td className="py-2 px-3"><StatusPill status={t.status} tone={t.status==="Closed"?"success":t.status==="In Progress"?"info":"warning"} /></td></tr>))}</tbody></table></Card></TabsContent>
        <TabsContent value="pm" className="mt-3"><Card className="p-4"><ul className="space-y-2 text-sm">{["Physical camera inspection","Lens cleaning","Cabling and connector check","Recorder health check","Storage capacity and retention","Firmware version verification","Time sync","Backup power test","Alarm and analytics test"].map((c, i) => (<li key={c} className="flex items-center gap-2"><input type="checkbox" defaultChecked={i<5} className="accent-signal" /> {c}</li>))}</ul></Card></TabsContent>
      </Tabs>
    </div>
  );
}
