import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
export const Route = createFileRoute("/documents")({ head: () => ({ meta: [{ title: "Documents | AL HARIB CCTV COMPANY" }] }), component: DocsPage });
function DocsPage() {
  const d = useData();
  const [q, setQ] = useState("");
  const list = d.documents.filter((x) => (x.name + x.category).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Documents" subtitle="Contracts, drawings, reports, compliance" actions={<Button size="sm" onClick={() => toast.success("Upload started (demo)")}>Upload</Button>} />
      <div className="flex items-center gap-2 mb-3"><Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search documents." className="h-9 w-72" /></div>
      <Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="missing">Missing</TabsTrigger><TabsTrigger value="expiring">Expiring</TabsTrigger></TabsList>
        <TabsContent value="all" className="mt-3"><Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Name","Category","Revision","Status","Uploaded","Expires","Tags"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{list.map((doc) => (<tr key={doc.id} className="border-t hairline"><td className="py-2 px-3">{doc.name}</td><td className="py-2 px-3 text-xs">{doc.category}</td><td className="py-2 px-3 num text-xs">{doc.revision}</td><td className="py-2 px-3"><StatusPill status={doc.status} tone={doc.status==="Approved"?"success":doc.status==="Expired"?"critical":"warning"} /></td><td className="py-2 px-3 num text-xs">{fmtDate(doc.uploadedOn)}</td><td className="py-2 px-3 num text-xs">{doc.expiresOn ? fmtDate(doc.expiresOn) : "-"}</td><td className="py-2 px-3 text-xs text-muted-foreground">{doc.tags.join(", ")}</td></tr>))}</tbody></table></Card></TabsContent>
        <TabsContent value="missing" className="mt-3"><Card className="p-4 text-sm"><ul className="space-y-2">{["Handover pack for AHC-PRO-2026-041","As-built drawings for AHC-PRO-2026-044","MoI approval letter for AHC-PRO-2026-038"].map((m) => <li key={m} className="flex items-center justify-between border hairline rounded p-2"><span>{m}</span><Button size="sm" variant="outline" onClick={() => toast("Placeholder created")}>Add placeholder</Button></li>)}</ul></Card></TabsContent>
        <TabsContent value="expiring" className="mt-3"><Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Name","Category","Expires"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{d.documents.filter((x)=>x.expiresOn).map((doc) => (<tr key={doc.id} className="border-t hairline"><td className="py-2 px-3">{doc.name}</td><td className="py-2 px-3 text-xs">{doc.category}</td><td className="py-2 px-3 num text-xs">{fmtDate(doc.expiresOn!)}</td></tr>))}</tbody></table></Card></TabsContent>
      </Tabs>
    </div>
  );
}
