import React from "react";
import { cn } from "@/lib/utils";
import type { ProjectHealth } from "@/lib/mock-data";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

/* ────────────────────────────────────────────────────────────────
   AL HARIB command design system — dark navy operations language
   ──────────────────────────────────────────────────────────────── */

export type Accent = "blue" | "cyan" | "purple" | "magenta" | "green" | "amber" | "red";

export const ACCENT: Record<Accent, { hex: string; from: string; to: string; soft: string; ring: string }> = {
  blue:    { hex: "#2F83FF", from: "rgba(47,131,255,0.28)",  to: "rgba(47,131,255,0)",  soft: "rgba(47,131,255,0.12)",  ring: "rgba(47,131,255,0.45)" },
  cyan:    { hex: "#18D5FF", from: "rgba(24,213,255,0.26)",  to: "rgba(24,213,255,0)",  soft: "rgba(24,213,255,0.12)",  ring: "rgba(24,213,255,0.42)" },
  purple:  { hex: "#9654FF", from: "rgba(150,84,255,0.28)",  to: "rgba(150,84,255,0)",  soft: "rgba(150,84,255,0.12)",  ring: "rgba(150,84,255,0.45)" },
  magenta: { hex: "#E447C4", from: "rgba(228,71,196,0.26)",  to: "rgba(228,71,196,0)",  soft: "rgba(228,71,196,0.12)",  ring: "rgba(228,71,196,0.42)" },
  green:   { hex: "#20D39A", from: "rgba(32,211,154,0.26)",  to: "rgba(32,211,154,0)",  soft: "rgba(32,211,154,0.12)",  ring: "rgba(32,211,154,0.42)" },
  amber:   { hex: "#FFAA2C", from: "rgba(255,170,44,0.26)",  to: "rgba(255,170,44,0)",  soft: "rgba(255,170,44,0.12)",  ring: "rgba(255,170,44,0.42)" },
  red:     { hex: "#FF4664", from: "rgba(255,70,100,0.28)",  to: "rgba(255,70,100,0)",  soft: "rgba(255,70,100,0.12)",  ring: "rgba(255,70,100,0.45)" },
};

export const CHART_COLORS = ["#2F83FF", "#18D5FF", "#9654FF", "#E447C4", "#20D39A", "#FFAA2C"];

export function MonoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("mono-chip", className)}>{children}</span>;
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("label-xs", className)}>{children}</div>;
}

/* ── Page header ─────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, actions, eyebrow }: {
  title: string; subtitle?: string; actions?: React.ReactNode; eyebrow?: React.ReactNode;
}) {
  return (
    <div className="rise mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="label-xs mb-1.5 flex items-center gap-2">{eyebrow}</div>}
        <h1 className="truncate text-[26px] md:text-[30px] font-semibold tracking-[-0.03em] text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Panel: the base card family ─────────────────────────────── */
