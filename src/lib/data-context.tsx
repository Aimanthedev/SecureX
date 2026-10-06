import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as seed from "./mock-data";

type State = {
  customers: seed.Customer[]; sites: seed.Site[]; employees: seed.Employee[];
  leads: seed.Lead[]; surveys: seed.SiteSurvey[]; quotations: seed.Quotation[];
  projects: seed.Project[]; tasks: seed.Task[]; milestones: seed.Milestone[];
  devices: seed.Device[]; testRecords: seed.TestRecord[]; approvals: seed.Approval[];
  variations: seed.Variation[]; documents: seed.Doc[]; payments: seed.PaymentMilestone[];
  amc: seed.AMCContract[]; tickets: seed.ServiceTicket[]; materials: seed.Material[];
  products: seed.Product[]; purchaseRequests: seed.PurchaseRequest[]; purchaseOrders: seed.PurchaseOrder[];
  siteActivities: seed.SiteActivity[]; communications: seed.Communication[];
  handoverItems: seed.HandoverItem[]; complianceItems: seed.ComplianceItem[];
};

type Ctx = State & {
  updateLead: (id: string, patch: Partial<seed.Lead>) => void;
  addLead: (l: Omit<seed.Lead, "id">) => seed.Lead;
  deleteLead: (id: string) => void;
  updateTask: (id: string, patch: Partial<seed.Task>) => void;
  addTask: (t: Omit<seed.Task, "id">) => void;
  deleteTask: (id: string) => void;
  updateProject: (id: string, patch: Partial<seed.Project>) => void;
  addProject: (p: Omit<seed.Project, "id">) => seed.Project;
  updateTicket: (id: string, patch: Partial<seed.ServiceTicket>) => void;
  addTicket: (t: Omit<seed.ServiceTicket, "id">) => void;
  updateApproval: (id: string, patch: Partial<seed.Approval>) => void;
  updateDevice: (id: string, patch: Partial<seed.Device>) => void;
  toggleHandover: (id: string) => void;
  toggleCompliance: (id: string) => void;
  addSiteActivity: (a: Omit<seed.SiteActivity, "id">) => void;
  updateQuotation: (id: string, patch: Partial<seed.Quotation>) => void;
  convertQuotationToProject: (qid: string) => seed.Project | null;
  addDocument: (d: Omit<seed.Doc, "id">) => void;
  markPaymentCollected: (id: string) => void;
  addPurchaseRequest: (p: Omit<seed.PurchaseRequest, "id">) => void;
  updateSurvey: (id: string, patch: Partial<seed.SiteSurvey>) => void;
  computeHealth: typeof seed.computeHealth;
};

