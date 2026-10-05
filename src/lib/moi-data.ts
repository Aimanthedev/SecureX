// UI-only mock data for MOI / SSD compliance tracking. No real submissions or approvals.
export type Risk = "Low" | "Medium" | "High" | "Critical";
export type MoiStage =
  | "Site Survey" | "Design Package" | "Client Approval" | "MOI/SSD Submission" | "MOI Review"
  | "Comments / Corrections" | "Design Approved" | "Installation" | "Testing & Commissioning"
  | "Inspection Request" | "MOI Inspection" | "Corrections / Reinspection" | "Certificate Received"
  | "Handover" | "AMC / Maintenance";

export const MOI_WORKFLOW: MoiStage[] = [
  "Site Survey", "Design Package", "Client Approval", "MOI/SSD Submission", "MOI Review",
  "Comments / Corrections", "Design Approved", "Installation", "Testing & Commissioning",
  "Inspection Request", "MOI Inspection", "Corrections / Reinspection", "Certificate Received",
  "Handover", "AMC / Maintenance",
];

export interface MoiProject {
  id: string; projectId?: string; code: string; name: string; client: string; site: string;
  stage: MoiStage; coordinator: string; docsReady: number; docsTotal: number;
  submissionDate?: string; inspectionDate?: string; certStatus: string; expiry?: string;
  risk: Risk; nextAction: string;
}

export const MOI_PROJECTS: MoiProject[] = [
  { id: "M-01", projectId: "P-041", code: "AHC-PRO-2026-041", name: "Al Wakrah Warehouse CCTV", client: "Gulf Logistics WLL", site: "Al Wakrah Industrial", stage: "MOI Review", coordinator: "Rania Haddad", docsReady: 9, docsTotal: 11, submissionDate: "2026-09-18", certStatus: "Under Review", risk: "Medium", nextAction: "Respond to reviewer query on retention" },
  { id: "M-02", projectId: "P-038", code: "AHC-PRO-2026-038", name: "Msheireb Office Tower B CCTV", client: "Msheireb Properties", site: "Msheireb Downtown", stage: "Corrections / Reinspection", coordinator: "Omar Siddiqui", docsReady: 12, docsTotal: 12, submissionDate: "2026-07-02", inspectionDate: "2026-09-29", certStatus: "Reinspection Required", risk: "High", nextAction: "Fix 3 failed camera FOV items, request reinspection" },
  { id: "M-03", code: "SX-MOI-2026-017", name: "Lusail Marina Hotel Lobby", client: "Marina Hospitality", site: "Lusail Marina", stage: "Inspection Request", coordinator: "Rania Haddad", docsReady: 11, docsTotal: 12, submissionDate: "2026-06-11", inspectionDate: "2026-10-14", certStatus: "Design Approved", risk: "Low", nextAction: "Confirm inspection slot with client" },
  { id: "M-04", code: "SX-MOI-2026-021", name: "Industrial Area Fuel Station", client: "Al Rayyan Fuels", site: "Street 43, Industrial Area", stage: "Comments / Corrections", coordinator: "Omar Siddiqui", docsReady: 7, docsTotal: 11, submissionDate: "2026-08-25", certStatus: "Corrections Requested", risk: "Critical", nextAction: "Revise camera schedule, resubmit package" },
  { id: "M-05", code: "SX-MOI-2025-088", name: "West Bay Jewellery Showroom", client: "Pearl Gold Trading", site: "West Bay", stage: "AMC / Maintenance", coordinator: "Hassan Ali", docsReady: 12, docsTotal: 12, submissionDate: "2025-03-04", inspectionDate: "2025-05-20", certStatus: "Certificate Valid", expiry: "2026-11-02", risk: "Medium", nextAction: "Renew maintenance contract before expiry" },
  { id: "M-06", code: "SX-MOI-2026-026", name: "Al Sadd Clinic Expansion", client: "Care Medical Group", site: "Al Sadd", stage: "Client Approval", coordinator: "Hassan Ali", docsReady: 4, docsTotal: 11, certStatus: "Not Submitted", risk: "Medium", nextAction: "Awaiting client sign-off on layout drawings" },
];

