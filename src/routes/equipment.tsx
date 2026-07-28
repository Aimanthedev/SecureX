import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill } from "@/components/app/common";
import { fmtQAR } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export const Route = createFileRoute("/equipment")({ head: () => ({ meta: [{ title: "Equipment | AL HARIB CCTV COMPANY" }] }), component: EquipmentPage });
function EquipmentPage() {
  const d = useData();
  const [q, setQ] = useState("");
  const list = d.products.filter((p) => (p.sku + p.brand + p.model).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Equipment" subtitle="Catalogue and serialized register" />
      <Tabs defaultValue="cat"><TabsList><TabsTrigger value="cat">Catalogue</TabsTrigger><TabsTrigger value="ser">Serialized Register</TabsTrigger></TabsList>
        <TabsContent value="cat" className="mt-3">
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search SKU, brand, model." className="h-9 w-72 mb-3" />
          <Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["SKU","Category","Brand","Model","Cost","Price","Stock","Reserved","Reorder","Status"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{list.map((p) => (<tr key={p.id} className="border-t hairline"><td className="py-2 px-3 num">{p.sku}</td><td className="py-2 px-3 text-xs">{p.category}</td><td className="py-2 px-3 text-xs">{p.brand}</td><td className="py-2 px-3 text-xs">{p.model}</td><td className="py-2 px-3 num">{fmtQAR(p.cost)}</td><td className="py-2 px-3 num">{fmtQAR(p.price)}</td><td className="py-2 px-3 num">{p.stock}</td><td className="py-2 px-3 num">{p.reserved}</td><td className="py-2 px-3 num">{p.reorderLevel}</td><td className="py-2 px-3"><StatusPill status={p.stock<=p.reorderLevel?"Reorder":p.status} tone={p.stock<=p.reorderLevel?"warning":"success"} /></td></tr>))}</tbody></table></Card>
        </TabsContent>
        <TabsContent value="ser" className="mt-3"><Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Label","Model","Serial","MAC","IP","Project","Status"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{d.devices.slice(0,25).map((dev) => (<tr key={dev.id} className="border-t hairline"><td className="py-2 px-3"><MonoChip>{dev.label}</MonoChip></td><td className="py-2 px-3 text-xs">{dev.model}</td><td className="py-2 px-3 num text-xs">{dev.serial}</td><td className="py-2 px-3 num text-xs">{dev.mac}</td><td className="py-2 px-3 num text-xs">{dev.ip}</td><td className="py-2 px-3"><MonoChip>{d.projects.find((p)=>p.id===dev.projectId)?.number}</MonoChip></td><td className="py-2 px-3"><StatusPill status={dev.status} tone={dev.status==="Faulty"?"critical":"info"} /></td></tr>))}</tbody></table></Card></TabsContent>
      </Tabs>
    </div>
  );
}
