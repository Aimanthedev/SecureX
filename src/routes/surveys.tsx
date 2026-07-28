import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, ProgressBar } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/surveys")({
  head: () => ({ meta: [{ title: "Site Surveys | AL HARIB CCTV COMPANY" }] }),
  component: SurveysPage,
});

function SurveysPage() {
  const d = useData();
  const [view, setView] = useState("list");
  const [detail, setDetail] = useState<string | null>(null);
  return (
    <div>
      <PageHeader title="Site Surveys" subtitle="Camera point capture threads into BOQ, devices, and testing" actions={<Button size="sm" className="bg-signal text-signal-foreground" onClick={() => toast.success("Survey scheduled (demo)")}>New survey</Button>} />
      <Tabs value={view} onValueChange={setView}><TabsList><TabsTrigger value="list">List</TabsTrigger><TabsTrigger value="cal">Calendar</TabsTrigger><TabsTrigger value="tpl">Templates</TabsTrigger></TabsList>
        <TabsContent value="list" className="mt-3">
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Number","Client","Site","Type","Engineer","Scheduled","Status","Completeness","Report",""].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead>
              <tbody>{d.surveys.map((s) => {
                const cust = d.customers.find((c) => c.id === s.customerId);
                const site = d.sites.find((x) => x.id === s.siteId);
                const eng = d.employees.find((e) => e.id === s.engineerId);
                return (
                  <tr key={s.id} className="border-t hairline hover:bg-muted/30 cursor-pointer" onClick={() => setDetail(s.id)}>
                    <td className="py-2 px-3"><MonoChip>{s.number}</MonoChip></td>
                    <td className="py-2 px-3">{cust?.name}</td>
                    <td className="py-2 px-3 text-xs">{site?.name || "-"}</td>
                    <td className="py-2 px-3 text-xs">{s.type}</td>
                    <td className="py-2 px-3 text-xs">{eng?.name}</td>
                    <td className="py-2 px-3 num text-xs">{fmtDate(s.scheduled)}</td>
                    <td className="py-2 px-3"><StatusPill status={s.status} tone={s.status.includes("Approved") ? "success" : s.status === "In Progress" ? "info" : "warning"} /></td>
                    <td className="py-2 px-3 w-32"><ProgressBar value={s.completeness} /></td>
                    <td className="py-2 px-3"><StatusPill status={s.reportStatus} tone={s.reportStatus==="Approved"?"success":"info"} /></td>
                    <td className="py-2 px-3"><Button size="sm" variant="ghost">Open</Button></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </Card>
        </TabsContent>
        <TabsContent value="cal" className="mt-3"><Card className="p-4"><div className="grid grid-cols-7 gap-1 text-xs">{Array.from({length: 35}, (_, i) => (<div key={i} className="border hairline rounded aspect-square p-1"><div className="text-[10px] text-muted-foreground">{((i%30)+1)}</div>{d.surveys.find((s) => new Date(s.scheduled).getDate() === (i%30)+1) && <div className="mt-1 text-[10px] bg-signal/15 text-signal rounded px-1">Survey</div>}</div>))}</div></Card></TabsContent>
        <TabsContent value="tpl" className="mt-3"><Card className="p-4"><div className="grid grid-cols-3 gap-3">{["Warehouse","Office Tower","Retail","Villa","Hotel","Sports Facility"].map((t) => (<div key={t} className="border hairline rounded-lg p-3"><div className="text-sm font-medium">{t} template</div><div className="text-xs text-muted-foreground mt-1">Prefilled sections and typical camera point layouts.</div><Button size="sm" variant="outline" className="mt-2" onClick={() => toast.success(`Applied ${t} template.`)}>Use template</Button></div>))}</div></Card></TabsContent>
      </Tabs>
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-4xl">
          {detail && (() => {
            const s = d.surveys.find((x) => x.id === detail)!;
            return (
              <>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><MonoChip>{s.number}</MonoChip> {s.type}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div><div className="text-xs uppercase text-muted-foreground">Existing system</div><div>{s.existingSystem}</div></div>
                  <div><div className="text-xs uppercase text-muted-foreground">Proposed system</div><div>{s.proposedSummary}</div></div>
                </div>
                <div className="text-sm font-medium mb-2">Proposed Camera Points ({s.points.length})</div>
                <div className="max-h-96 overflow-y-auto border hairline rounded">
                  <table className="w-full text-xs">
                    <thead className="text-[10px] uppercase text-muted-foreground bg-muted/40 sticky top-0"><tr>{["CP","Building","Floor","Zone","Type","Mount","Height","Cable","Notes"].map((h) => <th key={h} className="text-left py-2 px-2">{h}</th>)}</tr></thead>
                    <tbody>{s.points.map((p) => (
                      <tr key={p.id} className="border-t hairline"><td className="py-1.5 px-2"><MonoChip>{p.id}</MonoChip></td><td className="py-1.5 px-2">{p.building}</td><td className="py-1.5 px-2">{p.floor}</td><td className="py-1.5 px-2">{p.zone}</td><td className="py-1.5 px-2">{p.cameraType}</td><td className="py-1.5 px-2">{p.mountPos}</td><td className="py-1.5 px-2 num">{p.mountHeight}</td><td className="py-1.5 px-2 num">{p.cableLen}m</td><td className="py-1.5 px-2 text-muted-foreground">{p.notes || "-"}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setDetail(null)}>Close</Button><Button onClick={() => toast.success("Report printed (demo).")}>Print report</Button></DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
