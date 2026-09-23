import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import * as seed from "./mock-data";
import { loadDB, saveDB, resetDB, uid, type DB } from "./storage";
import type { SelectorCtx } from "./project-selectors";
import { getProjectHandoverReadiness } from "./project-selectors";

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
  projectBOQItems: seed.ProjectBOQItem[]; projectTeamMembers: seed.ProjectTeamMember[];
  projectIssues: seed.ProjectIssue[]; projectActivities: seed.ProjectActivity[];
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
  projectBOQItems: seed.projectBOQItems, projectTeamMembers: seed.projectTeamMembers,
  projectIssues: seed.projectIssues, projectActivities: seed.projectActivities,
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

type PendingCreate = { type: string; ts: number; projectId?: string } | null;

type Ctx = State & {
  selectorCtx: SelectorCtx;

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
  requestCreate: (type: string, projectId?: string) => void;
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
  setProjectPhase: (id: string, phase: seed.ProjectPhase, note?: string) => void;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
  cancelProject: (id: string, reason: string) => void;
  completeProject: (id: string) => { ok: boolean; remaining: string[] };
  updateProjectCommercial: (id: string, patch: { estimatedCost?: number; committedCost?: number; actualCost?: number; retention?: number }) => void;

  updateTicket: (id: string, patch: Partial<seed.ServiceTicket>) => void;
  addTicket: (t: Omit<seed.ServiceTicket, "id">) => seed.ServiceTicket;
  updateApproval: (id: string, patch: Partial<seed.Approval>) => void;
  updateDevice: (id: string, patch: Partial<seed.Device>) => void;
  addDevice: (d: Omit<seed.Device, "id">) => seed.Device;
  recordDeviceTest: (deviceId: string, result: "Pass" | "Fail", notes?: string) => void;
  toggleHandover: (id: string) => void;
  addHandoverItem: (h: Omit<seed.HandoverItem, "id">) => void;
  toggleCompliance: (id: string) => void;
  addComplianceItem: (c: Omit<seed.ComplianceItem, "id">) => void;
  addSiteActivity: (a: Omit<seed.SiteActivity, "id">) => void;
  updateQuotation: (id: string, patch: Partial<seed.Quotation>) => void;
  convertQuotationToProject: (qid: string) => seed.Project | null;
  addDocument: (d: Omit<seed.Doc, "id">) => seed.Doc;
  markPaymentCollected: (id: string) => void;
  markPaymentInvoiced: (id: string) => void;
  addPaymentMilestone: (p: Omit<seed.PaymentMilestone, "id">) => void;
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

  addMilestone: (m: Omit<seed.Milestone, "id">) => void;
  updateMilestone: (id: string, patch: Partial<seed.Milestone>) => void;
  deleteMilestone: (id: string) => void;
  completeMilestone: (id: string) => void;

  addBOQItem: (b: Omit<seed.ProjectBOQItem, "id">) => void;
  updateBOQItem: (id: string, patch: Partial<seed.ProjectBOQItem>) => void;
  deleteBOQItem: (id: string) => void;
  importBOQFromQuotation: (projectId: string) => number;

  addTeamMember: (projectId: string, employeeId: string, role: seed.ProjectRole) => void;
  updateTeamMemberRole: (id: string, role: seed.ProjectRole) => void;
  removeTeamMember: (id: string) => void;

  addIssue: (i: Omit<seed.ProjectIssue, "id">) => seed.ProjectIssue;
  updateIssue: (id: string, patch: Partial<seed.ProjectIssue>) => void;

  addCommunication: (c: Omit<seed.Communication, "id">) => void;
  addNote: (projectId: string, message: string, actor?: string) => void;
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

    const selectorCtx: SelectorCtx = {
      projects: state.projects, tasks: state.tasks, milestones: state.milestones, devices: state.devices,
      materials: state.materials, approvals: state.approvals, variations: state.variations, payments: state.payments,
      boqItems: state.projectBOQItems, handoverItems: state.handoverItems, issues: state.projectIssues,
      employees: state.employees, teamMembers: state.projectTeamMembers,
    };

    const logActivity = (projectId: string, type: string, message: string, actor?: string, relatedId?: string) => {
      create<seed.ProjectActivity>("projectActivities", "PA", { projectId, ts: new Date().toISOString(), type, message, actor, relatedId });
    };

    return {
      ...state,
      selectorCtx,

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
      requestCreate: (type, projectId) => setPendingCreate({ type, ts: Date.now(), projectId }),
      clearPendingCreate: () => setPendingCreate(null),
      resetDemoData: () => { persist(resetDB()); },

      updateLead: (id, p) => update("leads", id, { ...p, lastActivity: new Date().toISOString().slice(0, 10) }),
      addLead: (l) => create<seed.Lead>("leads", "L", l),
      deleteLead: (id) => remove("leads", id),

      updateTask: (id, p) => {
        update("tasks", id, p);
        const t = state.tasks.find((x) => x.id === id);
        if (t && p.status === "Completed") logActivity(t.projectId, "task_completed", `Task completed: ${t.title}`, undefined, id);
      },
      addTask: (t) => { const nt = create<seed.Task>("tasks", "T", t); logActivity(t.projectId, "task_created", `Task created: ${t.title}`, undefined, nt.id); },
      deleteTask: (id) => remove("tasks", id),

      updateProject: (id, p) => update("projects", id, p),
      addProject: (p) => {
        const np = create<seed.Project>("projects", "P", p);
        logActivity(np.id, "project_created", `Project created${p.quotationId ? ` from quotation ${p.quotationId}` : ""}.`);
        return np;
      },
      setProjectPhase: (id, phase, note) => {
        const before = state.projects.find((x) => x.id === id);
        update("projects", id, { phase });
        if (before && before.phase !== phase) logActivity(id, "phase_changed", `Phase changed from ${before.phase} to ${phase}.${note ? ` ${note}` : ""}`);
      },
      archiveProject: (id) => { update("projects", id, { archivedAt: new Date().toISOString() }); logActivity(id, "project_archived", "Project archived."); },
      unarchiveProject: (id) => { update("projects", id, { archivedAt: undefined }); logActivity(id, "project_unarchived", "Project restored from archive."); },
      cancelProject: (id, reason) => { update("projects", id, { phase: "Cancelled" }); logActivity(id, "project_cancelled", `Project cancelled.${reason ? ` Reason: ${reason}` : ""}`); },
      completeProject: (id) => {
        const readiness = getProjectHandoverReadiness(selectorCtx, id);
        if (!readiness.ready) return { ok: false, remaining: readiness.remaining };
        update("projects", id, { phase: "Completed", actualEnd: new Date().toISOString().slice(0, 10) });
        logActivity(id, "project_completed", "Project marked complete.");
        return { ok: true, remaining: [] };
      },
      updateProjectCommercial: (id, patch) => { update("projects", id, patch); logActivity(id, "commercial_updated", "Commercial baseline updated."); },

      updateTicket: (id, p) => update("tickets", id, p),
      addTicket: (t) => create<seed.ServiceTicket>("tickets", "TK", t),

      updateApproval: (id, p) => update("approvals", id, p),
      updateDevice: (id, p) => update("devices", id, p),
      addDevice: (d) => { const nd = create<seed.Device>("devices", "D", d); logActivity(d.projectId, "device_registered", `Device registered: ${d.label}.`, undefined, nd.id); return nd; },
      recordDeviceTest: (deviceId, result, notes) => {
        const dev = state.devices.find((x) => x.id === deviceId);
        if (!dev) return;
        update("devices", deviceId, { testResult: result, status: result === "Pass" ? "Tested" : "Configured" });
        const rec = state.testRecords.find((t) => t.deviceId === deviceId);
        if (rec) update("testRecords", rec.id, { result, notes: notes ?? rec.notes, testedOn: new Date().toISOString().slice(0, 10) });
        logActivity(dev.projectId, result === "Pass" ? "test_passed" : "test_failed", `Test result: ${result.toUpperCase()} on ${dev.label}.${notes ? ` ${notes}` : ""}`, undefined, deviceId);
      },

      toggleHandover: (id) => {
        const item = state.handoverItems.find((h) => h.id === id);
        if (item) { update("handoverItems", id, { done: !item.done }); logActivity(item.projectId, "handover_item", `Handover item "${item.label}" marked ${!item.done ? "complete" : "incomplete"}.`); }
      },
      addHandoverItem: (h) => create<seed.HandoverItem>("handoverItems", "H", h),
      toggleCompliance: (id) => { const item = state.complianceItems.find((c) => c.id === id); if (item) update("complianceItems", id, { status: item.status === "Approved" ? "Submitted" : "Approved" }); },
      addComplianceItem: (c) => create<seed.ComplianceItem>("complianceItems", "CI", c),

      addSiteActivity: (a) => { create<seed.SiteActivity>("siteActivities", "SA", a); logActivity(a.projectId, "site_report", `Daily site report logged for ${a.date}.`); },
      updateQuotation: (id, p) => update("quotations", id, p),

      convertQuotationToProject: (qid) => {
        const q = state.quotations.find((x) => x.id === qid);
        if (!q) return null;
        const num = `AHC-PRO-2026-${String(50 + state.projects.length).padStart(3, "0")}`;
        const total = q.items.reduce((s, i) => s + i.unitPrice * i.qty, 0) || Math.round(100000 + Math.random() * 300000);
        const np = create<seed.Project>("projects", "P", {
          number: num, name: q.opportunityName + " CCTV",
          customerId: q.customerId, siteId: q.siteId, phase: "Planning",
          scope: q.notes || "Scope inherited from quotation " + q.number,
          contractValue: total, estimatedCost: Math.round(total * 0.62),
          committedCost: 0, actualCost: 0, retention: Math.round(total * 0.05),
          plannedStart: new Date().toISOString().slice(0, 10),
          plannedEnd: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
          pmId: "E-004", salespersonId: q.salespersonId, teamIds: ["E-008", "E-010"],
          quotationId: q.id, leadId: q.leadId,
        });
        logActivity(np.id, "project_created", `Project created from quotation ${q.number}.`);
        return np;
      },

      addDocument: (d) => create<seed.Doc>("documents", "DOC", d),
      markPaymentCollected: (id) => {
        const pay = state.payments.find((p) => p.id === id);
        update("payments", id, { status: "Collected", collectedOn: new Date().toISOString().slice(0, 10) });
        if (pay) logActivity(pay.projectId, "payment_collected", `Payment collected: ${pay.label}.`);
      },
      markPaymentInvoiced: (id) => {
        const pay = state.payments.find((p) => p.id === id);
        update("payments", id, { status: "Invoiced", invoicedOn: new Date().toISOString().slice(0, 10) });
        if (pay) logActivity(pay.projectId, "payment_invoiced", `Payment invoiced: ${pay.label}.`);
      },
      addPaymentMilestone: (p) => { create<seed.PaymentMilestone>("payments", "PM", p); logActivity(p.projectId, "payment_milestone_added", `Payment milestone added: ${p.label}.`); },

      addPurchaseRequest: (p) => { const r = create<seed.PurchaseRequest>("purchaseRequests", "PR", p); logActivity(p.projectId, "purchase_request", `Purchase request ${r.number} raised.`); return r; },
      updatePurchaseRequest: (id, p) => update("purchaseRequests", id, p),
      addPurchaseOrder: (p) => create<seed.PurchaseOrder>("purchaseOrders", "PO", p),
      updatePurchaseOrder: (id, p) => update("purchaseOrders", id, p),

      updateSurvey: (id, p) => update("surveys", id, p),
      addSurvey: (s) => create<seed.SiteSurvey>("surveys", "SV", s),

      addVariation: (v) => { const nv = create<seed.Variation>("variations", "V", v); logActivity(v.projectId, "variation_submitted", `Variation ${v.number} submitted.`); return nv; },
      updateVariation: (id, p) => {
        update("variations", id, p);
        const v = state.variations.find((x) => x.id === id);
        if (v && p.status === "Approved") logActivity(v.projectId, "variation_approved", `Variation ${v.number} approved.`);
      },

      updateCustomer: (id, p) => update("customers", id, p),
      addCustomer: (c) => create<seed.Customer>("customers", "C", c),

      addAMC: (a) => create<seed.AMCContract>("amc", "AMC", a),
      updateAMC: (id, p) => update("amc", id, p),

      updateProduct: (id, p) => update("products", id, p),
      receiveStock: (id, qty) => { const p = state.products.find((x) => x.id === id); if (p) update("products", id, { stock: p.stock + qty }); },
      issueStock: (id, qty) => { const p = state.products.find((x) => x.id === id); if (p) update("products", id, { stock: Math.max(0, p.stock - qty) }); },

      addMilestone: (m) => { create<seed.Milestone>("milestones", "MS", m); logActivity(m.projectId, "milestone_added", `Milestone added: ${m.title}.`); },
      updateMilestone: (id, p) => update("milestones", id, p),
      deleteMilestone: (id) => remove("milestones", id),
      completeMilestone: (id) => {
        const m = state.milestones.find((x) => x.id === id);
        update("milestones", id, { done: true, actual: new Date().toISOString().slice(0, 10) });
        if (m) logActivity(m.projectId, "milestone_completed", `Milestone completed: ${m.title}.`);
      },

      addBOQItem: (b) => create<seed.ProjectBOQItem>("projectBOQItems", "PBOQ", b),
      updateBOQItem: (id, p) => update("projectBOQItems", id, p),
      deleteBOQItem: (id) => remove("projectBOQItems", id),
      importBOQFromQuotation: (projectId) => {
        const proj = state.projects.find((p) => p.id === projectId);
        if (!proj?.quotationId) return 0;
        const q = state.quotations.find((x) => x.id === proj.quotationId);
        if (!q || q.items.length === 0) return 0;
        const bySku = new Map<string, { description: string; category: string; unit: string; qty: number; unitPrice: number; delivered: number }>();
        q.items.forEach((it) => {
          const existing = bySku.get(it.sku);
          if (existing) { existing.qty += it.qty; existing.delivered += it.delivered; }
          else bySku.set(it.sku, { description: it.description.replace(/ at .+$/, ""), category: it.category, unit: it.unit, qty: it.qty, delivered: it.delivered, unitPrice: it.unitPrice });
        });
        let count = 0;
        bySku.forEach((line, sku) => {
          create<seed.ProjectBOQItem>("projectBOQItems", "PBOQ", { projectId, sku, ...line });
          count++;
        });
        logActivity(projectId, "boq_imported", `Imported ${count} BOQ line${count === 1 ? "" : "s"} from quotation ${q.number}.`);
        return count;
      },

      addTeamMember: (projectId, employeeId, role) => {
        create<seed.ProjectTeamMember>("projectTeamMembers", "PTM", { projectId, employeeId, role });
        const proj = state.projects.find((p) => p.id === projectId);
        if (proj && !proj.teamIds.includes(employeeId)) update("projects", projectId, { teamIds: [...proj.teamIds, employeeId] });
        const emp = state.employees.find((e) => e.id === employeeId);
        logActivity(projectId, "team_assigned", `${emp?.name ?? employeeId} added to the team as ${role}.`);
      },
      updateTeamMemberRole: (id, role) => update("projectTeamMembers", id, { role }),
      removeTeamMember: (id) => {
        const m = state.projectTeamMembers.find((x) => x.id === id);
        remove("projectTeamMembers", id);
        if (m) {
          const proj = state.projects.find((p) => p.id === m.projectId);
          if (proj) update("projects", m.projectId, { teamIds: proj.teamIds.filter((t) => t !== m.employeeId) });
          const emp = state.employees.find((e) => e.id === m.employeeId);
          logActivity(m.projectId, "team_removed", `${emp?.name ?? m.employeeId} removed from the team.`);
        }
      },

      addIssue: (i) => { const ni = create<seed.ProjectIssue>("projectIssues", "ISS", i); logActivity(i.projectId, "issue_raised", `Issue raised: ${i.title}.`, undefined, ni.id); return ni; },
      updateIssue: (id, p) => {
        update("projectIssues", id, p);
        const i = state.projectIssues.find((x) => x.id === id);
        if (i && (p.status === "Resolved" || p.status === "Closed")) logActivity(i.projectId, "issue_resolved", `Issue resolved: ${i.title}.`);
      },

      addCommunication: (c) => { create<seed.Communication>("communications", "CM", c); logActivity(c.projectId, "communication_logged", `Client update logged: ${c.subject}.`); },
      addNote: (projectId, message, actor) => logActivity(projectId, "note", message, actor),
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