export type DocState = "Approved" | "Submitted" | "Pending" | "Missing" | "Rejected" | "Expired";
export interface MoiSubmission { id: string; project: string; item: string; status: DocState; comments: string; resubmission: string; }
export const MOI_SUBMISSIONS: MoiSubmission[] = [
  { id: "S1", project: "M-01", item: "Design approval package", status: "Submitted", comments: "Under review", resubmission: "Not Required" },
  { id: "S2", project: "M-01", item: "CCTV layout drawings", status: "Approved", comments: "Accepted", resubmission: "Not Required" },
  { id: "S3", project: "M-01", item: "Storage / retention notes", status: "Pending", comments: "Clarify retention period per area", resubmission: "Pending" },
  { id: "S4", project: "M-04", item: "Camera schedule", status: "Rejected", comments: "Perimeter coverage gaps at pump island", resubmission: "In Progress" },
  { id: "S5", project: "M-04", item: "Device list", status: "Submitted", comments: "—", resubmission: "Not Required" },
  { id: "S6", project: "M-04", item: "Technical specification", status: "Missing", comments: "NVR datasheet not attached", resubmission: "Pending" },
  { id: "S7", project: "M-06", item: "Client authorization / site documents", status: "Missing", comments: "Awaiting client NOC", resubmission: "Pending" },
  { id: "S8", project: "M-05", item: "Maintenance contract document", status: "Expired", comments: "Contract renewal due", resubmission: "Pending" },
  { id: "S9", project: "M-03", item: "Design approval package", status: "Approved", comments: "Approved", resubmission: "Not Required" },
];

export interface MoiInspection { id: string; project: string; requested: string; scheduled?: string; result: "Scheduled" | "Passed" | "Failed" | "Requested"; failedItems: string[]; reinspection: boolean; cert: string; }
export const MOI_INSPECTIONS: MoiInspection[] = [
  { id: "I1", project: "M-02", requested: "2026-09-10", scheduled: "2026-09-29", result: "Failed", failedItems: ["Lobby cam C-07 FOV below spec", "Lift cam missing IR", "Recording retention short on NVR-2"], reinspection: true, cert: "Pending" },
  { id: "I2", project: "M-03", requested: "2026-09-30", scheduled: "2026-10-14", result: "Scheduled", failedItems: [], reinspection: false, cert: "Pending" },
  { id: "I3", project: "M-05", requested: "2025-05-02", scheduled: "2025-05-20", result: "Passed", failedItems: [], reinspection: false, cert: "Issued" },
  { id: "I4", project: "M-01", requested: "2026-10-03", result: "Requested", failedItems: [], reinspection: false, cert: "Pending" },
];

export interface MoiCert { id: string; name: string; type: string; expiry: string; owner: string; status: "Valid" | "Renewal In Progress" | "Expiring Soon" | "Expired"; }
export const MOI_CERTS: MoiCert[] = [
  { id: "C1", name: "MOI/SSD Company Approval Certificate", type: "Company", expiry: "2027-02-15", owner: "Yousef Al-Emadi", status: "Valid" },
  { id: "C2", name: "SSD Registration", type: "Company", expiry: "2026-10-28", owner: "Rania Haddad", status: "Renewal In Progress" },
  { id: "C3", name: "Project Certificate — West Bay Jewellery", type: "Project", expiry: "2026-11-02", owner: "Hassan Ali", status: "Expiring Soon" },
  { id: "C4", name: "Maintenance Contract — West Bay Jewellery", type: "Maintenance", expiry: "2026-10-20", owner: "Hassan Ali", status: "Expiring Soon" },
  { id: "C5", name: "Commercial Registration Activity Permit", type: "Permit", expiry: "2027-06-30", owner: "Yousef Al-Emadi", status: "Valid" },
  { id: "C6", name: "Maintenance Contract — Al Sadd Mall Kiosk", type: "Maintenance", expiry: "2026-09-30", owner: "Omar Siddiqui", status: "Expired" },
];

