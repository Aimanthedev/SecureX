// Shared connected mock dataset for SecureX CCTV COMPANY
// All entities linked by id. Camera Point ids (CP-*) thread through survey -> BOQ -> device -> test -> handover.
//
// Dates: every seed date is generated relative to the moment the app loads (see demoDate below),
// so the demo timeline stays chronologically coherent no matter when someone opens it — a project
// "due in 20 days" is always due in 20 days from today, never a fixed calendar date that drifts into
// the past. Only source-controlled seed records use demoDate(); anything a user creates through the UI
// stores the real date they entered.

export type ID = string;

const NOW = Date.now();
const DAY = 86400000;
/** Relative-to-today date for seed records, so the shipped demo never looks stale. */
export function demoDate(offsetDays: number): string {
  return new Date(NOW + offsetDays * DAY).toISOString().slice(0, 10);
}
/** Relative-to-today datetime (for activity/communication timestamps). */
export function demoDateTime(offsetDays: number, hh = 9, mm = 0): string {
  const d = new Date(NOW + offsetDays * DAY);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

export type Customer = {
  id: ID; name: string; industry: string; contact: string; phone: string; email: string;
  address: string; status: "Active" | "Prospect" | "Inactive"; since: string;
};
export type Site = {
  id: ID; customerId: ID; name: string; area: string; type: string; address: string;
  contact?: string; contactPhone?: string;
};
export type Employee = {
  id: ID; name: string; role: string; department: string; phone: string; email: string;
  availability: "Available" | "Busy" | "On Leave"; workload: number; // 0-100
};
/** Departments an employee must belong to in order to be assignable to field/installation work. */
export const FIELD_DEPARTMENTS = ["Engineering", "Installation", "Service"];
export const PM_DEPARTMENTS = ["Projects"];

export type Lead = {
  id: ID; company: string; contactName: string; phone: string; email: string;
  customerId?: ID; siteId?: ID;
  systemType: string; value: number; source: string; salespersonId: ID;
  stage: LeadStage; probability: number; nextFollowUp?: string;
  createdAt: string; lastActivity: string; notes: string; lostReason?: string;
};
export const LEAD_STAGES = [
  "New Enquiry","Contacted","Qualified","Site Survey Required","Site Survey Scheduled",
  "Survey Completed","Quotation Draft","Quotation Sent","Negotiation","Verbal Approval","Won","Lost",
] as const;
export type LeadStage = typeof LEAD_STAGES[number];

export type CameraPoint = {
  id: ID; // e.g., CP-01
  building: string; floor: string; zone: string; area: string;
  indoor: boolean; cameraType: string; coverage: string;
  mountPos: string; mountHeight: string; cableLen: number;
  power: string; networkRoute: string; notes: string;
};
export type SiteSurvey = {
  id: ID; number: string; customerId: ID; siteId: ID; type: string;
  engineerId: ID; scheduled: string; status: "Requested"|"Scheduled"|"In Progress"|"Completed"|"Report Pending"|"Report Approved";
  completeness: number; reportStatus: "Draft"|"Pending Review"|"Approved";
  points: CameraPoint[]; existingSystem: string; proposedSummary: string;
};
export type BOQItem = {
  id: ID; cameraPointId?: ID; sku: string; description: string; category: string;
  unit: string; qty: number; unitCost: number; unitPrice: number;
  ordered: number; delivered: number; issued: number; installed: number; tested: number;
};
export type Quotation = {
  id: ID; number: string; customerId: ID; siteId: ID; leadId?: ID; opportunityName: string;
  salespersonId: ID; revision: number; createdAt: string; validUntil: string;
  status: "Draft"|"Internal Approval"|"Sent"|"Approved"|"Rejected"|"Expired";
  items: BOQItem[]; tax: number; notes: string;
};
export type Task = {
  id: ID; projectId: ID; title: string; assigneeId: ID; phase: string;
  status: "Not Started"|"Ready"|"In Progress"|"Blocked"|"Awaiting Client"|"Awaiting Material"|"Under Review"|"Completed";
  due: string; progress: number; priority: "Low"|"Medium"|"High"|"Critical";
};
export type Milestone = {
  id: ID; projectId: ID; title: string; planned: string; actual?: string; done: boolean;
  owner?: ID; notes?: string;
};
export type Device = {
  id: ID; projectId: ID; cameraPointId?: ID; label: string; brand: string; model: string;
  serial: string; mac: string; ip: string; building: string; floor: string; zone: string;
  indoor: boolean; switch: string; switchPort: string; recorder: string; recorderChannel: string;
  installDate?: string; installerId?: ID; testResult: "Pass"|"Fail"|"Pending"|"Retest";
  warranty: string; status: "Installed"|"Configured"|"Tested"|"Handed Over"|"Faulty";
};
export type TestRecord = {
  id: ID; deviceId: ID; projectId: ID; testedBy: ID; testedOn?: string;
  checks: Record<string, "Pass"|"Fail"|"NA">; result: "Pass"|"Fail"|"Pending"; notes: string;
};
export type Approval = { id: ID; projectId: ID; title: string; requestedOn: string; status: "Pending"|"Approved"|"Rejected"; owner: string; critical: boolean; };
export type Variation = { id: ID; projectId: ID; number: string; description: string; amount: number; status: "Draft"|"Submitted"|"Approved"|"Rejected"; date: string; };
export type Doc = {
  id: ID; name: string; category: string; projectId?: ID; customerId?: ID; revision: string;
  status: "Draft"|"Pending"|"Approved"|"Expired"; expiresOn?: string; uploadedOn: string; tags: string[];
  uploadedBy?: string; caption?: string; zone?: string;
};
export const DOC_CATEGORIES = ["Contract / LPO","Survey","Quotation","Drawings","Technical Submittal","Delivery","Site Report","Test / Commissioning","As-Built","Warranty","Handover","Photo","Other"];
export type PaymentMilestone = { id: ID; projectId: ID; label: string; amount: number; dueDate: string; invoicedOn?: string; collectedOn?: string; status: "Pending"|"Invoiced"|"Collected"|"Overdue"; };
export type AMCContract = { id: ID; number: string; customerId: ID; siteId: ID; projectId?: ID; equipment: string; start: string; end: string; visitFrequency: string; value: number; sla: string; engineerId: ID; nextVisit: string; renewalStatus: "Active"|"Expiring Soon"|"Expired"|"Renewed"; };
export type ServiceTicket = { id: ID; number: string; customerId: ID; siteId: ID; amcId?: ID; title: string; priority: "Low"|"Medium"|"High"|"Critical"; status: "New"|"Assigned"|"In Progress"|"Awaiting Parts"|"Resolved"|"Closed"; opened: string; assigneeId?: ID; sla: string; };
export type Material = { id: ID; projectId: ID; sku: string; name: string; required: number; ordered: number; delivered: number; issued: number; installed: number; returned: number; critical: boolean; };
export type Product = { id: ID; sku: string; category: string; brand: string; model: string; spec: string; unit: string; cost: number; price: number; stock: number; reserved: number; reorderLevel: number; supplier: string; warranty: string; status: "Active"|"Discontinued"; };
export type PurchaseRequest = { id: ID; number: string; projectId: ID; requestedBy: ID; requestDate: string; requiredDate: string; items: number; cost: number; priority: "Low"|"Medium"|"High"|"Critical"; approvalStatus: "Pending"|"Approved"|"Rejected"; procurementStatus: "Requested"|"Sourcing"|"Quoted"|"Ordered"|"Delivered"|"Closed"; };
export type PurchaseOrder = { id: ID; number: string; supplier: string; projectId: ID; amount: number; orderDate: string; expectedDelivery: string; deliveryStatus: "Pending"|"Partial"|"Delivered"|"Overdue"; paymentStatus: "Unpaid"|"Partial"|"Paid"; };
export type SiteActivity = { id: ID; projectId: ID; date: string; teamPresent: string[]; workCompleted: string; camerasInstalled: number; cableInstalled: number; devicesConfigured: number; issues: string; tomorrowPlan: string; };
export type Communication = {
  id: ID; projectId: ID; date: string; owner: string; subject: string; status: "Sent"|"Received"|"Confirmed"|"Pending";
  relatedTaskId?: ID; method?: "Call"|"WhatsApp"|"Email"|"Meeting"|"Site Meeting"; summary?: string; nextAction?: string; followUpDate?: string;
};

/** A project's own operational bill of quantities — a snapshot taken at award time, not a live link
 * back to the (mutable) sales quotation. Procurement/delivery tracking lives on `Material`; device-level
 * install/test tracking lives on `Device`. This collection only answers "what did we contract to supply,
 * and how much of it has actually arrived on site." */
export type ProjectBOQItem = {
  id: ID; projectId: ID; sku: string; description: string; category: string;
  unit: string; qty: number; unitPrice: number; delivered: number; notes?: string;
};

export const PROJECT_ROLES = ["Project Manager","Project Engineer","Site Supervisor","CCTV Technician","ELV Technician","Installer","QA / Commissioning"] as const;
export type ProjectRole = typeof PROJECT_ROLES[number];
export type ProjectTeamMember = { id: ID; projectId: ID; employeeId: ID; role: ProjectRole; };

export const ISSUE_CATEGORIES = ["Installation","Cabling","Device Fault","Network","Access","Snag","Client Request","Other"];
export type ProjectIssue = {
  id: ID; projectId: ID; number: string; title: string; category: string; description: string;
  priority: "Low"|"Medium"|"High"|"Critical"; status: "Open"|"Assigned"|"In Progress"|"Resolved"|"Closed";
  raisedBy: string; assignedTo?: ID; raisedOn: string; dueDate?: string;
  relatedDeviceId?: ID; zone?: string; resolution?: string; resolvedOn?: string;
};

export type ProjectActivity = {
  id: ID; projectId: ID; ts: string; type: string; message: string; actor?: string; relatedId?: string;
};

export const PROJECT_PHASES = ["Planning","Procurement","Installation","Testing & Commissioning","Handover","Warranty","AMC","Completed","On Hold","Cancelled"] as const;
export type ProjectPhase = typeof PROJECT_PHASES[number];

/** Defensive mapping so any stale phase string left over in a browser's localStorage delta from an
 * earlier build of this app (before phases were normalized) still renders instead of crashing. */
const LEGACY_PHASE_MAP: Record<string, ProjectPhase> = {
  "Project Setup": "Planning", "Design and Planning": "Planning", "Client Approval": "Planning", "Mobilization": "Planning",
  "Material Delivery": "Procurement",
  "Configuration": "Installation", "Rework": "Installation",
  "Testing": "Testing & Commissioning", "Training": "Testing & Commissioning",
  "Inspection and Compliance": "Handover",
  "Awaiting Client": "On Hold", "Awaiting Materials": "On Hold", "Delayed": "On Hold",
};
export function normalizePhase(phase: string): ProjectPhase {
  if ((PROJECT_PHASES as readonly string[]).includes(phase)) return phase as ProjectPhase;
  return LEGACY_PHASE_MAP[phase] ?? "Planning";
}

export const PROJECT_HEALTH = ["On Track","Watch","At Risk","Delayed"] as const;
export type ProjectHealth = typeof PROJECT_HEALTH[number];
export type HealthDriver = { severity: "info" | "warning" | "critical"; text: string; };

export type Project = {
  id: ID; number: string; name: string; customerId: ID; siteId: ID;
  phase: ProjectPhase; scope: string;
  contractValue: number; estimatedCost: number; committedCost: number; actualCost: number;
  retention: number;
  plannedStart: string; plannedEnd: string; actualStart?: string; actualEnd?: string;
  pmId: ID; salespersonId: ID; teamIds: ID[];
  quotationId?: ID; surveyId?: ID; leadId?: ID;
  /** Presence = archived (hidden from active views but kept for history). Distinct from phase "Cancelled". */
  archivedAt?: string;
  warrantyStart?: string; warrantyEnd?: string; amcId?: ID;
};

// ---------- SEED: people, accounts, pipeline ----------

export const employees: Employee[] = [
  { id: "E-001", name: "Yousef Al-Emadi", role: "Managing Director", department: "Management", phone: "+974 3311 0001", email: "yousef@securex.qa", availability: "Busy", workload: 92 },
  { id: "E-002", name: "Rashid Al-Kubaisi", role: "Operations Manager", department: "Projects", phone: "+974 3311 0002", email: "rashid@securex.qa", availability: "Busy", workload: 88 },
  { id: "E-003", name: "Karim Haddad", role: "Senior Project Manager", department: "Projects", phone: "+974 3311 0003", email: "karim@securex.qa", availability: "Busy", workload: 84 },
  { id: "E-004", name: "Anitha Verghese", role: "Project Manager", department: "Projects", phone: "+974 3311 0004", email: "anitha@securex.qa", availability: "Busy", workload: 76 },
  { id: "E-005", name: "Mohammed Farouk", role: "Sales Manager", department: "Sales", phone: "+974 3311 0005", email: "farouk@securex.qa", availability: "Available", workload: 55 },
  { id: "E-006", name: "Layla Al-Thani", role: "Senior Sales Executive", department: "Sales", phone: "+974 3311 0006", email: "layla@securex.qa", availability: "Busy", workload: 71 },
  { id: "E-007", name: "Nassar Iqbal", role: "Sales Executive", department: "Sales", phone: "+974 3311 0007", email: "nassar@securex.qa", availability: "Available", workload: 48 },
  { id: "E-008", name: "Ahmed Sobhi", role: "Senior Site Engineer", department: "Engineering", phone: "+974 3311 0008", email: "sobhi@securex.qa", availability: "Busy", workload: 90 },
  { id: "E-009", name: "Vinod Menon", role: "Site Engineer", department: "Engineering", phone: "+974 3311 0009", email: "vinod@securex.qa", availability: "Busy", workload: 82 },
  { id: "E-010", name: "Suresh Kumar", role: "Lead Technician", department: "Installation", phone: "+974 3311 0010", email: "suresh@securex.qa", availability: "Busy", workload: 78 },
  { id: "E-011", name: "Rakesh Nair", role: "Installation Technician", department: "Installation", phone: "+974 3311 0011", email: "rakesh@securex.qa", availability: "Busy", workload: 72 },
  { id: "E-012", name: "Prakash Iyer", role: "Installation Technician", department: "Installation", phone: "+974 3311 0012", email: "prakash@securex.qa", availability: "Available", workload: 40 },
  { id: "E-013", name: "Bilal Farooq", role: "Service Engineer", department: "Service", phone: "+974 3311 0013", email: "bilal@securex.qa", availability: "Busy", workload: 68 },
  { id: "E-014", name: "Aisha Rahman", role: "Procurement Officer", department: "Procurement", phone: "+974 3311 0014", email: "aisha@securex.qa", availability: "Available", workload: 58 },
  { id: "E-015", name: "Hasan Barzani", role: "Accounts Manager", department: "Accounts", phone: "+974 3311 0015", email: "hasan@securex.qa", availability: "Available", workload: 52 },
];

export const customers: Customer[] = [
  { id: "C-001", name: "Al Wakra Logistics Hub", industry: "Logistics", contact: "Fahad Al-Marri", phone: "+974 4455 1001", email: "fahad@wakralogistics.qa", address: "Industrial Area, Al Wakrah", status: "Active", since: "2023-04-11" },
  { id: "C-002", name: "Msheireb Properties", industry: "Real Estate", contact: "Hessa Al-Sulaiti", phone: "+974 4455 1002", email: "h.sulaiti@msheireb.qa", address: "Msheireb, Doha", status: "Active", since: "2022-01-20" },
  { id: "C-003", name: "Katara Cultural Village", industry: "Hospitality", contact: "Sara Al-Kaabi", phone: "+974 4455 1003", email: "s.kaabi@katara.qa", address: "The Pearl, Doha", status: "Active", since: "2024-06-14" },
  { id: "C-004", name: "Lusail Retail Group", industry: "Retail", contact: "Omar Al-Hajri", phone: "+974 4455 1004", email: "omar@lusailretail.qa", address: "Lusail Marina, Lusail", status: "Active", since: "2023-11-02" },
  { id: "C-005", name: "West Bay Financial Tower", industry: "Finance", contact: "Nawaf Al-Attiyah", phone: "+974 4455 1005", email: "nawaf@wbft.qa", address: "West Bay, Doha", status: "Prospect", since: "2026-03-10" },
  { id: "C-006", name: "Al Rayyan Sports Academy", industry: "Sports", contact: "Jassim Al-Ansari", phone: "+974 4455 1006", email: "jassim@rayyanacademy.qa", address: "Al Rayyan", status: "Active", since: "2024-09-19" },
  { id: "C-007", name: "Pearl Marina Residences", industry: "Residential", contact: "Reem Al-Mohannadi", phone: "+974 4455 1007", email: "reem@pearlmarina.qa", address: "The Pearl, Doha", status: "Active", since: "2025-02-05" },
  { id: "C-008", name: "Doha Industrial Warehousing", industry: "Warehousing", contact: "Khaled Naseer", phone: "+974 4455 1008", email: "khaled@dohaind.qa", address: "Industrial Area, Doha", status: "Prospect", since: "2026-05-22" },
];

export const sites: Site[] = [
  { id: "S-001", customerId: "C-001", name: "Al Wakrah Warehouse A", area: "Al Wakrah", type: "Warehouse", address: "Logistics Hub, Warehouse A, Al Wakrah", contact: "Fahad Al-Marri", contactPhone: "+974 4455 1001" },
  { id: "S-002", customerId: "C-002", name: "Msheireb Office Tower B", area: "Msheireb", type: "Commercial", address: "Msheireb Downtown, Tower B, Doha", contact: "Hessa Al-Sulaiti", contactPhone: "+974 4455 1002" },
  { id: "S-003", customerId: "C-003", name: "Katara Villa 12", area: "The Pearl", type: "Residential", address: "Katara Hills, Villa 12", contact: "Sara Al-Kaabi", contactPhone: "+974 4455 1003" },
  { id: "S-004", customerId: "C-004", name: "Lusail Retail Unit 7", area: "Lusail", type: "Retail", address: "Lusail Marina, Retail Unit 7", contact: "Omar Al-Hajri", contactPhone: "+974 4455 1004" },
  { id: "S-005", customerId: "C-005", name: "West Bay Tower Podium", area: "West Bay", type: "Commercial", address: "West Bay, Podium Level" },
  { id: "S-006", customerId: "C-006", name: "Rayyan Sports Complex", area: "Al Rayyan", type: "Sports", address: "Al Rayyan Sports Academy Complex" },
  { id: "S-007", customerId: "C-007", name: "Pearl Marina Tower 3", area: "The Pearl", type: "Residential", address: "Pearl Marina, Tower 3" },
];

// Camera points for the Al Wakrah warehouse survey - these ids thread through the whole system
const wakrahPoints: CameraPoint[] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const outdoor = n <= 6;
  const type = outdoor ? "4MP IR Bullet" : n % 4 === 0 ? "4MP PTZ" : "4MP IR Dome";
  return {
    id: `CP-${String(n).padStart(2, "0")}`,
    building: "Warehouse A",
    floor: outdoor ? "Perimeter" : n <= 14 ? "Ground Floor" : "Mezzanine",
    zone: outdoor ? `Perimeter Zone ${Math.ceil(n / 2)}` : n <= 14 ? `Ground Zone ${Math.ceil((n - 6) / 2)}` : `Mezz Zone ${Math.ceil((n - 14) / 2)}`,
    area: outdoor ? "External" : n <= 10 ? "Aisle" : n <= 14 ? "Loading Bay" : "Office",
    indoor: !outdoor,
    cameraType: type,
    coverage: outdoor ? "Perimeter surveillance" : "Aisle and rack coverage",
    mountPos: outdoor ? "Pole mount" : "Ceiling mount",
    mountHeight: outdoor ? "6.0 m" : "4.5 m",
    cableLen: 30 + (n % 6) * 10,
    power: "PoE from switch SW-01",
    networkRoute: "Ceiling tray to IDF-01",
    notes: n === 4 ? "Requires PTZ, coverage of loading dock." : "",
  };
});

