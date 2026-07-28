import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, MetricCard, Panel, PanelHead, TableShell } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, ArrowRightCircle, FileText, Send, CheckCircle2, Clock, Wallet, Trophy } from "lucide-react";
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
  const totalOf = (q: typeof d.quotations[number]) => q.items.reduce((a, i) => a + i.unitPrice * i.qty, 0) || 100000;
  const total = d.quotations.reduce((s, q) => s + totalOf(q), 0);
  const wonValue = d.quotations.filter((q) => q.status === "Approved").reduce((s, q) => s + totalOf(q), 0);
  const expiring = d.quotations.filter((q) => q.status === "Sent" && new Date(q.validUntil).getTime() - Date.now() < 7 * 86400000).length;

  return (
    <div>
      <PageHeader title="Quotations" subtitle="Draft, negotiate, and convert to project" actions={<Button size="sm" className="bg-signal text-white" onClick={() => toast.success("New quotation drafted (demo)")}>New quotation</Button>} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <MetricCard label="Draft" value={d.quotations.filter((q) => q.status === "Draft").length} icon={<FileText className="w-4 h-4" />} accent="blue" motif="grid" />
        <MetricCard label="Sent" value={d.quotations.filter((q) => q.status === "Sent").length} icon={<Send className="w-4 h-4" />} accent="cyan" motif="waves" />
        <MetricCard label="Approved" value={d.quotations.filter((q) => q.status === "Approved").length} icon={<CheckCircle2 className="w-4 h-4" />} accent="green" motif="channels" />
        <MetricCard label="Expiring" value={expiring} sub="within 7 days" icon={<Clock className="w-4 h-4" />} accent="amber" motif="nodes" />
        <MetricCard label="Quoted Value" value={fmtQAR(total, { compact: true })} icon={<Wallet className="w-4 h-4" />} accent="purple" motif="grid" />
        <MetricCard label="Won Value" value={fmtQAR(wonValue, { compact: true })} icon={<Trophy className="w-4 h-4" />} accent="magenta" motif="waves" />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#091321] border border-[rgba(133,164,204,0.12)] rounded-xl p-1">{["all","Draft","Internal Approval","Sent","Approved","Rejected","Expired"].map((s) => <TabsTrigger key={s} value={s}>{s === "all" ? "All" : s}</TabsTrigger>)}</TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
        {list.map((q) => {
          const cust = d.customers.find((c) => c.id === q.customerId);
          const sp = d.employees.find((e) => e.id === q.salespersonId);
          const tot = totalOf(q);
          const tone = q.status === "Approved" ? "success" : q.status === "Rejected" || q.status === "Expired" ? "critical" : "info";
          return (
            <Panel key={q.id} texture="grid" accent={q.status === "Approved" ? "green" : "blue"} className="card-lift">
              <div className="flex items-start justify-between mb-2">
                <MonoChip>{q.number}</MonoChip>
                <StatusPill status={q.status} tone={tone as any} />
              </div>
              <div className="text-[15px] font-semibold text-foreground truncate">{cust?.name}</div>
              <div className="text-[12px] text-muted-foreground truncate mb-3">{q.opportunityName}</div>
              <div className="grid grid-cols-2 gap-y-1.5 text-[11.5px] mb-3">
                <div className="text-muted-foreground">Salesperson</div><div className="text-right text-foreground">{sp?.name}</div>
                <div className="text-muted-foreground">Revision</div><div className="text-right num text-foreground">R{q.revision}</div>
                <div className="text-muted-foreground">Created</div><div className="text-right num text-foreground">{fmtDate(q.createdAt)}</div>
                <div className="text-muted-foreground">Valid until</div><div className="text-right num text-foreground">{fmtDate(q.validUntil)}</div>
              </div>
              <div className="num text-2xl font-semibold text-foreground mb-3">{fmtQAR(tot, { compact: true })}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-[rgba(133,164,204,0.18)]" onClick={() => setPreview(q.id)}><Printer className="w-3 h-3 mr-1" />Preview</Button>
                {q.status === "Approved" && (
                  <Button size="sm" className="flex-1 bg-signal text-white" onClick={() => {
                    const np = d.convertQuotationToProject(q.id);
                    if (np) { toast.success(`Converted to ${np.number}. Opening.`); nav({ to: "/projects/$id", params: { id: np.id } }); }
                  }}><ArrowRightCircle className="w-3 h-3 mr-1" />Convert</Button>
                )}
              </div>
            </Panel>
          );
        })}
        {list.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-10">No quotations in this status.</div>}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl bg-[#0B1524] border-[rgba(133,164,204,0.14)]">
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
      <DialogHeader><DialogTitle>Quotation Builder</DialogTitle></DialogHeader>
      <div className="panel relative overflow-hidden p-6 grid-fade">
        <div className="flex items-start justify-between mb-6 relative">
          <div>
            <div className="label-xs mb-1">Quotation</div>
            <div className="font-semibold text-2xl tracking-[-0.03em] text-foreground">{q.number}</div>
            <div className="text-xs num mt-1 text-muted-foreground">Revision {q.revision} · {fmtDate(q.createdAt)}</div>
          </div>
          <div className="text-right">
            <div className="w-10 h-10 rounded-xl bg-signal text-white grid place-items-center font-semibold mb-1 ml-auto">A</div>
            <div className="font-semibold text-foreground">AL HARIB CCTV COMPANY</div>
            <div className="text-xs text-muted-foreground">Doha, Qatar</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm relative">
          <div className="panel-flat p-3"><div className="label-xs mb-1">Bill to</div><div className="font-medium text-foreground">{cust?.name}</div><div className="text-xs text-muted-foreground">{cust?.contact} · {cust?.phone}</div></div>
          <div className="panel-flat p-3"><div className="label-xs mb-1">Site</div><div className="font-medium text-foreground">{site?.name}</div><div className="text-xs text-muted-foreground">{site?.address}</div></div>
        </div>
        <div className="text-sm font-medium mb-2 text-foreground relative">{q.opportunityName}</div>
        <div className="relative">
          <TableShell>
            <thead><tr>{["#","SKU","Description","Qty","Unit price","Line total"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{q.items.slice(0, 12).map((it, i) => (
              <tr key={it.id}><td className="num">{i+1}</td><td className="num"><MonoChip>{it.sku}</MonoChip></td><td>{it.description}</td><td className="num">{it.qty}</td><td className="num">{fmtQAR(it.unitPrice)}</td><td className="num text-foreground font-medium">{fmtQAR(it.unitPrice * it.qty)}</td></tr>
            ))}</tbody>
          </TableShell>
        </div>
        {q.items.length > 12 && <div className="text-xs text-muted-foreground mt-2 relative">…and {q.items.length - 12} more line items.</div>}
        <div className="mt-4 flex justify-end relative"><div className="w-64 space-y-1.5 text-sm panel-flat p-3">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="num text-foreground">{fmtQAR(total || 100000)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Tax (0%)</span><span className="num text-foreground">0 QAR</span></div>
          <div className="flex justify-between font-semibold text-base border-t border-[rgba(133,164,204,0.14)] pt-1.5 text-foreground"><span>Total</span><span className="num">{fmtQAR(total || 100000)}</span></div>
        </div></div>
        <div className="mt-6 text-xs text-muted-foreground relative">Valid until {fmtDate(q.validUntil)}. All prices in Qatari Riyal (QAR). {q.notes}</div>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => window.print()}><Printer className="w-3 h-3 mr-1" />Print</Button></DialogFooter>
    </div>
  );
}
