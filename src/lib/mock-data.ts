// Shared connected mock dataset for AL HARIB CCTV COMPANY
// All entities linked by id. Camera Point ids (CP-*) thread through survey -> BOQ -> device -> test -> handover.

export type ID = string;

export type Customer = {
  id: ID; name: string; industry: string; contact: string; phone: string; email: string;
  address: string; status: "Active" | "Prospect" | "Inactive"; since: string;
};
export type Site = {
  id: ID; customerId: ID; name: string; area: string; type: string; address: string;
};
export type Employee = {
  id: ID; name: string; role: string; department: string; phone: string; email: string;
  availability: "Available" | "Busy" | "On Leave"; workload: number; // 0-100
};
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
export type Milestone = { id: ID; projectId: ID; title: string; planned: string; actual?: string; done: boolean; };
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
export type Doc = { id: ID; name: string; category: string; projectId?: ID; customerId?: ID; revision: string; status: "Draft"|"Pending"|"Approved"|"Expired"; expiresOn?: string; uploadedOn: string; tags: string[]; };
export type PaymentMilestone = { id: ID; projectId: ID; label: string; amount: number; dueDate: string; invoicedOn?: string; collectedOn?: string; status: "Pending"|"Invoiced"|"Collected"|"Overdue"; };
export type AMCContract = { id: ID; number: string; customerId: ID; siteId: ID; equipment: string; start: string; end: string; visitFrequency: string; value: number; sla: string; engineerId: ID; nextVisit: string; renewalStatus: "Active"|"Expiring Soon"|"Expired"|"Renewed"; };
export type ServiceTicket = { id: ID; number: string; customerId: ID; siteId: ID; amcId?: ID; title: string; priority: "Low"|"Medium"|"High"|"Critical"; status: "New"|"Assigned"|"In Progress"|"Awaiting Parts"|"Resolved"|"Closed"; opened: string; assigneeId?: ID; sla: string; };
export type Material = { id: ID; projectId: ID; sku: string; name: string; required: number; ordered: number; delivered: number; issued: number; installed: number; returned: number; critical: boolean; };
export type Product = { id: ID; sku: string; category: string; brand: string; model: string; spec: string; unit: string; cost: number; price: number; stock: number; reserved: number; reorderLevel: number; supplier: string; warranty: string; status: "Active"|"Discontinued"; };
export type PurchaseRequest = { id: ID; number: string; projectId: ID; requestedBy: ID; requestDate: string; requiredDate: string; items: number; cost: number; priority: "Low"|"Medium"|"High"|"Critical"; approvalStatus: "Pending"|"Approved"|"Rejected"; procurementStatus: "Requested"|"Sourcing"|"Quoted"|"Ordered"|"Delivered"|"Closed"; };
export type PurchaseOrder = { id: ID; number: string; supplier: string; projectId: ID; amount: number; orderDate: string; expectedDelivery: string; deliveryStatus: "Pending"|"Partial"|"Delivered"|"Overdue"; paymentStatus: "Unpaid"|"Partial"|"Paid"; };
export type SiteActivity = { id: ID; projectId: ID; date: string; teamPresent: string[]; workCompleted: string; camerasInstalled: number; cableInstalled: number; devicesConfigured: number; issues: string; tomorrowPlan: string; };
export type Communication = { id: ID; projectId: ID; date: string; owner: string; subject: string; status: "Sent"|"Received"|"Confirmed"|"Pending"; relatedTaskId?: ID; };

export type ProjectPhase =
  | "Project Setup"|"Design and Planning"|"Client Approval"|"Mobilization"|"Procurement"
  | "Material Delivery"|"Installation"|"Configuration"|"Testing"|"Training"
  | "Inspection and Compliance"|"Handover"|"Warranty"|"AMC"
  | "On Hold"|"Delayed"|"Awaiting Client"|"Awaiting Materials"|"Rework"|"Cancelled";

export type Project = {
  id: ID; number: string; name: string; customerId: ID; siteId: ID;
  phase: ProjectPhase; scope: string;
  contractValue: number; approvedVariations: number; estimatedCost: number;
  committedCost: number; actualCost: number; invoiced: number; collected: number;
  retention: number;
  plannedStart: string; plannedEnd: string; actualStart?: string; actualEnd?: string;
  pmId: ID; salespersonId: ID; teamIds: ID[];
  plannedProgress: number; actualProgress: number;
  materialReadiness: number;
  quotationId?: ID; surveyId?: ID; leadId?: ID;
};

// ---------- SEED ----------