const msheirebPoints: CameraPoint[] = Array.from({ length: 48 }, (_, i) => ({
  id: `CP-${String(i + 1).padStart(2, "0")}`, building: "Tower B", floor: `Floor ${Math.ceil((i + 1) / 6)}`,
  zone: `Zone ${((i + 1) % 4) + 1}`, area: i % 3 === 0 ? "Lobby" : "Corridor", indoor: true,
  cameraType: "4MP IR Dome", coverage: "Corridor coverage", mountPos: "Ceiling mount",
  mountHeight: "3.2 m", cableLen: 25 + (i % 5) * 5, power: "PoE from floor switch", networkRoute: "Riser to core",
  notes: "",
}));

const kataraPoints: CameraPoint[] = Array.from({ length: 12 }, (_, i) => ({
  id: `CP-${String(i + 1).padStart(2, "0")}`, building: "Villa 12", floor: i < 6 ? "Ground" : "First",
  zone: "Villa Perimeter", area: i < 4 ? "External" : "Internal", indoor: i >= 4, cameraType: "4MP Dome",
  coverage: "Perimeter and entrance", mountPos: "Wall mount", mountHeight: "3.0 m", cableLen: 20 + i * 3,
  power: "PoE", networkRoute: "Ceiling", notes: "",
}));

const lusailPoints: CameraPoint[] = Array.from({ length: 16 }, (_, i) => {
  const n = i + 1;
  const bullet = n <= 6;
  return {
    id: `CP-${String(n).padStart(2, "0")}`, building: "Retail Unit 7", floor: "Ground",
    zone: bullet ? "Shopfront / Entrance" : `Sales Floor Zone ${Math.ceil((n - 6) / 3)}`,
    area: bullet ? "External" : "Sales Floor", indoor: !bullet, cameraType: bullet ? "4MP IR Bullet" : "4MP IR Dome",
    coverage: bullet ? "Entrance and shopfront" : "Sales floor and till coverage", mountPos: bullet ? "Wall mount" : "Ceiling mount",
    mountHeight: bullet ? "3.5 m" : "3.0 m", cableLen: 18 + (n % 5) * 4, power: "PoE from SW-01", networkRoute: "Ceiling void to IDF",
    notes: "",
  };
});

