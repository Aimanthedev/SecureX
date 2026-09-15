import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatTile, StatusPill, TableShell, Panel } from "@/components/app/common";
import { fmtQAR } from "@/lib/format";
import { Input } from "@/components/ui/input";

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
  const list = d.customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const active = d.customers.filter((c) => c.status === "Active").length;
  const prospects = d.customers.filter((c) => c.status === "Prospect").length;
  const totalContracted = d.projects.reduce((s, p) => s + p.contractValue, 0);
  const totalOutstanding = d.projects.reduce((s, p) => s + (p.invoiced - p.collected), 0);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#2F83FF] shadow-[0_0_8px_#2F83FF]" />Accounts</>}
        title="Customers"
        subtitle="Accounts, sites, contracted value, and outstanding balances"
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total Accounts" value={d.customers.length} accent="blue" />
        <StatTile label="Active" value={active} accent="green" />
        <StatTile label="Prospects" value={prospects} accent="cyan" />
        <StatTile label="Outstanding" value={fmtQAR(totalOutstanding, { compact: true })} accent="amber" />
      </div>

      <Panel className="rise rise-2 mb-4" pad={false}>
        <div className="p-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer…" className="h-9 w-72 border-input bg-card" />
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
    </div>
  );
}
