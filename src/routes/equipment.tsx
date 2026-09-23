import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, StatTile, TableShell, Panel } from "@/components/app/common";
import { fmtQAR } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/equipment")({
  head: () => ({ meta: [
    { title: "Equipment | SecureX CCTV COMPANY" },
    { name: "description", content: "Catalogue and serialized register of every camera, recorder and network device." },
  ] }),
  component: EquipmentPage,
});

function EquipmentPage() {
  const d = useData();
  const [q, setQ] = useState("");
  const list = d.products.filter((p) => (p.sku + p.brand + p.model).toLowerCase().includes(q.toLowerCase()));
  const reorder = d.products.filter((p) => p.stock <= p.reorderLevel).length;
  const faulty = d.devices.filter((dv) => dv.status === "Faulty").length;
  const totalStockValue = d.products.reduce((s, p) => s + p.stock * p.cost, 0);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#9654FF] shadow-[0_0_8px_#9654FF]" />Fleet Registry</>}
        title="Equipment"
        subtitle="Catalogue and serialized register of every deployed device"
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="SKUs" value={d.products.length} accent="purple" />
        <StatTile label="Serialized Devices" value={d.devices.length} accent="cyan" />
        <StatTile label="Reorder Needed" value={reorder} accent="amber" />
        <StatTile label="Faulty in Field" value={faulty} accent="red" />
      </div>

      <Panel className="rise rise-2 mb-4" accent="purple" texture="dots">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="label-xs">Total Stock Value</div>
            <div className="num mt-1 text-2xl font-semibold text-foreground">{fmtQAR(totalStockValue, { compact: true })}</div>
          </div>
        </div>
      </Panel>

      <Tabs defaultValue="cat" className="rise rise-3">
        <TabsList>
          <TabsTrigger value="cat">Catalogue</TabsTrigger>
          <TabsTrigger value="ser">Serialized Register</TabsTrigger>
        </TabsList>

        <TabsContent value="cat" className="mt-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SKU, brand, model…" className="h-9 w-72 mb-3 border-[rgba(133,164,204,0.16)] bg-[#0D1929]" />
          <TableShell>
            <thead>
              <tr>
                {["SKU", "Category", "Brand", "Model", "Cost", "Price", "Stock", "Reserved", "Reorder", "Status", ""].map((h) => (
                  <th key={h} className={["Cost", "Price", "Stock", "Reserved", "Reorder"].includes(h) ? "text-right" : "text-left"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.sku}</td>
                  <td className="text-xs text-muted-foreground">{p.category}</td>
                  <td className="text-xs text-muted-foreground">{p.brand}</td>
                  <td className="text-xs text-muted-foreground">{p.model}</td>
                  <td className="num text-right">{fmtQAR(p.cost)}</td>
                  <td className="num text-right">{fmtQAR(p.price)}</td>
                  <td className="num text-right">{p.stock}</td>
                  <td className="num text-right">{p.reserved}</td>
                  <td className="num text-right">{p.reorderLevel}</td>
                  <td><StatusPill status={p.stock <= p.reorderLevel ? "Reorder" : p.status} tone={p.stock <= p.reorderLevel ? "warning" : "success"} /></td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="sm" variant="ghost"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { d.receiveStock(p.id, 10); toast.success(`Received 10 × ${p.sku}.`); }}>Receive stock (+10)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { if (p.stock <= 0) { toast.error("No stock to issue"); return; } d.issueStock(p.id, 1); toast.success(`Issued 1 × ${p.sku}.`); }}>Issue stock (-1)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="ser" className="mt-3">
          <TableShell>
            <thead>
              <tr>{["Label", "Model", "Serial", "MAC", "IP", "Project", "Status"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {d.devices.slice(0, 25).map((dev) => (
                <tr key={dev.id}>
                  <td><MonoChip>{dev.label}</MonoChip></td>
                  <td className="text-xs text-muted-foreground">{dev.model}</td>
                  <td className="num text-xs">{dev.serial}</td>
                  <td className="num text-xs">{dev.mac}</td>
                  <td className="num text-xs">{dev.ip}</td>
                  <td><MonoChip>{d.projects.find((p) => p.id === dev.projectId)?.number}</MonoChip></td>
                  <td><StatusPill status={dev.status} tone={dev.status === "Faulty" ? "critical" : "info"} /></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
