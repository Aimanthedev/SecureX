import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, StatTile, TableShell, Panel, PanelHead } from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/service")({
  head: () => ({ meta: [
    { title: "Service and AMC | SecureX CCTV COMPANY" },
    { name: "description", content: "AMC contracts, service tickets, SLA tracking and preventive maintenance checklists." },
    { property: "og:title", content: "Service and AMC | SecureX CCTV COMPANY" },
    { property: "og:description", content: "AMC contracts, service tickets, SLA tracking and preventive maintenance checklists." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ServicePage,
});

const PM_CHECKLIST = ["Physical camera inspection", "Lens cleaning", "Cabling and connector check", "Recorder health check", "Storage capacity and retention", "Firmware version verification", "Time sync", "Backup power test", "Alarm and analytics test"];

function ServicePage() {
  const d = useData();
  const activeAmc = d.amc.filter((a) => a.renewalStatus !== "Expired").length;
  const expiring = d.amc.filter((a) => daysFromToday(a.end) >= 0 && daysFromToday(a.end) <= 30).length;
  const openTickets = d.tickets.filter((t) => t.status !== "Closed" && t.status !== "Resolved").length;
  const annualValue = d.amc.reduce((s, a) => s + a.value, 0);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#20D39A] shadow-[0_0_8px_#20D39A]" />Service Operations</>}
        title="Service and AMC"
        subtitle="Contracts, tickets, and SLA"
        actions={<Button size="sm" onClick={() => toast.success("Ticket created (demo)")} className="bg-signal text-white hover:bg-signal/90">New ticket</Button>}
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Active AMC" value={activeAmc} accent="green" />
        <StatTile label="Expiring 30d" value={expiring} accent="amber" />
        <StatTile label="Open Tickets" value={openTickets} accent="cyan" />
        <StatTile label="Annual AMC Value" value={fmtQAR(annualValue, { compact: true })} accent="purple" />
      </div>

      <Tabs defaultValue="amc" className="rise rise-2">
        <TabsList>
          <TabsTrigger value="amc">AMC Contracts</TabsTrigger>
          <TabsTrigger value="tk">Tickets</TabsTrigger>
          <TabsTrigger value="pm">Preventive Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="amc" className="mt-3">
          <TableShell>
            <thead>
              <tr>
                {["Contract", "Customer", "Equipment", "Start", "End", "Frequency", "Value", "Next visit", "Renewal"].map((h) => (
                  <th key={h} className={h === "Value" ? "text-right" : "text-left"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.amc.map((a) => (
                <tr key={a.id}>
                  <td><MonoChip>{a.number}</MonoChip></td>
                  <td className="text-foreground">{d.customers.find((c) => c.id === a.customerId)?.name}</td>
                  <td className="text-xs text-muted-foreground">{a.equipment}</td>
                  <td className="num text-xs">{fmtDate(a.start)}</td>
                  <td className="num text-xs">{fmtDate(a.end)}</td>
                  <td className="text-xs text-muted-foreground">{a.visitFrequency}</td>
                  <td className="num text-right">{fmtQAR(a.value, { compact: true })}</td>
                  <td className="num text-xs">{fmtDate(a.nextVisit)}</td>
                  <td><StatusPill status={a.renewalStatus} tone={a.renewalStatus === "Active" ? "success" : a.renewalStatus === "Expiring Soon" ? "warning" : a.renewalStatus === "Expired" ? "critical" : "info"} /></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="tk" className="mt-3">
          <TableShell>
            <thead>
              <tr>{["Ticket", "Customer", "Title", "Priority", "Assigned", "Opened", "SLA", "Status"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {d.tickets.map((t) => (
                <tr key={t.id}>
                  <td><MonoChip>{t.number}</MonoChip></td>
                  <td className="text-foreground">{d.customers.find((c) => c.id === t.customerId)?.name}</td>
                  <td className="text-xs text-muted-foreground">{t.title}</td>
                  <td><StatusPill status={t.priority} tone={t.priority === "Critical" ? "critical" : t.priority === "High" ? "warning" : "neutral"} /></td>
                  <td className="text-xs text-muted-foreground">{d.employees.find((e) => e.id === t.assigneeId)?.name || "—"}</td>
                  <td className="num text-xs">{fmtDate(t.opened)}</td>
                  <td className="num text-xs">{t.sla}</td>
                  <td><StatusPill status={t.status} tone={t.status === "Closed" ? "success" : t.status === "In Progress" ? "info" : "warning"} /></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="pm" className="mt-3">
          <Panel accent="green" texture="dots">
            <PanelHead title="Preventive Maintenance Checklist" sub="Standard visit checklist" accent="green" />
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
              {PM_CHECKLIST.map((c, i) => (
                <li key={c} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <input type="checkbox" defaultChecked={i < 5} className="accent-signal" /> <span className="text-foreground/90">{c}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
