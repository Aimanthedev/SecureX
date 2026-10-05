import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/app/common";
import { MOI_SUBMISSIONS, MOI_INSPECTIONS, MOI_CERTS, MOI_CHECKLIST, MOI_WORKFLOW, docTone, daysLeftLabel, type MoiProject } from "@/lib/moi-data";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";

const demo = () => toast("Demo UI only");

export function MoiProjectPanel({ m }: { m: MoiProject }) {
  const subs = MOI_SUBMISSIONS.filter((s) => s.project === m.id);
  const insp = MOI_INSPECTIONS.filter((i) => i.project === m.id);
  const stageIdx = MOI_WORKFLOW.indexOf(m.stage);
  const certs = MOI_CERTS.filter((c) => c.type !== "Company").slice(0, 3);
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><h3 className="font-display text-lg font-semibold">MOI / SSD Workflow</h3><p className="text-xs text-muted-foreground">Current stage: {m.stage} · Coordinator {m.coordinator}</p></div>
          <div className="flex gap-2"><StatusPill status={m.certStatus} tone={docTone(m.certStatus)} /><StatusPill status={`${m.risk} risk`} tone={docTone(m.risk)} /></div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOI_WORKFLOW.map((s, i) => (
            <StatusPill key={s} status={s} tone={i < stageIdx ? "success" : i === stageIdx ? "info" : "neutral"} />
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Submission package & review comments</h3><Button size="sm" variant="outline" onClick={demo}>Add document</Button></div>
          <div className="mb-2 text-xs text-muted-foreground">Required documents: {m.docsReady} / {m.docsTotal} ready</div>
          <div className="divide-y hairline">
            {subs.length === 0 && <div className="py-3 text-xs text-muted-foreground">No submission items yet.</div>}
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0"><div className="truncate text-sm">{s.item}</div><div className="truncate text-[11px] text-muted-foreground">{s.comments}</div></div>
                <StatusPill status={s.status} tone={docTone(s.status)} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 font-semibold">Inspection & corrective actions</h3>
          {insp.length === 0 && <div className="text-xs text-muted-foreground">No inspection requested yet.</div>}
          {insp.map((i) => (
            <div key={i.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span>{i.scheduled ? `Scheduled ${fmtDate(i.scheduled)}` : `Requested ${fmtDate(i.requested)}`}</span><StatusPill status={i.result} tone={docTone(i.result)} /></div>
              {i.failedItems.map((f) => <div key={f} className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">{f}</div>)}
              {i.reinspection && <StatusPill status="Reinspection Required" tone="critical" />}
            </div>
          ))}
          <h4 className="mb-1 mt-4 text-xs font-semibold uppercase text-muted-foreground">Inspection checklist</h4>
          {MOI_CHECKLIST.find((g) => g.group === "Inspection readiness")!.items.map((it) => (
            <div key={it.label} className="flex items-center justify-between py-1 text-sm">{it.label}<StatusPill status={it.status} tone={docTone(it.status)} /></div>
          ))}
        </Card>
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-2 font-semibold">Certificate, maintenance contract & renewal reminders</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {certs.map((c) => (
              <div key={c.id} className="rounded-xl border border-border p-3">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">Expiry {fmtDate(c.expiry)} · {daysLeftLabel(c.expiry)}</div>
                <div className="mt-2"><StatusPill status={c.status} tone={docTone(c.status)} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