export const employees: Employee[] = [
  { id: "E-001", name: "Yousef Al-Emadi", role: "Managing Director", department: "Management", phone: "+974 3311 0001", email: "yousef@alharib.qa", availability: "Busy", workload: 92 },
  { id: "E-002", name: "Rashid Al-Kubaisi", role: "Operations Manager", department: "Projects", phone: "+974 3311 0002", email: "rashid@alharib.qa", availability: "Busy", workload: 88 },
  { id: "E-003", name: "Karim Haddad", role: "Senior Project Manager", department: "Projects", phone: "+974 3311 0003", email: "karim@alharib.qa", availability: "Busy", workload: 84 },
  { id: "E-004", name: "Anitha Verghese", role: "Project Manager", department: "Projects", phone: "+974 3311 0004", email: "anitha@alharib.qa", availability: "Busy", workload: 76 },
  { id: "E-005", name: "Mohammed Farouk", role: "Sales Manager", department: "Sales", phone: "+974 3311 0005", email: "farouk@alharib.qa", availability: "Available", workload: 55 },
  { id: "E-006", name: "Layla Al-Thani", role: "Senior Sales Executive", department: "Sales", phone: "+974 3311 0006", email: "layla@alharib.qa", availability: "Busy", workload: 71 },
  { id: "E-007", name: "Nassar Iqbal", role: "Sales Executive", department: "Sales", phone: "+974 3311 0007", email: "nassar@alharib.qa", availability: "Available", workload: 48 },
  { id: "E-008", name: "Ahmed Sobhi", role: "Senior Site Engineer", department: "Engineering", phone: "+974 3311 0008", email: "sobhi@alharib.qa", availability: "Busy", workload: 90 },
  { id: "E-009", name: "Vinod Menon", role: "Site Engineer", department: "Engineering", phone: "+974 3311 0009", email: "vinod@alharib.qa", availability: "Busy", workload: 82 },
  { id: "E-010", name: "Suresh Kumar", role: "Lead Technician", department: "Installation", phone: "+974 3311 0010", email: "suresh@alharib.qa", availability: "Busy", workload: 78 },
  { id: "E-011", name: "Rakesh Nair", role: "Installation Technician", department: "Installation", phone: "+974 3311 0011", email: "rakesh@alharib.qa", availability: "Busy", workload: 72 },
  { id: "E-012", name: "Prakash Iyer", role: "Installation Technician", department: "Installation", phone: "+974 3311 0012", email: "prakash@alharib.qa", availability: "Available", workload: 40 },
  { id: "E-013", name: "Bilal Farooq", role: "Service Engineer", department: "Service", phone: "+974 3311 0013", email: "bilal@alharib.qa", availability: "Busy", workload: 68 },
  { id: "E-014", name: "Aisha Rahman", role: "Procurement Officer", department: "Procurement", phone: "+974 3311 0014", email: "aisha@alharib.qa", availability: "Available", workload: 58 },
  { id: "E-015", name: "Hasan Barzani", role: "Accounts Manager", department: "Accounts", phone: "+974 3311 0015", email: "hasan@alharib.qa", availability: "Available", workload: 52 },
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
  { id: "S-001", customerId: "C-001", name: "Al Wakrah Warehouse A", area: "Al Wakrah", type: "Warehouse", address: "Logistics Hub, Warehouse A, Al Wakrah" },
  { id: "S-002", customerId: "C-002", name: "Msheireb Office Tower B", area: "Msheireb", type: "Commercial", address: "Msheireb Downtown, Tower B, Doha" },
  { id: "S-003", customerId: "C-003", name: "Katara Villa 12", area: "The Pearl", type: "Residential", address: "Katara Hills, Villa 12" },
  { id: "S-004", customerId: "C-004", name: "Lusail Retail Unit 7", area: "Lusail", type: "Retail", address: "Lusail Marina, Retail Unit 7" },
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

export const surveys: SiteSurvey[] = [
  {
    id: "SV-001", number: "AHC-SUR-2026-014", customerId: "C-001", siteId: "S-001", type: "Full site survey",
    engineerId: "E-008", scheduled: "2026-04-22", status: "Report Approved", completeness: 100, reportStatus: "Approved",
    points: wakrahPoints,
    existingSystem: "Legacy 8-channel analog DVR, 6 cameras, end of life.",
    proposedSummary: "24-camera 4MP IP CCTV with 32-ch NVR, PoE switches, 8TB storage, remote viewing.",
  },
  {
    id: "SV-002", number: "AHC-SUR-2026-018", customerId: "C-002", siteId: "S-002", type: "Full site survey",
    engineerId: "E-008", scheduled: "2026-05-05", status: "Report Approved", completeness: 100, reportStatus: "Approved",
    points: Array.from({ length: 48 }, (_, i) => ({
      id: `CP-${String(i + 1).padStart(2, "0")}`, building: "Tower B", floor: `Floor ${Math.ceil((i + 1) / 6)}`,
      zone: `Zone ${((i + 1) % 4) + 1}`, area: i % 3 === 0 ? "Lobby" : "Corridor", indoor: true,
      cameraType: "4MP IR Dome", coverage: "Corridor coverage", mountPos: "Ceiling mount",
      mountHeight: "3.2 m", cableLen: 25 + (i % 5) * 5, power: "PoE from floor switch", networkRoute: "Riser to core",
      notes: "",
    })),
    existingSystem: "Building shell only. Greenfield installation.",
    proposedSummary: "48-camera 4K IP CCTV, VMS-controlled, integrated with access control.",
  },
  {
    id: "SV-003", number: "AHC-SUR-2026-021", customerId: "C-003", siteId: "S-003", type: "Residential survey",
    engineerId: "E-009", scheduled: "2026-06-14", status: "Report Approved", completeness: 100, reportStatus: "Approved",
    points: Array.from({ length: 12 }, (_, i) => ({
      id: `CP-${String(i + 1).padStart(2, "0")}`, building: "Villa 12", floor: i < 6 ? "Ground" : "First",
      zone: "Villa Perimeter", area: i < 4 ? "External" : "Internal", indoor: i >= 4, cameraType: "4MP Dome",
      coverage: "Perimeter and entrance", mountPos: "Wall mount", mountHeight: "3.0 m", cableLen: 20 + i * 3,
      power: "PoE", networkRoute: "Ceiling", notes: "",
    })),
    existingSystem: "None.", proposedSummary: "12-camera residential IP CCTV with mobile app.",
  },
  {
    id: "SV-004", number: "AHC-SUR-2026-024", customerId: "C-005", siteId: "S-005", type: "Full site survey",
    engineerId: "E-008", scheduled: "2026-07-15", status: "In Progress", completeness: 65, reportStatus: "Draft",
    points: [], existingSystem: "16-camera legacy IP system, non-compliant.", proposedSummary: "Under assessment.",
  },
  {
    id: "SV-005", number: "AHC-SUR-2026-026", customerId: "C-008", siteId: undefined as unknown as ID, type: "Scoping",
    engineerId: "E-009", scheduled: "2026-07-24", status: "Scheduled", completeness: 0, reportStatus: "Draft",
    points: [], existingSystem: "Unknown.", proposedSummary: "",
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
    salespersonId: "E-006", revision: 2, createdAt: "2026-04-25", validUntil: "2026-05-25", status: "Approved", items: wakrahBOQ, tax: 0, notes: "Approved by client on 2026-05-04." },
  { id: "Q-002", number: "AHC-QTN-2026-038", customerId: "C-002", siteId: "S-002", opportunityName: "Msheireb Tower B CCTV", salespersonId: "E-005", revision: 3, createdAt: "2026-03-10", validUntil: "2026-04-10", status: "Approved", items: [], tax: 0, notes: "" },
  { id: "Q-003", number: "AHC-QTN-2026-044", customerId: "C-003", siteId: "S-003", opportunityName: "Katara Villa 12 CCTV", salespersonId: "E-006", revision: 1, createdAt: "2026-06-18", validUntil: "2026-07-18", status: "Approved", items: [], tax: 0, notes: "" },
  { id: "Q-004", number: "AHC-QTN-2026-035", customerId: "C-004", siteId: "S-004", opportunityName: "Lusail Retail CCTV", salespersonId: "E-007", revision: 1, createdAt: "2026-02-14", validUntil: "2026-03-14", status: "Approved", items: [], tax: 0, notes: "" },
  { id: "Q-005", number: "AHC-QTN-2026-051", customerId: "C-005", siteId: "S-005", leadId: "L-004", opportunityName: "West Bay Tower CCTV Upgrade", salespersonId: "E-006", revision: 1, createdAt: "2026-07-16", validUntil: "2026-08-16", status: "Sent", items: [], tax: 0, notes: "Awaiting client review." },
  { id: "Q-006", number: "AHC-QTN-2026-053", customerId: "C-006", siteId: "S-006", opportunityName: "Rayyan Academy Access Control", salespersonId: "E-007", revision: 1, createdAt: "2026-07-18", validUntil: "2026-08-18", status: "Draft", items: [], tax: 0, notes: "" },
  { id: "Q-007", number: "AHC-QTN-2026-050", customerId: "C-007", siteId: "S-007", opportunityName: "Pearl Marina Tower 3 CCTV", salespersonId: "E-005", revision: 2, createdAt: "2026-07-08", validUntil: "2026-08-08", status: "Negotiation" as unknown as Quotation["status"], items: [], tax: 0, notes: "" },
];

export const leads: Lead[] = [
  { id: "L-001", company: "Al Wakra Logistics Hub", contactName: "Fahad Al-Marri", phone: "+974 4455 1001", email: "fahad@wakralogistics.qa", customerId: "C-001", siteId: "S-001", systemType: "IP CCTV", value: 340000, source: "Referral", salespersonId: "E-006", stage: "Won", probability: 100, nextFollowUp: undefined, createdAt: "2026-03-10", lastActivity: "2026-05-04", notes: "Won. Converted to AHC-PRO-2026-041." },
  { id: "L-002", company: "Msheireb Properties", contactName: "Hessa Al-Sulaiti", phone: "+974 4455 1002", email: "h.sulaiti@msheireb.qa", customerId: "C-002", siteId: "S-002", systemType: "IP CCTV, VMS", value: 1240000, source: "Tender", salespersonId: "E-005", stage: "Won", probability: 100, createdAt: "2026-01-20", lastActivity: "2026-03-14", notes: "Converted to project." },
  { id: "L-003", company: "Katara Cultural Village", contactName: "Sara Al-Kaabi", phone: "+974 4455 1003", email: "s.kaabi@katara.qa", customerId: "C-003", siteId: "S-003", systemType: "IP CCTV", value: 145000, source: "Repeat", salespersonId: "E-006", stage: "Won", probability: 100, createdAt: "2026-05-11", lastActivity: "2026-06-20", notes: "" },
  { id: "L-004", company: "West Bay Financial Tower", contactName: "Nawaf Al-Attiyah", phone: "+974 4455 1005", email: "nawaf@wbft.qa", systemType: "NVR upgrade, IP CCTV", value: 480000, source: "Website", salespersonId: "E-006", stage: "Quotation Sent", probability: 65, nextFollowUp: "2026-07-24", createdAt: "2026-06-10", lastActivity: "2026-07-16", notes: "Quotation sent, awaiting review." },
  { id: "L-005", company: "Doha Industrial Warehousing", contactName: "Khaled Naseer", phone: "+974 4455 1008", email: "khaled@dohaind.qa", systemType: "IP CCTV", value: 220000, source: "Cold outreach", salespersonId: "E-007", stage: "Site Survey Scheduled", probability: 40, nextFollowUp: "2026-07-24", createdAt: "2026-06-28", lastActivity: "2026-07-18", notes: "Survey booked for 24 Jul." },
  { id: "L-006", company: "Pearl Marina Residences", contactName: "Reem Al-Mohannadi", phone: "+974 4455 1007", email: "reem@pearlmarina.qa", customerId: "C-007", siteId: "S-007", systemType: "IP CCTV, Access Control", value: 620000, source: "Referral", salespersonId: "E-005", stage: "Negotiation", probability: 70, nextFollowUp: "2026-07-22", createdAt: "2026-05-30", lastActivity: "2026-07-15", notes: "Negotiating payment terms." },
  { id: "L-007", company: "Rayyan Sports Academy", contactName: "Jassim Al-Ansari", phone: "+974 4455 1006", email: "jassim@rayyanacademy.qa", customerId: "C-006", siteId: "S-006", systemType: "Access Control, Intercom", value: 180000, source: "Repeat", salespersonId: "E-007", stage: "Quotation Draft", probability: 55, nextFollowUp: "2026-07-23", createdAt: "2026-06-20", lastActivity: "2026-07-18", notes: "" },
  { id: "L-008", company: "Souq Waqif Boutique Hotel", contactName: "Faisal Al-Ibrahim", phone: "+974 4455 2001", email: "faisal@sqboutique.qa", systemType: "IP CCTV", value: 95000, source: "Website", salespersonId: "E-007", stage: "Qualified", probability: 30, nextFollowUp: "2026-07-25", createdAt: "2026-07-12", lastActivity: "2026-07-17", notes: "Boutique hotel, 22 cameras." },
  { id: "L-009", company: "Aspire Zone Foundation", contactName: "Mansour Al-Saadi", phone: "+974 4455 2002", email: "mansour@aspire.qa", systemType: "IP CCTV, VMS", value: 890000, source: "Tender", salespersonId: "E-005", stage: "Verbal Approval", probability: 90, nextFollowUp: "2026-07-21", createdAt: "2026-05-02", lastActivity: "2026-07-19", notes: "Verbal go-ahead, awaiting PO." },
  { id: "L-010", company: "Ezdan Mall Al Wakra", contactName: "Latifa Al-Naimi", phone: "+974 4455 2003", email: "latifa@ezdan.qa", systemType: "IP CCTV, Analytics", value: 720000, source: "Referral", salespersonId: "E-006", stage: "New Enquiry", probability: 15, nextFollowUp: "2026-07-22", createdAt: "2026-07-18", lastActivity: "2026-07-18", notes: "New enquiry via referral." },
  { id: "L-011", company: "Doha Metro Concessions", contactName: "Yaseen Al-Kuwari", phone: "+974 4455 2004", email: "yaseen@dmc.qa", systemType: "IP CCTV", value: 260000, source: "Website", salespersonId: "E-007", stage: "Contacted", probability: 20, nextFollowUp: "2026-07-24", createdAt: "2026-07-10", lastActivity: "2026-07-14", notes: "" },
  { id: "L-012", company: "Al Sadd Villa Compound", contactName: "Hessa Al-Emadi", phone: "+974 4455 2005", email: "hessa@alsaddc.qa", systemType: "IP CCTV", value: 130000, source: "Referral", salespersonId: "E-006", stage: "Survey Completed", probability: 60, nextFollowUp: "2026-07-22", createdAt: "2026-06-25", lastActivity: "2026-07-15", notes: "Survey done, quotation pending." },
  { id: "L-013", company: "Barwa City Retail", contactName: "Ali Al-Kaabi", phone: "+974 4455 2006", email: "ali@barwa.qa", systemType: "IP CCTV", value: 410000, source: "Tender", salespersonId: "E-005", stage: "Lost", probability: 0, createdAt: "2026-04-01", lastActivity: "2026-05-30", notes: "", lostReason: "Price - competitor undercut by 18%" },
];

// Devices for the Wakrah project. Reuse the CP ids as labels.
const wakrahDevices: Device[] = wakrahPoints.map((p, i) => {
  const failedIds = ["CP-13", "CP-17", "CP-20"];
  const notInstalled = ["CP-22", "CP-23", "CP-24"];
  const tested = i < 21 && !failedIds.includes(p.id) && !notInstalled.includes(p.id);
  const status: Device["status"] = notInstalled.includes(p.id) ? "Faulty" : failedIds.includes(p.id) ? "Configured" : tested ? "Tested" : "Installed";
  const testResult: Device["testResult"] = failedIds.includes(p.id) ? "Fail" : notInstalled.includes(p.id) ? "Pending" : tested ? "Pass" : "Pending";
  return {
    id: `D-W-${p.id}`, projectId: "P-041", cameraPointId: p.id, label: p.id,
    brand: "Hikvision", model: p.cameraType.includes("PTZ") ? "DS-2DE7A425IW-AEB" : p.cameraType.includes("Bullet") ? "DS-2CD2T46G2-4I" : "DS-2CD2146G2-I",
    serial: `HIK${String(2600000 + i * 37).padStart(9, "0")}`, mac: `AC:DE:48:${String(i).padStart(2, "0")}:${String((i * 7) % 100).padStart(2, "0")}:${String((i * 3) % 100).padStart(2, "0")}`,
    ip: `10.20.30.${100 + i}`, building: p.building, floor: p.floor, zone: p.zone, indoor: p.indoor,
    switch: i < 12 ? "SW-01" : "SW-02", switchPort: String((i % 16) + 1), recorder: "NVR-01", recorderChannel: String(i + 1),
    installDate: notInstalled.includes(p.id) ? undefined : "2026-07-08", installerId: "E-010",
    testResult, warranty: "3 years", status,
  };
});

export const devices: Device[] = wakrahDevices;

// Materials for Wakrah - highlight the two critical shortages
export const materials: Material[] = [
  { id: "M-001", projectId: "P-041", sku: "SW-16P-POE", name: "16-port PoE managed switch", required: 2, ordered: 2, delivered: 1, issued: 1, installed: 1, returned: 0, critical: true },
  { id: "M-002", projectId: "P-041", sku: "HDD-8TB", name: "8TB Surveillance HDD", required: 4, ordered: 4, delivered: 2, issued: 2, installed: 2, returned: 0, critical: true },
  { id: "M-003", projectId: "P-041", sku: "CAM-DOM-4M", name: "4MP IR Dome camera", required: 15, ordered: 15, delivered: 15, issued: 15, installed: 12, returned: 0, critical: false },
  { id: "M-004", projectId: "P-041", sku: "CAM-BUL-4M", name: "4MP IR Bullet camera", required: 6, ordered: 6, delivered: 6, issued: 6, installed: 6, returned: 0, critical: false },
  { id: "M-005", projectId: "P-041", sku: "CBL-CAT6-305", name: "Cat6 UTP cable 305m box", required: 6, ordered: 6, delivered: 6, issued: 5, installed: 5, returned: 0, critical: false },
  { id: "M-006", projectId: "P-041", sku: "NVR-32CH", name: "32-ch 4K NVR", required: 1, ordered: 1, delivered: 1, issued: 1, installed: 1, returned: 0, critical: false },
];

export const projects: Project[] = [
  { id: "P-041", number: "AHC-PRO-2026-041", name: "Al Wakrah Warehouse CCTV", customerId: "C-001", siteId: "S-001",
    phase: "Installation", scope: "Supply and install 24-camera 4MP IP CCTV, 32-ch NVR, PoE switches, 8TB storage, remote viewing.",
    contractValue: 340000, approvedVariations: 12000, estimatedCost: 218000, committedCost: 195000, actualCost: 152000,
    invoiced: 170000, collected: 118000, retention: 17000,
    plannedStart: "2026-05-20", plannedEnd: "2026-08-15", actualStart: "2026-05-22",
    pmId: "E-004", salespersonId: "E-006", teamIds: ["E-008","E-010","E-011"],
    plannedProgress: 77, actualProgress: 62, materialReadiness: 78,
    quotationId: "Q-001", surveyId: "SV-001", leadId: "L-001" },
  { id: "P-038", number: "AHC-PRO-2026-038", name: "Msheireb Office Tower B CCTV", customerId: "C-002", siteId: "S-002",
    phase: "Testing", scope: "48-camera 4K IP CCTV with VMS.",
    contractValue: 1240000, approvedVariations: 45000, estimatedCost: 780000, committedCost: 760000, actualCost: 705000,
    invoiced: 950000, collected: 810000, retention: 62000,
    plannedStart: "2026-02-01", plannedEnd: "2026-08-10", actualStart: "2026-02-05",
    pmId: "E-003", salespersonId: "E-005", teamIds: ["E-008","E-010","E-011","E-012"],
    plannedProgress: 82, actualProgress: 84, materialReadiness: 96,
    quotationId: "Q-002", surveyId: "SV-002", leadId: "L-002" },
  { id: "P-044", number: "AHC-PRO-2026-044", name: "Katara Villa 12 CCTV", customerId: "C-003", siteId: "S-003",
    phase: "Procurement", scope: "12-camera residential IP CCTV with mobile app.",
    contractValue: 145000, approvedVariations: 0, estimatedCost: 92000, committedCost: 68000, actualCost: 22000,
    invoiced: 35000, collected: 35000, retention: 7250,
    plannedStart: "2026-07-01", plannedEnd: "2026-09-15",
    pmId: "E-004", salespersonId: "E-006", teamIds: ["E-009","E-011"],
    plannedProgress: 32, actualProgress: 25, materialReadiness: 45,
    quotationId: "Q-003", surveyId: "SV-003", leadId: "L-003" },
  { id: "P-035", number: "AHC-PRO-2026-035", name: "Lusail Retail Unit 7 CCTV", customerId: "C-004", siteId: "S-004",
    phase: "Handover", scope: "16-camera IP CCTV, NVR, retail analytics.",
    contractValue: 220000, approvedVariations: 8500, estimatedCost: 138000, committedCost: 136000, actualCost: 132000,
    invoiced: 205000, collected: 180000, retention: 11000,
    plannedStart: "2026-03-01", plannedEnd: "2026-07-25", actualStart: "2026-03-04",
    pmId: "E-003", salespersonId: "E-007", teamIds: ["E-009","E-012"],
    plannedProgress: 98, actualProgress: 96, materialReadiness: 100,
    quotationId: "Q-004", leadId: undefined },
];

export const tasks: Task[] = [
  { id: "T-1001", projectId: "P-041", title: "Terminate cables in IDF-01", assigneeId: "E-010", phase: "Installation", status: "In Progress", due: "2026-07-22", progress: 60, priority: "High" },
  { id: "T-1002", projectId: "P-041", title: "Install cameras CP-22 to CP-24", assigneeId: "E-011", phase: "Installation", status: "Awaiting Material", due: "2026-07-25", progress: 0, priority: "Critical" },
  { id: "T-1003", projectId: "P-041", title: "Retest failed devices CP-13, CP-17, CP-20", assigneeId: "E-008", phase: "Testing", status: "Ready", due: "2026-07-24", progress: 0, priority: "Critical" },
  { id: "T-1004", projectId: "P-041", title: "Client approval on final NVR configuration", assigneeId: "E-004", phase: "Client Approval", status: "Awaiting Client", due: "2026-07-23", progress: 30, priority: "High" },
  { id: "T-1005", projectId: "P-041", title: "Daily site cleanup", assigneeId: "E-011", phase: "Installation", status: "In Progress", due: "2026-07-21", progress: 50, priority: "Low" },
  { id: "T-1006", projectId: "P-038", title: "VMS integration testing", assigneeId: "E-008", phase: "Testing", status: "In Progress", due: "2026-07-28", progress: 70, priority: "High" },
  { id: "T-1007", projectId: "P-038", title: "Compile handover documentation", assigneeId: "E-003", phase: "Handover", status: "In Progress", due: "2026-08-02", progress: 45, priority: "Medium" },
  { id: "T-1008", projectId: "P-044", title: "Place PO with supplier for 12x dome cameras", assigneeId: "E-014", phase: "Procurement", status: "In Progress", due: "2026-07-24", progress: 40, priority: "High" },
  { id: "T-1009", projectId: "P-035", title: "Final client sign-off checklist", assigneeId: "E-003", phase: "Handover", status: "Under Review", due: "2026-07-22", progress: 90, priority: "High" },
  { id: "T-1010", projectId: "P-035", title: "Deliver O&M manuals", assigneeId: "E-004", phase: "Handover", status: "Ready", due: "2026-07-25", progress: 0, priority: "Medium" },
];

export const milestones: Milestone[] = [
  { id: "MS-1", projectId: "P-041", title: "Site Mobilization", planned: "2026-05-22", actual: "2026-05-22", done: true },
  { id: "MS-2", projectId: "P-041", title: "Material Delivery Complete", planned: "2026-06-25", done: false },
  { id: "MS-3", projectId: "P-041", title: "Installation Complete", planned: "2026-07-28", done: false },
  { id: "MS-4", projectId: "P-041", title: "Testing and Commissioning", planned: "2026-08-05", done: false },
  { id: "MS-5", projectId: "P-041", title: "Handover", planned: "2026-08-15", done: false },
  { id: "MS-6", projectId: "P-038", title: "Installation Complete", planned: "2026-06-30", actual: "2026-07-02", done: true },
  { id: "MS-7", projectId: "P-038", title: "Testing Complete", planned: "2026-08-05", done: false },
  { id: "MS-8", projectId: "P-035", title: "Handover", planned: "2026-07-25", done: false },
];

export const approvals: Approval[] = [
  { id: "A-1", projectId: "P-041", title: "NVR retention policy sign-off", requestedOn: "2026-07-17", status: "Pending", owner: "Fahad Al-Marri", critical: true },
  { id: "A-2", projectId: "P-044", title: "Camera model substitution approval", requestedOn: "2026-07-15", status: "Pending", owner: "Sara Al-Kaabi", critical: false },
  { id: "A-3", projectId: "P-038", title: "Riser cable routing change", requestedOn: "2026-07-10", status: "Approved", owner: "Hessa Al-Sulaiti", critical: false },
];

export const variations: Variation[] = [
  { id: "V-1", projectId: "P-041", number: "VO-01", description: "Additional 4 cameras at mezzanine", amount: 12000, status: "Approved", date: "2026-06-20" },
  { id: "V-2", projectId: "P-038", number: "VO-01", description: "Upgrade to 4K analytics", amount: 45000, status: "Approved", date: "2026-05-14" },
  { id: "V-3", projectId: "P-041", number: "VO-02", description: "Add outdoor bollard IR illuminators", amount: 6800, status: "Submitted", date: "2026-07-14" },
];

export const documents: Doc[] = [
  { id: "DOC-1", name: "AHC-PRO-2026-041 Signed Contract.pdf", category: "Contract", projectId: "P-041", customerId: "C-001", revision: "R1", status: "Approved", uploadedOn: "2026-05-15", tags: ["contract","signed"] },
  { id: "DOC-2", name: "Al Wakrah Site Survey Report R3.pdf", category: "Survey Report", projectId: "P-041", customerId: "C-001", revision: "R3", status: "Approved", uploadedOn: "2026-04-28", tags: ["survey","approved"] },
  { id: "DOC-3", name: "As-Built Drawings R1.dwg", category: "Drawings", projectId: "P-041", revision: "R1", status: "Draft", uploadedOn: "2026-07-12", tags: ["drawing","as-built"] },
  { id: "DOC-4", name: "Method Statement Rev B.pdf", category: "Method Statement", projectId: "P-041", revision: "B", status: "Approved", uploadedOn: "2026-05-30", tags: ["hse"] },
  { id: "DOC-5", name: "Msheireb Handover Pack Draft.pdf", category: "Handover", projectId: "P-038", revision: "D1", status: "Draft", uploadedOn: "2026-07-19", tags: ["handover"] },
  { id: "DOC-6", name: "Lusail Retail Warranty Certificate.pdf", category: "Warranty", projectId: "P-035", revision: "R1", status: "Approved", uploadedOn: "2026-07-16", tags: ["warranty"] },
  { id: "DOC-7", name: "Company Trade Licence.pdf", category: "Company", revision: "2026", status: "Approved", uploadedOn: "2026-01-15", expiresOn: "2026-12-31", tags: ["compliance"] },
  { id: "DOC-8", name: "MoI Security Contractor Registration.pdf", category: "Compliance", revision: "2026", status: "Approved", uploadedOn: "2026-02-20", expiresOn: "2026-08-30", tags: ["moi","expiring"] },
];

export const payments: PaymentMilestone[] = [
  { id: "PM-1", projectId: "P-041", label: "Mobilization advance 20%", amount: 68000, dueDate: "2026-05-22", invoicedOn: "2026-05-22", collectedOn: "2026-05-30", status: "Collected" },
  { id: "PM-2", projectId: "P-041", label: "Materials delivery 30%", amount: 102000, dueDate: "2026-06-30", invoicedOn: "2026-07-01", collectedOn: "2026-07-10", status: "Collected" },
  { id: "PM-3", projectId: "P-041", label: "Installation milestone 30%", amount: 102000, dueDate: "2026-07-25", invoicedOn: "2026-07-18", status: "Invoiced" },
  { id: "PM-4", projectId: "P-041", label: "Handover 15%", amount: 51000, dueDate: "2026-08-20", status: "Pending" },
  { id: "PM-5", projectId: "P-041", label: "Retention 5%", amount: 17000, dueDate: "2027-02-20", status: "Pending" },
  { id: "PM-6", projectId: "P-038", label: "Progress Cert 4", amount: 210000, dueDate: "2026-07-01", invoicedOn: "2026-06-30", collectedOn: "2026-07-15", status: "Collected" },
  { id: "PM-7", projectId: "P-038", label: "Progress Cert 5", amount: 180000, dueDate: "2026-07-31", invoicedOn: "2026-07-18", status: "Invoiced" },
  { id: "PM-8", projectId: "P-035", label: "Handover balance", amount: 40000, dueDate: "2026-07-25", invoicedOn: "2026-07-18", status: "Invoiced" },
];

export const amc: AMCContract[] = [
  { id: "AMC-1", number: "AHC-AMC-2025-014", customerId: "C-002", siteId: "S-002", equipment: "48 cameras, 2 NVRs, VMS", start: "2025-08-01", end: "2026-08-02", visitFrequency: "Quarterly", value: 84000, sla: "8h response, 24h resolution", engineerId: "E-013", nextVisit: "2026-07-30", renewalStatus: "Expiring Soon" },
  { id: "AMC-2", number: "AHC-AMC-2025-021", customerId: "C-004", siteId: "S-004", equipment: "16 cameras, NVR", start: "2025-08-01", end: "2027-07-31", visitFrequency: "Bi-annual", value: 22000, sla: "24h response", engineerId: "E-013", nextVisit: "2026-08-15", renewalStatus: "Active" },
  { id: "AMC-3", number: "AHC-AMC-2024-009", customerId: "C-006", siteId: "S-006", equipment: "32 cameras, access control", start: "2024-05-01", end: "2026-04-30", visitFrequency: "Quarterly", value: 54000, sla: "8h response", engineerId: "E-013", nextVisit: "2026-08-05", renewalStatus: "Expired" },
];

export const tickets: ServiceTicket[] = [
  { id: "TK-1", number: "AHC-SR-2026-118", customerId: "C-002", siteId: "S-002", amcId: "AMC-1", title: "Lobby camera offline", priority: "High", status: "In Progress", opened: "2026-07-20", assigneeId: "E-013", sla: "8h" },
  { id: "TK-2", number: "AHC-SR-2026-117", customerId: "C-004", siteId: "S-004", amcId: "AMC-2", title: "Recording gaps on channel 4-6", priority: "Medium", status: "Assigned", opened: "2026-07-19", assigneeId: "E-013", sla: "24h" },
  { id: "TK-3", number: "AHC-SR-2026-116", customerId: "C-001", siteId: "S-001", title: "Live view latency on mobile app", priority: "Low", status: "New", opened: "2026-07-19", sla: "48h" },
  { id: "TK-4", number: "AHC-SR-2026-115", customerId: "C-006", siteId: "S-006", amcId: "AMC-3", title: "Access controller reset required", priority: "Critical", status: "In Progress", opened: "2026-07-18", assigneeId: "E-013", sla: "4h" },
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
  { id: "PR-101", number: "AHC-PR-2026-101", projectId: "P-041", requestedBy: "E-004", requestDate: "2026-07-05", requiredDate: "2026-07-18", items: 3, cost: 24800, priority: "Critical", approvalStatus: "Approved", procurementStatus: "Ordered" },
  { id: "PR-102", number: "AHC-PR-2026-102", projectId: "P-044", requestedBy: "E-004", requestDate: "2026-07-12", requiredDate: "2026-07-24", items: 6, cost: 58000, priority: "High", approvalStatus: "Approved", procurementStatus: "Sourcing" },
  { id: "PR-103", number: "AHC-PR-2026-103", projectId: "P-038", requestedBy: "E-003", requestDate: "2026-07-15", requiredDate: "2026-07-30", items: 2, cost: 6400, priority: "Medium", approvalStatus: "Pending", procurementStatus: "Requested" },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "PO-338", number: "AHC-PO-2026-338", supplier: "Al Manara Distribution", projectId: "P-041", amount: 18400, orderDate: "2026-07-01", expectedDelivery: "2026-07-15", deliveryStatus: "Overdue", paymentStatus: "Partial" },
  { id: "PO-339", number: "AHC-PO-2026-339", supplier: "Storage Traders LLC", projectId: "P-041", amount: 4600, orderDate: "2026-07-08", expectedDelivery: "2026-07-22", deliveryStatus: "Partial", paymentStatus: "Unpaid" },
  { id: "PO-340", number: "AHC-PO-2026-340", supplier: "Netcore Qatar", projectId: "P-044", amount: 12200, orderDate: "2026-07-14", expectedDelivery: "2026-07-28", deliveryStatus: "Pending", paymentStatus: "Unpaid" },
  { id: "PO-341", number: "AHC-PO-2026-341", supplier: "Al Manara Distribution", projectId: "P-038", amount: 9800, orderDate: "2026-07-16", expectedDelivery: "2026-07-29", deliveryStatus: "Pending", paymentStatus: "Unpaid" },
];

