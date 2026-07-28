import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { ProjectHealth } from "@/lib/mock-data";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function MonoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("mono-chip", className)}>{children}</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b hairline pb-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function KpiCard({ label, value, delta, sub, spark, onClick, tone = "default" }: {
  label: string; value: React.ReactNode; delta?: string; sub?: string; spark?: number[]; onClick?: () => void;
  tone?: "default"|"warning"|"critical"|"success";
}) {
  const toneCls = tone === "critical" ? "text-critical" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-signal";
  return (
    <button onClick={onClick} className={cn("group text-left rounded-xl border hairline bg-card p-4 hover:border-signal/40 hover:shadow-sm transition-all", onClick && "cursor-pointer")}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
        {delta && <div className={cn("text-xs num", delta.startsWith("-") ? "text-critical" : "text-success")}>{delta}</div>}
      </div>
      <div className="mt-2 text-2xl font-display font-semibold num text-foreground">{value}</div>
      {sub && <div className={cn("text-xs mt-1", toneCls)}>{sub}</div>}
      {spark && spark.length > 0 && (
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark.map((v, i) => ({ i, v }))}><Line type="monotone" dataKey="v" stroke="var(--signal)" strokeWidth={1.5} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </button>
  );
}

const healthMap: Record<ProjectHealth, { cls: string; dot: string }> = {
  "On Track":         { cls: "bg-success-soft text-success border-success/20", dot: "bg-success" },
  "Watch":            { cls: "bg-warning-soft text-warning-foreground border-warning/20", dot: "bg-warning" },
  "At Risk":          { cls: "bg-critical-soft text-critical border-critical/20", dot: "bg-critical" },
  "Awaiting Materials": { cls: "bg-warning-soft text-warning-foreground border-warning/20", dot: "bg-warning" },
  "Delayed":          { cls: "bg-critical-soft text-critical border-critical/20", dot: "bg-critical" },
};

export function HealthBadge({ label }: { label: ProjectHealth }) {
  const m = healthMap[label];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border", m.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} /> {label}
    </span>
  );
}

export function StatusPill({ status, tone = "neutral" }: { status: string; tone?: "neutral"|"success"|"warning"|"critical"|"info" }) {
  const cls =
    tone === "success" ? "bg-success-soft text-success border-success/20" :
    tone === "warning" ? "bg-warning-soft text-warning-foreground border-warning/20" :
    tone === "critical" ? "bg-critical-soft text-critical border-critical/20" :
    tone === "info" ? "bg-signal-soft text-signal border-signal/20" :
    "bg-muted text-muted-foreground border-border";
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap", cls)}>{status}</span>;
}

export function ProgressBar({ value, planned }: { value: number; planned?: number }) {
  return (
    <div className="w-full">
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-signal" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        {planned !== undefined && <div className="absolute top-0 h-full w-px bg-foreground/40" style={{ left: `${Math.min(100, Math.max(0, planned))}%` }} />}
      </div>
    </div>
  );
}

export function Ring({ value, size = 44, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="4" stroke="var(--muted)" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="4" stroke="var(--signal)" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="-mt-8 text-[11px] font-semibold num">{Math.round(value)}%</div>
      {label && <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="border hairline rounded-lg p-8 text-center bg-surface-2/50">
      <div className="text-sm font-medium text-foreground">{title}</div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
