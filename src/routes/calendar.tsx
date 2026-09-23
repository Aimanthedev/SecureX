import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatTile, Panel, PanelHead, Segmented, MonoChip, EmptyState } from "@/components/app/common";
import { fmtDate } from "@/lib/format";

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

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function CalPage() {
  const d = useData();
  const [view, setView] = useState("month");
  // Anchor "today" to the demo data's active period (mid-July 2026) so events are visible by default.
  const today = new Date("2026-07-21T00:00:00");
  const [cursor, setCursor] = useState(new Date(today));

  const events = useMemo(() => [
    ...d.surveys.map((s) => ({ date: s.scheduled, label: "Survey " + s.number, kind: "survey" })),
    ...d.milestones.filter((m) => !m.done).map((m) => ({ date: m.planned, label: m.title, kind: "milestone" })),
    ...d.tickets.map((t) => ({ date: t.opened, label: "Ticket " + t.number, kind: "ticket" })),
    ...d.amc.map((a) => ({ date: a.nextVisit, label: "AMC visit " + a.number, kind: "visit" })),
  ].filter((e) => !!e.date), [d]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: Math.ceil((startOffset + daysInMonth) / 7) * 7 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return { day: dayNum, iso, events: events.filter((e) => e.date === iso) };
  });

  const counts = {
    survey: events.filter((e) => e.kind === "survey").length,
    milestone: events.filter((e) => e.kind === "milestone").length,
    ticket: events.filter((e) => e.kind === "ticket").length,
    visit: events.filter((e) => e.kind === "visit").length,
  };

  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => { const dt = new Date(weekStart); dt.setDate(weekStart.getDate() + i); return dt; });
  const isoOf = (dt: Date) => dt.toISOString().slice(0, 10);
  const todayIso = isoOf(today);

  const agenda = useMemo(() => events
    .filter((e) => e.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 30), [events, todayIso]);

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

      {view === "month" && (
        <Panel className="rise rise-2" texture="grid" accent="cyan">
          <PanelHead
            title={`${MONTH_NAMES[month]} ${year}`}
            sub="Scheduled activity across the portfolio"
            accent="cyan"
            right={
              <div className="flex items-center gap-1.5 text-xs">
                <button className="rounded-md border border-[rgba(133,164,204,0.16)] px-2 py-1 hover:bg-[rgba(133,164,204,0.08)]" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
                <button className="rounded-md border border-[rgba(133,164,204,0.16)] px-2 py-1 hover:bg-[rgba(133,164,204,0.08)]" onClick={() => setCursor(new Date(today))}>Today</button>
                <button className="rounded-md border border-[rgba(133,164,204,0.16)] px-2 py-1 hover:bg-[rgba(133,164,204,0.08)]" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
              </div>
            }
          />
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dw) => (
              <div key={dw} className="label-xs p-1 text-center">{dw}</div>
            ))}
            {days.map((day, i) => day === null ? <div key={i} /> : (
              <div key={day.iso} className={`aspect-square rounded-xl border p-1.5 overflow-hidden ${day.iso === todayIso ? "border-[rgba(47,131,255,0.5)] bg-[rgba(47,131,255,0.08)]" : "border-[rgba(133,164,204,0.10)] bg-[rgba(133,164,204,0.03)]"}`}>
                <div className="num text-[10px] text-muted-foreground">{day.day}</div>
                <div className="mt-1 space-y-0.5">
                  {day.events.slice(0, 3).map((e, i2) => {
                    const c = COLOR[e.kind] || COLOR.visit;
                    return <div key={i2} className="truncate rounded px-1 text-[9px] font-medium" style={{ background: c.bg, color: c.text }}>{e.label}</div>;
                  })}
                  {day.events.length > 3 && <div className="text-[9px] text-muted-foreground">+{day.events.length - 3} more</div>}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {view === "week" && (
        <Panel className="rise rise-2" texture="grid" accent="blue">
          <PanelHead title="This Week" sub={`${fmtDate(isoOf(weekDays[0]))} – ${fmtDate(isoOf(weekDays[6]))}`} accent="blue" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {weekDays.map((dt) => {
              const iso = isoOf(dt);
              const dayEvents = events.filter((e) => e.date === iso);
              return (
                <div key={iso} className={`rounded-xl border p-2 ${iso === todayIso ? "border-[rgba(47,131,255,0.5)] bg-[rgba(47,131,255,0.08)]" : "border-[rgba(133,164,204,0.10)] bg-[rgba(133,164,204,0.03)]"}`}>
                  <div className="label-xs mb-1">{dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</div>
                  <div className="space-y-1">
                    {dayEvents.length === 0 && <div className="text-[10px] text-muted-foreground">—</div>}
                    {dayEvents.map((e, i) => { const c = COLOR[e.kind] || COLOR.visit; return <div key={i} className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: c.bg, color: c.text }}>{e.label}</div>; })}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {view === "day" && (
        <Panel className="rise rise-2" texture="grid" accent="purple">
          <PanelHead title={today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} sub="Today's scheduled activity" accent="purple" />
          {events.filter((e) => e.date === todayIso).length === 0 ? (
            <EmptyState title="Nothing scheduled today" />
          ) : (
            <div className="space-y-2">
              {events.filter((e) => e.date === todayIso).map((e, i) => {
                const c = COLOR[e.kind] || COLOR.visit;
                return <div key={i} className="flex items-center gap-2.5 rounded-lg border border-[rgba(133,164,204,0.10)] px-3 py-2"><span className="h-2 w-2 rounded-full" style={{ background: c.text }} /><span className="text-sm text-foreground">{e.label}</span><span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">{e.kind}</span></div>;
              })}
            </div>
          )}
        </Panel>
      )}

      {view === "agenda" && (
        <Panel className="rise rise-2" texture="grid" accent="green">
          <PanelHead title="Upcoming Agenda" sub="Next 30 scheduled items, chronologically" accent="green" />
          {agenda.length === 0 ? <EmptyState title="Nothing upcoming" /> : (
            <div className="divide-y divide-[rgba(133,164,204,0.08)]">
              {agenda.map((e, i) => {
                const c = COLOR[e.kind] || COLOR.visit;
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <MonoChip>{fmtDate(e.date)}</MonoChip>
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.text }} />
                    <span className="text-sm text-foreground">{e.label}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">{e.kind}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