export const surveys: SiteSurvey[] = [
  {
    id: "SV-001", number: "AHC-SUR-2026-014", customerId: "C-001", siteId: "S-001", type: "Full site survey",
    engineerId: "E-008", scheduled: demoDate(-95), status: "Report Approved", completeness: 100, reportStatus: "Approved",
    points: wakrahPoints,
    existingSystem: "Legacy 8-channel analog DVR, 6 cameras, end of life.",
    proposedSummary: "24-camera 4MP IP CCTV with 32-ch NVR, PoE switches, 8TB storage, remote viewing.",
  },
  {
    id: "SV-002", number: "AHC-SUR-2026-018", customerId: "C-002", siteId: "S-002", type: "Full site survey",
    engineerId: "E-008", scheduled: demoDate(-178), status: "Report Approved", completeness: 100, reportStatus: "Approved",
    points: msheirebPoints,
    existingSystem: "Building shell only. Greenfield installation.",
    proposedSummary: "48-camera 4K IP CCTV, VMS-controlled, integrated with access control.",
  },
  {
    id: "SV-003", number: "AHC-SUR-2026-021", customerId: "C-003", siteId: "S-003", type: "Residential survey",
    engineerId: "E-009", scheduled: demoDate(-28), status: "Report Approved", completeness: 100, reportStatus: "Approved",
    points: kataraPoints,
    existingSystem: "None.", proposedSummary: "12-camera residential IP CCTV with mobile app.",
  },
  {
    id: "SV-004", number: "AHC-SUR-2026-024", customerId: "C-005", siteId: "S-005", type: "Full site survey",
    engineerId: "E-008", scheduled: demoDate(4), status: "In Progress", completeness: 65, reportStatus: "Draft",
    points: [], existingSystem: "16-camera legacy IP system, non-compliant.", proposedSummary: "Under assessment.",
  },
  {
    id: "SV-005", number: "AHC-SUR-2026-026", customerId: "C-008", siteId: undefined as unknown as ID, type: "Scoping",
    engineerId: "E-009", scheduled: demoDate(9), status: "Scheduled", completeness: 0, reportStatus: "Draft",
    points: [], existingSystem: "Unknown.", proposedSummary: "",
  },
  {
    id: "SV-006", number: "AHC-SUR-2026-031", customerId: "C-004", siteId: "S-004", type: "Retail survey",
    engineerId: "E-009", scheduled: demoDate(-142), status: "Report Approved", completeness: 100, reportStatus: "Approved",
    points: lusailPoints,
    existingSystem: "4-camera legacy DVR at till only.", proposedSummary: "16-camera IP CCTV with retail analytics, NVR, remote viewing.",
  },
];

// Quotations
const wakrahBOQ: BOQItem[] = [
  ...wakrahPoints.map((p) => ({
    id: `BOQ-${p.id}`, cameraPointId: p.id, sku: p.cameraType.includes("PTZ") ? "CAM-PTZ-4M" : p.cameraType.includes("Bullet") ? "CAM-BUL-4M" : "CAM-DOM-4M",
    description: `${p.cameraType} at ${p.zone}`, category: "Camera", unit: "pcs", qty: 1,
    unitCost: p.cameraType.includes("PTZ") ? 2400 : 620, unitPrice: p.cameraType.includes("PTZ") ? 3400 : 920,
    ordered: 1, delivered: 1, issued: 1, installed: p.id === "CP-22" || p.id === "CP-23" || p.id === "CP-24" ? 0 : 1, tested: ["CP-01","CP-02","CP-03","CP-04","CP-05","CP-06","CP-07","CP-08","CP-09","CP-10","CP-11","CP-12","CP-13","CP-14","CP-15","CP-16","CP-17","CP-18","CP-19","CP-20","CP-21"].includes(p.id) ? 1 : 0,
  })),
  { id: "BOQ-NVR", sku: "NVR-32CH", description: "32-channel 4K NVR", category: "Recorder", unit: "pcs", qty: 1, unitCost: 4200, unitPrice: 6800, ordered: 1, delivered: 1, issued: 1, installed: 1, tested: 1 },
  { id: "BOQ-HDD", sku: "HDD-8TB", description: "8TB Surveillance HDD", category: "Storage", unit: "pcs", qty: 4, unitCost: 780, unitPrice: 1150, ordered: 4, delivered: 2, issued: 2, installed: 2, tested: 2 },
  { id: "BOQ-SW", sku: "SW-16P-POE", description: "16-port PoE managed switch", category: "Network", unit: "pcs", qty: 2, unitCost: 1900, unitPrice: 2850, ordered: 2, delivered: 1, issued: 1, installed: 1, tested: 1 },
  { id: "BOQ-CBL", sku: "CBL-CAT6-305", description: "Cat6 UTP cable 305m box", category: "Cabling", unit: "box", qty: 6, unitCost: 480, unitPrice: 720, ordered: 6, delivered: 6, issued: 5, installed: 5, tested: 5 },
  { id: "BOQ-RCK", sku: "RCK-12U", description: "12U wall-mount rack", category: "Rack", unit: "pcs", qty: 1, unitCost: 1200, unitPrice: 1900, ordered: 1, delivered: 1, issued: 1, installed: 1, tested: 1 },
];

export const quotations: Quotation[] = [
  { id: "Q-001", number: "AHC-QTN-2026-041", customerId: "C-001", siteId: "S-001", leadId: "L-001", opportunityName: "Al Wakrah Warehouse CCTV",
    salespersonId: "E-006", revision: 2, createdAt: demoDate(-100), validUntil: demoDate(-70), status: "Approved", items: wakrahBOQ, tax: 0, notes: "Approved by client." },
  { id: "Q-002", number: "AHC-QTN-2026-038", customerId: "C-002", siteId: "S-002", opportunityName: "Msheireb Tower B CCTV", salespersonId: "E-005", revision: 3, createdAt: demoDate(-183), validUntil: demoDate(-153), status: "Approved", items: [], tax: 0, notes: "" },
  { id: "Q-003", number: "AHC-QTN-2026-044", customerId: "C-003", siteId: "S-003", opportunityName: "Katara Villa 12 CCTV", salespersonId: "E-006", revision: 1, createdAt: demoDate(-25), validUntil: demoDate(5), status: "Approved", items: [], tax: 0, notes: "" },
  { id: "Q-004", number: "AHC-QTN-2026-035", customerId: "C-004", siteId: "S-004", opportunityName: "Lusail Retail CCTV", salespersonId: "E-007", revision: 1, createdAt: demoDate(-147), validUntil: demoDate(-117), status: "Approved", items: [], tax: 0, notes: "" },
  { id: "Q-005", number: "AHC-QTN-2026-051", customerId: "C-005", siteId: "S-005", leadId: "L-004", opportunityName: "West Bay Tower CCTV Upgrade", salespersonId: "E-006", revision: 1, createdAt: demoDate(-5), validUntil: demoDate(25), status: "Sent", items: [], tax: 0, notes: "Awaiting client review." },
  { id: "Q-006", number: "AHC-QTN-2026-053", customerId: "C-006", siteId: "S-006", opportunityName: "Rayyan Academy Access Control", salespersonId: "E-007", revision: 1, createdAt: demoDate(-3), validUntil: demoDate(27), status: "Draft", items: [], tax: 0, notes: "" },
  { id: "Q-007", number: "AHC-QTN-2026-050", customerId: "C-007", siteId: "S-007", opportunityName: "Pearl Marina Tower 3 CCTV", salespersonId: "E-005", revision: 2, createdAt: demoDate(-13), validUntil: demoDate(17), status: "Negotiation" as unknown as Quotation["status"], items: [], tax: 0, notes: "" },
];

export const leads: Lead[] = [
  { id: "L-001", company: "Al Wakra Logistics Hub", contactName: "Fahad Al-Marri", phone: "+974 4455 1001", email: "fahad@wakralogistics.qa", customerId: "C-001", siteId: "S-001", systemType: "IP CCTV", value: 340000, source: "Referral", salespersonId: "E-006", stage: "Won", probability: 100, nextFollowUp: undefined, createdAt: demoDate(-105), lastActivity: demoDate(-70), notes: "Won. Converted to AHC-PRO-2026-041." },
  { id: "L-002", company: "Msheireb Properties", contactName: "Hessa Al-Sulaiti", phone: "+974 4455 1002", email: "h.sulaiti@msheireb.qa", customerId: "C-002", siteId: "S-002", systemType: "IP CCTV, VMS", value: 1240000, source: "Tender", salespersonId: "E-005", stage: "Won", probability: 100, createdAt: demoDate(-188), lastActivity: demoDate(-150), notes: "Converted to project." },
  { id: "L-003", company: "Katara Cultural Village", contactName: "Sara Al-Kaabi", phone: "+974 4455 1003", email: "s.kaabi@katara.qa", customerId: "C-003", siteId: "S-003", systemType: "IP CCTV", value: 145000, source: "Repeat", salespersonId: "E-006", stage: "Won", probability: 100, createdAt: demoDate(-30), lastActivity: demoDate(-19), notes: "" },
  { id: "L-004", company: "West Bay Financial Tower", contactName: "Nawaf Al-Attiyah", phone: "+974 4455 1005", email: "nawaf@wbft.qa", systemType: "NVR upgrade, IP CCTV", value: 480000, source: "Website", salespersonId: "E-006", stage: "Quotation Sent", probability: 65, nextFollowUp: demoDate(3), createdAt: demoDate(-11), lastActivity: demoDate(-5), notes: "Quotation sent, awaiting review." },
  { id: "L-005", company: "Doha Industrial Warehousing", contactName: "Khaled Naseer", phone: "+974 4455 1008", email: "khaled@dohaind.qa", systemType: "IP CCTV", value: 220000, source: "Cold outreach", salespersonId: "E-007", stage: "Site Survey Scheduled", probability: 40, nextFollowUp: demoDate(4), createdAt: demoDate(-23), lastActivity: demoDate(-3), notes: "Survey booked." },
  { id: "L-006", company: "Pearl Marina Residences", contactName: "Reem Al-Mohannadi", phone: "+974 4455 1007", email: "reem@pearlmarina.qa", customerId: "C-007", siteId: "S-007", systemType: "IP CCTV, Access Control", value: 620000, source: "Referral", salespersonId: "E-005", stage: "Negotiation", probability: 70, nextFollowUp: demoDate(2), createdAt: demoDate(-51), lastActivity: demoDate(-6), notes: "Negotiating payment terms." },
  { id: "L-007", company: "Rayyan Sports Academy", contactName: "Jassim Al-Ansari", phone: "+974 4455 1006", email: "jassim@rayyanacademy.qa", customerId: "C-006", siteId: "S-006", systemType: "Access Control, Intercom", value: 180000, source: "Repeat", salespersonId: "E-007", stage: "Quotation Draft", probability: 55, nextFollowUp: demoDate(3), createdAt: demoDate(-30), lastActivity: demoDate(-3), notes: "" },
  { id: "L-008", company: "Souq Waqif Boutique Hotel", contactName: "Faisal Al-Ibrahim", phone: "+974 4455 2001", email: "faisal@sqboutique.qa", systemType: "IP CCTV", value: 95000, source: "Website", salespersonId: "E-007", stage: "Qualified", probability: 30, nextFollowUp: demoDate(5), createdAt: demoDate(-9), lastActivity: demoDate(-4), notes: "Boutique hotel, 22 cameras." },
  { id: "L-009", company: "Aspire Zone Foundation", contactName: "Mansour Al-Saadi", phone: "+974 4455 2002", email: "mansour@aspire.qa", systemType: "IP CCTV, VMS", value: 890000, source: "Tender", salespersonId: "E-005", stage: "Verbal Approval", probability: 90, nextFollowUp: demoDate(1), createdAt: demoDate(-78), lastActivity: demoDate(0), notes: "Verbal go-ahead, awaiting PO." },
  { id: "L-010", company: "Ezdan Mall Al Wakra", contactName: "Latifa Al-Naimi", phone: "+974 4455 2003", email: "latifa@ezdan.qa", systemType: "IP CCTV, Analytics", value: 720000, source: "Referral", salespersonId: "E-006", stage: "New Enquiry", probability: 15, nextFollowUp: demoDate(3), createdAt: demoDate(-1), lastActivity: demoDate(-1), notes: "New enquiry via referral." },
  { id: "L-011", company: "Doha Metro Concessions", contactName: "Yaseen Al-Kuwari", phone: "+974 4455 2004", email: "yaseen@dmc.qa", systemType: "IP CCTV", value: 260000, source: "Website", salespersonId: "E-007", stage: "Contacted", probability: 20, nextFollowUp: demoDate(4), createdAt: demoDate(-9), lastActivity: demoDate(-5), notes: "" },
  { id: "L-012", company: "Al Sadd Villa Compound", contactName: "Hessa Al-Emadi", phone: "+974 4455 2005", email: "hessa@alsaddc.qa", systemType: "IP CCTV", value: 130000, source: "Referral", salespersonId: "E-006", stage: "Survey Completed", probability: 60, nextFollowUp: demoDate(3), createdAt: demoDate(-24), lastActivity: demoDate(-4), notes: "Survey done, quotation pending." },
  { id: "L-013", company: "Barwa City Retail", contactName: "Ali Al-Kaabi", phone: "+974 4455 2006", email: "ali@barwa.qa", systemType: "IP CCTV", value: 410000, source: "Tender", salespersonId: "E-005", stage: "Lost", probability: 0, createdAt: demoDate(-90), lastActivity: demoDate(-45), notes: "", lostReason: "Price - competitor undercut by 18%" },
];