export const siteActivities: SiteActivity[] = [
  { id: "SA-1", projectId: "P-041", date: "2026-07-20", teamPresent: ["E-010","E-011"], workCompleted: "Installed cameras CP-19 to CP-21, cable pulling for CP-22 to CP-24.", camerasInstalled: 3, cableInstalled: 180, devicesConfigured: 3, issues: "PoE switch shortage delaying final segment.", tomorrowPlan: "Continue cable termination and camera mounting." },
  { id: "SA-2", projectId: "P-041", date: "2026-07-19", teamPresent: ["E-010","E-011","E-008"], workCompleted: "Terminated cables in IDF-01, tested channels 1-16.", camerasInstalled: 0, cableInstalled: 0, devicesConfigured: 16, issues: "Three cameras failed initial test.", tomorrowPlan: "Retest failed devices." },
];

export const communications: Communication[] = [
  { id: "CM-1", projectId: "P-041", date: "2026-07-19", owner: "Anitha Verghese", subject: "Awaiting NVR retention policy sign-off", status: "Pending", relatedTaskId: "T-1004" },
  { id: "CM-2", projectId: "P-041", date: "2026-07-16", owner: "Anitha Verghese", subject: "Weekly progress report shared", status: "Sent" },
  { id: "CM-3", projectId: "P-041", date: "2026-07-14", owner: "Fahad Al-Marri", subject: "Client confirmed access to mezzanine floor", status: "Confirmed" },
];

