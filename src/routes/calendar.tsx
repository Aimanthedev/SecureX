import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill } from "@/components/app/common";
import { fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/calendar")({ head: () => ({ meta: [{ title: "Calendar | AL HARIB CCTV COMPANY" }] }), component: CalPage });
const COLOR: Record<string, string> = { survey: "bg-signal/15 text-signal", milestone: "bg-success/15 text-success", install: "bg-warning-soft text-warning-foreground", ticket: "bg-critical-soft text-critical", visit: "bg-muted text-foreground" };
function CalPage() {
  const d = useData();
  const [view, setView] = useState("month");
  const events = [
    ...d.surveys.map((s) => ({ date: s.scheduled, label: "Survey " + s.number, kind: "survey" })),
    ...d.milestones.map((m) => ({ date: m.planned, label: m.title, kind: "milestone" })),
    ...d.tickets.map((t) => ({ date: t.opened, label: "Ticket " + t.number, kind: "ticket" })),
    ...d.amc.map((a) => ({ date: a.nextVisit, label: "AMC visit " + a.number, kind: "visit" })),
  ];
  const days = Array.from({ length: 35 }, (_, i) => { const day = ((i % 31) + 1); const iso = `2026-07-${String(day).padStart(2,"0")}`; return { day, iso, events: events.filter((e) => e.date === iso).slice(0,3) }; });
  return (
    <div>
      <PageHeader title="Calendar" subtitle="Surveys, milestones, installs, testing, service visits" actions={<Tabs value={view} onValueChange={setView}><TabsList><TabsTrigger value="month">Month</TabsTrigger><TabsTrigger value="week">Week</TabsTrigger><TabsTrigger value="day">Day</TabsTrigger><TabsTrigger value="agenda">Agenda</TabsTrigger></TabsList></Tabs>} />
      <Card className="p-3"><div className="grid grid-cols-7 gap-1 text-xs">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="uppercase text-muted-foreground text-[10px] p-1">{d}</div>)}{days.map((d) => (
        <div key={d.iso} className="border hairline rounded aspect-square p-1 overflow-hidden"><div className="text-[10px] num text-muted-foreground">{d.day}</div><div className="mt-1 space-y-0.5">{d.events.map((e, i) => (<div key={i} className={`text-[9px] rounded px-1 truncate ${COLOR[e.kind] || "bg-muted"}`}>{e.label}</div>))}</div></div>
      ))}</div></Card>
    </div>
  );
}