// ---------- SEED: four projects, four different stages of the same lifecycle ----------
//
// P-041 Al Wakrah Warehouse      — Installation, running behind schedule (At Risk)
// P-038 Msheireb Office Tower B  — Testing & Commissioning, nearly complete
// P-044 Katara Villa 12          — Procurement, early stage, nothing installed yet
// P-035 Lusail Retail Unit 7     — Handover, fully built and ready to close out

export const projects: Project[] = [
  { id: "P-041", number: "AHC-PRO-2026-041", name: "Al Wakrah Warehouse CCTV", customerId: "C-001", siteId: "S-001",
    phase: "Installation", scope: "Supply and install 24-camera 4MP IP CCTV, 32-ch NVR, PoE switches, 8TB storage, remote viewing.",
    contractValue: 340000, estimatedCost: 218000, committedCost: 195000, actualCost: 152000, retention: 17000,
    plannedStart: demoDate(-60), plannedEnd: demoDate(20), actualStart: demoDate(-58),
    pmId: "E-004", salespersonId: "E-006", teamIds: ["E-008","E-010","E-011"],
    quotationId: "Q-001", surveyId: "SV-001", leadId: "L-001" },
  { id: "P-038", number: "AHC-PRO-2026-038", name: "Msheireb Office Tower B CCTV", customerId: "C-002", siteId: "S-002",
    phase: "Testing & Commissioning", scope: "48-camera 4K IP CCTV with VMS.",
    contractValue: 1240000, estimatedCost: 780000, committedCost: 760000, actualCost: 742000, retention: 62000,
    plannedStart: demoDate(-140), plannedEnd: demoDate(10), actualStart: demoDate(-136),
    pmId: "E-003", salespersonId: "E-005", teamIds: ["E-008","E-010","E-011","E-012"],
    quotationId: "Q-002", surveyId: "SV-002", leadId: "L-002" },
  { id: "P-044", number: "AHC-PRO-2026-044", name: "Katara Villa 12 CCTV", customerId: "C-003", siteId: "S-003",
    phase: "Procurement", scope: "12-camera residential IP CCTV with mobile app.",
    contractValue: 145000, estimatedCost: 92000, committedCost: 41000, actualCost: 6000, retention: 7250,
    plannedStart: demoDate(-20), plannedEnd: demoDate(55),
    pmId: "E-004", salespersonId: "E-006", teamIds: ["E-009","E-011"],
    quotationId: "Q-003", surveyId: "SV-003", leadId: "L-003" },
  { id: "P-035", number: "AHC-PRO-2026-035", name: "Lusail Retail Unit 7 CCTV", customerId: "C-004", siteId: "S-004",
    phase: "Handover", scope: "16-camera IP CCTV, NVR, retail analytics.",
    contractValue: 220000, estimatedCost: 138000, committedCost: 136000, actualCost: 134500, retention: 11000,
    plannedStart: demoDate(-110), plannedEnd: demoDate(-8), actualStart: demoDate(-108),
    pmId: "E-003", salespersonId: "E-007", teamIds: ["E-009","E-012"],
    quotationId: "Q-004", surveyId: "SV-006", leadId: undefined,
    warrantyStart: demoDate(-2), warrantyEnd: demoDate(363) },
];

// ---------- Project team roles (role-tagged; teamIds/pmId above remain the quick-reference list) ----------
export const projectTeamMembers: ProjectTeamMember[] = [
  { id: "PTM-1", projectId: "P-041", employeeId: "E-004", role: "Project Manager" },
  { id: "PTM-2", projectId: "P-041", employeeId: "E-008", role: "Project Engineer" },
  { id: "PTM-3", projectId: "P-041", employeeId: "E-010", role: "Site Supervisor" },
  { id: "PTM-4", projectId: "P-041", employeeId: "E-011", role: "CCTV Technician" },

  { id: "PTM-5", projectId: "P-038", employeeId: "E-003", role: "Project Manager" },
  { id: "PTM-6", projectId: "P-038", employeeId: "E-008", role: "Project Engineer" },
  { id: "PTM-7", projectId: "P-038", employeeId: "E-010", role: "Site Supervisor" },
  { id: "PTM-8", projectId: "P-038", employeeId: "E-011", role: "CCTV Technician" },
  { id: "PTM-9", projectId: "P-038", employeeId: "E-012", role: "QA / Commissioning" },

  { id: "PTM-10", projectId: "P-044", employeeId: "E-004", role: "Project Manager" },
  { id: "PTM-11", projectId: "P-044", employeeId: "E-009", role: "Project Engineer" },
  { id: "PTM-12", projectId: "P-044", employeeId: "E-011", role: "CCTV Technician" },

  { id: "PTM-13", projectId: "P-035", employeeId: "E-003", role: "Project Manager" },
  { id: "PTM-14", projectId: "P-035", employeeId: "E-009", role: "Site Supervisor" },
  { id: "PTM-15", projectId: "P-035", employeeId: "E-012", role: "CCTV Technician" },
];

// ---------- Project BOQ (operational snapshot, distinct from the sales quotation) ----------
export const projectBOQItems: ProjectBOQItem[] = [
  // P-041 — Installation: everything ordered, storage/switch still short
  { id: "PBOQ-041-1", projectId: "P-041", sku: "CAM-DOM-4M", description: "4MP IR Dome camera", category: "Camera", unit: "pcs", qty: 15, unitPrice: 920, delivered: 15 },
  { id: "PBOQ-041-2", projectId: "P-041", sku: "CAM-BUL-4M", description: "4MP IR Bullet camera", category: "Camera", unit: "pcs", qty: 6, unitPrice: 950, delivered: 6 },
  { id: "PBOQ-041-3", projectId: "P-041", sku: "CAM-PTZ-4M", description: "4MP 25x PTZ camera", category: "Camera", unit: "pcs", qty: 3, unitPrice: 3400, delivered: 3 },
  { id: "PBOQ-041-4", projectId: "P-041", sku: "NVR-32CH", description: "32-channel 4K NVR", category: "Recorder", unit: "pcs", qty: 1, unitPrice: 6800, delivered: 1 },
  { id: "PBOQ-041-5", projectId: "P-041", sku: "HDD-8TB", description: "8TB Surveillance HDD", category: "Storage", unit: "pcs", qty: 4, unitPrice: 1150, delivered: 2, notes: "2 units backordered." },
  { id: "PBOQ-041-6", projectId: "P-041", sku: "SW-16P-POE", description: "16-port PoE managed switch", category: "Network", unit: "pcs", qty: 2, unitPrice: 2850, delivered: 1, notes: "PO-338 overdue for the second unit." },
  { id: "PBOQ-041-7", projectId: "P-041", sku: "CBL-CAT6-305", description: "Cat6 UTP cable 305m box", category: "Cabling", unit: "box", qty: 6, unitPrice: 720, delivered: 6 },
  { id: "PBOQ-041-8", projectId: "P-041", sku: "RCK-12U", description: "12U wall-mount rack", category: "Rack", unit: "pcs", qty: 1, unitPrice: 1900, delivered: 1 },

  // P-038 — Testing & Commissioning: fully delivered
  { id: "PBOQ-038-1", projectId: "P-038", sku: "CAM-DOM-4M", description: "4MP IR Dome camera", category: "Camera", unit: "pcs", qty: 48, unitPrice: 920, delivered: 48 },
  { id: "PBOQ-038-2", projectId: "P-038", sku: "NVR-32CH", description: "32-channel 4K NVR", category: "Recorder", unit: "pcs", qty: 2, unitPrice: 6800, delivered: 2 },
  { id: "PBOQ-038-3", projectId: "P-038", sku: "HDD-8TB", description: "8TB Surveillance HDD", category: "Storage", unit: "pcs", qty: 8, unitPrice: 1150, delivered: 8 },
  { id: "PBOQ-038-4", projectId: "P-038", sku: "SW-16P-POE", description: "16-port PoE managed switch", category: "Network", unit: "pcs", qty: 4, unitPrice: 2850, delivered: 4 },
  { id: "PBOQ-038-5", projectId: "P-038", sku: "CBL-CAT6-305", description: "Cat6 UTP cable 305m box", category: "Cabling", unit: "box", qty: 10, unitPrice: 720, delivered: 10 },
  { id: "PBOQ-038-6", projectId: "P-038", sku: "RCK-12U", description: "12U wall-mount rack", category: "Rack", unit: "pcs", qty: 2, unitPrice: 1900, delivered: 2 },

  // P-044 — Procurement: mostly not delivered yet
  { id: "PBOQ-044-1", projectId: "P-044", sku: "CAM-DOM-4M", description: "4MP Dome camera", category: "Camera", unit: "pcs", qty: 12, unitPrice: 920, delivered: 4, notes: "First batch of 4 delivered; remainder on PO-340." },
  { id: "PBOQ-044-2", projectId: "P-044", sku: "NVR-32CH", description: "32-channel 4K NVR", category: "Recorder", unit: "pcs", qty: 1, unitPrice: 6800, delivered: 0 },
  { id: "PBOQ-044-3", projectId: "P-044", sku: "HDD-8TB", description: "8TB Surveillance HDD", category: "Storage", unit: "pcs", qty: 2, unitPrice: 1150, delivered: 0 },
  { id: "PBOQ-044-4", projectId: "P-044", sku: "SW-16P-POE", description: "16-port PoE managed switch", category: "Network", unit: "pcs", qty: 1, unitPrice: 2850, delivered: 1 },
  { id: "PBOQ-044-5", projectId: "P-044", sku: "CBL-CAT6-305", description: "Cat6 UTP cable 305m box", category: "Cabling", unit: "box", qty: 3, unitPrice: 720, delivered: 2 },
  { id: "PBOQ-044-6", projectId: "P-044", sku: "RCK-12U", description: "12U wall-mount rack", category: "Rack", unit: "pcs", qty: 1, unitPrice: 1900, delivered: 0 },

  // P-035 — Handover: fully delivered
  { id: "PBOQ-035-1", projectId: "P-035", sku: "CAM-DOM-4M", description: "4MP IR Dome camera", category: "Camera", unit: "pcs", qty: 10, unitPrice: 920, delivered: 10 },
  { id: "PBOQ-035-2", projectId: "P-035", sku: "CAM-BUL-4M", description: "4MP IR Bullet camera", category: "Camera", unit: "pcs", qty: 6, unitPrice: 950, delivered: 6 },
  { id: "PBOQ-035-3", projectId: "P-035", sku: "NVR-32CH", description: "32-channel 4K NVR", category: "Recorder", unit: "pcs", qty: 1, unitPrice: 6800, delivered: 1 },
  { id: "PBOQ-035-4", projectId: "P-035", sku: "HDD-8TB", description: "8TB Surveillance HDD", category: "Storage", unit: "pcs", qty: 2, unitPrice: 1150, delivered: 2 },
  { id: "PBOQ-035-5", projectId: "P-035", sku: "SW-16P-POE", description: "16-port PoE managed switch", category: "Network", unit: "pcs", qty: 1, unitPrice: 2850, delivered: 1 },
  { id: "PBOQ-035-6", projectId: "P-035", sku: "CBL-CAT6-305", description: "Cat6 UTP cable 305m box", category: "Cabling", unit: "box", qty: 4, unitPrice: 720, delivered: 4 },
  { id: "PBOQ-035-7", projectId: "P-035", sku: "RCK-12U", description: "12U wall-mount rack", category: "Rack", unit: "pcs", qty: 1, unitPrice: 1900, delivered: 1 },
];

