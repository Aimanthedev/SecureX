import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill, StatTile, TableShell, EmptyState } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const list = d.documents.filter((x) => (x.name + x.category).toLowerCase().includes(q.toLowerCase()));
  const expired = d.documents.filter((x) => x.status === "Expired").length;
  const expiring = d.documents.filter((x) => x.expiresOn).length;
  const approved = d.documents.filter((x) => x.status === "Approved").length;

  useEffect(() => {
    if (d.pendingCreate?.type === "document") { setUploadOpen(true); d.clearPendingCreate(); }
  }, [d.pendingCreate]);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#18D5FF] shadow-[0_0_8px_#18D5FF]" />Records</>}
        title="Documents"
        subtitle="Contracts, drawings, reports, compliance"
        actions={<Button size="sm" onClick={() => setUploadOpen(true)} className="bg-signal text-white hover:bg-signal/90">Upload</Button>}
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

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

const CATEGORIES = ["Contract", "Drawings", "Survey Report", "Method Statement", "Handover", "Warranty", "Company", "Compliance"];

function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const d = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("Contract");
  const [fileName, setFileName] = useState("");
  useEffect(() => { if (open) { setFileName(""); setCategory("Contract"); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-xs text-muted-foreground">File</span>
            <input ref={fileRef} type="file" className="mt-1.5 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-signal file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
            <span className="mt-1 block text-[10.5px] text-muted-foreground">Local demo: file metadata is stored, not the binary content.</span>
          </label>
          <label className="block"><span className="text-xs text-muted-foreground">Category</span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-signal text-white" onClick={() => {
            const name = fileName || `${category} document.pdf`;
            const doc = d.addDocument({ name, category, revision: "R1", status: "Draft", uploadedOn: new Date().toISOString().slice(0, 10), tags: [category.toLowerCase()] });
            onOpenChange(false);
            toast.success(`${doc.name} uploaded.`);
          }}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MissingDocs() {
  const d = useData();
  const missing = d.projects.flatMap((p) => {
    const have = new Set(d.documents.filter((doc) => doc.projectId === p.id).map((doc) => doc.category));
    const need = ["Handover", "Drawings", "Method Statement"].filter((c) => !have.has(c));
    return need.map((c) => ({ project: p, category: c }));
  });
  if (missing.length === 0) return <EmptyState title="Nothing missing" hint="Every active project has its core document set on file." />;
  return (
    <div className="space-y-2">
      {missing.map(({ project, category }) => (
        <div key={project.id + category} className="panel-flat flex items-center justify-between p-3">
          <span className="text-sm text-foreground">{category} pack for {project.number} — {project.name}</span>
          <Button size="sm" variant="outline" className="border-[rgba(133,164,204,0.18)]" onClick={() => {
            d.addDocument({ name: `${project.number} ${category} (placeholder).pdf`, category, projectId: project.id, revision: "R0", status: "Draft", uploadedOn: new Date().toISOString().slice(0, 10), tags: ["placeholder"] });
            toast.success("Placeholder created.");
          }}>Add placeholder</Button>
        </div>
      ))}
    </div>
  );
}
