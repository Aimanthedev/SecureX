import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as seed from "./mock-data";
import { loadDB, saveDB, resetDB, uid, type DB } from "./storage";

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

const SEED: State = {
  customers: seed.customers, sites: seed.sites, employees: seed.employees,
  leads: seed.leads, surveys: seed.surveys, quotations: seed.quotations,
  projects: seed.projects, tasks: seed.tasks, milestones: seed.milestones,
  devices: seed.devices, testRecords: seed.testRecords, approvals: seed.approvals,
  variations: seed.variations, documents: seed.documents, payments: seed.payments,
  amc: seed.amc, tickets: seed.tickets, materials: seed.materials, products: seed.products,
  purchaseRequests: seed.purchaseRequests, purchaseOrders: seed.purchaseOrders,
  siteActivities: seed.siteActivities, communications: seed.communications,
  handoverItems: seed.handoverItems, complianceItems: seed.complianceItems,
};

type CollectionName = keyof State;

function computeEffective<K extends CollectionName>(coll: K, db: DB): State[K] {
  const seedArr = SEED[coll] as unknown as Record<string, unknown>[];
  const deleted = new Set(db.deletedIds[coll] ?? []);
  const overrides = db.overrides[coll] ?? {};
  const kept = seedArr
    .filter((x) => !deleted.has(x.id as string))
    .map((x) => (overrides[x.id as string] ? { ...x, ...overrides[x.id as string] } : x));
  const created = (db.created[coll] ?? []).filter((x) => !deleted.has(x.id as string));
  return [...kept, ...created] as unknown as State[K];
}

function buildState(db: DB): State {
  const out = {} as State;
  (Object.keys(SEED) as CollectionName[]).forEach((k) => {
    (out as Record<CollectionName, unknown>)[k] = computeEffective(k, db);
  });
  return out;
}

export type CompanyProfile = { name: string; currency: string; taxRate: string; dateFormat: string };
export type NumberingFormats = { project: string; workOrder: string; purchaseOrder: string; amc: string };
export type NotificationPrefs = Record<string, boolean>;

const DEFAULT_COMPANY: CompanyProfile = { name: "SecureX CCTV COMPANY", currency: "QAR", taxRate: "0%", dateFormat: "dd MMM yyyy" };
const DEFAULT_NUMBERING: NumberingFormats = { project: "AHC-PRO-2026-000", workOrder: "AHC-WO-2026-000", purchaseOrder: "AHC-PO-2026-000", amc: "AHC-AMC-2026-000" };
const DEFAULT_NOTIF_PREFS: NotificationPrefs = { "Failed test alerts": true, "Overdue PO alerts": true, "AMC expiring alerts": true, "Client approval reminders": true, "Payment collection reminders": true };

type PendingCreate = { type: string; ts: number } | null;