export const testRecords: TestRecord[] = wakrahDevices.map((d) => ({
  id: `TR-${d.id}`, deviceId: d.id, projectId: "P-041", testedBy: "E-008",
  testedOn: d.testResult !== "Pending" ? "2026-07-19" : undefined,
  checks: { power: "Pass", network: "Pass", ip: "Pass", image: d.testResult === "Fail" ? "Fail" : "Pass", focus: "Pass", angle: "Pass", day: "Pass", night: d.testResult === "Fail" ? "Fail" : "Pass", recording: "Pass", playback: "Pass", storage: "Pass", time: "Pass", motion: "Pass", analytics: "Pass", mounting: "Pass", label: "Pass" },
  result: d.testResult === "Fail" ? "Fail" : d.testResult === "Pending" ? "Pending" : "Pass",
  notes: d.testResult === "Fail" ? "Image degraded at low light. Requires lens cleaning and re-focus." : "",
}));

// Handover checklist items reuse device labels for the wakrah project
export type HandoverItem = { id: ID; section: "Technical"|"Documentation"|"Commercial"|"Client"; label: string; done: boolean; projectId: ID; };
export const handoverItems: HandoverItem[] = [
  { id: "H-1", section: "Technical", label: "All 24 cameras installed and tested (CP-01 to CP-24)", done: false, projectId: "P-041" },
  { id: "H-2", section: "Technical", label: "NVR configured and recording verified", done: true, projectId: "P-041" },
  { id: "H-3", section: "Technical", label: "Failed devices retested (CP-13, CP-17, CP-20)", done: false, projectId: "P-041" },
  { id: "H-4", section: "Documentation", label: "As-built drawings signed", done: false, projectId: "P-041" },
  { id: "H-5", section: "Documentation", label: "Device register and IP schedule delivered", done: true, projectId: "P-041" },
  { id: "H-6", section: "Documentation", label: "O&M manual pack delivered", done: false, projectId: "P-041" },
  { id: "H-7", section: "Commercial", label: "Final invoice raised", done: false, projectId: "P-041" },
  { id: "H-8", section: "Commercial", label: "Retention agreement signed", done: false, projectId: "P-041" },
  { id: "H-9", section: "Client", label: "Client training completed", done: false, projectId: "P-041" },
  { id: "H-10", section: "Client", label: "Handover acceptance form signed by client", done: false, projectId: "P-041" },
];

