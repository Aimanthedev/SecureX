import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { KpiCard, PageHeader, MonoChip, StatusPill } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/quotations")({
  head: () => ({ meta: [{ title: "Quotations | AL HARIB CCTV COMPANY" }] }),
  component: QuotationsPage,
});

function QuotationsPage() {
  const d = useData();
  const nav = useNavigate();
  const [tab, setTab] = useState<string>("all");
  const [preview, setPreview] = useState<string | null>(null);
  const list = d.quotations.filter((q) => tab === "all" || q.status === tab);
  const total = d.quotations.reduce((s, q) => s + q.items.reduce((a, i) => a + i.unitPrice * i.qty, 0), 0);
  return (
    <div>
      <PageHeader title="Quotations" subtitle="Draft, negotiate, and convert to project" actions={<Button size="sm" className="bg-signal text-signal-foreground" onClick={() => toast.success("New quotation drafted (demo)")}>New quotation</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Draft" value={d.quotations.filter((q) => q.status === "Draft").length} />
        <KpiCard label="Sent" value={d.quotations.filter((q) => q.status === "Sent").length} />
        <KpiCard label="Approved" value={d.quotations.filter((q) => q.status === "Approved").length} tone="success" />
        <KpiCard label="Total value" value={fmtQAR(total, { compact: true })} />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>{["all","Draft","Internal Approval","Sent","Approved","Rejected","Expired"].map((s) => <TabsTrigger key={s} value={s}>{s === "all" ? "All" : s}</TabsTrigger>)}</TabsList>
      </Tabs>
      <Card className="p-0 mt-3">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Number","Client","Opportunity","Salesperson","Rev","Created","Valid until","Total","Status","Actions"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
          <tbody>{list.map((q) => {
            const cust = d.customers.find((c) => c.id === q.customerId);
            const sp = d.employees.find((e) => e.id === q.salespersonId);
            const total = q.items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
            return (
              <tr key={q.id} className="border-t hairline hover:bg-muted/30">
                <td className="py-2 px-3"><MonoChip>{q.number}</MonoChip></td>
                <td className="py-2 px-3">{cust?.name}</td>
                <td className="py-2 px-3 text-xs">{q.opportunityName}</td>
                <td className="py-2 px-3 text-xs">{sp?.name}</td>
                <td className="py-2 px-3 num">R{q.revision}</td>
                <td className="py-2 px-3 num text-xs">{fmtDate(q.createdAt)}</td>
                <td className="py-2 px-3 num text-xs">{fmtDate(q.validUntil)}</td>
                <td className="py-2 px-3 num">{fmtQAR(total || 100000, { compact: true })}</td>
                <td className="py-2 px-3"><StatusPill status={q.status} tone={q.status==="Approved"?"success":q.status==="Rejected"?"critical":"info"} /></td>
                <td className="py-2 px-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setPreview(q.id)}><Printer className="w-3 h-3 mr-1" />Preview</Button>
                    {q.status === "Approved" && (
                      <Button size="sm" variant="ghost" className="text-signal" onClick={() => {
                        const np = d.convertQuotationToProject(q.id);
                        if (np) { toast.success(`Converted to ${np.number}. Opening.`); nav({ to: "/projects/$id", params: { id: np.id } }); }
                      }}><ArrowRightCircle className="w-3 h-3 mr-1" />Convert to project</Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </Card>
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          {preview && <QuotationPreview id={preview} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuotationPreview({ id }: { id: string }) {
  const d = useData();
  const q = d.quotations.find((x) => x.id === id)!;
  const cust = d.customers.find((c) => c.id === q.customerId);
  const site = d.sites.find((s) => s.id === q.siteId);
  const total = q.items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  return (
    <div>
      <DialogHeader><DialogTitle>Quotation Preview</DialogTitle></DialogHeader>
      <div className="border hairline rounded-lg p-6 bg-surface print:border-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Quotation</div>
            <div className="font-display font-bold text-2xl">{q.number}</div>
            <div className="text-xs num mt-1">Revision {q.revision} · {fmtDate(q.createdAt)}</div>
          </div>
          <div className="text-right">
            <div className="w-10 h-10 rounded-md bg-brand text-brand-foreground grid place-items-center font-display font-bold mb-1 ml-auto">A</div>
            <div className="font-display font-bold">AL HARIB CCTV COMPANY</div>
            <div className="text-xs text-muted-foreground">Doha, Qatar</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><div className="text-xs uppercase text-muted-foreground">Bill to</div><div className="font-medium">{cust?.name}</div><div className="text-xs">{cust?.contact} · {cust?.phone}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Site</div><div className="font-medium">{site?.name}</div><div className="text-xs">{site?.address}</div></div>
        </div>
        <div className="text-sm font-medium mb-2">{q.opportunityName}</div>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground uppercase tracking-wider border-b hairline"><tr>{["#","SKU","Description","Qty","Unit price","Line total"].map((h) => <th key={h} className="text-left py-2">{h}</th>)}</tr></thead>
          <tbody>{q.items.slice(0, 12).map((it, i) => (
            <tr key={it.id} className="border-b hairline"><td className="py-1.5 num">{i+1}</td><td className="py-1.5 num">{it.sku}</td><td className="py-1.5">{it.description}</td><td className="py-1.5 num">{it.qty}</td><td className="py-1.5 num">{fmtQAR(it.unitPrice)}</td><td className="py-1.5 num">{fmtQAR(it.unitPrice * it.qty)}</td></tr>
          ))}</tbody>
        </table>
        {q.items.length > 12 && <div className="text-xs text-muted-foreground mt-2">…and {q.items.length - 12} more line items.</div>}
        <div className="mt-4 flex justify-end"><div className="w-64 space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal</span><span className="num">{fmtQAR(total || 100000)}</span></div><div className="flex justify-between"><span>Tax (0%)</span><span className="num">0 QAR</span></div><div className="flex justify-between font-semibold text-base border-t hairline pt-1"><span>Total</span><span className="num">{fmtQAR(total || 100000)}</span></div></div></div>
        <div className="mt-6 text-xs text-muted-foreground">Valid until {fmtDate(q.validUntil)}. All prices in Qatari Riyal (QAR). {q.notes}</div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => window.print()}><Printer className="w-3 h-3 mr-1" />Print</Button></DialogFooter>
    </div>
  );
}