type Ctx = State & {
  companyProfile: CompanyProfile;
  setCompanyProfile: (p: Partial<CompanyProfile>) => void;
  numberingFormats: NumberingFormats;
  setNumberingFormats: (p: Partial<NumberingFormats>) => void;
  notificationPrefs: NotificationPrefs;
  toggleNotificationPref: (key: string) => void;
  readNotificationIds: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  onSiteEmployeeIds: string[];
  setCheckedIn: (employeeId: string, checkedIn: boolean) => void;
  pmChecklistDone: string[];
  togglePmChecklist: (label: string) => void;
  pendingCreate: PendingCreate;
  requestCreate: (type: string) => void;
  clearPendingCreate: () => void;
  resetDemoData: () => void;

  updateLead: (id: string, patch: Partial<seed.Lead>) => void;
  addLead: (l: Omit<seed.Lead, "id">) => seed.Lead;
  deleteLead: (id: string) => void;
  updateTask: (id: string, patch: Partial<seed.Task>) => void;
  addTask: (t: Omit<seed.Task, "id">) => void;
  deleteTask: (id: string) => void;
  updateProject: (id: string, patch: Partial<seed.Project>) => void;
  addProject: (p: Omit<seed.Project, "id">) => seed.Project;
  updateTicket: (id: string, patch: Partial<seed.ServiceTicket>) => void;
  addTicket: (t: Omit<seed.ServiceTicket, "id">) => seed.ServiceTicket;
  updateApproval: (id: string, patch: Partial<seed.Approval>) => void;
  updateDevice: (id: string, patch: Partial<seed.Device>) => void;
  toggleHandover: (id: string) => void;
  toggleCompliance: (id: string) => void;
  addSiteActivity: (a: Omit<seed.SiteActivity, "id">) => void;
  updateQuotation: (id: string, patch: Partial<seed.Quotation>) => void;
  convertQuotationToProject: (qid: string) => seed.Project | null;
  addDocument: (d: Omit<seed.Doc, "id">) => seed.Doc;
  markPaymentCollected: (id: string) => void;
  addPurchaseRequest: (p: Omit<seed.PurchaseRequest, "id">) => seed.PurchaseRequest;
  updatePurchaseRequest: (id: string, patch: Partial<seed.PurchaseRequest>) => void;
  addPurchaseOrder: (p: Omit<seed.PurchaseOrder, "id">) => seed.PurchaseOrder;
  updatePurchaseOrder: (id: string, patch: Partial<seed.PurchaseOrder>) => void;
  updateSurvey: (id: string, patch: Partial<seed.SiteSurvey>) => void;
  addSurvey: (s: Omit<seed.SiteSurvey, "id">) => seed.SiteSurvey;
  addVariation: (v: Omit<seed.Variation, "id">) => seed.Variation;
  updateVariation: (id: string, patch: Partial<seed.Variation>) => void;
  updateCustomer: (id: string, patch: Partial<seed.Customer>) => void;
  addCustomer: (c: Omit<seed.Customer, "id">) => seed.Customer;
  addAMC: (a: Omit<seed.AMCContract, "id">) => seed.AMCContract;
  updateAMC: (id: string, patch: Partial<seed.AMCContract>) => void;
  updateProduct: (id: string, patch: Partial<seed.Product>) => void;
  receiveStock: (id: string, qty: number) => void;
  issueStock: (id: string, qty: number) => void;
  computeHealth: typeof seed.computeHealth;
};

