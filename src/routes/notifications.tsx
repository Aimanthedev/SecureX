import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatusPill } from "@/components/app/common";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
export const Route = createFileRoute("/notifications")({ head: () => ({ meta: [{ title: "Notifications | AL HARIB CCTV COMPANY" }] }), component: NotifPage });
const NOTIFS = [
  { g: "Projects", t: "3 devices failed testing on AHC-PRO-2026-041", p: "Critical", read: false, path: "/projects/P-041" },
  { g: "Payments", t: "Payment PC-3 due in 5 days for AHC-PRO-2026-041", p: "Warning", read: false },
  { g: "Materials", t: "PO-338 overdue by 5 days", p: "Critical", read: false },
  { g: "Approvals", t: "Client approval pending: NVR retention policy", p: "Warning", read: false },
  { g: "Service", t: "AMC AHC-AMC-2025-014 expires in 12 days", p: "Warning", read: false },
  { g: "Sales", t: "Lead 'Aspire Zone Foundation' verbal approval received", p: "Info", read: true },
  { g: "Compliance", t: "MoI Security Contractor Registration expires 30 Aug 2026", p: "Info", read: true },
];
function NotifPage() {
  const nav = useNavigate();
  const [list, setList] = useState(NOTIFS);
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Signals across the platform" actions={<Button size="sm" variant="outline" onClick={() => { setList(list.map((n)=>({...n,read:true}))); toast("All marked read."); }}>Mark all read</Button>} />
      <Tabs defaultValue="all"><TabsList>{["all","unread","Projects","Payments","Materials","Approvals","Service"].map((t) => <TabsTrigger key={t} value={t}>{t === "all" ? "All" : t === "unread" ? "Unread" : t}</TabsTrigger>)}</TabsList></Tabs>
      <Card className="p-0 mt-3 divide-y hairline">{list.map((n, i) => (
        <div key={i} className={`p-3 flex items-center gap-3 ${!n.read ? "bg-signal-soft/40" : ""}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${n.p==="Critical"?"bg-critical":n.p==="Warning"?"bg-warning":"bg-signal"}`} />
          <div className="flex-1 min-w-0"><div className="text-sm">{n.t}</div><div className="text-xs text-muted-foreground">{n.g}</div></div>
          <StatusPill status={n.p} tone={n.p==="Critical"?"critical":n.p==="Warning"?"warning":"info"} />
          {n.path && <Button size="sm" variant="ghost" onClick={() => nav({ to: n.path as never })}>Open</Button>}
        </div>
      ))}</Card>
    </div>
  );
}
