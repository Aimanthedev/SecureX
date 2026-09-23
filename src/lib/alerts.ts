// Single shared source for "what needs attention" across the app.
// Command Center's "Requires Attention" rail and the Notifications page both
// read from this so the two views never disagree.
import { daysFromToday } from "./format";
import type { PurchaseOrder, AMCContract, Customer, ServiceTicket } from "./mock-data";
import type { SelectorCtx } from "./project-selectors";
import { getProjectHealth } from "./project-selectors";

export type AppAlert = {
  id: string;
  severity: "critical" | "warning" | "info";
  group: "Projects" | "Payments" | "Materials" | "Approvals" | "Service" | "Procurement";
  title: string;
  sub: string;
  owner: string;
  path?: string;
  projectId?: string;
};

type AlertInputs = SelectorCtx & {
  purchaseOrders: PurchaseOrder[];
  amc: AMCContract[];
  tickets: ServiceTicket[];
  customers: Customer[];
};

export function buildAlerts(d: AlertInputs): AppAlert[] {
  const out: AppAlert[] = [];

  d.projects.forEach((p) => {
    const h = getProjectHealth(d, p.id);
    const pm = d.employees.find((e) => e.id === p.pmId)?.name || "—";
    h.drivers.filter((x) => x.severity !== "info").forEach((dr, i) => {
      out.push({
        id: `proj-${p.id}-${i}`, severity: dr.severity as "critical" | "warning", group: "Projects",
        title: dr.text, sub: `${p.number} · ${p.name}`, owner: pm, path: `/projects/${p.id}`, projectId: p.id,
      });
    });
  });

  d.purchaseOrders.filter((po) => po.deliveryStatus === "Overdue").forEach((po) => {
    out.push({ id: `po-${po.id}`, severity: "critical", group: "Procurement", title: `PO ${po.number} overdue`, sub: po.supplier, owner: "Procurement", path: "/procurement" });
  });

  d.amc.forEach((a) => {
    if (a.renewalStatus !== "Expiring Soon" && a.renewalStatus !== "Expired") return;
    const days = daysFromToday(a.end);
    out.push({
      id: `amc-${a.id}`, severity: days < 0 ? "critical" : "warning", group: "Service",
      title: `AMC ${a.number} ${days < 0 ? "expired" : `expires in ${days} days`}`,
      sub: d.customers.find((c) => c.id === a.customerId)?.name || "", owner: "Service", path: "/service",
    });
  });

  d.tickets.filter((t) => t.priority === "Critical" && t.status !== "Closed" && t.status !== "Resolved").forEach((t) => {
    out.push({ id: `tk-${t.id}`, severity: "critical", group: "Service", title: `Critical ticket open: ${t.title}`, sub: t.number, owner: d.employees.find((e) => e.id === t.assigneeId)?.name || "Unassigned", path: "/service" });
  });

  d.approvals.filter((a) => a.status === "Pending" && a.critical).forEach((a) => {
    const p = d.projects.find((pr) => pr.id === a.projectId);
    out.push({ id: `appr-${a.id}`, severity: "warning", group: "Approvals", title: `Client approval pending: ${a.title}`, sub: p ? `${p.number} · ${p.name}` : "", owner: a.owner, path: p ? `/projects/${p.id}` : undefined, projectId: p?.id });
  });

  return out.sort((a, b) => (a.severity === "critical" ? -1 : 1) - (b.severity === "critical" ? -1 : 1));
}
