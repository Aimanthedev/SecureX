import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { MonoChip, StatusPill, WorkStatusBadge, projectStatus, countStatus } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Home, ClipboardList, Package, User, HardHat, MapPin, CheckCircle2, AlertTriangle, Camera, PenSquare, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/field")({
  head: () => ({ meta: [{ title: "Field Operations | SecureX CCTV COMPANY" }] }),
  component: FieldOps,
});

function FieldOps() {
  const d = useData();
  const [tab, setTab] = useState<"today"|"projects"|"tasks"|"materials"|"me">("today");
  const [checkedIn, setCheckedIn] = useState(false);
  const myTasks = d.tasks.filter((t) => t.assigneeId === "E-010").slice(0, 5);
  const todayProject = d.projects.find((p) => p.id === "P-041")!;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-[var(--topbar-bg)] px-4 pb-4 pt-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Good morning</div>
            <div className="font-semibold text-lg tracking-[-0.02em]">Suresh Kumar</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium" style={{ background: checkedIn ? "rgba(32,211,154,0.12)" : "rgba(133,164,204,0.08)", borderColor: checkedIn ? "rgba(32,211,154,0.4)" : "rgba(133,164,204,0.16)", color: checkedIn ? "#20D39A" : "#A8B7CA" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: checkedIn ? "#20D39A" : "#66778D" }} />
              {checkedIn ? "On site" : "Off site"}
            </span>
            <Link to="/" className="text-[11px] text-muted-foreground hover:text-foreground">Exit</Link>
          </div>
        </div>
      </header>

      {tab === "today" && (
        <div className="p-4 space-y-4">
          <div className="panel relative overflow-hidden p-4">
            <div className="pointer-events-none absolute inset-0 grid-fade opacity-60" />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Today at</div>
              <div className="font-semibold text-xl tracking-[-0.02em] mt-0.5">{todayProject.name}</div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Industrial Area, Al Wakrah</div>
              <div className="mt-4 flex gap-2">
                {!checkedIn ? (
                  <Button className="flex-1 h-11 rounded-xl bg-[#2F83FF] text-white text-[14px] font-medium hover:bg-[#2F83FF]/90" onClick={() => { setCheckedIn(true); toast.success("Checked in at 07:45"); }}><LogIn className="w-4 h-4 mr-1.5" />Check in</Button>
                ) : (
                  <Button variant="outline" className="flex-1 h-11 rounded-xl border-[rgba(133,164,204,0.22)] text-[14px]" onClick={() => { setCheckedIn(false); toast("Checked out."); }}><LogOut className="w-4 h-4 mr-1.5" />Check out</Button>
                )}
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-[rgba(133,164,204,0.22)]" onClick={() => toast.success("Photo captured (demo)")}><Camera className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          <div className="panel-flat p-4">
            <div className="mb-3 flex items-center justify-between"><div className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">Today's Tasks</div><div className="num text-[12px] text-muted-foreground">{myTasks.length}</div></div>
            <div className="space-y-2.5">{myTasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-start justify-between gap-2"><div className="text-[14px] font-medium">{t.title}</div><StatusPill status={t.priority} tone={t.priority==="Critical"?"critical":t.priority==="High"?"warning":"neutral"} /></div>
                <div className="mt-2 flex items-center justify-between text-[11.5px] text-muted-foreground"><span>{t.phase}</span><span className="num">Due {fmtDate(t.due)}</span></div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-10 rounded-lg border-[rgba(133,164,204,0.2)] text-[12.5px]" onClick={() => toast.success("Task started")}>Start</Button>
                  <Button size="sm" className="flex-1 h-10 rounded-lg bg-[#20D39A] text-[#06101D] font-medium text-[12.5px] hover:bg-[#20D39A]/90" onClick={() => toast.success("Task completed")}><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Complete</Button>
                </div>
              </div>
            ))}</div>
          </div>

          <div className="panel-flat p-4">
            <div className="mb-3 text-[13px] font-medium uppercase tracking-wide text-muted-foreground">Quick actions</div>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="outline" className="h-12 rounded-xl border-[rgba(255,170,44,0.3)] bg-[rgba(255,170,44,0.08)] text-[#FFAA2C] text-[13px]" onClick={() => toast.success("Issue raised.")}><AlertTriangle className="w-4 h-4 mr-1.5" />Raise issue</Button>
              <Button variant="outline" className="h-12 rounded-xl border-[rgba(24,213,255,0.3)] bg-[rgba(24,213,255,0.08)] text-[#18D5FF] text-[13px]" onClick={() => toast.success("Evidence uploaded.")}><Camera className="w-4 h-4 mr-1.5" />Upload evidence</Button>
              <Button variant="outline" className="h-12 rounded-xl border-[rgba(150,84,255,0.3)] bg-[rgba(150,84,255,0.08)] text-[#9654FF] text-[13px]" onClick={() => toast.success("Signature captured.")}><PenSquare className="w-4 h-4 mr-1.5" />Client sign</Button>
              <Button variant="outline" className="h-12 rounded-xl border-[rgba(47,131,255,0.3)] bg-[rgba(47,131,255,0.08)] text-[#2F83FF] text-[13px]" onClick={() => toast("Material request sent")}><Package className="w-4 h-4 mr-1.5" />Request material</Button>
            </div>
          </div>
        </div>
      )}

      {tab === "projects" && <div className="p-4 space-y-2.5">{d.projects.map((p) => (
        <div key={p.id} className="panel-flat p-4">
          <div className="text-[14px] font-medium">{p.name}</div>
          <div className="mt-2.5 flex items-center gap-2"><WorkStatusBadge status={projectStatus(p)} /><StatusPill status={p.phase} tone="info" /></div>
        </div>
      ))}</div>}

      {tab === "tasks" && <div className="p-4 space-y-2.5">{d.tasks.slice(0,10).map((t) => (
        <div key={t.id} className="panel-flat p-3.5 text-[14px]">
          <div className="font-medium">{t.title}</div>
          <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-muted-foreground"><span>{t.phase}</span><StatusPill status={t.status} tone="info" /></div>
        </div>
      ))}</div>}

      {tab === "materials" && <div className="p-4 space-y-2.5">{d.materials.slice(0,10).map((m) => (
        <div key={m.id} className="panel-flat p-3.5 text-[14px]">
          <div className="font-medium">{m.name}</div>
          <div className="mt-1 text-[11.5px] text-muted-foreground">Issued <span className="num text-foreground">{m.issued}</span> of <span className="num text-foreground">{m.required}</span></div>
          <div className="mt-2"><WorkStatusBadge status={countStatus(m.issued, m.required)} /></div>
        </div>
      ))}</div>}

      {tab === "me" && <div className="p-4 space-y-3">
        <div className="panel-flat p-4">
          <div className="font-semibold text-[16px]">Suresh Kumar</div>
          <div className="text-[12px] text-muted-foreground">Lead Technician · Installation</div>
        </div>
        <div className="panel-flat p-4">
          <div className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">This week</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-[11px] text-muted-foreground">Hours</div><div className="num text-lg font-semibold">38</div></div>
            <div><div className="text-[11px] text-muted-foreground">Tasks</div><div className="num text-lg font-semibold">12</div></div>
            <div><div className="text-[11px] text-muted-foreground">Sites</div><div className="num text-lg font-semibold">3</div></div>
          </div>
        </div>
      </div>}

      <nav className="fixed bottom-0 left-1/2 grid w-full max-w-md -translate-x-1/2 grid-cols-5 border-t border-border bg-[var(--topbar-bg)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        {[[Home, "today", "Today"],[HardHat, "projects", "Projects"],[ClipboardList, "tasks", "Tasks"],[Package, "materials", "Materials"],[User, "me", "Me"]].map(([Icon, key, label]: any) => (
          <button key={key} onClick={() => setTab(key)} className={tab === key ? "flex flex-col items-center gap-0.5 py-2.5 text-[10px] text-signal" : "flex flex-col items-center gap-0.5 py-2.5 text-[10px] text-muted-foreground"}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
