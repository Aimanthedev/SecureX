import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatTile, StatusPill, TableShell, MonoChip } from "@/components/app/common";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FolderOpen } from "lucide-react";
import {
  MOI_PROJECTS, MOI_SUBMISSIONS, MOI_INSPECTIONS, MOI_CERTS, MOI_DOC_FOLDERS, MOI_RENEWALS, MOI_CHECKLIST,
  docTone, daysLeftLabel,
} from "@/lib/moi-data";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/moi")({
  head: () => ({ meta: [
    { title: "MOI Compliance | SecureX CCTV COMPANY" },
    { name: "description", content: "Track MOI/SSD submissions, inspections, certificates, renewals and compliance documents." },
    { property: "og:title", content: "MOI Compliance | SecureX CCTV COMPANY" },
    { property: "og:description", content: "Track MOI/SSD submissions, inspections, certificates, renewals and compliance documents." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: MoiPage,
});

const demo = () => toast("Demo UI only");
const pname = (id: string) => MOI_PROJECTS.find((p) => p.id === id)?.name ?? id;
const soon = (iso?: string, days = 45) => !!iso && (new Date(iso).getTime() - Date.now()) / 86400000 <= days;
const th = "py-2 px-3 text-left text-[11px] uppercase text-muted-foreground whitespace-nowrap";
const td = "py-2 px-3 whitespace-nowrap";

function MoiPage() {
  const [open, setOpen] = useState(false);
  const pendingSubs = MOI_SUBMISSIONS.filter((s) => s.status === "Submitted" || s.status === "Pending");
  const corrections = MOI_PROJECTS.filter((p) => p.stage.includes("Correction"));
  const expiring = MOI_CERTS.filter((c) => c.status === "Expiring Soon" || c.status === "Expired" || c.status === "Renewal In Progress");
  const attention = MOI_PROJECTS.filter((p) => p.risk === "High" || p.risk === "Critical");

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-signal" />Compliance</>}
        title="MOI Compliance"
        subtitle="MOI / SSD submissions, inspections, certificates and renewals. Reference tracker only — not legal advice."
        actions={<Button size="sm" onClick={() => setOpen(true)} className="bg-signal text-white hover:bg-signal/90">New MOI record</Button>}
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Active MOI projects" value={MOI_PROJECTS.length} accent="blue" />
        <StatTile label="Design submissions pending" value={pendingSubs.length} accent="amber" />
        <StatTile label="Inspection requests pending" value={MOI_INSPECTIONS.filter((i) => i.result === "Requested" || i.result === "Scheduled").length} accent="cyan" />
        <StatTile label="Corrections required" value={corrections.length} accent="red" />
        <StatTile label="Certificates expiring soon" value={MOI_CERTS.filter((c) => c.type !== "Maintenance" && soon(c.expiry)).length} accent="amber" />
        <StatTile label="Maintenance contracts expiring" value={MOI_CERTS.filter((c) => c.type === "Maintenance" && soon(c.expiry)).length} accent="red" />
        <StatTile label="Missing documents" value={MOI_SUBMISSIONS.filter((s) => s.status === "Missing").length} accent="red" />
        <StatTile label="Approved company documents" value={MOI_DOC_FOLDERS.filter((f) => f.status === "Approved").length} accent="green" />
      </div>

      <Tabs defaultValue="overview">
        <div className="overflow-x-auto"><TabsList>
          {["Overview", "MOI Projects", "Submissions", "Inspections", "Certificates & Permits", "Document Register", "Renewal Calendar", "Compliance Checklist"].map((t) => (
            <TabsTrigger key={t} value={t === "Overview" ? "overview" : t}>{t}</TabsTrigger>
          ))}
        </TabsList></div>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ListCard title="Management attention" rows={attention.map((p) => ({ k: p.id, a: p.name, b: p.nextAction, s: `${p.risk} risk` }))} />
          <ListCard title="Upcoming expiries" rows={expiring.map((c) => ({ k: c.id, a: c.name, b: `${fmtDate(c.expiry)} · ${daysLeftLabel(c.expiry)}`, s: c.status }))} />
          <ListCard title="Pending submissions" rows={pendingSubs.map((s) => ({ k: s.id, a: s.item, b: pname(s.project), s: s.status }))} />
          <ListCard title="Inspection schedule" rows={MOI_INSPECTIONS.filter((i) => i.result !== "Passed").map((i) => ({ k: i.id, a: pname(i.project), b: i.scheduled ? fmtDate(i.scheduled) : `Requested ${fmtDate(i.requested)}`, s: i.result }))} />
          <ListCard title="Awaiting client / MOI action" rows={MOI_PROJECTS.filter((p) => ["Client Approval", "MOI Review", "Inspection Request"].includes(p.stage)).map((p) => ({ k: p.id, a: p.name, b: p.stage, s: p.certStatus }))} />
          <ListCard title="Corrections after inspection" rows={MOI_INSPECTIONS.flatMap((i) => i.failedItems.map((f, n) => ({ k: i.id + n, a: f, b: pname(i.project), s: "Failed" })))} />
        </TabsContent>

        <TabsContent value="MOI Projects" className="mt-4">
          <TableShell><table className="w-full text-sm">
            <thead><tr>{["Project ID", "Project", "Client", "Site", "MOI workflow status", "Coordinator", "Required docs", "Submission", "Inspection", "Certificate / approval", "Expiry", "Risk", "Next action"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>{MOI_PROJECTS.map((p) => (
              <tr key={p.id} className="border-t hairline hover:bg-muted/40">
                <td className={td}><MonoChip>{p.code}</MonoChip></td>
                <td className={td}>{p.projectId ? <Link to="/projects/$id" params={{ id: p.projectId }} className="hover:underline">{p.name}</Link> : p.name}</td>
                <td className={td}>{p.client}</td><td className={td}>{p.site}</td>
                <td className={td}><StatusPill status={p.stage} tone="info" /></td>
                <td className={td}>{p.coordinator}</td>
                <td className={td}><span className="num">{p.docsReady} / {p.docsTotal}</span></td>
                <td className={td}>{p.submissionDate ? fmtDate(p.submissionDate) : "—"}</td>
                <td className={td}>{p.inspectionDate ? fmtDate(p.inspectionDate) : "—"}</td>
                <td className={td}><StatusPill status={p.certStatus} tone={docTone(p.certStatus)} /></td>
                <td className={td}>{p.expiry ? fmtDate(p.expiry) : "—"}</td>
                <td className={td}><StatusPill status={p.risk} tone={docTone(p.risk)} /></td>
                <td className={td + " text-xs text-muted-foreground"}>{p.nextAction}</td>
              </tr>
            ))}</tbody>
          </table></TableShell>
        </TabsContent>

        <TabsContent value="Submissions" className="mt-4">
          <TableShell><table className="w-full text-sm">
            <thead><tr>{["Package item", "Project", "Submission status", "Review comments", "Resubmission", ""].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>{MOI_SUBMISSIONS.map((s) => (
              <tr key={s.id} className="border-t hairline">
                <td className={td}>{s.item}</td><td className={td}>{pname(s.project)}</td>
                <td className={td}><StatusPill status={s.status} tone={docTone(s.status)} /></td>
                <td className={td + " text-xs text-muted-foreground"}>{s.comments}</td>
                <td className={td}><StatusPill status={s.resubmission} tone={docTone(s.resubmission)} /></td>
                <td className={td}><Button size="sm" variant="ghost" onClick={demo}>View</Button></td>
              </tr>
            ))}</tbody>
          </table></TableShell>
        </TabsContent>

        <TabsContent value="Inspections" className="mt-4 grid gap-4 md:grid-cols-2">
          {MOI_INSPECTIONS.map((i) => (
            <Card key={i.id} className="p-4">
              <div className="flex items-center justify-between"><div className="font-semibold">{pname(i.project)}</div><StatusPill status={i.result} tone={docTone(i.result)} /></div>
              <div className="mt-1 text-xs text-muted-foreground">Requested {fmtDate(i.requested)}{i.scheduled && ` · Scheduled ${fmtDate(i.scheduled)}`}</div>
              {i.failedItems.length > 0 && <div className="mt-3 space-y-1.5"><div className="text-[11px] font-semibold uppercase text-muted-foreground">Failed items / corrective actions</div>
                {i.failedItems.map((f) => <div key={f} className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">{f}</div>)}</div>}
              <div className="mt-3 flex flex-wrap gap-2">
                {i.reinspection && <StatusPill status="Reinspection Required" tone="critical" />}
                <StatusPill status={`Certificate: ${i.cert}`} tone={i.cert === "Issued" ? "success" : "warning"} />
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="Certificates & Permits" className="mt-4">
          <TableShell><table className="w-full text-sm">
            <thead><tr>{["Certificate / permit", "Type", "Expiry", "Days remaining", "Renewal owner", "Renewal status", ""].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>{MOI_CERTS.map((c) => (
              <tr key={c.id} className="border-t hairline">
                <td className={td}>{c.name}</td><td className={td}>{c.type}</td><td className={td}>{fmtDate(c.expiry)}</td>
                <td className={td}><StatusPill status={daysLeftLabel(c.expiry)} tone={soon(c.expiry, 0) ? "critical" : soon(c.expiry) ? "warning" : "neutral"} /></td>
                <td className={td}>{c.owner}</td>
                <td className={td}><StatusPill status={c.status} tone={docTone(c.status)} /></td>
                <td className={td}><Button size="sm" variant="ghost" onClick={demo}>Start renewal</Button></td>
              </tr>
            ))}</tbody>
          </table></TableShell>
        </TabsContent>

        <TabsContent value="Document Register" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {MOI_DOC_FOLDERS.map((f) => (
            <button key={f.name} onClick={demo} className="panel-flat card-lift p-4 text-left">
              <FolderOpen className="h-5 w-5 text-signal" />
              <div className="mt-2 text-sm font-medium">{f.name}</div>
              <div className="mb-2 text-[11px] text-muted-foreground">{f.count} files</div>
              <StatusPill status={f.status} tone={docTone(f.status)} />
            </button>
          ))}
        </TabsContent>

        <TabsContent value="Renewal Calendar" className="mt-4">
          <Card className="divide-y hairline p-0">
            {MOI_RENEWALS.map((r) => (
              <div key={r.title} className="flex items-center gap-4 px-4 py-3">
                <div className="w-24 text-xs num text-muted-foreground">{fmtDate(r.date)}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm">{r.title}</div><div className="text-[11px] text-muted-foreground">{r.kind}</div></div>
                <StatusPill status={daysLeftLabel(r.date)} tone={soon(r.date, 0) ? "critical" : soon(r.date, 30) ? "warning" : "neutral"} />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="Compliance Checklist" className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MOI_CHECKLIST.map((g) => (
            <Card key={g.group} className="p-4">
              <div className="mb-2 font-semibold">{g.group}</div>
              {g.items.map((it) => <div key={it.label} className="flex items-center justify-between gap-2 py-1.5 text-sm">{it.label}<StatusPill status={it.status} tone={docTone(it.status)} /></div>)}
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New MOI record</DialogTitle></DialogHeader>
          <div className="space-y-2"><Input placeholder="Project name" /><Input placeholder="Client" /><Input placeholder="Assigned coordinator" /></div>
          <DialogFooter><Button onClick={() => { setOpen(false); demo(); }}>Save (demo)</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListCard({ title, rows }: { title: string; rows: { k: string; a: string; b: string; s: string }[] }) {
  return (
    <Card className="p-4">
      <div className="mb-2 font-semibold">{title}</div>
      {rows.length === 0 && <div className="text-xs text-muted-foreground">Nothing outstanding.</div>}
      <div className="divide-y hairline">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0"><div className="truncate text-sm">{r.a}</div><div className="truncate text-[11px] text-muted-foreground">{r.b}</div></div>
            <StatusPill status={r.s} tone={docTone(r.s.replace(" risk", ""))} />
          </div>
        ))}
      </div>
    </Card>
  );
}
