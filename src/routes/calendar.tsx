import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatTile, Panel, PanelHead, Segmented, MonoChip } from "@/components/app/common";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [
    { title: "Calendar | SecureX CCTV COMPANY" },
    { name: "description", content: "Unified schedule of surveys, milestones, installs and service visits." },
  ] }),
  component: CalPage,
});

const COLOR: Record<string, { bg: string; text: string }> = {
  survey: { bg: "rgba(24,213,255,0.14)", text: "#18D5FF" },
  milestone: { bg: "rgba(32,211,154,0.14)", text: "#20D39A" },
  install: { bg: "rgba(255,170,44,0.14)", text: "#FFAA2C" },
  ticket: { bg: "rgba(255,70,100,0.14)", text: "#FF4664" },
  visit: { bg: "rgba(150,84,255,0.14)", text: "#9654FF" },
};

function CalPage() {
  const d = useData();
  const [view, setView] = useState("month");
  const events = [
    ...d.surveys.map((s) => ({ date: s.scheduled, label: "Survey " + s.number, kind: "survey" })),
    ...d.milestones.map((m) => ({ date: m.planned, label: m.title, kind: "milestone" })),
    ...d.tickets.map((t) => ({ date: t.opened, label: "Ticket " + t.number, kind: "ticket" })),
    ...d.amc.map((a) => ({ date: a.nextVisit, label: "AMC visit " + a.number, kind: "visit" })),
  ];
  const days = Array.from({ length: 35 }, (_, i) => {
    const day = (i % 31) + 1;
    const iso = `2026-07-${String(day).padStart(2, "0")}`;
    return { day, iso, events: events.filter((e) => e.date === iso).slice(0, 3) };
  });

  const counts = {
    survey: events.filter((e) => e.kind === "survey").length,
    milestone: events.filter((e) => e.kind === "milestone").length,
    ticket: events.filter((e) => e.kind === "ticket").length,
    visit: events.filter((e) => e.kind === "visit").length,
  };

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#18D5FF] shadow-[0_0_8px_#18D5FF]" />Operations Schedule</>}
        title="Calendar"
        subtitle="Surveys, milestones, installs, testing and service visits across every active engagement"
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "month", label: "Month" },
              { value: "week", label: "Week" },
              { value: "day", label: "Day" },
              { value: "agenda", label: "Agenda" },
            ]}
          />
        }
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Surveys" value={counts.survey} accent="cyan" />
        <StatTile label="Milestones" value={counts.milestone} accent="green" />
        <StatTile label="Tickets" value={counts.ticket} accent="red" />
        <StatTile label="AMC Visits" value={counts.visit} accent="purple" />
      </div>

      <Panel className="rise rise-2" texture="grid" accent="cyan">
        <PanelHead title="July 2026" sub="Scheduled activity across the portfolio" accent="cyan" />
        <div className="grid grid-cols-7 gap-1.5 text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dw) => (
            <div key={dw} className="label-xs p-1 text-center">{dw}</div>
          ))}
          {days.map((day) => (
            <div key={day.iso} className="aspect-square rounded-xl border border-border bg-muted/40 p-1.5 overflow-hidden">
              <div className="num text-[10px] text-muted-foreground">{day.day}</div>
              <div className="mt-1 space-y-0.5">
                {day.events.map((e, i) => {
                  const c = COLOR[e.kind] || COLOR.visit;
                  return (
                    <div key={i} className="truncate rounded px-1 text-[9px] font-medium" style={{ background: c.bg, color: c.text }}>
                      {e.label}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