const DataContext = createContext<Ctx | null>(null);
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    customers: seed.customers, sites: seed.sites, employees: seed.employees,
    leads: seed.leads, surveys: seed.surveys, quotations: seed.quotations,
    projects: seed.projects, tasks: seed.tasks, milestones: seed.milestones,
    devices: seed.devices, testRecords: seed.testRecords, approvals: seed.approvals,
    variations: seed.variations, documents: seed.documents, payments: seed.payments,
    amc: seed.amc, tickets: seed.tickets, materials: seed.materials, products: seed.products,
    purchaseRequests: seed.purchaseRequests, purchaseOrders: seed.purchaseOrders,
    siteActivities: seed.siteActivities, communications: seed.communications,
    handoverItems: seed.handoverItems, complianceItems: seed.complianceItems,
  });

  const patch = <K extends keyof State>(key: K, list: State[K]) => setState((s) => ({ ...s, [key]: list }));

  const value = useMemo<Ctx>(() => ({
    ...state,
    computeHealth: seed.computeHealth,
    updateLead: (id, p) => patch("leads", state.leads.map((l) => l.id === id ? { ...l, ...p, lastActivity: new Date().toISOString().slice(0,10) } : l)),
    addLead: (l) => { const nl = { ...l, id: uid("L") }; patch("leads", [nl, ...state.leads]); return nl; },
    deleteLead: (id) => patch("leads", state.leads.filter((l) => l.id !== id)),
    updateTask: (id, p) => patch("tasks", state.tasks.map((t) => t.id === id ? { ...t, ...p } : t)),
    addTask: (t) => patch("tasks", [{ ...t, id: uid("T") }, ...state.tasks]),
    deleteTask: (id) => patch("tasks", state.tasks.filter((t) => t.id !== id)),
    updateProject: (id, p) => patch("projects", state.projects.map((pr) => pr.id === id ? { ...pr, ...p } : pr)),
    addProject: (p) => { const np = { ...p, id: uid("P") }; patch("projects", [np, ...state.projects]); return np; },
    updateTicket: (id, p) => patch("tickets", state.tickets.map((t) => t.id === id ? { ...t, ...p } : t)),
    addTicket: (t) => patch("tickets", [{ ...t, id: uid("TK") }, ...state.tickets]),
    updateApproval: (id, p) => patch("approvals", state.approvals.map((a) => a.id === id ? { ...a, ...p } : a)),
    updateDevice: (id, p) => patch("devices", state.devices.map((d) => d.id === id ? { ...d, ...p } : d)),
    toggleHandover: (id) => patch("handoverItems", state.handoverItems.map((h) => h.id === id ? { ...h, done: !h.done } : h)),
    toggleCompliance: (id) => patch("complianceItems", state.complianceItems.map((c) => c.id === id ? { ...c, status: c.status === "Approved" ? "Submitted" : "Approved" } : c)),
    addSiteActivity: (a) => patch("siteActivities", [{ ...a, id: uid("SA") }, ...state.siteActivities]),
    updateQuotation: (id, p) => patch("quotations", state.quotations.map((q) => q.id === id ? { ...q, ...p } : q)),
    convertQuotationToProject: (qid) => {
      const q = state.quotations.find((x) => x.id === qid);
      if (!q) return null;
      const num = `AHC-PRO-2026-${String(50 + state.projects.length).padStart(3, "0")}`;
      const total = q.items.reduce((s, i) => s + i.unitPrice * i.qty, 0) || Math.round(100000 + Math.random() * 300000);
      const np: seed.Project = {
        id: uid("P"), number: num, name: q.opportunityName + " CCTV",
        customerId: q.customerId, siteId: q.siteId, phase: "Project Setup",
        scope: q.notes || "Scope inherited from quotation " + q.number,
        contractValue: total, approvedVariations: 0, estimatedCost: Math.round(total * 0.62),
        committedCost: 0, actualCost: 0, invoiced: 0, collected: 0, retention: Math.round(total * 0.05),
        plannedStart: new Date().toISOString().slice(0,10),
        plannedEnd: new Date(Date.now() + 90 * 864e5).toISOString().slice(0,10),
        pmId: "E-004", salespersonId: q.salespersonId, teamIds: ["E-008","E-010"],
        plannedProgress: 0, actualProgress: 0, materialReadiness: 0,
        quotationId: q.id, leadId: q.leadId,
      };
      patch("projects", [np, ...state.projects]);
      return np;
    },
    addDocument: (d) => patch("documents", [{ ...d, id: uid("DOC") }, ...state.documents]),
    markPaymentCollected: (id) => patch("payments", state.payments.map((p) => p.id === id ? { ...p, status: "Collected", collectedOn: new Date().toISOString().slice(0,10) } : p)),
    addPurchaseRequest: (p) => patch("purchaseRequests", [{ ...p, id: uid("PR") }, ...state.purchaseRequests]),
    updateSurvey: (id, p) => patch("surveys", state.surveys.map((s) => s.id === id ? { ...s, ...p } : s)),
  }), [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const v = useContext(DataContext);
  if (!v) throw new Error("useData outside DataProvider");
  return v;
}

// Theme / role
type Role = "Owner" | "Operations Manager" | "Project Manager" | "Salesperson" | "Site Engineer" | "Technician" | "Accounts Viewer";
type ThemeMode = "light" | "dark";
type Lang = "en" | "ar";
type UICtx = { theme: ThemeMode; setTheme: (t: ThemeMode) => void; role: Role; setRole: (r: Role) => void; lang: Lang; setLang: (l: Lang) => void; density: "compact"|"comfortable"; setDensity: (d: "compact"|"comfortable") => void; };
const UIContext = createContext<UICtx | null>(null);
export const ROLES: Role[] = ["Owner","Operations Manager","Project Manager","Salesperson","Site Engineer","Technician","Accounts Viewer"];

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [role, setRole] = useState<Role>("Owner");
  const [lang, setLang] = useState<Lang>("en");
  const [density, setDensity] = useState<"compact"|"comfortable">("comfortable");
  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
      document.documentElement.style.colorScheme = t;
      window.localStorage.setItem("securex-theme", t);
    }
  }, []);
  React.useEffect(() => {
    const saved = window.localStorage.getItem("securex-theme");
    const initial = saved === "light" || saved === "dark" ? saved : "dark";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    document.documentElement.style.colorScheme = initial;
  }, []);
  return <UIContext.Provider value={{ theme, setTheme, role, setRole, lang, setLang, density, setDensity }}>{children}</UIContext.Provider>;
}
export function useUI() {
  const v = useContext(UIContext);
  if (!v) throw new Error("useUI outside UIProvider");
  return v;
}