// ---------- Materials — procurement/issue tracking on the two critical/short SKUs per project ----------
export const materials: Material[] = [
  { id: "M-001", projectId: "P-041", sku: "SW-16P-POE", name: "16-port PoE managed switch", required: 2, ordered: 2, delivered: 1, issued: 1, installed: 1, returned: 0, critical: true },
  { id: "M-002", projectId: "P-041", sku: "HDD-8TB", name: "8TB Surveillance HDD", required: 4, ordered: 4, delivered: 2, issued: 2, installed: 2, returned: 0, critical: true },
  { id: "M-003", projectId: "P-041", sku: "CAM-DOM-4M", name: "4MP IR Dome camera", required: 15, ordered: 15, delivered: 15, issued: 15, installed: 12, returned: 0, critical: false },
  { id: "M-004", projectId: "P-041", sku: "CAM-BUL-4M", name: "4MP IR Bullet camera", required: 6, ordered: 6, delivered: 6, issued: 6, installed: 6, returned: 0, critical: false },
  { id: "M-005", projectId: "P-041", sku: "CBL-CAT6-305", name: "Cat6 UTP cable 305m box", required: 6, ordered: 6, delivered: 6, issued: 5, installed: 5, returned: 0, critical: false },
  { id: "M-006", projectId: "P-041", sku: "NVR-32CH", name: "32-ch 4K NVR", required: 1, ordered: 1, delivered: 1, issued: 1, installed: 1, returned: 0, critical: false },

  { id: "M-007", projectId: "P-038", sku: "CAM-DOM-4M", name: "4MP IR Dome camera", required: 48, ordered: 48, delivered: 48, issued: 46, installed: 46, returned: 0, critical: false },
  { id: "M-008", projectId: "P-038", sku: "NVR-32CH", name: "32-ch 4K NVR", required: 2, ordered: 2, delivered: 2, issued: 2, installed: 2, returned: 0, critical: false },
  { id: "M-009", projectId: "P-038", sku: "HDD-8TB", name: "8TB Surveillance HDD", required: 8, ordered: 8, delivered: 8, issued: 8, installed: 8, returned: 0, critical: false },

  { id: "M-010", projectId: "P-044", sku: "CAM-DOM-4M", name: "4MP Dome camera", required: 12, ordered: 12, delivered: 4, issued: 0, installed: 0, returned: 0, critical: true },
  { id: "M-011", projectId: "P-044", sku: "NVR-32CH", name: "32-ch 4K NVR", required: 1, ordered: 1, delivered: 0, issued: 0, installed: 0, returned: 0, critical: true },
  { id: "M-012", projectId: "P-044", sku: "HDD-8TB", name: "8TB Surveillance HDD", required: 2, ordered: 0, delivered: 0, issued: 0, installed: 0, returned: 0, critical: true },

  { id: "M-013", projectId: "P-035", sku: "CAM-DOM-4M", name: "4MP IR Dome camera", required: 10, ordered: 10, delivered: 10, issued: 10, installed: 10, returned: 0, critical: false },
  { id: "M-014", projectId: "P-035", sku: "CAM-BUL-4M", name: "4MP IR Bullet camera", required: 6, ordered: 6, delivered: 6, issued: 6, installed: 6, returned: 0, critical: false },
  { id: "M-015", projectId: "P-035", sku: "NVR-32CH", name: "32-ch 4K NVR", required: 1, ordered: 1, delivered: 1, issued: 1, installed: 1, returned: 0, critical: false },
];

// ---------- Devices — none registered yet for P-044 (nothing has arrived to install) ----------
function makeDevices(projectId: ID, points: CameraPoint[], opts: { failed?: number[]; pending?: number[]; notInstalled?: number[] }): Device[] {
  const failed = new Set(opts.failed ?? []);
  const pending = new Set(opts.pending ?? []);
  const notInstalled = new Set(opts.notInstalled ?? []);
  const salt = projectId.charCodeAt(2) + projectId.charCodeAt(projectId.length - 1);
  return points.map((p, i) => {
    const n = i + 1;
    const isNotInstalled = notInstalled.has(n);
    const isFailed = failed.has(n);
    const isPending = pending.has(n);
    const status: Device["status"] = isNotInstalled ? "Faulty" : isFailed ? "Configured" : isPending ? "Installed" : "Tested";
    const testResult: Device["testResult"] = isNotInstalled ? "Pending" : isFailed ? "Fail" : isPending ? "Pending" : "Pass";
    return {
      id: `D-${projectId}-${p.id}`, projectId, cameraPointId: p.id, label: p.id,
      brand: "Hikvision",
      model: p.cameraType.includes("PTZ") ? "DS-2DE7A425IW-AEB" : p.cameraType.includes("Bullet") ? "DS-2CD2T46G2-4I" : "DS-2CD2146G2-I",
      serial: `HIK${String(2600000 + n * 37 + salt * 1000).padStart(9, "0")}`,
      mac: `AC:DE:48:${String((n + salt) % 100).padStart(2, "0")}:${String((n * 7) % 100).padStart(2, "0")}:${String((n * 3) % 100).padStart(2, "0")}`,
      ip: `10.20.${(salt % 40) + 10}.${100 + n}`,
      building: p.building, floor: p.floor, zone: p.zone, indoor: p.indoor,
      switch: n <= 12 ? "SW-01" : "SW-02", switchPort: String((n % 16) + 1), recorder: "NVR-01", recorderChannel: String(n),
      installDate: isNotInstalled ? undefined : demoDate(-30 + (n % 20)),
      installerId: "E-010",
      testResult, warranty: "3 years", status,
    };
  });
}

export const devices: Device[] = [
  ...makeDevices("P-041", wakrahPoints, { failed: [13, 17, 20], notInstalled: [22, 23, 24] }),
  ...makeDevices("P-038", msheirebPoints, { failed: [22], pending: [45, 46], notInstalled: [47, 48] }),
  // P-044: nothing registered yet — materials haven't arrived to install.
  ...makeDevices("P-035", lusailPoints, {}),
];

function makeTestRecords(devs: Device[], testerId: ID): TestRecord[] {
  return devs.map((d) => ({
    id: `TR-${d.id}`, deviceId: d.id, projectId: d.projectId, testedBy: testerId,
    testedOn: d.testResult !== "Pending" ? demoDate(-2) : undefined,
    checks: { power: "Pass", network: "Pass", ip: "Pass", image: d.testResult === "Fail" ? "Fail" : "Pass", focus: "Pass", angle: "Pass", day: "Pass", night: d.testResult === "Fail" ? "Fail" : "Pass", recording: "Pass", playback: "Pass", storage: "Pass", time: "Pass", motion: "Pass", analytics: "Pass", mounting: "Pass", label: "Pass" },
    result: d.testResult === "Fail" ? "Fail" : d.testResult === "Pending" ? "Pending" : "Pass",
    notes: d.testResult === "Fail" ? "Image degraded at low light. Requires lens cleaning and re-focus." : "",
  }));
}
export const testRecords: TestRecord[] = [
  ...makeTestRecords(devices.filter((d) => d.projectId === "P-041"), "E-008"),
  ...makeTestRecords(devices.filter((d) => d.projectId === "P-038"), "E-012"),
  ...makeTestRecords(devices.filter((d) => d.projectId === "P-035"), "E-009"),
];

export const tasks: Task[] = [
  // P-041 — Installation, behind schedule
  { id: "T-1001", projectId: "P-041", title: "Terminate cables in IDF-01", assigneeId: "E-010", phase: "Installation", status: "In Progress", due: demoDate(-1), progress: 60, priority: "High" },
  { id: "T-1002", projectId: "P-041", title: "Install cameras CP-22 to CP-24", assigneeId: "E-011", phase: "Installation", status: "Awaiting Material", due: demoDate(2), progress: 0, priority: "Critical" },
  { id: "T-1003", projectId: "P-041", title: "Retest failed devices CP-13, CP-17, CP-20", assigneeId: "E-008", phase: "Testing", status: "Ready", due: demoDate(1), progress: 0, priority: "Critical" },
  { id: "T-1004", projectId: "P-041", title: "Client approval on final NVR configuration", assigneeId: "E-004", phase: "Client Approval", status: "Awaiting Client", due: demoDate(0), progress: 30, priority: "High" },
  { id: "T-1005", projectId: "P-041", title: "Daily site cleanup", assigneeId: "E-011", phase: "Installation", status: "In Progress", due: demoDate(-2), progress: 50, priority: "Low" },

  // P-038 — Testing & Commissioning
  { id: "T-1006", projectId: "P-038", title: "VMS integration testing", assigneeId: "E-008", phase: "Testing", status: "In Progress", due: demoDate(3), progress: 70, priority: "High" },
  { id: "T-1007", projectId: "P-038", title: "Compile handover documentation", assigneeId: "E-003", phase: "Handover", status: "In Progress", due: demoDate(9), progress: 45, priority: "Medium" },
  { id: "T-1008", projectId: "P-038", title: "Install remaining cameras CP-47, CP-48", assigneeId: "E-011", phase: "Installation", status: "Awaiting Material", due: demoDate(1), progress: 0, priority: "Critical" },
  { id: "T-1009", projectId: "P-038", title: "Retest CP-22 after re-focus", assigneeId: "E-012", phase: "Testing", status: "Ready", due: demoDate(2), progress: 0, priority: "High" },

  // P-044 — Procurement
  { id: "T-1010", projectId: "P-044", title: "Place PO with supplier for remaining 8x dome cameras", assigneeId: "E-014", phase: "Procurement", status: "In Progress", due: demoDate(4), progress: 40, priority: "High" },
  { id: "T-1011", projectId: "P-044", title: "Confirm NVR delivery slot", assigneeId: "E-014", phase: "Procurement", status: "Not Started", due: demoDate(7), progress: 0, priority: "Medium" },
  { id: "T-1012", projectId: "P-044", title: "Site power-point confirmation with client", assigneeId: "E-009", phase: "Planning", status: "Ready", due: demoDate(-1), progress: 0, priority: "Medium" },

  // P-035 — Handover
  { id: "T-1013", projectId: "P-035", title: "Final client sign-off checklist", assigneeId: "E-003", phase: "Handover", status: "Under Review", due: demoDate(-1), progress: 90, priority: "High" },
  { id: "T-1014", projectId: "P-035", title: "Deliver O&M manuals", assigneeId: "E-009", phase: "Handover", status: "Ready", due: demoDate(2), progress: 0, priority: "Medium" },
  { id: "T-1015", projectId: "P-035", title: "Client walkthrough and training", assigneeId: "E-003", phase: "Handover", status: "Completed", due: demoDate(-4), progress: 100, priority: "High" },
];