const DataContext = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(() => loadDB());
  const state = useMemo(() => buildState(db), [db]);

  const persist = useCallback((next: DB) => {
    setDb(next);
    saveDB(next);
  }, []);

  const mutate = useCallback((fn: (draft: DB) => DB) => {
    setDb((prev) => {
      const next = fn({
        version: prev.version,
        created: { ...prev.created },
        overrides: { ...prev.overrides },
        deletedIds: { ...prev.deletedIds },
        settings: { ...prev.settings },
      });
      saveDB(next);
      return next;
    });
  }, []);

  const create = useCallback(<T extends { id: string }>(coll: CollectionName, prefix: string, data: Omit<T, "id">): T => {
    const record = { ...data, id: uid(prefix) } as T;
    mutate((draft) => {
      draft.created = { ...draft.created, [coll]: [record as unknown as Record<string, unknown>, ...(draft.created[coll] ?? [])] };
      return draft;
    });
    return record;
  }, [mutate]);

  const update = useCallback((coll: CollectionName, id: string, patch: Record<string, unknown>) => {
    mutate((draft) => {
      const inSeed = (SEED[coll] as unknown as { id: string }[]).some((x) => x.id === id);
      if (inSeed) {
        draft.overrides = { ...draft.overrides, [coll]: { ...(draft.overrides[coll] ?? {}), [id]: { ...(draft.overrides[coll]?.[id] ?? {}), ...patch } } };
      } else {
        draft.created = { ...draft.created, [coll]: (draft.created[coll] ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)) };
      }
      return draft;
    });
  }, [mutate]);

  const remove = useCallback((coll: CollectionName, id: string) => {
    mutate((draft) => {
      const inSeed = (SEED[coll] as unknown as { id: string }[]).some((x) => x.id === id);
      if (inSeed) {
        draft.deletedIds = { ...draft.deletedIds, [coll]: [...(draft.deletedIds[coll] ?? []), id] };
      } else {
        draft.created = { ...draft.created, [coll]: (draft.created[coll] ?? []).filter((x) => x.id !== id) };
      }
      return draft;
    });
  }, [mutate]);

  const setSetting = useCallback((key: string, value: unknown) => {
    mutate((draft) => {
      draft.settings = { ...draft.settings, [key]: value };
      return draft;
    });
  }, [mutate]);

  const [pendingCreate, setPendingCreate] = useState<PendingCreate>(null);

  const value = useMemo<Ctx>(() => {
    const companyProfile: CompanyProfile = { ...DEFAULT_COMPANY, ...(db.settings.companyProfile as Partial<CompanyProfile> | undefined) };
    const numberingFormats: NumberingFormats = { ...DEFAULT_NUMBERING, ...(db.settings.numberingFormats as Partial<NumberingFormats> | undefined) };
    const notificationPrefs: NotificationPrefs = { ...DEFAULT_NOTIF_PREFS, ...(db.settings.notificationPrefs as NotificationPrefs | undefined) };
    const readNotificationIds: string[] = (db.settings.readNotificationIds as string[] | undefined) ?? [];
    const onSiteEmployeeIds: string[] = (db.settings.onSiteEmployeeIds as string[] | undefined) ?? [];
    const pmChecklistDone: string[] = (db.settings.pmChecklistDone as string[] | undefined) ?? [];

    return {
      ...state,
      computeHealth: seed.computeHealth,

      companyProfile,
      setCompanyProfile: (p) => setSetting("companyProfile", { ...companyProfile, ...p }),
      numberingFormats,
      setNumberingFormats: (p) => setSetting("numberingFormats", { ...numberingFormats, ...p }),
      notificationPrefs,
      toggleNotificationPref: (key) => setSetting("notificationPrefs", { ...notificationPrefs, [key]: !notificationPrefs[key] }),
      readNotificationIds,
      markNotificationRead: (id) => setSetting("readNotificationIds", Array.from(new Set([...readNotificationIds, id]))),
      markAllNotificationsRead: (ids) => setSetting("readNotificationIds", Array.from(new Set([...readNotificationIds, ...ids]))),
      onSiteEmployeeIds,
      setCheckedIn: (employeeId, checkedIn) => setSetting("onSiteEmployeeIds", checkedIn ? Array.from(new Set([...onSiteEmployeeIds, employeeId])) : onSiteEmployeeIds.filter((x) => x !== employeeId)),
      pmChecklistDone,
      togglePmChecklist: (label) => setSetting("pmChecklistDone", pmChecklistDone.includes(label) ? pmChecklistDone.filter((x) => x !== label) : [...pmChecklistDone, label]),
      pendingCreate,
      requestCreate: (type) => setPendingCreate({ type, ts: Date.now() }),
      clearPendingCreate: () => setPendingCreate(null),
      resetDemoData: () => { persist(resetDB()); },

      updateLead: (id, p) => update("leads", id, { ...p, lastActivity: new Date().toISOString().slice(0, 10) }),
      addLead: (l) => create<seed.Lead>("leads", "L", l),
      deleteLead: (id) => remove("leads", id),

      updateTask: (id, p) => update("tasks", id, p),
      addTask: (t) => create<seed.Task>("tasks", "T", t),
      deleteTask: (id) => remove("tasks", id),

      updateProject: (id, p) => update("projects", id, p),
      addProject: (p) => create<seed.Project>("projects", "P", p),

      updateTicket: (id, p) => update("tickets", id, p),
      addTicket: (t) => create<seed.ServiceTicket>("tickets", "TK", t),

      updateApproval: (id, p) => update("approvals", id, p),
      updateDevice: (id, p) => update("devices", id, p),

      toggleHandover: (id) => { const item = state.handoverItems.find((h) => h.id === id); if (item) update("handoverItems", id, { done: !item.done }); },
      toggleCompliance: (id) => { const item = state.complianceItems.find((c) => c.id === id); if (item) update("complianceItems", id, { status: item.status === "Approved" ? "Submitted" : "Approved" }); },

      addSiteActivity: (a) => create<seed.SiteActivity>("siteActivities", "SA", a),
      updateQuotation: (id, p) => update("quotations", id, p),

      convertQuotationToProject: (qid) => {
        const q = state.quotations.find((x) => x.id === qid);
        if (!q) return null;
        const num = `AHC-PRO-2026-${String(50 + state.projects.length).padStart(3, "0")}`;
        const total = q.items.reduce((s, i) => s + i.unitPrice * i.qty, 0) || Math.round(100000 + Math.random() * 300000);
        return create<seed.Project>("projects", "P", {
          number: num, name: q.opportunityName + " CCTV",
          customerId: q.customerId, siteId: q.siteId, phase: "Project Setup",
          scope: q.notes || "Scope inherited from quotation " + q.number,
          contractValue: total, approvedVariations: 0, estimatedCost: Math.round(total * 0.62),
          committedCost: 0, actualCost: 0, invoiced: 0, collected: 0, retention: Math.round(total * 0.05),
          plannedStart: new Date().toISOString().slice(0, 10),
          plannedEnd: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
          pmId: "E-004", salespersonId: q.salespersonId, teamIds: ["E-008", "E-010"],
          plannedProgress: 0, actualProgress: 0, materialReadiness: 0,
          quotationId: q.id, leadId: q.leadId,
        });
      },

      addDocument: (d) => create<seed.Doc>("documents", "DOC", d),
      markPaymentCollected: (id) => update("payments", id, { status: "Collected", collectedOn: new Date().toISOString().slice(0, 10) }),

      addPurchaseRequest: (p) => create<seed.PurchaseRequest>("purchaseRequests", "PR", p),
      updatePurchaseRequest: (id, p) => update("purchaseRequests", id, p),
      addPurchaseOrder: (p) => create<seed.PurchaseOrder>("purchaseOrders", "PO", p),
      updatePurchaseOrder: (id, p) => update("purchaseOrders", id, p),

      updateSurvey: (id, p) => update("surveys", id, p),
      addSurvey: (s) => create<seed.SiteSurvey>("surveys", "SV", s),

      addVariation: (v) => create<seed.Variation>("variations", "V", v),
      updateVariation: (id, p) => update("variations", id, p),

      updateCustomer: (id, p) => update("customers", id, p),
      addCustomer: (c) => create<seed.Customer>("customers", "C", c),

      addAMC: (a) => create<seed.AMCContract>("amc", "AMC", a),
      updateAMC: (id, p) => update("amc", id, p),

      updateProduct: (id, p) => update("products", id, p),
      receiveStock: (id, qty) => { const p = state.products.find((x) => x.id === id); if (p) update("products", id, { stock: p.stock + qty }); },
      issueStock: (id, qty) => { const p = state.products.find((x) => x.id === id); if (p) update("products", id, { stock: Math.max(0, p.stock - qty) }); },
    };
  }, [state, db.settings, pendingCreate, create, update, remove, setSetting, persist]);

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

