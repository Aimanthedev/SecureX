import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, StatTile, TableShell, Panel, PanelHead } from "@/components/app/common";
import { fmtQAR, fmtDate, daysFromToday } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/service")({
  head: () => ({ meta: [
    { title: "Service and AMC | SecureX CCTV COMPANY" },
    { name: "description", content: "AMC contracts, service tickets, SLA tracking and preventive maintenance checklists." },
  ] }),
  component: ServicePage,
});

const PM_CHECKLIST = ["Physical camera inspection", "Lens cleaning", "Cabling and connector check", "Recorder health check", "Storage capacity and retention", "Firmware version verification", "Time sync", "Backup power test", "Alarm and analytics test"];

function ServicePage() {
  const d = useData();
  const [newOpen, setNewOpen] = useState(false);
  const activeAmc = d.amc.filter((a) => a.renewalStatus !== "Expired").length;
  const expiring = d.amc.filter((a) => daysFromToday(a.end) >= 0 && daysFromToday(a.end) <= 30).length;
  const openTickets = d.tickets.filter((t) => t.status !== "Closed" && t.status !== "Resolved").length;
  const annualValue = d.amc.reduce((s, a) => s + a.value, 0);

  useEffect(() => {
    if (d.pendingCreate?.type === "ticket") { setNewOpen(true); d.clearPendingCreate(); }
  }, [d.pendingCreate]);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#20D39A] shadow-[0_0_8px_#20D39A]" />Service Operations</>}
        title="Service and AMC"
        subtitle="Contracts, tickets, and SLA"
        actions={<Button size="sm" onClick={() => setNewOpen(true)} className="bg-signal text-white hover:bg-signal/90">New ticket</Button>}
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
            <PanelHead title="Preventive Maintenance Checklist" sub="Standard visit checklist — progress is saved" accent="green" />
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
              {PM_CHECKLIST.map((c) => (
                <li key={c} className="flex items-center gap-2 rounded-lg border border-[rgba(133,164,204,0.10)] bg-[rgba(133,164,204,0.03)] px-3 py-2">
                  <input type="checkbox" checked={d.pmChecklistDone.includes(c)} onChange={() => d.togglePmChecklist(c)} className="accent-signal" /> <span className="text-foreground/90">{c}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>

      <NewTicketDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function NewTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const d = useData();
  const blank = { customerId: "", siteId: "", title: "", priority: "Medium" as const, sla: "24h" };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(blank); }, [open]);
  const sites = d.sites.filter((s) => s.customerId === form.customerId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Service Ticket</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Issue</span><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Camera offline in lobby" /></label>
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
          <label><span className="text-xs text-muted-foreground">Priority</span>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as never })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label><span className="text-xs text-muted-foreground">SLA</span>
            <Select value={form.sla} onValueChange={(v) => setForm({ ...form, sla: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["4h", "8h", "24h", "48h"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-signal text-white" onClick={() => {
            if (!form.title.trim()) { toast.error("Describe the issue"); return; }
            if (!form.customerId) { toast.error("Choose a customer"); return; }
            const t = d.addTicket({
              number: `AHC-SR-2026-${String(120 + d.tickets.length).padStart(3, "0")}`,
              customerId: form.customerId, siteId: form.siteId || d.sites.find((s) => s.customerId === form.customerId)!.id,
              title: form.title.trim(), priority: form.priority, status: "New", opened: new Date().toISOString().slice(0, 10), sla: form.sla,
            });
            onOpenChange(false);
            toast.success(`Ticket ${t.number} created.`);
          }}>Create ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
