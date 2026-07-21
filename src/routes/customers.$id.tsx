import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export const Route = createFileRoute("/customers/$id")({ head: () => ({ meta: [{ title: "Customer | AL HARIB CCTV COMPANY" }] }), component: CustomerDetail });
function CustomerDetail() {
  const { id } = useParams({ from: "/customers/$id" });
  const d = useData();
  const c = d.customers.find((x) => x.id === id);
  if (!c) return <Card className="p-6">Not found. <Link to="/customers" className="text-signal">Back</Link></Card>;
  return (
    <div>
      <PageHeader title={c.name} subtitle={`${c.industry} · Customer since ${fmtDate(c.since)}`} />
      <Tabs defaultValue="ov">
        <TabsList>{["Overview","Contacts","Sites","Projects","Quotations","AMC","Tickets","Documents"].map((t) => <TabsTrigger key={t} value={t.toLowerCase()}>{t}</TabsTrigger>)}</TabsList>
        <TabsContent value="overview" className="mt-4"><Card className="p-4 grid grid-cols-2 gap-3 text-sm"><div><div className="text-xs uppercase text-muted-foreground">Main contact</div><div>{c.contact}</div><div className="text-xs num">{c.phone}</div><div className="text-xs">{c.email}</div></div><div><div className="text-xs uppercase text-muted-foreground">Address</div><div>{c.address}</div></div></Card></TabsContent>
        <TabsContent value="sites" className="mt-4"><Card className="p-4"><ul className="text-sm space-y-2">{d.sites.filter((s) => s.customerId === c.id).map((s) => <li key={s.id} className="border hairline rounded p-2"><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.address}</div></li>)}</ul></Card></TabsContent>
        <TabsContent value="projects" className="mt-4"><Card className="p-3"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground"><tr>{["Number","Name","Phase","Value","Status"].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead><tbody>{d.projects.filter((p) => p.customerId === c.id).map((p) => (<tr key={p.id} className="border-t hairline"><td className="py-2"><MonoChip>{p.number}</MonoChip></td><td className="py-2"><Link to="/projects/$id" params={{id: p.id}} className="text-signal">{p.name}</Link></td><td className="py-2"><StatusPill status={p.phase} tone="info" /></td><td className="py-2 num">{fmtQAR(p.contractValue, {compact:true})}</td><td className="py-2 text-xs">{p.actualProgress}%</td></tr>))}</tbody></table></Card></TabsContent>
        {["contacts","quotations","amc","tickets","documents"].map((t) => <TabsContent key={t} value={t} className="mt-4"><Card className="p-6 text-sm text-muted-foreground">No {t} records to display.</Card></TabsContent>)}
      </Tabs>
    </div>
  );
}