export const milestones: Milestone[] = [
  { id: "MS-1", projectId: "P-041", title: "Site Mobilization", planned: demoDate(-58), actual: demoDate(-58), done: true, owner: "E-004" },
  { id: "MS-2", projectId: "P-041", title: "Material Delivery Complete", planned: demoDate(-5), done: false, owner: "E-014" },
  { id: "MS-3", projectId: "P-041", title: "Installation Complete", planned: demoDate(8), done: false, owner: "E-008" },
  { id: "MS-4", projectId: "P-041", title: "Testing and Commissioning", planned: demoDate(15), done: false, owner: "E-008" },
  { id: "MS-5", projectId: "P-041", title: "Handover", planned: demoDate(20), done: false, owner: "E-004" },

  { id: "MS-6", projectId: "P-038", title: "Site Mobilization", planned: demoDate(-136), actual: demoDate(-136), done: true, owner: "E-003" },
  { id: "MS-7", projectId: "P-038", title: "Installation Complete", planned: demoDate(-12), actual: demoDate(-10), done: true, owner: "E-008" },
  { id: "MS-8", projectId: "P-038", title: "Testing Complete", planned: demoDate(6), done: false, owner: "E-008" },
  { id: "MS-9", projectId: "P-038", title: "Handover", planned: demoDate(15), done: false, owner: "E-003" },

  { id: "MS-10", projectId: "P-044", title: "Site Mobilization", planned: demoDate(-18), actual: demoDate(-17), done: true, owner: "E-004" },
  { id: "MS-11", projectId: "P-044", title: "Material Delivery Complete", planned: demoDate(12), done: false, owner: "E-014" },
  { id: "MS-12", projectId: "P-044", title: "Installation Complete", planned: demoDate(35), done: false, owner: "E-009" },
  { id: "MS-13", projectId: "P-044", title: "Handover", planned: demoDate(55), done: false, owner: "E-004" },

  { id: "MS-14", projectId: "P-035", title: "Site Mobilization", planned: demoDate(-108), actual: demoDate(-108), done: true, owner: "E-003" },
  { id: "MS-15", projectId: "P-035", title: "Installation Complete", planned: demoDate(-25), actual: demoDate(-23), done: true, owner: "E-009" },
  { id: "MS-16", projectId: "P-035", title: "Testing and Commissioning", planned: demoDate(-12), actual: demoDate(-11), done: true, owner: "E-009" },
  { id: "MS-17", projectId: "P-035", title: "Handover", planned: demoDate(-8), done: false, owner: "E-003", notes: "Awaiting final client sign-off." },
];

export const approvals: Approval[] = [
  { id: "A-1", projectId: "P-041", title: "NVR retention policy sign-off", requestedOn: demoDate(-3), status: "Pending", owner: "Fahad Al-Marri", critical: true },
  { id: "A-2", projectId: "P-044", title: "Camera model substitution approval", requestedOn: demoDate(-5), status: "Pending", owner: "Sara Al-Kaabi", critical: false },
  { id: "A-3", projectId: "P-038", title: "Riser cable routing change", requestedOn: demoDate(-25), status: "Approved", owner: "Hessa Al-Sulaiti", critical: false },
  { id: "A-4", projectId: "P-035", title: "Final handover walkthrough date", requestedOn: demoDate(-6), status: "Approved", owner: "Omar Al-Hajri", critical: false },
];

export const variations: Variation[] = [
  { id: "V-1", projectId: "P-041", number: "VO-01", description: "Additional 4 cameras at mezzanine", amount: 12000, status: "Approved", date: demoDate(-30) },
  { id: "V-2", projectId: "P-038", number: "VO-01", description: "Upgrade to 4K analytics", amount: 45000, status: "Approved", date: demoDate(-45) },
  { id: "V-3", projectId: "P-041", number: "VO-02", description: "Add outdoor bollard IR illuminators", amount: 6800, status: "Submitted", date: demoDate(-6) },
];

export const documents: Doc[] = [
  { id: "DOC-1", name: "AHC-PRO-2026-041 Signed Contract.pdf", category: "Contract / LPO", projectId: "P-041", customerId: "C-001", revision: "R1", status: "Approved", uploadedOn: demoDate(-70), uploadedBy: "Anitha Verghese", tags: ["contract","signed"] },
  { id: "DOC-2", name: "Al Wakrah Site Survey Report R3.pdf", category: "Survey", projectId: "P-041", customerId: "C-001", revision: "R3", status: "Approved", uploadedOn: demoDate(-92), uploadedBy: "Ahmed Sobhi", tags: ["survey","approved"] },
  { id: "DOC-3", name: "As-Built Drawings R1.dwg", category: "As-Built", projectId: "P-041", revision: "R1", status: "Draft", uploadedOn: demoDate(-4), uploadedBy: "Ahmed Sobhi", tags: ["drawing","as-built"] },
  { id: "DOC-4", name: "Method Statement Rev B.pdf", category: "Technical Submittal", projectId: "P-041", revision: "B", status: "Approved", uploadedOn: demoDate(-55), uploadedBy: "Anitha Verghese", tags: ["hse"] },

  { id: "DOC-5", name: "AHC-PRO-2026-038 Signed Contract.pdf", category: "Contract / LPO", projectId: "P-038", customerId: "C-002", revision: "R1", status: "Approved", uploadedOn: demoDate(-152), uploadedBy: "Karim Haddad", tags: ["contract"] },
  { id: "DOC-6", name: "Msheireb Handover Pack Draft.pdf", category: "Handover", projectId: "P-038", revision: "D1", status: "Draft", uploadedOn: demoDate(-2), uploadedBy: "Karim Haddad", tags: ["handover"] },
  { id: "DOC-7", name: "Commissioning Test Report R1.pdf", category: "Test / Commissioning", projectId: "P-038", revision: "R1", status: "Pending", uploadedOn: demoDate(-1), uploadedBy: "Ahmed Sobhi", tags: ["testing"] },

  { id: "DOC-8", name: "Katara Villa 12 Site Survey Report.pdf", category: "Survey", projectId: "P-044", customerId: "C-003", revision: "R1", status: "Approved", uploadedOn: demoDate(-27), uploadedBy: "Vinod Menon", tags: ["survey"] },
  { id: "DOC-9", name: "AHC-PRO-2026-044 Signed LPO.pdf", category: "Contract / LPO", projectId: "P-044", customerId: "C-003", revision: "R1", status: "Approved", uploadedOn: demoDate(-18), uploadedBy: "Anitha Verghese", tags: ["contract"] },

  { id: "DOC-10", name: "Lusail Retail Warranty Certificate.pdf", category: "Warranty", projectId: "P-035", revision: "R1", status: "Approved", uploadedOn: demoDate(-3), uploadedBy: "Karim Haddad", tags: ["warranty"] },
  { id: "DOC-11", name: "Lusail As-Built Drawings R2.dwg", category: "As-Built", projectId: "P-035", revision: "R2", status: "Approved", uploadedOn: demoDate(-9), uploadedBy: "Vinod Menon", tags: ["as-built"] },
  { id: "DOC-12", name: "Lusail Handover Pack.pdf", category: "Handover", projectId: "P-035", revision: "R1", status: "Pending", uploadedOn: demoDate(-2), uploadedBy: "Karim Haddad", tags: ["handover"] },
  { id: "DOC-13", name: "Lusail O&M Manual.pdf", category: "Warranty", projectId: "P-035", revision: "R1", status: "Approved", uploadedOn: demoDate(-3), uploadedBy: "Karim Haddad", tags: ["manual"] },

  { id: "DOC-14", name: "Company Trade Licence.pdf", category: "Other", revision: "2026", status: "Approved", uploadedOn: demoDate(-250), expiresOn: demoDate(100), tags: ["compliance"] },
  { id: "DOC-15", name: "MoI Security Contractor Registration.pdf", category: "Other", revision: "2026", status: "Approved", uploadedOn: demoDate(-220), expiresOn: demoDate(38), tags: ["moi","expiring"] },
];

export const payments: PaymentMilestone[] = [
  { id: "PM-1", projectId: "P-041", label: "Mobilization advance 20%", amount: 68000, dueDate: demoDate(-58), invoicedOn: demoDate(-58), collectedOn: demoDate(-50), status: "Collected" },
  { id: "PM-2", projectId: "P-041", label: "Materials delivery 30%", amount: 102000, dueDate: demoDate(-20), invoicedOn: demoDate(-19), collectedOn: demoDate(-9), status: "Collected" },
  { id: "PM-3", projectId: "P-041", label: "Installation milestone 30%", amount: 102000, dueDate: demoDate(5), invoicedOn: demoDate(-2), status: "Invoiced" },
  { id: "PM-4", projectId: "P-041", label: "Handover 15%", amount: 51000, dueDate: demoDate(22), status: "Pending" },
  { id: "PM-5", projectId: "P-041", label: "Retention 5%", amount: 17000, dueDate: demoDate(200), status: "Pending" },

  { id: "PM-6", projectId: "P-038", label: "Progress Cert 4", amount: 210000, dueDate: demoDate(-30), invoicedOn: demoDate(-31), collectedOn: demoDate(-15), status: "Collected" },
  { id: "PM-7", projectId: "P-038", label: "Progress Cert 5", amount: 180000, dueDate: demoDate(-1), invoicedOn: demoDate(-2), status: "Invoiced" },
  { id: "PM-8", projectId: "P-038", label: "Handover balance", amount: 120000, dueDate: demoDate(16), status: "Pending" },

  { id: "PM-9", projectId: "P-044", label: "Mobilization advance 20%", amount: 29000, dueDate: demoDate(-17), invoicedOn: demoDate(-17), collectedOn: demoDate(-10), status: "Collected" },
  { id: "PM-10", projectId: "P-044", label: "Materials delivery 30%", amount: 43500, dueDate: demoDate(14), status: "Pending" },

  { id: "PM-11", projectId: "P-035", label: "Mobilization advance 20%", amount: 44000, dueDate: demoDate(-108), invoicedOn: demoDate(-108), collectedOn: demoDate(-100), status: "Collected" },
  { id: "PM-12", projectId: "P-035", label: "Materials delivery 30%", amount: 66000, dueDate: demoDate(-70), invoicedOn: demoDate(-70), collectedOn: demoDate(-60), status: "Collected" },
  { id: "PM-13", projectId: "P-035", label: "Installation milestone 30%", amount: 66000, dueDate: demoDate(-22), invoicedOn: demoDate(-22), collectedOn: demoDate(-12), status: "Collected" },
  { id: "PM-14", projectId: "P-035", label: "Handover balance 15%", amount: 33000, dueDate: demoDate(-6), invoicedOn: demoDate(-4), status: "Invoiced" },
  { id: "PM-15", projectId: "P-035", label: "Retention 5%", amount: 11000, dueDate: demoDate(280), status: "Pending" },
];