export const MOI_DOC_FOLDERS: { name: string; count: number; status: DocState }[] = [
  { name: "Company MOI approval", count: 3, status: "Approved" },
  { name: "SSD registration", count: 2, status: "Pending" },
  { name: "Project design submission", count: 14, status: "Submitted" },
  { name: "Approved CCTV layout", count: 6, status: "Approved" },
  { name: "Camera schedule", count: 7, status: "Submitted" },
  { name: "Device register", count: 6, status: "Approved" },
  { name: "Technical datasheets", count: 22, status: "Missing" },
  { name: "Inspection request", count: 4, status: "Submitted" },
  { name: "Inspection report", count: 2, status: "Approved" },
  { name: "Certificate / approval", count: 3, status: "Approved" },
  { name: "Maintenance contract", count: 5, status: "Expired" },
  { name: "Renewal documents", count: 2, status: "Pending" },
];

export const MOI_RENEWALS: { date: string; title: string; kind: string }[] = [
  { date: "2026-10-14", title: "MOI inspection — Lusail Marina Hotel", kind: "Inspection follow-up" },
  { date: "2026-10-20", title: "Maintenance contract — West Bay Jewellery", kind: "Maintenance contract" },
  { date: "2026-10-28", title: "SSD registration renewal", kind: "Certificate" },
  { date: "2026-11-02", title: "Project certificate — West Bay Jewellery", kind: "Certificate" },
  { date: "2026-11-15", title: "Reinspection follow-up — Msheireb Tower B", kind: "Inspection follow-up" },
  { date: "2026-12-01", title: "Technical datasheet pack refresh", kind: "Document renewal" },
  { date: "2027-02-15", title: "MOI/SSD company approval", kind: "MOI-related reminder" },
];

export const MOI_CHECKLIST: { group: string; items: { label: string; status: DocState }[] }[] = [
  { group: "Company approval documents", items: [{ label: "MOI/SSD approval certificate", status: "Approved" }, { label: "SSD registration", status: "Pending" }, { label: "Commercial registration", status: "Approved" }] },
  { group: "Project design package", items: [{ label: "Design approval form", status: "Submitted" }, { label: "Client authorization letter", status: "Missing" }] },
  { group: "CCTV layout and camera schedule", items: [{ label: "Layout drawings (stamped)", status: "Approved" }, { label: "Camera schedule with FOV", status: "Rejected" }] },
  { group: "Technical specifications", items: [{ label: "Camera datasheets", status: "Approved" }, { label: "NVR / storage datasheets", status: "Missing" }] },
  { group: "Installation evidence", items: [{ label: "Installation photos", status: "Pending" }, { label: "Cable test records", status: "Pending" }] },
  { group: "Testing and commissioning", items: [{ label: "Commissioning report", status: "Pending" }, { label: "Recording retention test", status: "Pending" }] },
  { group: "Inspection readiness", items: [{ label: "Inspection request form", status: "Submitted" }, { label: "Site access arranged", status: "Pending" }] },
  { group: "Maintenance contract", items: [{ label: "Signed AMC contract", status: "Expired" }] },
  { group: "Certificate / handover documents", items: [{ label: "MOI certificate copy", status: "Pending" }, { label: "Handover pack", status: "Pending" }] },
];

export const docTone = (s: string) =>
  (["Approved", "Valid", "Passed", "Issued", "Certificate Valid", "Design Approved", "Not Required"].includes(s) ? "success"
  : ["Missing", "Rejected", "Expired", "Failed", "Critical", "Corrections Requested", "Reinspection Required"].includes(s) ? "critical"
  : ["Submitted", "Under Review", "Scheduled", "Renewal In Progress", "In Progress", "Requested"].includes(s) ? "info"
  : ["Expiring Soon", "High", "Medium", "Pending"].includes(s) ? "warning" : "neutral") as "success" | "critical" | "info" | "warning" | "neutral";

export const daysLeftLabel = (iso?: string) => {
  if (!iso) return "—";
  const d = Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
  return d < 0 ? `Expired ${-d}d ago` : d === 0 ? "Due today" : `${d} days left`;
};