// Nav sections each role is allowed to see. Owner/Operations Manager see everything.
export const ROLE_NAV_ALLOW: Record<Role, string[] | null> = {
  "Owner": null,
  "Operations Manager": null,
  "Project Manager": ["/", "/projects", "/field", "/calendar", "/surveys", "/customers", "/equipment", "/procurement", "/employees", "/documents", "/reports", "/notifications", "/settings"],
  "Salesperson": ["/", "/sales", "/surveys", "/customers", "/calendar", "/documents", "/reports", "/notifications", "/settings"],
  "Site Engineer": ["/", "/projects", "/field", "/calendar", "/surveys", "/equipment", "/documents", "/notifications", "/settings"],
  "Technician": ["/", "/field", "/calendar", "/notifications", "/settings"],
  "Accounts Viewer": ["/", "/customers", "/procurement", "/reports", "/documents", "/notifications", "/settings"],
};

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [role, setRoleState] = useState<Role>("Owner");
  const [lang, setLang] = useState<Lang>("en");
  const [density, setDensity] = useState<"compact"|"comfortable">("comfortable");
  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", t === "dark");
  }, []);
  const setRole = useCallback((r: Role) => setRoleState(r), []);
  React.useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <UIContext.Provider value={{ theme, setTheme, role, setRole, lang, setLang, density, setDensity }}>{children}</UIContext.Provider>;
}
export function useUI() {
  const v = useContext(UIContext);
  if (!v) throw new Error("useUI outside UIProvider");
  return v;
}
