import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export const Route = createFileRoute("/procurement")({ head: () => ({ meta: [{ title: "Procurement | AL HARIB CCTV COMPANY" }] }), component: ProcurementPage });
function ProcurementPage() {
  const d = useData();
  return (
    <div>
      <PageHeader title="Procurement" subtitle="Purchase requests and orders" />
      <Tabs defaultValue="pr"><TabsList><TabsTrigger value="pr">Purchase Requests</TabsTrigger><TabsTrigger value="po">Purchase Orders</TabsTrigger><TabsTrigger value="pipe">Pipeline</TabsTrigger></TabsList>
        <TabsContent value="pr" className="mt-3"><Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Number","Project","Requested","Required","Items","Cost","Priority","Approval","Status"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{d.purchaseRequests.map((r) => (<tr key={r.id} className="border-t hairline"><td className="py-2 px-3"><MonoChip>{r.number}</MonoChip></td><td className="py-2 px-3"><MonoChip>{d.projects.find((p)=>p.id===r.projectId)?.number}</MonoChip></td><td className="py-2 px-3 num text-xs">{fmtDate(r.requestDate)}</td><td className="py-2 px-3 num text-xs">{fmtDate(r.requiredDate)}</td><td className="py-2 px-3 num">{r.items}</td><td className="py-2 px-3 num">{fmtQAR(r.cost)}</td><td className="py-2 px-3"><StatusPill status={r.priority} tone={r.priority==="Critical"?"critical":r.priority==="High"?"warning":"neutral"} /></td><td className="py-2 px-3"><StatusPill status={r.approvalStatus} tone={r.approvalStatus==="Approved"?"success":"warning"} /></td><td className="py-2 px-3"><StatusPill status={r.procurementStatus} tone="info" /></td></tr>))}</tbody></table></Card></TabsContent>
        <TabsContent value="po" className="mt-3"><Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["PO","Supplier","Project","Amount","Ordered","Expected","Delivery","Payment"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{d.purchaseOrders.map((po) => (<tr key={po.id} className={`border-t hairline ${po.deliveryStatus==="Overdue"?"bg-critical-soft/40":""}`}><td className="py-2 px-3"><MonoChip>{po.number}</MonoChip></td><td className="py-2 px-3 text-xs">{po.supplier}</td><td className="py-2 px-3"><MonoChip>{d.projects.find((p)=>p.id===po.projectId)?.number}</MonoChip></td><td className="py-2 px-3 num">{fmtQAR(po.amount)}</td><td className="py-2 px-3 num text-xs">{fmtDate(po.orderDate)}</td><td className="py-2 px-3 num text-xs">{fmtDate(po.expectedDelivery)}</td><td className="py-2 px-3"><StatusPill status={po.deliveryStatus} tone={po.deliveryStatus==="Overdue"?"critical":po.deliveryStatus==="Delivered"?"success":"info"} /></td><td className="py-2 px-3"><StatusPill status={po.paymentStatus} tone={po.paymentStatus==="Paid"?"success":po.paymentStatus==="Partial"?"warning":"neutral"} /></td></tr>))}</tbody></table></Card></TabsContent>
        <TabsContent value="pipe" className="mt-3"><Card className="p-4"><div className="grid grid-cols-6 gap-3">{["Requested","Sourcing","Quoted","Ordered","Delivered","Closed"].map((s) => (<div key={s} className="border hairline rounded-lg p-3 text-center"><div className="text-xs uppercase text-muted-foreground">{s}</div><div className="text-2xl font-display num mt-1">{d.purchaseRequests.filter((r)=>r.procurementStatus===s).length}</div></div>))}</div></Card></TabsContent>
      </Tabs>
    </div>
  );
}