export const amc: AMCContract[] = [
  { id: "AMC-1", number: "AHC-AMC-2025-014", customerId: "C-002", siteId: "S-002", equipment: "48 cameras, 2 NVRs, VMS", start: demoDate(-330), end: demoDate(35), visitFrequency: "Quarterly", value: 84000, sla: "8h response, 24h resolution", engineerId: "E-013", nextVisit: demoDate(10), renewalStatus: "Expiring Soon" },
  { id: "AMC-2", number: "AHC-AMC-2025-021", customerId: "C-004", siteId: "S-004", projectId: "P-035", equipment: "16 cameras, NVR", start: demoDate(-2), end: demoDate(363), visitFrequency: "Bi-annual", value: 22000, sla: "24h response", engineerId: "E-013", nextVisit: demoDate(175), renewalStatus: "Active" },
  { id: "AMC-3", number: "AHC-AMC-2024-009", customerId: "C-006", siteId: "S-006", equipment: "32 cameras, access control", start: demoDate(-450), end: demoDate(-85), visitFrequency: "Quarterly", value: 54000, sla: "8h response", engineerId: "E-013", nextVisit: demoDate(-40), renewalStatus: "Expired" },
];

export const tickets: ServiceTicket[] = [
  { id: "TK-1", number: "AHC-SR-2026-118", customerId: "C-002", siteId: "S-002", amcId: "AMC-1", title: "Lobby camera offline", priority: "High", status: "In Progress", opened: demoDate(-1), assigneeId: "E-013", sla: "8h" },
  { id: "TK-2", number: "AHC-SR-2026-117", customerId: "C-004", siteId: "S-004", amcId: "AMC-2", title: "Recording gaps on channel 4-6", priority: "Medium", status: "Assigned", opened: demoDate(-2), assigneeId: "E-013", sla: "24h" },
  { id: "TK-3", number: "AHC-SR-2026-116", customerId: "C-001", siteId: "S-001", title: "Live view latency on mobile app", priority: "Low", status: "New", opened: demoDate(-2), sla: "48h" },
  { id: "TK-4", number: "AHC-SR-2026-115", customerId: "C-006", siteId: "S-006", amcId: "AMC-3", title: "Access controller reset required", priority: "Critical", status: "In Progress", opened: demoDate(-3), assigneeId: "E-013", sla: "4h" },
];

export const products: Product[] = [
  { id: "PR-01", sku: "CAM-DOM-4M", category: "Camera", brand: "Hikvision", model: "DS-2CD2146G2-I", spec: "4MP AcuSense IR Dome, 2.8mm", unit: "pcs", cost: 620, price: 920, stock: 42, reserved: 15, reorderLevel: 20, supplier: "Al Manara Distribution", warranty: "3 years", status: "Active" },
  { id: "PR-02", sku: "CAM-BUL-4M", category: "Camera", brand: "Hikvision", model: "DS-2CD2T46G2-4I", spec: "4MP AcuSense IR Bullet, 4mm", unit: "pcs", cost: 640, price: 950, stock: 28, reserved: 6, reorderLevel: 15, supplier: "Al Manara Distribution", warranty: "3 years", status: "Active" },
  { id: "PR-03", sku: "CAM-PTZ-4M", category: "Camera", brand: "Hikvision", model: "DS-2DE7A425IW-AEB", spec: "4MP 25x PTZ IR", unit: "pcs", cost: 2400, price: 3400, stock: 5, reserved: 1, reorderLevel: 3, supplier: "Al Manara Distribution", warranty: "3 years", status: "Active" },
  { id: "PR-04", sku: "NVR-32CH", category: "Recorder", brand: "Hikvision", model: "DS-9632NI-M8", spec: "32-ch 4K NVR, 8-bay HDD", unit: "pcs", cost: 4200, price: 6800, stock: 4, reserved: 0, reorderLevel: 2, supplier: "Al Manara Distribution", warranty: "3 years", status: "Active" },
  { id: "PR-05", sku: "SW-16P-POE", category: "Network", brand: "Ubiquiti", model: "USW-16-PoE-Pro", spec: "16-port managed PoE+ 250W", unit: "pcs", cost: 1900, price: 2850, stock: 2, reserved: 1, reorderLevel: 3, supplier: "Netcore Qatar", warranty: "2 years", status: "Active" },
  { id: "PR-06", sku: "HDD-8TB", category: "Storage", brand: "Seagate", model: "ST8000VX004 SkyHawk", spec: "8TB Surveillance HDD", unit: "pcs", cost: 780, price: 1150, stock: 3, reserved: 2, reorderLevel: 6, supplier: "Storage Traders LLC", warranty: "3 years", status: "Active" },
  { id: "PR-07", sku: "CBL-CAT6-305", category: "Cabling", brand: "CommScope", model: "6-728030-9", spec: "Cat6 UTP 305m box, blue", unit: "box", cost: 480, price: 720, stock: 22, reserved: 4, reorderLevel: 8, supplier: "Netcore Qatar", warranty: "N/A", status: "Active" },
  { id: "PR-08", sku: "RCK-12U", category: "Rack", brand: "Netrack", model: "NR-WM12U600", spec: "12U wall-mount rack, 600mm", unit: "pcs", cost: 1200, price: 1900, stock: 6, reserved: 1, reorderLevel: 2, supplier: "Netcore Qatar", warranty: "1 year", status: "Active" },
];

export const purchaseRequests: PurchaseRequest[] = [
  { id: "PR-101", number: "AHC-PR-2026-101", projectId: "P-041", requestedBy: "E-004", requestDate: demoDate(-16), requiredDate: demoDate(-3), items: 3, cost: 24800, priority: "Critical", approvalStatus: "Approved", procurementStatus: "Ordered" },
  { id: "PR-102", number: "AHC-PR-2026-102", projectId: "P-044", requestedBy: "E-004", requestDate: demoDate(-9), requiredDate: demoDate(3), items: 6, cost: 58000, priority: "High", approvalStatus: "Approved", procurementStatus: "Sourcing" },
  { id: "PR-103", number: "AHC-PR-2026-103", projectId: "P-038", requestedBy: "E-003", requestDate: demoDate(-6), requiredDate: demoDate(9), items: 2, cost: 6400, priority: "Medium", approvalStatus: "Pending", procurementStatus: "Requested" },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-338", number: "AHC-PO-2026-338", supplier: "Al Manara Distribution", projectId: "P-041", amount: 18400, orderDate: demoDate(-20), expectedDelivery: demoDate(-6), deliveryStatus: "Overdue", paymentStatus: "Partial" },
  { id: "PO-339", number: "AHC-PO-2026-339", supplier: "Storage Traders LLC", projectId: "P-041", amount: 4600, orderDate: demoDate(-13), expectedDelivery: demoDate(1), deliveryStatus: "Partial", paymentStatus: "Unpaid" },
  { id: "PO-340", number: "AHC-PO-2026-340", supplier: "Al Manara Distribution", projectId: "P-044", amount: 12200, orderDate: demoDate(-6), expectedDelivery: demoDate(8), deliveryStatus: "Pending", paymentStatus: "Unpaid" },
  { id: "PO-341", number: "AHC-PO-2026-341", supplier: "Al Manara Distribution", projectId: "P-038", amount: 9800, orderDate: demoDate(-4), expectedDelivery: demoDate(9), deliveryStatus: "Pending", paymentStatus: "Unpaid" },
];

export const siteActivities: SiteActivity[] = [
  { id: "SA-1", projectId: "P-041", date: demoDate(-1), teamPresent: ["E-010","E-011"], workCompleted: "Installed cameras CP-19 to CP-21, cable pulling for CP-22 to CP-24.", camerasInstalled: 3, cableInstalled: 180, devicesConfigured: 3, issues: "PoE switch shortage delaying final segment.", tomorrowPlan: "Continue cable termination and camera mounting." },
  { id: "SA-2", projectId: "P-041", date: demoDate(-2), teamPresent: ["E-010","E-011","E-008"], workCompleted: "Terminated cables in IDF-01, tested channels 1-16.", camerasInstalled: 0, cableInstalled: 0, devicesConfigured: 16, issues: "Three cameras failed initial test.", tomorrowPlan: "Retest failed devices." },
  { id: "SA-3", projectId: "P-038", date: demoDate(-3), teamPresent: ["E-008","E-011","E-012"], workCompleted: "Commissioned channels 33-46, VMS integration testing started.", camerasInstalled: 2, cableInstalled: 40, devicesConfigured: 14, issues: "CP-22 flagged for low-light image quality.", tomorrowPlan: "Continue VMS integration, revisit CP-22 lens focus." },
  { id: "SA-4", projectId: "P-044", date: demoDate(-4), teamPresent: ["E-009","E-011"], workCompleted: "Confirmed containment routes and power points with client, first batch of 4 cameras received.", camerasInstalled: 0, cableInstalled: 0, devicesConfigured: 0, issues: "Remaining 8 cameras and NVR still awaiting delivery.", tomorrowPlan: "Await PO-340 delivery before mobilizing installation team." },
  { id: "SA-5", projectId: "P-035", date: demoDate(-11), teamPresent: ["E-009","E-012"], workCompleted: "Completed commissioning of all 16 channels, client walkthrough scheduled.", camerasInstalled: 0, cableInstalled: 0, devicesConfigured: 16, issues: "None.", tomorrowPlan: "Prepare handover documentation pack." },
];

export const communications: Communication[] = [
  { id: "CM-1", projectId: "P-041", date: demoDate(-2), owner: "Anitha Verghese", subject: "Awaiting NVR retention policy sign-off", status: "Pending", relatedTaskId: "T-1004", method: "Email", summary: "Sent updated retention policy options for client sign-off.", nextAction: "Follow up by phone if no response in 3 days.", followUpDate: demoDate(1) },
  { id: "CM-2", projectId: "P-041", date: demoDate(-5), owner: "Anitha Verghese", subject: "Weekly progress report shared", status: "Sent", method: "Email" },
  { id: "CM-3", projectId: "P-041", date: demoDate(-7), owner: "Fahad Al-Marri", subject: "Client confirmed access to mezzanine floor", status: "Confirmed", method: "WhatsApp" },
  { id: "CM-4", projectId: "P-038", date: demoDate(-1), owner: "Karim Haddad", subject: "Commissioning schedule shared with facilities team", status: "Sent", method: "Email", summary: "Shared testing schedule for remaining floors.", nextAction: "Confirm access windows for floors 7-8.", followUpDate: demoDate(2) },
  { id: "CM-5", projectId: "P-038", date: demoDate(-9), owner: "Hessa Al-Sulaiti", subject: "Riser cable routing change confirmed by client", status: "Confirmed", method: "Site Meeting" },
  { id: "CM-6", projectId: "P-044", date: demoDate(-4), owner: "Anitha Verghese", subject: "Delivery delay update sent to client", status: "Sent", method: "Call", summary: "Advised client of 1-week delay on NVR delivery.", nextAction: "Confirm revised install date once PO-340 arrives.", followUpDate: demoDate(8) },
  { id: "CM-7", projectId: "P-035", date: demoDate(-4), owner: "Karim Haddad", subject: "Handover walkthrough date proposed", status: "Sent", method: "Email", summary: "Proposed final walkthrough and sign-off date.", nextAction: "Await client confirmation.", followUpDate: demoDate(-1) },
  { id: "CM-8", projectId: "P-035", date: demoDate(-1), owner: "Omar Al-Hajri", subject: "Client confirmed handover walkthrough date", status: "Confirmed", method: "WhatsApp" },
];

