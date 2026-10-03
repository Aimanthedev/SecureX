import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill, StatTile, TableShell, EmptyState } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [
    { title: "Documents | SecureX CCTV COMPANY" },
    { name: "description", content: "Contracts, drawings, reports and compliance documents across the company." },
    { property: "og:title", content: "Documents | SecureX CCTV COMPANY" },
    { property: "og:description", content: "Contracts, drawings, reports and compliance documents across the company." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DocsPage,
});

function DocsPage() {
  const d = useData();
  const [q, setQ] = useState("");
  const list = d.documents.filter((x) => (x.name + x.category).toLowerCase().includes(q.toLowerCase()));
  const expired = d.documents.filter((x) => x.status === "Expired").length;
  const expiring = d.documents.filter((x) => x.expiresOn).length;
  const approved = d.documents.filter((x) => x.status === "Approved").length;

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#18D5FF] shadow-[0_0_8px_#18D5FF]" />Records</>}
        title="Documents"
        subtitle="Contracts, drawings, reports, compliance"
        actions={<Button size="sm" onClick={() => toast.success("Upload started (demo)")} className="bg-signal text-white hover:bg-signal/90">Upload</Button>}
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Total Documents" value={d.documents.length} accent="cyan" />
        <StatTile label="Approved" value={approved} accent="green" />
        <StatTile label="With Expiry" value={expiring} accent="amber" />
        <StatTile label="Expired" value={expired} accent="red" />
      </div>

      <div className="rise rise-2 mb-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="h-9 w-72 border-input bg-card" />
      </div>

      <Tabs defaultValue="all" className="rise rise-3">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="missing">Missing</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-3">
          <TableShell>
            <thead>
              <tr>{["Name", "Category", "Revision", "Status", "Uploaded", "Expires", "Tags"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.map((doc) => (
                <tr key={doc.id}>
                  <td className="text-foreground">{doc.name}</td>
                  <td className="text-xs text-muted-foreground">{doc.category}</td>
                  <td className="num text-xs">{doc.revision}</td>
                  <td><StatusPill status={doc.status} tone={doc.status === "Approved" ? "success" : doc.status === "Expired" ? "critical" : "warning"} /></td>
                  <td className="num text-xs">{fmtDate(doc.uploadedOn)}</td>
                  <td className="num text-xs">{doc.expiresOn ? fmtDate(doc.expiresOn) : "—"}</td>
                  <td className="text-xs text-muted-foreground">{doc.tags.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        <TabsContent value="missing" className="mt-3">
          <div className="space-y-2">
            {["Handover pack for AHC-PRO-2026-041", "As-built drawings for AHC-PRO-2026-044", "MoI approval letter for AHC-PRO-2026-038"].map((m) => (
              <div key={m} className="panel-flat flex items-center justify-between p-3">
                <span className="text-sm text-foreground">{m}</span>
                <Button size="sm" variant="outline" className="border-input" onClick={() => toast("Placeholder created")}>Add placeholder</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="mt-3">
          {d.documents.filter((x) => x.expiresOn).length === 0 ? (
            <EmptyState title="Nothing is expiring" />
          ) : (
            <TableShell>
              <thead><tr>{["Name", "Category", "Expires"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr></thead>
              <tbody>
                {d.documents.filter((x) => x.expiresOn).map((doc) => (
                  <tr key={doc.id}>
                    <td className="text-foreground">{doc.name}</td>
                    <td className="text-xs text-muted-foreground">{doc.category}</td>
                    <td className="num text-xs">{fmtDate(doc.expiresOn!)}</td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