export type ComplianceItem = { id: ID; projectId: ID; item: string; status: "Not Started"|"Submitted"|"Approved"|"Rejected"; owner: string; expires?: string; };
export const complianceItems: ComplianceItem[] = [
  { id: "CI-1", projectId: "P-041", item: "MoI security systems contractor authorization", status: "Approved", owner: "Company", expires: "2026-08-30" },
  { id: "CI-2", projectId: "P-041", item: "Camera location and quantity schedule submission", status: "Approved", owner: "Karim Haddad" },
  { id: "CI-3", projectId: "P-041", item: "Drawing submission for authority review", status: "Submitted", owner: "Anitha Verghese" },
  { id: "CI-4", projectId: "P-041", item: "Inspection request", status: "Not Started", owner: "Anitha Verghese" },
  { id: "CI-5", projectId: "P-041", item: "Conformity certificate", status: "Not Started", owner: "Company" },
];

// Project Health computation
export type ProjectHealth = "On Track" | "Watch" | "At Risk" | "Awaiting Materials" | "Delayed";
export type HealthDriver = { severity: "info" | "warning" | "critical"; text: string; };

export function computeHealth(p: Project, allApprovals: Approval[], allDevices: Device[], allMaterials: Material[]): { label: ProjectHealth; drivers: HealthDriver[]; score: number; } {
  const drivers: HealthDriver[] = [];
  const scheduleVariance = p.actualProgress - p.plannedProgress;
  const materialReady = p.materialReadiness;
  const pendingApprovals = allApprovals.filter((a) => a.projectId === p.id && a.status === "Pending").length;
  const failedTests = allDevices.filter((d) => d.projectId === p.id && d.testResult === "Fail").length;
  const criticalShortages = allMaterials.filter((m) => m.projectId === p.id && m.critical && m.delivered < m.required).length;

  if (scheduleVariance < -10) drivers.push({ severity: "critical", text: `Installation ${Math.abs(Math.round(scheduleVariance))}% behind schedule` });
  else if (scheduleVariance < -3) drivers.push({ severity: "warning", text: `Installation ${Math.abs(Math.round(scheduleVariance))}% behind schedule` });
  else if (scheduleVariance >= 0) drivers.push({ severity: "info", text: `On or ahead of schedule` });

  if (criticalShortages > 0) drivers.push({ severity: "critical", text: `${criticalShortages} critical material${criticalShortages > 1 ? "s" : ""} not delivered` });
  else if (materialReady < 70) drivers.push({ severity: "warning", text: `Material readiness at ${materialReady}%` });

  if (pendingApprovals > 0) drivers.push({ severity: pendingApprovals >= 2 ? "warning" : "info", text: `${pendingApprovals} client approval${pendingApprovals > 1 ? "s" : ""} pending` });
  if (failedTests > 0) drivers.push({ severity: "critical", text: `${failedTests} device${failedTests > 1 ? "s" : ""} failed testing` });

  let label: ProjectHealth = "On Track";
  const scoreCritical = drivers.filter((d) => d.severity === "critical").length;
  const scoreWarn = drivers.filter((d) => d.severity === "warning").length;
  if (p.phase === "Procurement" && criticalShortages > 0) label = "Awaiting Materials";
  else if (scheduleVariance < -20) label = "Delayed";
  else if (scoreCritical >= 1) label = "At Risk";
  else if (scoreWarn >= 1) label = "Watch";
  const score = Math.max(0, 100 - scoreCritical * 25 - scoreWarn * 12);
  return { label, drivers, score };
}
