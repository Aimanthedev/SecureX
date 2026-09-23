// Centralized, pure derivations for everything the Projects module displays.
// The same business fact must resolve identically everywhere it's shown (list, profile, Command
// Center, Reports) — so every route reads through these functions instead of recomputing its own
// version of "current value" / "progress" / "health" / "next task" etc.
import { daysFromToday, daysBetween } from "./format";
import type {
  Project, Task, Milestone, Device, Material, Approval, Variation, PaymentMilestone,
  ProjectBOQItem, HandoverItem, ProjectIssue, Employee, ProjectHealth, HealthDriver, ProjectTeamMember,
} from "./mock-data";

export type SelectorCtx = {
  projects: Project[]; tasks: Task[]; milestones: Milestone[]; devices: Device[]; materials: Material[];
  approvals: Approval[]; variations: Variation[]; payments: PaymentMilestone[]; boqItems: ProjectBOQItem[];
  handoverItems: HandoverItem[]; issues: ProjectIssue[]; employees: Employee[]; teamMembers: ProjectTeamMember[];
};

const by = <T extends { projectId: string }>(arr: T[], projectId: string) => arr.filter((x) => x.projectId === projectId);

export function getProject(ctx: SelectorCtx, projectId: string): Project | undefined {
  return ctx.projects.find((p) => p.id === projectId);
}

export function getProjectDevices(ctx: SelectorCtx, projectId: string) { return by(ctx.devices, projectId); }
export function getProjectMaterials(ctx: SelectorCtx, projectId: string) { return by(ctx.materials, projectId); }
export function getProjectBOQ(ctx: SelectorCtx, projectId: string) { return by(ctx.boqItems, projectId); }
export function getProjectTasks(ctx: SelectorCtx, projectId: string) { return by(ctx.tasks, projectId); }
export function getProjectMilestones(ctx: SelectorCtx, projectId: string) { return by(ctx.milestones, projectId); }
export function getProjectHandoverItems(ctx: SelectorCtx, projectId: string) { return by(ctx.handoverItems, projectId); }
export function getProjectIssues(ctx: SelectorCtx, projectId: string) { return by(ctx.issues, projectId); }
export function getProjectVariations(ctx: SelectorCtx, projectId: string) { return by(ctx.variations, projectId); }
export function getProjectPayments(ctx: SelectorCtx, projectId: string) { return by(ctx.payments, projectId); }
export function getProjectApprovals(ctx: SelectorCtx, projectId: string) { return by(ctx.approvals, projectId); }
export function getProjectTeamMembers(ctx: SelectorCtx, projectId: string) { return by(ctx.teamMembers, projectId); }

/** Sum of approved variation amounts only — submitted/rejected variations never affect contract value. */
export function getProjectApprovedVariationsTotal(ctx: SelectorCtx, projectId: string): number {
  return getProjectVariations(ctx, projectId).filter((v) => v.status === "Approved").reduce((s, v) => s + v.amount, 0);
}
export function getProjectPendingVariationsTotal(ctx: SelectorCtx, projectId: string): number {
  return getProjectVariations(ctx, projectId).filter((v) => v.status === "Submitted").reduce((s, v) => s + v.amount, 0);
}

/** ONE definition of "what is this project worth right now": original contract + approved variations. */
export function getProjectCurrentValue(ctx: SelectorCtx, projectId: string): number {
  const p = getProject(ctx, projectId);
  if (!p) return 0;
  return p.contractValue + getProjectApprovedVariationsTotal(ctx, projectId);
}

export function getProjectInvoiced(ctx: SelectorCtx, projectId: string): number {
  return getProjectPayments(ctx, projectId).filter((pm) => pm.invoicedOn).reduce((s, pm) => s + pm.amount, 0);
}
export function getProjectCollected(ctx: SelectorCtx, projectId: string): number {
  return getProjectPayments(ctx, projectId).filter((pm) => pm.status === "Collected").reduce((s, pm) => s + pm.amount, 0);
}
export function getProjectOutstanding(ctx: SelectorCtx, projectId: string): number {
  return getProjectInvoiced(ctx, projectId) - getProjectCollected(ctx, projectId);
}

/** Best-available forecast cost: once real spend exists, trust it over the original estimate. */
export function getProjectForecastCost(ctx: SelectorCtx, projectId: string): number {
  const p = getProject(ctx, projectId);
  if (!p) return 0;
  const running = Math.max(p.actualCost, p.committedCost);
  return running > 0 ? running : p.estimatedCost;
}

export function getProjectForecastMargin(ctx: SelectorCtx, projectId: string): { profit: number; pct: number } {
  const value = getProjectCurrentValue(ctx, projectId);
  const cost = getProjectForecastCost(ctx, projectId);
  const profit = value - cost;
  const pct = value > 0 ? (profit / value) * 100 : 0;
  return { profit, pct };
}

