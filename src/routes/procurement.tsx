import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, StatTile, TableShell, Panel, PanelHead } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/procurement")({
  head: () => ({ meta: [
    { title: "Procurement | AL HARIB CCTV COMPANY" },
    { name: "description", content: "Purchase requests, purchase orders and sourcing pipeline across every project." },
  ] }),
  component: ProcurementPage,
});

const PIPE = ["Requested", "Sourcing", "Quoted", "Ordered", "Delivered", "Closed"];

function ProcurementPage() {
  const d = useData();
  const overdue = d.purchaseOrders.filter((po) => po.deliveryStatus === "Overdue").length;
  const critical = d.purchaseRequests.filter((r) => r.priority === "Critical").length;
  const totalPOValue = d.purchaseOrders.reduce((s, po) => s + po.amount, 0);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#FFAA2C] shadow-[0_0_8px_#FFAA2C]" />Supply Chain</>}
        title="Procurement"
        subtitle="Purchase requests and orders across every project"
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Purchase Requests" value={d.purchaseRequests.length} accent="amber" />
        <StatTile label="Critical Priority" value={critical} accent="red" />
        <StatTile label="Overdue POs" value={overdue} accent="red" />
        <StatTile label="Total PO Value" value={fmtQAR(totalPOValue, { compact: true })} accent="green" />
      </div>

      <Tabs defaultValue="pr" className="rise rise-2">
        <TabsList>
          <TabsTrigger value="pr">Purchase Requests</TabsTrigger>
          <TabsTrigger value="po">Purchase Orders</TabsTrigger>
          <TabsTrigger value="pipe">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="pr" className="mt-3">
          <TableShell>
            <thead>
              <tr>
                {["Number", "Project", "Requested", "Required", "Items", "Cost", "Priority", "Approval", "Status"].map((h) => (
                  <th key={h} className={["Items", "Cost"].includes(h) ? "text-right" : "text-left"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.purchaseRequests.map((r) => (
                <tr key={r.id}>
                  <td><MonoChip>{r.number}</MonoChip></td>
                  <td><MonoChip>{d.projects.find((p) => p.id === r.projectId)?.number}</MonoChip></td>
                  <td className="num text-xs">{fmtDate(r.requestDate)}</td>
                  <td className="num text-xs">{fmtDate(r.requiredDate)}</td>
                  <td className="num text-right">{r.items}</td>
                  <td className="num text-right">{fmtQAR(r.cost)}</td>
                  <td><StatusPill status={r.priority} tone={r.priority === "Critical" ? "critical" : r.priority === "High" ? "warning" : "neutral"} /></td>
                  <td><StatusPill status={r.approvalStatus} tone={r.approvalStatus === "Approved" ? "success" : "warning"} /></td>
                  <td><StatusPill status={r.procurementStatus} tone="info" /></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="po" className="mt-3">
          <TableShell>
            <thead>
              <tr>
                {["PO", "Supplier", "Project", "Amount", "Ordered", "Expected", "Delivery", "Payment"].map((h) => (
                  <th key={h} className={h === "Amount" ? "text-right" : "text-left"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.purchaseOrders.map((po) => (
                <tr key={po.id} className={po.deliveryStatus === "Overdue" ? "bg-[rgba(255,70,100,0.06)]" : undefined}>
                  <td><MonoChip>{po.number}</MonoChip></td>
                  <td className="text-xs text-muted-foreground">{po.supplier}</td>
                  <td><MonoChip>{d.projects.find((p) => p.id === po.projectId)?.number}</MonoChip></td>
                  <td className="num text-right">{fmtQAR(po.amount)}</td>
                  <td className="num text-xs">{fmtDate(po.orderDate)}</td>
                  <td className="num text-xs">{fmtDate(po.expectedDelivery)}</td>
                  <td><StatusPill status={po.deliveryStatus} tone={po.deliveryStatus === "Overdue" ? "critical" : po.deliveryStatus === "Delivered" ? "success" : "info"} /></td>
                  <td><StatusPill status={po.paymentStatus} tone={po.paymentStatus === "Paid" ? "success" : po.paymentStatus === "Partial" ? "warning" : "neutral"} /></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="pipe" className="mt-3">
          <Panel accent="amber" texture="grid">
            <PanelHead title="Procurement Pipeline" sub="Requests distributed across sourcing stages" accent="amber" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {PIPE.map((s) => (
                <div key={s} className="panel-flat p-3 text-center">
                  <div className="label-xs">{s}</div>
                  <div className="num mt-1 text-2xl font-semibold text-foreground">{d.purchaseRequests.filter((r) => r.procurementStatus === s).length}</div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