// ---------- Handover checklist ----------
export type HandoverItem = { id: ID; section: "Technical"|"Documentation"|"Commercial"|"Client"; label: string; done: boolean; projectId: ID; critical?: boolean; };
export const handoverItems: HandoverItem[] = [
  { id: "H-1", section: "Technical", label: "All 24 cameras installed and tested (CP-01 to CP-24)", done: false, projectId: "P-041", critical: true },
  { id: "H-2", section: "Technical", label: "NVR configured and recording verified", done: true, projectId: "P-041", critical: true },
  { id: "H-3", section: "Technical", label: "Failed devices retested (CP-13, CP-17, CP-20)", done: false, projectId: "P-041", critical: true },
  { id: "H-4", section: "Documentation", label: "As-built drawings signed", done: false, projectId: "P-041" },
  { id: "H-5", section: "Documentation", label: "Device register and IP schedule delivered", done: true, projectId: "P-041" },
  { id: "H-6", section: "Documentation", label: "O&M manual pack delivered", done: false, projectId: "P-041" },
  { id: "H-7", section: "Commercial", label: "Final invoice raised", done: false, projectId: "P-041" },
  { id: "H-8", section: "Commercial", label: "Retention agreement signed", done: false, projectId: "P-041" },
  { id: "H-9", section: "Client", label: "Client training completed", done: false, projectId: "P-041" },
  { id: "H-10", section: "Client", label: "Handover acceptance form signed by client", done: false, projectId: "P-041" },

  { id: "H-11", section: "Technical", label: "All 48 cameras installed and tested", done: false, projectId: "P-038", critical: true },
  { id: "H-12", section: "Technical", label: "VMS integration verified", done: false, projectId: "P-038", critical: true },
  { id: "H-13", section: "Documentation", label: "Commissioning test report finalized", done: false, projectId: "P-038" },
  { id: "H-14", section: "Documentation", label: "As-built drawings delivered", done: false, projectId: "P-038" },
  { id: "H-15", section: "Commercial", label: "Progress Cert 5 invoiced", done: true, projectId: "P-038" },
  { id: "H-16", section: "Client", label: "Facilities team training scheduled", done: false, projectId: "P-038" },

  { id: "H-17", section: "Technical", label: "All 12 cameras installed and tested", done: false, projectId: "P-044", critical: true },
  { id: "H-18", section: "Documentation", label: "As-built drawings prepared", done: false, projectId: "P-044" },
  { id: "H-19", section: "Commercial", label: "Materials delivery invoice raised", done: false, projectId: "P-044" },
  { id: "H-20", section: "Client", label: "Client training scheduled", done: false, projectId: "P-044" },

  { id: "H-21", section: "Technical", label: "All 16 cameras installed and tested", done: true, projectId: "P-035", critical: true },
  { id: "H-22", section: "Technical", label: "NVR configured and recording verified", done: true, projectId: "P-035", critical: true },
  { id: "H-23", section: "Documentation", label: "As-built drawings signed", done: true, projectId: "P-035" },
  { id: "H-24", section: "Documentation", label: "O&M manual pack delivered", done: true, projectId: "P-035" },
  { id: "H-25", section: "Commercial", label: "Handover balance invoiced", done: true, projectId: "P-035" },
  { id: "H-26", section: "Commercial", label: "Retention agreement signed", done: false, projectId: "P-035" },
  { id: "H-27", section: "Client", label: "Client training completed", done: true, projectId: "P-035" },
  { id: "H-28", section: "Client", label: "Handover acceptance form signed by client", done: false, projectId: "P-035" },
];

// ---------- Compliance ----------
export type ComplianceItem = { id: ID; projectId: ID; item: string; status: "Not Started"|"Submitted"|"Approved"|"Rejected"; owner: string; expires?: string; };
export const complianceItems: ComplianceItem[] = [
  { id: "CI-1", projectId: "P-041", item: "MoI security systems contractor authorization", status: "Approved", owner: "Company", expires: demoDate(38) },
  { id: "CI-2", projectId: "P-041", item: "Camera location and quantity schedule submission", status: "Approved", owner: "Karim Haddad" },
  { id: "CI-3", projectId: "P-041", item: "Drawing submission for authority review", status: "Submitted", owner: "Anitha Verghese" },
  { id: "CI-4", projectId: "P-041", item: "Inspection request", status: "Not Started", owner: "Anitha Verghese" },
  { id: "CI-5", projectId: "P-041", item: "Conformity certificate", status: "Not Started", owner: "Company" },

  { id: "CI-6", projectId: "P-038", item: "MoI security systems contractor authorization", status: "Approved", owner: "Company", expires: demoDate(38) },
  { id: "CI-7", projectId: "P-038", item: "Drawing submission for authority review", status: "Approved", owner: "Karim Haddad" },
  { id: "CI-8", projectId: "P-038", item: "Inspection request", status: "Submitted", owner: "Karim Haddad" },
  { id: "CI-9", projectId: "P-038", item: "Conformity certificate", status: "Not Started", owner: "Company" },

  { id: "CI-10", projectId: "P-044", item: "MoI security systems contractor authorization", status: "Approved", owner: "Company", expires: demoDate(38) },
  { id: "CI-11", projectId: "P-044", item: "Camera location and quantity schedule submission", status: "Not Started", owner: "Anitha Verghese" },

  { id: "CI-12", projectId: "P-035", item: "MoI security systems contractor authorization", status: "Approved", owner: "Company", expires: demoDate(38) },
  { id: "CI-13", projectId: "P-035", item: "Camera location and quantity schedule submission", status: "Approved", owner: "Karim Haddad" },
  { id: "CI-14", projectId: "P-035", item: "Drawing submission for authority review", status: "Approved", owner: "Karim Haddad" },
  { id: "CI-15", projectId: "P-035", item: "Inspection request", status: "Approved", owner: "Karim Haddad" },
  { id: "CI-16", projectId: "P-035", item: "Conformity certificate", status: "Submitted", owner: "Company" },
];

// ---------- Issues & snags ----------
export const projectIssues: ProjectIssue[] = [
  { id: "ISS-1", projectId: "P-041", number: "ISS-041-01", title: "PoE switch #2 delivery delayed", category: "Installation", description: "Second 16-port PoE switch on PO-338 is overdue, blocking mezzanine camera installs.", priority: "High", status: "In Progress", raisedBy: "Ahmed Sobhi", assignedTo: "E-014", raisedOn: demoDate(-6), dueDate: demoDate(1) },
  { id: "ISS-2", projectId: "P-038", number: "ISS-038-01", title: "CP-22 image quality fails in low light", category: "Device Fault", description: "Camera at CP-22 fails night test — image noise excessive. Suspect lens focus.", priority: "Medium", status: "Assigned", raisedBy: "Ahmed Sobhi", assignedTo: "E-012", raisedOn: demoDate(-2), relatedDeviceId: "D-P-038-CP-22", zone: "Zone 3" },
  { id: "ISS-3", projectId: "P-038", number: "ISS-038-02", title: "Riser cable route required client approval", category: "Client Request", description: "Original riser route blocked by ductwork; alternate route required client sign-off.", priority: "Medium", status: "Resolved", raisedBy: "Karim Haddad", assignedTo: "E-008", raisedOn: demoDate(-30), resolution: "Client approved alternate riser route.", resolvedOn: demoDate(-25) },
  { id: "ISS-4", projectId: "P-035", number: "ISS-035-01", title: "Minor cable dressing snag at IDF", category: "Snag", description: "Cable dressing at IDF rack untidy, flagged during QA walk.", priority: "Low", status: "Closed", raisedBy: "Vinod Menon", assignedTo: "E-012", raisedOn: demoDate(-15), resolution: "Re-dressed and labeled.", resolvedOn: demoDate(-13) },
];

// ---------- Activity log (real, project-scoped; generated by mutators as the demo is used) ----------
export const projectActivities: ProjectActivity[] = [
  { id: "PA-1", projectId: "P-041", ts: demoDateTime(-58, 8, 0), type: "project_created", message: "Project created from approved quotation AHC-QTN-2026-041.", actor: "Anitha Verghese" },
  { id: "PA-2", projectId: "P-041", ts: demoDateTime(-2, 16, 40), type: "test_failed", message: "Test result: FAIL on CP-13, CP-17, CP-20.", actor: "Ahmed Sobhi" },
  { id: "PA-3", projectId: "P-041", ts: demoDateTime(-2, 11, 20), type: "material_issued", message: "Materials issued for cameras CP-01 to CP-21.", actor: "Aisha Rahman" },
  { id: "PA-4", projectId: "P-041", ts: demoDateTime(-2, 14, 0), type: "payment_invoiced", message: "Installation milestone 30% invoiced.", actor: "Hasan Barzani" },
  { id: "PA-5", projectId: "P-041", ts: demoDateTime(-6, 10, 12), type: "variation_submitted", message: "Variation VO-02 submitted for approval.", actor: "Anitha Verghese" },
  { id: "PA-6", projectId: "P-041", ts: demoDateTime(-6, 9, 30), type: "issue_raised", message: "Issue raised: PoE switch #2 delivery delayed.", actor: "Ahmed Sobhi" },

  { id: "PA-7", projectId: "P-038", ts: demoDateTime(-136, 8, 0), type: "project_created", message: "Project created from approved quotation AHC-QTN-2026-038.", actor: "Karim Haddad" },
  { id: "PA-8", projectId: "P-038", ts: demoDateTime(-10, 9, 0), type: "milestone_completed", message: "Milestone completed: Installation Complete.", actor: "Ahmed Sobhi" },
  { id: "PA-9", projectId: "P-038", ts: demoDateTime(-2, 15, 5), type: "issue_raised", message: "Issue raised: CP-22 image quality fails in low light.", actor: "Ahmed Sobhi" },
  { id: "PA-10", projectId: "P-038", ts: demoDateTime(-25, 13, 0), type: "issue_resolved", message: "Issue resolved: Riser cable route required client approval.", actor: "Karim Haddad" },

  { id: "PA-11", projectId: "P-044", ts: demoDateTime(-17, 8, 0), type: "project_created", message: "Project created from approved quotation AHC-QTN-2026-044.", actor: "Anitha Verghese" },
  { id: "PA-12", projectId: "P-044", ts: demoDateTime(-9, 10, 0), type: "purchase_request", message: "Purchase request AHC-PR-2026-102 raised for remaining equipment.", actor: "Anitha Verghese" },
  { id: "PA-13", projectId: "P-044", ts: demoDateTime(-4, 11, 30), type: "material_delivered", message: "First batch of 4 dome cameras delivered to site.", actor: "Aisha Rahman" },

  { id: "PA-14", projectId: "P-035", ts: demoDateTime(-108, 8, 0), type: "project_created", message: "Project created from approved quotation AHC-QTN-2026-035.", actor: "Karim Haddad" },
  { id: "PA-15", projectId: "P-035", ts: demoDateTime(-11, 9, 0), type: "milestone_completed", message: "Milestone completed: Testing and Commissioning.", actor: "Vinod Menon" },
  { id: "PA-16", projectId: "P-035", ts: demoDateTime(-4, 14, 0), type: "payment_invoiced", message: "Handover balance 15% invoiced.", actor: "Hasan Barzani" },
  { id: "PA-17", projectId: "P-035", ts: demoDateTime(-13, 9, 15), type: "issue_resolved", message: "Snag resolved: cable dressing at IDF rack.", actor: "Vinod Menon" },
];