const TERMINAL_PHASES = new Set(["Handover", "Warranty", "AMC", "Completed", "Cancelled"]);

/** Straight-line schedule expectation: 0% before start, 100% after planned end. */
export function getProjectPlannedProgress(ctx: SelectorCtx, projectId: string): number {
  const p = getProject(ctx, projectId);
  if (!p) return 0;
  const total = daysBetween(p.plannedStart, p.plannedEnd);
  if (total <= 0) return 100;
  const elapsed = daysBetween(p.plannedStart, new Date().toISOString());
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

/** Weighted operational progress — reacts to real installation/testing/handover records instead of
 * being a manually-typed number that drifts from reality. */
export function getProjectActualProgress(ctx: SelectorCtx, projectId: string): number {
  const p = getProject(ctx, projectId);
  if (!p) return 0;
  const devs = getProjectDevices(ctx, projectId);
  const boq = getProjectBOQ(ctx, projectId);
  const handover = getProjectHandoverItems(ctx, projectId);

  const setupProgress = p.quotationId && p.surveyId ? 1 : p.quotationId || p.surveyId ? 0.5 : 0;

  const boqQty = boq.reduce((s, b) => s + b.qty, 0);
  const boqDelivered = boq.reduce((s, b) => s + Math.min(b.delivered, b.qty), 0);
  const procurementProgress = boqQty > 0 ? boqDelivered / boqQty : 0;

  const totalDevices = Math.max(devs.length, boqQty > 0 ? boq.filter((b) => b.category === "Camera").reduce((s, b) => s + b.qty, 0) : 0);
  const installedDevices = devs.filter((d) => d.status !== "Faulty").length;
  const installationProgress = totalDevices > 0 ? installedDevices / totalDevices : 0;

  const testedPass = devs.filter((d) => d.testResult === "Pass").length;
  const testingProgress = totalDevices > 0 ? testedPass / totalDevices : 0;

  const handoverProgress = handover.length > 0 ? handover.filter((h) => h.done).length / handover.length : 0;

  const raw = 5 * setupProgress + 15 * procurementProgress + 40 * installationProgress + 25 * testingProgress + 15 * handoverProgress;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function getProjectMaterialStatus(ctx: SelectorCtx, projectId: string): "Not Started" | "Request Pending" | "Ordered" | "Partially Delivered" | "Ready" | "Shortage" {
  const mats = getProjectMaterials(ctx, projectId);
  if (mats.length === 0) return "Not Started";
  if (mats.some((m) => m.critical && m.delivered < m.required)) return "Shortage";
  if (mats.every((m) => m.delivered >= m.required)) return "Ready";
  if (mats.some((m) => m.ordered > 0)) return "Partially Delivered";
  return "Request Pending";
}

export function getProjectTestSummary(ctx: SelectorCtx, projectId: string) {
  const devs = getProjectDevices(ctx, projectId);
  const total = devs.length;
  const pass = devs.filter((d) => d.testResult === "Pass").length;
  const fail = devs.filter((d) => d.testResult === "Fail").length;
  const pending = devs.filter((d) => d.testResult === "Pending" || d.testResult === "Retest").length;
  return { total, pass, fail, pending };
}

export function getProjectNextTask(ctx: SelectorCtx, projectId: string): Task | null {
  const open = getProjectTasks(ctx, projectId).filter((t) => t.status !== "Completed");
  if (open.length === 0) return null;
  const priorityRank: Record<Task["priority"], number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const overdue = open.filter((t) => daysFromToday(t.due) < 0).sort((a, b) => a.due.localeCompare(b.due) || priorityRank[a.priority] - priorityRank[b.priority]);
  if (overdue.length > 0) return overdue[0];
  return [...open].sort((a, b) => a.due.localeCompare(b.due) || priorityRank[a.priority] - priorityRank[b.priority])[0];
}

export function getProjectNextMilestone(ctx: SelectorCtx, projectId: string): Milestone | null {
  const open = getProjectMilestones(ctx, projectId).filter((m) => !m.done).sort((a, b) => a.planned.localeCompare(b.planned));
  return open[0] ?? null;
}

export function getProjectHandoverReadiness(ctx: SelectorCtx, projectId: string): { ready: boolean; remaining: string[] } {
  const items = getProjectHandoverItems(ctx, projectId);
  const criticalOpen = items.filter((h) => h.critical && !h.done);
  const remaining: string[] = criticalOpen.map((h) => h.label);
  const { fail } = getProjectTestSummary(ctx, projectId);
  if (fail > 0) remaining.push(`${fail} device${fail > 1 ? "s" : ""} still failing tests`);
  const openCritical = getProjectIssues(ctx, projectId).filter((i) => i.priority === "Critical" && i.status !== "Resolved" && i.status !== "Closed");
  if (openCritical.length > 0) remaining.push(`${openCritical.length} critical issue${openCritical.length > 1 ? "s" : ""} unresolved`);
  return { ready: remaining.length === 0 && items.length > 0, remaining };
}

export function getProjectHealth(ctx: SelectorCtx, projectId: string): { label: ProjectHealth; score: number; drivers: HealthDriver[] } {
  const p = getProject(ctx, projectId);
  if (!p) return { label: "On Track", score: 100, drivers: [] };
  const drivers: HealthDriver[] = [];
  let penalty = 0;

  const planned = getProjectPlannedProgress(ctx, projectId);
  const actual = getProjectActualProgress(ctx, projectId);
  const variance = actual - planned;
  if (variance < -20) { drivers.push({ severity: "critical", text: `Execution ${Math.abs(variance)}% behind the planned schedule` }); penalty += 35; }
  else if (variance < -10) { drivers.push({ severity: "critical", text: `Execution ${Math.abs(variance)}% behind the planned schedule` }); penalty += 25; }
  else if (variance < -3) { drivers.push({ severity: "warning", text: `Execution ${Math.abs(variance)}% behind the planned schedule` }); penalty += 12; }
  else drivers.push({ severity: "info", text: "On or ahead of the planned schedule" });

  const overdueEnd = !TERMINAL_PHASES.has(p.phase) && daysFromToday(p.plannedEnd) < 0;
  if (overdueEnd) { drivers.push({ severity: "critical", text: `Planned completion date has passed (${Math.abs(daysFromToday(p.plannedEnd))} days ago)` }); penalty += 20; }

  const mats = getProjectMaterials(ctx, projectId);
  const shortages = mats.filter((m) => m.critical && m.delivered < m.required);
  if (shortages.length > 0) { drivers.push({ severity: "critical", text: `${shortages.length} critical material${shortages.length > 1 ? "s" : ""} not delivered` }); penalty += 15 * shortages.length; }

  const overdueCriticalTasks = getProjectTasks(ctx, projectId).filter((t) => t.status !== "Completed" && (t.priority === "Critical" || t.priority === "High") && daysFromToday(t.due) < 0);
  if (overdueCriticalTasks.length > 0) { drivers.push({ severity: "warning", text: `${overdueCriticalTasks.length} high/critical task${overdueCriticalTasks.length > 1 ? "s" : ""} overdue` }); penalty += 10 * overdueCriticalTasks.length; }

  const { fail } = getProjectTestSummary(ctx, projectId);
  if (fail > 0) { drivers.push({ severity: "critical", text: `${fail} device${fail > 1 ? "s" : ""} failed testing` }); penalty += 12 * fail; }

  const pendingApprovals = getProjectApprovals(ctx, projectId).filter((a) => a.status === "Pending");
  const criticalApprovals = pendingApprovals.filter((a) => a.critical);
  if (criticalApprovals.length > 0) { drivers.push({ severity: "warning", text: `${criticalApprovals.length} critical client approval${criticalApprovals.length > 1 ? "s" : ""} pending` }); penalty += 10; }
  else if (pendingApprovals.length > 0) { drivers.push({ severity: "info", text: `${pendingApprovals.length} client approval${pendingApprovals.length > 1 ? "s" : ""} pending` }); }

  const overdueMilestones = getProjectMilestones(ctx, projectId).filter((m) => !m.done && daysFromToday(m.planned) < 0);
  if (overdueMilestones.length > 0) { drivers.push({ severity: "warning", text: `${overdueMilestones.length} milestone${overdueMilestones.length > 1 ? "s" : ""} overdue` }); penalty += 8 * overdueMilestones.length; }

  const criticalIssues = getProjectIssues(ctx, projectId).filter((i) => i.priority === "Critical" && i.status !== "Resolved" && i.status !== "Closed");
  if (criticalIssues.length > 0) { drivers.push({ severity: "critical", text: `${criticalIssues.length} critical issue${criticalIssues.length > 1 ? "s" : ""} open` }); penalty += 15 * criticalIssues.length; }

  const score = Math.max(0, Math.min(100, 100 - penalty));
  let label: ProjectHealth;
  if (score >= 80) label = "On Track";
  else if (score >= 60) label = "Watch";
  else if (score >= 35) label = "At Risk";
  else label = "Delayed";
  if (overdueEnd && label === "On Track") label = "Watch";

  return { label, score, drivers };
}

const FIELD_DEPT = new Set(["Engineering", "Installation", "Service"]);
export function getAssignableEmployees(employees: Employee[]): Employee[] {
  return employees.filter((e) => FIELD_DEPT.has(e.department) || e.department === "Projects");
}
