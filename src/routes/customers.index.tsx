import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatTile, StatusPill, TableShell, Panel } from "@/components/app/common";
import { fmtQAR } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/customers/")({
  head: () => ({ meta: [
    { title: "Customers | SecureX CCTV COMPANY" },
    { name: "description", content: "Accounts, sites, contracted value and outstanding balances across the customer base." },
  ] }),
  component: CustomersPage,
});

function CustomersPage() {
  const d = useData();
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const list = d.customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const active = d.customers.filter((c) => c.status === "Active").length;
  const prospects = d.customers.filter((c) => c.status === "Prospect").length;
  const totalOutstanding = d.projects.reduce((s, p) => s + (p.invoiced - p.collected), 0);

  useEffect(() => {
    if (d.pendingCreate?.type === "customer") { setNewOpen(true); d.clearPendingCreate(); }
  }, [d.pendingCreate]);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#2F83FF] shadow-[0_0_8px_#2F83FF]" />Accounts</>}
        title="Customers"
        subtitle="Accounts, sites, contracted value, and outstanding balances"
        actions={<Button size="sm" onClick={() => setNewOpen(true)} className="bg-signal text-white hover:bg-signal/90">+ New Customer</Button>}
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total Accounts" value={d.customers.length} accent="blue" />
        <StatTile label="Active" value={active} accent="green" />
        <StatTile label="Prospects" value={prospects} accent="cyan" />
        <StatTile label="Outstanding" value={fmtQAR(totalOutstanding, { compact: true })} accent="amber" />
      </div>

      <Panel className="rise rise-2 mb-4" pad={false}>
        <div className="p-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer…" className="h-9 w-72 border-[rgba(133,164,204,0.16)] bg-[#0D1929]" />
        </div>
      </Panel>

      <div className="rise rise-3">
        <TableShell>
          <thead>
            <tr>
              {["Customer", "Industry", "Contact", "Phone", "Active projects", "Contracted", "Outstanding", "AMC", "Status"].map((h) => (
                <th key={h} className={["Contracted", "Outstanding", "AMC", "Active projects"].includes(h) ? "text-right" : "text-left"}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const projs = d.projects.filter((p) => p.customerId === c.id);
              const outstanding = projs.reduce((s, p) => s + (p.invoiced - p.collected), 0);
              const amc = d.amc.filter((a) => a.customerId === c.id).length;
              return (
                <tr key={c.id}>
                  <td><Link to="/customers/$id" params={{ id: c.id }} className="text-signal font-medium">{c.name}</Link></td>
                  <td className="text-xs text-muted-foreground">{c.industry}</td>
                  <td className="text-xs text-muted-foreground">{c.contact}</td>
                  <td className="num text-xs">{c.phone}</td>
                  <td className="num text-right">{projs.length}</td>
                  <td className="num text-right">{fmtQAR(projs.reduce((s, p) => s + p.contractValue, 0), { compact: true })}</td>
                  <td className="num text-right">{fmtQAR(outstanding, { compact: true })}</td>
                  <td className="num text-right">{amc}</td>
                  <td><StatusPill status={c.status} tone={c.status === "Active" ? "success" : c.status === "Prospect" ? "info" : "neutral"} /></td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </div>

      <NewCustomerDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

const INDUSTRIES = ["Logistics", "Real Estate", "Hospitality", "Retail", "Finance", "Sports", "Residential", "Warehousing", "Education", "Healthcare", "Government"];

function NewCustomerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const d = useData();
  const nav = useNavigate();
  const blank = { name: "", industry: "Retail", contact: "", phone: "+974 ", email: "", address: "" };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(blank); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Company name</span><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Doha Festival City Mall" /></label>
          <label><span className="text-xs text-muted-foreground">Industry</span>
            <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </label>
          <label><span className="text-xs text-muted-foreground">Primary contact</span><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Phone</span><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label><span className="text-xs text-muted-foreground">Email</span><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="col-span-2"><span className="text-xs text-muted-foreground">Address</span><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Area, Doha" /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-signal text-white" onClick={() => {
            if (!form.name.trim()) { toast.error("Company name is required"); return; }
            const c = d.addCustomer({ ...form, status: "Prospect", since: new Date().toISOString().slice(0, 10) });
            onOpenChange(false);
            toast.success(`Customer ${c.name} created.`);
            nav({ to: "/customers/$id", params: { id: c.id } });
          }}>Create customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
