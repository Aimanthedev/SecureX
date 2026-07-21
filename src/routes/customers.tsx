import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/customers")({ head: () => ({ meta: [{ title: "Customers | AL HARIB CCTV COMPANY" }] }), component: CustomersPage });
function CustomersPage() {
  const d = useData();
  const [q, setQ] = useState("");
  const list = d.customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Customers" subtitle="Accounts, sites, contracted value, and outstanding balances" />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer." className="h-9 w-72 mb-3" />
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Customer","Industry","Contact","Phone","Active projects","Contracted","Outstanding","AMC","Status"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
          <tbody>{list.map((c) => {
            const projs = d.projects.filter((p) => p.customerId === c.id);
            const outstanding = projs.reduce((s, p) => s + (p.invoiced - p.collected), 0);
            const amc = d.amc.filter((a) => a.customerId === c.id).length;
            return (
              <tr key={c.id} className="border-t hairline hover:bg-muted/30">
                <td className="py-2 px-3"><Link to="/customers/$id" params={{id: c.id}} className="text-signal">{c.name}</Link></td>
                <td className="py-2 px-3 text-xs">{c.industry}</td>
                <td className="py-2 px-3 text-xs">{c.contact}</td>
                <td className="py-2 px-3 num text-xs">{c.phone}</td>
                <td className="py-2 px-3 num">{projs.length}</td>
                <td className="py-2 px-3 num">{fmtQAR(projs.reduce((s,p)=>s+p.contractValue,0), {compact:true})}</td>
                <td className="py-2 px-3 num">{fmtQAR(outstanding, {compact:true})}</td>
                <td className="py-2 px-3 num">{amc}</td>
                <td className="py-2 px-3"><StatusPill status={c.status} tone={c.status==="Active"?"success":c.status==="Prospect"?"info":"neutral"} /></td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>
    </div>
  );
}