export function Panel({ children, className, pad = true, accent, texture }: {
  children: React.ReactNode; className?: string; pad?: boolean; accent?: Accent;
  texture?: "grid" | "dots" | "none";
}) {
  return (
    <div
      className={cn("panel relative overflow-hidden", pad && "p-4 md:p-5", className)}
      style={accent ? { borderColor: ACCENT[accent].ring.replace("0.4", "0.3") } : undefined}
    >
      {texture === "grid" && <div className="pointer-events-none absolute inset-0 grid-fade" />}
      {texture === "dots" && <div className="pointer-events-none absolute inset-0 dot-fade" />}
      {accent && (
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full blur-3xl"
          style={{ background: ACCENT[accent].from }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

export function PanelHead({ title, sub, right, icon, accent = "blue" }: {
  title: string; sub?: string; right?: React.ReactNode; icon?: React.ReactNode; accent?: Accent;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
            style={{ background: ACCENT[accent].soft, borderColor: ACCENT[accent].ring, color: ACCENT[accent].hex }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.02em]">{title}</h3>
          {sub && <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}

/* ── Metric card family ──────────────────────────────────────── */
export function MetricCard({ label, value, delta, sub, icon, accent = "blue", spark, onClick, motif = "grid", className }: {
  label: string; value: React.ReactNode; delta?: string; sub?: React.ReactNode; icon?: React.ReactNode;
  accent?: Accent; spark?: number[]; onClick?: () => void; motif?: "grid" | "camera" | "nodes" | "channels" | "waves"; className?: string;
}) {
  const a = ACCENT[accent];
  const Comp: any = onClick ? "button" : "div";
  const id = React.useId().replace(/[:]/g, "");
  return (
    <Comp
      onClick={onClick}
      className={cn("panel card-lift group relative flex h-full w-full flex-col overflow-hidden p-4 text-left", onClick && "cursor-pointer", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ background: `radial-gradient(120% 120% at 100% 0%, ${a.from} 0%, transparent 58%)` }}
      />
      <Motif kind={motif} color={a.hex} />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="label-xs">{label}</div>
          {icon && (
            <div className="grid h-7 w-7 place-items-center rounded-lg border" style={{ background: a.soft, borderColor: a.ring, color: a.hex }}>
              {icon}
            </div>
          )}
        </div>
        <div className="num mt-3 text-[28px] font-semibold leading-none tracking-[-0.035em] text-foreground">{value}</div>
        <div className="mt-2 flex items-center gap-2 text-[11.5px]">
          {delta && (
            <span
              className="num rounded-md px-1.5 py-0.5 font-medium"
              style={{
                background: delta.startsWith("-") ? "rgba(255,70,100,0.12)" : "rgba(32,211,154,0.12)",
                color: delta.startsWith("-") ? "#FF4664" : "#20D39A",
              }}
            >
              {delta}
            </span>
          )}
          {sub && <span className="truncate text-muted-foreground">{sub}</span>}
        </div>
        {spark && spark.length > 0 && (
          <div className="mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark.map((v, i) => ({ i, v }))} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id={`mc${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={a.hex} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={a.hex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={a.hex} strokeWidth={1.8} fill={`url(#mc${id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Comp>
  );
}

/** Abstract CCTV-flavoured background geometry. */
export function Motif({ kind, color }: { kind: "grid" | "camera" | "nodes" | "channels" | "waves"; color: string }) {
  return (
    <svg className="pointer-events-none absolute -right-4 -top-2 h-[120px] w-[190px] opacity-[0.22]" viewBox="0 0 190 120" fill="none" aria-hidden>
      {kind === "camera" && (
        <g stroke={color} strokeWidth="1.2">
          <path d="M60 78 L112 52 l14 30 -52 26z" opacity="0.55" />
          <path d="M126 60 l22 -10 6 18 -22 10z" opacity="0.4" />
          <path d="M86 96 v14" opacity="0.4" />
          <path d="M40 118 a72 72 0 0 1 120 -52" opacity="0.25" />
          <path d="M58 118 a54 54 0 0 1 88 -40" opacity="0.18" />
        </g>
      )}
      {kind === "nodes" && (
        <g stroke={color} strokeWidth="1" opacity="0.6">
          <path d="M20 90 L60 40 L110 70 L160 26" />
          <path d="M60 40 L100 108 L160 26" opacity="0.4" />
          {[[20, 90], [60, 40], [110, 70], [160, 26], [100, 108]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.2" fill={color} stroke="none" />
          ))}
        </g>
      )}
      {kind === "channels" && (
        <g fill={color} opacity="0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={18 + i * 21} y={110 - (12 + ((i * 37) % 70))} width="9" height={12 + ((i * 37) % 70)} rx="3" opacity={0.25 + (i % 4) * 0.14} />
          ))}
        </g>
      )}
      {kind === "waves" && (
        <g stroke={color} strokeWidth="1.2" opacity="0.45">
          <path d="M0 90 C 40 40, 70 120, 110 62 S 170 30, 190 60" />
          <path d="M0 108 C 40 60, 70 132, 110 80 S 170 48, 190 78" opacity="0.5" />
        </g>
      )}
      {kind === "grid" && (
        <g stroke={color} strokeWidth="0.8" opacity="0.4">
          {Array.from({ length: 7 }).map((_, i) => <path key={`h${i}`} d={`M0 ${i * 20} H190`} />)}
          {Array.from({ length: 10 }).map((_, i) => <path key={`v${i}`} d={`M${i * 20} 0 V120`} />)}
        </g>
      )}
    </svg>
  );
}

/* ── Compact stat tile ───────────────────────────────────────── */
export function StatTile({ label, value, accent = "blue", sub, onClick, active }: {
  label: string; value: React.ReactNode; accent?: Accent; sub?: string; onClick?: () => void; active?: boolean;
}) {
  const a = ACCENT[accent];
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn("panel-flat card-lift relative overflow-hidden p-3 text-left", onClick && "cursor-pointer")}
      style={active ? { borderColor: a.ring, boxShadow: `0 0 0 1px ${a.soft}` } : undefined}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${a.hex}, transparent)` }} />
      <div className="label-xs truncate">{label}</div>
      <div className="num mt-1.5 text-xl font-semibold leading-none" style={{ color: a.hex }}>{value}</div>
      {sub && <div className="mt-1 truncate text-[11px] text-muted-foreground">{sub}</div>}
    </Comp>
  );
}

/* ── Status language ─────────────────────────────────────────── */
const healthMap: Record<ProjectHealth, Accent> = {
  "On Track": "green",
  "Watch": "amber",
  "At Risk": "red",
  "Awaiting Materials": "amber",
  "Delayed": "red",
};

export function HealthBadge({ label }: { label: ProjectHealth }) {
  const a = ACCENT[healthMap[label] ?? "blue"];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[11px] font-medium"
      style={{ background: a.soft, borderColor: a.ring, color: a.hex }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.hex, boxShadow: `0 0 8px ${a.hex}` }} />
      {label}
    </span>
  );
}

export function StatusPill({ status, tone = "neutral" }: {
  status: string; tone?: "neutral" | "success" | "warning" | "critical" | "info" | "purple" | "cyan";
}) {
  const map: Record<string, Accent | null> = {
    success: "green", warning: "amber", critical: "red", info: "blue", purple: "purple", cyan: "cyan", neutral: null,
  };
  const key = map[tone];
  if (!key) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full border border-[rgba(133,164,204,0.16)] bg-[rgba(133,164,204,0.07)] px-2.5 py-[3px] text-[11px] font-medium text-muted-foreground">
        {status}
      </span>
    );
  }
  const a = ACCENT[key];
  return (
    <span
      className="inline-flex whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[11px] font-medium"
      style={{ background: a.soft, borderColor: a.ring, color: a.hex }}
    >
      {status}
    </span>
  );
}

/* ── Work status language (replaces percentage progress) ─────── */
export type WorkStatus =
  | "Not Started" | "Pending" | "In Progress" | "On Hold" | "Awaiting Material"
  | "Awaiting Client" | "Ready for Testing" | "Testing" | "Completed" | "Delayed" | "Blocked";

const WORK_STATUS_TONE: Record<WorkStatus, "neutral" | "success" | "warning" | "critical" | "info" | "purple" | "cyan"> = {
  "Not Started": "neutral",
  "Pending": "neutral",
  "In Progress": "info",
  "On Hold": "warning",
  "Awaiting Material": "warning",
  "Awaiting Client": "warning",
  "Ready for Testing": "cyan",
  "Testing": "purple",
  "Completed": "success",
  "Delayed": "critical",
  "Blocked": "critical",
};

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  return <StatusPill status={status} tone={WORK_STATUS_TONE[status]} />;
}

/** Operational status of a project, derived from phase and health — never a percentage. */
export function projectStatus(
  p: { phase: string; actualProgress?: number; plannedProgress?: number },
  healthLabel?: ProjectHealth,
): WorkStatus {
  switch (p.phase) {
    case "On Hold": return "On Hold";
    case "Delayed": return "Delayed";
    case "Awaiting Client":
    case "Client Approval": return "Awaiting Client";
    case "Awaiting Materials":
    case "Procurement":
    case "Material Delivery": return "Awaiting Material";
    case "Testing": return "Testing";
    case "Handover":
    case "Warranty":
    case "AMC": return "Completed";
    case "Project Setup": return "Not Started";
    default: break;
  }
  if (healthLabel === "Delayed") return "Delayed";
  if (healthLabel === "Awaiting Materials") return "Awaiting Material";
  if (healthLabel === "At Risk") return "Blocked";
  return "In Progress";
}

/** Material status from factual delivered / required counts. */
export function materialStatus(mats: { required: number; ordered: number; delivered: number; critical: boolean }[]): WorkStatus {
  if (mats.length === 0) return "Pending";
  if (mats.some((m) => m.critical && m.delivered < m.required)) return "Blocked";
  if (mats.every((m) => m.delivered >= m.required)) return "Completed";
  if (mats.some((m) => m.delivered < m.required)) return "Awaiting Material";
  return "In Progress";
}

/** Status from a factual done / total count pair. */
export function countStatus(done: number, total: number): WorkStatus {
  if (total === 0) return "Not Started";
  if (done === 0) return "Not Started";
  if (done >= total) return "Completed";
  return "In Progress";
}

/* ── Segmented control ───────────────────────────────────────── */
export function Segmented<T extends string>({ value, onChange, options, size = "md" }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: React.ReactNode }[]; size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-[rgba(133,164,204,0.12)] bg-[#091321] p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all",
              size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3.5 py-1.5 text-[12.5px]",
              active
                ? "bg-signal text-white shadow-[0_8px_22px_-10px_var(--glow)]"
                : "text-muted-foreground hover:bg-[rgba(133,164,204,0.07)] hover:text-foreground",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Alert / risk card ───────────────────────────────────────── */
export function AlertCard({ severity, title, meta, action, onAction }: {
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  meta?: { k: string; v: React.ReactNode }[];
  action?: string;
  onAction?: () => void;
}) {
  const accent: Accent = severity === "critical" ? "red" : severity === "warning" ? "amber" : severity === "success" ? "green" : "blue";
  const a = ACCENT[accent];
  return (
    <div className="panel-flat relative overflow-hidden p-3.5 pl-4 transition-colors hover:border-[rgba(133,164,204,0.24)]">
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: a.hex, boxShadow: `0 0 14px ${a.ring}` }} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium leading-snug text-foreground">{title}</div>
          {meta && meta.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {meta.map((m, i) => (
                <div key={i} className="text-[11px]">
                  <span className="label-xs mr-1.5 inline">{m.k}</span>
                  <span className="text-foreground/85">{m.v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {action && (
          <button
            onClick={onAction}
            className="shrink-0 rounded-lg border px-3 py-1.5 text-[11.5px] font-medium transition-colors"
            style={{ borderColor: a.ring, color: a.hex, background: a.soft }}
          >
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Table shell ─────────────────────────────────────────────── */
export function TableShell({ children, className, maxHeight }: { children: React.ReactNode; className?: string; maxHeight?: number }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-[rgba(133,164,204,0.12)] bg-[#091321]", className)}>
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table className="data-table">{children}</table>
      </div>
    </div>
  );
}

/* ── Donut ───────────────────────────────────────────────────── */
export function Donut({ data, size = 180, thickness = 18, centerLabel, centerValue }: {
  data: { name: string; value: number; color?: string }[];
  size?: number; thickness?: number; centerLabel?: string; centerValue?: React.ReactNode;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={thickness} stroke="rgba(133,164,204,0.08)" fill="none" />
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={i} cx={size / 2} cy={size / 2} r={r} strokeWidth={thickness}
                stroke={d.color || CHART_COLORS[i % CHART_COLORS.length]} fill="none"
                strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} strokeLinecap="butt"
                style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.4))" }}
              />
            );
            acc += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="num text-xl font-semibold leading-none">{centerValue}</div>
            {centerLabel && <div className="label-xs mt-1.5">{centerLabel}</div>}
          </div>
        </div>
      </div>
      <div className="min-w-[140px] flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-[12px]">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color || CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="num shrink-0 font-medium text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Quick circular action ───────────────────────────────────── */
export function QuickAction({ icon, label, accent = "blue", onClick }: {
  icon: React.ReactNode; label: string; accent?: Accent; onClick?: () => void;
}) {
  const a = ACCENT[accent];
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-2">
      <span
        className="grid h-12 w-12 place-items-center rounded-full border transition-all group-hover:-translate-y-0.5"
        style={{ background: a.soft, borderColor: a.ring, color: a.hex, boxShadow: `0 12px 26px -18px ${a.hex}` }}
      >
        {icon}
      </span>
      <span className="text-center text-[10.5px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">{label}</span>
    </button>
  );
}

/* ── Legacy-compatible KPI card ──────────────────────────────── */
export function KpiCard({ label, value, delta, sub, spark, onClick, tone = "default" }: {
  label: string; value: React.ReactNode; delta?: string; sub?: string; spark?: number[]; onClick?: () => void;
  tone?: "default" | "warning" | "critical" | "success";
}) {
  const accent: Accent = tone === "critical" ? "red" : tone === "warning" ? "amber" : tone === "success" ? "green" : "blue";
  const motifs = ["grid", "camera", "nodes", "channels", "waves"] as const;
  const motif = motifs[Math.abs(label.length * 7) % motifs.length];
  return <MetricCard label={label} value={value} delta={delta} sub={sub} spark={spark} onClick={onClick} accent={accent} motif={motif} />;
}

/* ── Empty state ─────────────────────────────────────────────── */
export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="panel-flat relative overflow-hidden p-10 text-center">
      <div className="pointer-events-none absolute inset-0 dot-fade" />
      <div className="relative">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-[rgba(47,131,255,0.25)] bg-[rgba(47,131,255,0.10)] text-signal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </div>
        <div className="text-[13.5px] font-medium text-foreground">{title}</div>
        {hint && <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted-foreground">{hint}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

/* ── Chart helpers ───────────────────────────────────────────── */
export const axisProps = {
  tick: { fill: "#66778D", fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

export function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[rgba(133,164,204,0.18)] bg-[#0D1929]/95 px-3 py-2 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur">
      {label !== undefined && <div className="label-xs mb-1.5">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="num ml-auto font-medium text-foreground">{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
