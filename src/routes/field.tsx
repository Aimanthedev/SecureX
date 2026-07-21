import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { MonoChip, StatusPill, ProgressBar } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Home, ClipboardList, Package, User, HardHat, MapPin, CheckCircle2, AlertTriangle, Camera, PenSquare, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/field")({
  head: () => ({ meta: [{ title: "Field Operations | AL HARIB CCTV COMPANY" }] }),
  component: FieldOps,
});

function FieldOps() {
  const d = useData();
  const [tab, setTab] = useState<"today"|"projects"|"tasks"|"materials"|"me">("today");
  const [checkedIn, setCheckedIn] = useState(false);
  const myTasks = d.tasks.filter((t) => t.assigneeId === "E-010").slice(0, 5);
  const todayProject = d.projects.find((p) => p.id === "P-041")!;
  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto pb-20">
      <header className="bg-sidebar text-sidebar-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div><div className="text-xs opacity-70">Good morning</div><div className="font-display font-semibold">Suresh Kumar</div></div>
          <Link to="/" className="text-xs opacity-70 hover:opacity-100">Exit field</Link>
        </div>
      </header>

      {tab === "today" && (
        <div className="p-4 space-y-4">
          <div className="border hairline rounded-xl p-4 bg-card">
            <div className="text-xs uppercase text-muted-foreground">Today at</div>
            <div className="font-display font-semibold text-lg">{todayProject.name}</div>
            <div className="text-xs flex items-center gap-1 text-muted-foreground mt-1"><MapPin className="w-3 h-3" /> Industrial Area, Al Wakrah</div>
            <div className="mt-3 flex gap-2">
              {!checkedIn ? (
                <Button className="flex-1 bg-signal text-signal-foreground" onClick={() => { setCheckedIn(true); toast.success("Checked in at 07:45"); }}><LogIn className="w-4 h-4 mr-1" />Check in</Button>
              ) : (
                <Button variant="outline" className="flex-1" onClick={() => { setCheckedIn(false); toast("Checked out."); }}>Check out</Button>
              )}
              <Button variant="outline" size="icon" onClick={() => toast.success("Photo captured (demo)")}><Camera className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="border hairline rounded-xl p-4 bg-card">
            <div className="flex items-center justify-between mb-3"><div className="font-medium text-sm">Today's Tasks</div><div className="text-xs num text-muted-foreground">{myTasks.length}</div></div>
            <div className="space-y-2">{myTasks.map((t) => (
              <div key={t.id} className="border hairline rounded-lg p-3">
                <div className="flex items-start justify-between gap-2"><div className="text-sm font-medium">{t.title}</div><StatusPill status={t.priority} tone={t.priority==="Critical"?"critical":t.priority==="High"?"warning":"neutral"} /></div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{t.phase}</span><span className="num">Due {fmtDate(t.due)}</span></div>
                <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success("Task started")}>Start</Button><Button size="sm" className="flex-1 bg-success text-success-foreground" onClick={() => toast.success("Task completed")}><CheckCircle2 className="w-3 h-3 mr-1" />Complete</Button></div>
              </div>
            ))}</div>
          </div>
          <div className="border hairline rounded-xl p-4 bg-card">
            <div className="font-medium text-sm mb-3">Quick actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => toast.success("Issue raised.")}><AlertTriangle className="w-4 h-4 mr-1" />Raise issue</Button>
              <Button variant="outline" onClick={() => toast.success("Evidence uploaded.")}><Camera className="w-4 h-4 mr-1" />Upload evidence</Button>
              <Button variant="outline" onClick={() => toast.success("Signature captured.")}><PenSquare className="w-4 h-4 mr-1" />Client sign</Button>
              <Button variant="outline" onClick={() => toast("Material request sent")}><Package className="w-4 h-4 mr-1" />Request material</Button>
            </div>
          </div>
        </div>
      )}
      {tab === "projects" && <div className="p-4 space-y-2">{d.projects.map((p) => (
        <div key={p.id} className="border hairline rounded-xl p-3 bg-card"><div className="text-sm font-medium">{p.name}</div><div className="mt-1"><ProgressBar value={p.actualProgress} planned={p.plannedProgress} /></div><div className="mt-2 text-xs text-muted-foreground num">{p.actualProgress}% actual · {p.plannedProgress}% planned</div></div>
      ))}</div>}
      {tab === "tasks" && <div className="p-4 space-y-2">{d.tasks.slice(0,10).map((t) => (
        <div key={t.id} className="border hairline rounded-xl p-3 bg-card text-sm"><div className="font-medium">{t.title}</div><div className="mt-1 flex items-center justify-between text-xs text-muted-foreground"><span>{t.phase}</span><StatusPill status={t.status} tone="info" /></div></div>
      ))}</div>}
      {tab === "materials" && <div className="p-4 space-y-2">{d.materials.slice(0,10).map((m) => (
        <div key={m.id} className="border hairline rounded-xl p-3 bg-card text-sm"><div className="font-medium">{m.name}</div><div className="text-xs text-muted-foreground mt-0.5">Issued <span className="num">{m.issued}</span> of <span className="num">{m.required}</span></div></div>
      ))}</div>}
      {tab === "me" && <div className="p-4 space-y-3">
        <div className="border hairline rounded-xl p-4 bg-card"><div className="font-display font-semibold">Suresh Kumar</div><div className="text-xs text-muted-foreground">Lead Technician · Installation</div></div>
        <div className="border hairline rounded-xl p-4 bg-card text-sm"><div className="text-muted-foreground text-xs uppercase mb-2">This week</div><div className="grid grid-cols-3 gap-2 text-center"><div><div className="text-xs text-muted-foreground">Hours</div><div className="num font-semibold text-lg">38</div></div><div><div className="text-xs text-muted-foreground">Tasks</div><div className="num font-semibold text-lg">12</div></div><div><div className="text-xs text-muted-foreground">Sites</div><div className="num font-semibold text-lg">3</div></div></div></div>
      </div>}

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t hairline grid grid-cols-5">
        {[[Home, "today", "Today"],[HardHat, "projects", "Projects"],[ClipboardList, "tasks", "Tasks"],[Package, "materials", "Materials"],[User, "me", "Me"]].map(([Icon, key, label]: any) => (
          <button key={key} onClick={() => setTab(key)} className={`flex flex-col items-center py-2 text-[10px] ${tab === key ? "text-signal" : "text-muted-foreground"}`}><Icon className="w-5 h-5" /><span className="mt-0.5">{label}</span></button>
        ))}
      </nav>
    </div>
  );
}
