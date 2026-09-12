import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, StatusPill, StatTile, Panel } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "Notifications | SecureX CCTV COMPANY" },
    { name: "description", content: "Critical, warning and informational signals across the platform." },
  ] }),
  component: NotifPage,
});

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
  const unread = list.filter((n) => !n.read).length;
  const critical = list.filter((n) => n.p === "Critical").length;
  const warning = list.filter((n) => n.p === "Warning").length;

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#FF4664] shadow-[0_0_8px_#FF4664]" />Alert Center</>}
        title="Notifications"
        subtitle="Signals across the platform"
        actions={
          <Button size="sm" variant="outline" className="border-[rgba(133,164,204,0.18)] bg-transparent" onClick={() => { setList(list.map((n) => ({ ...n, read: true }))); toast("All marked read."); }}>
            Mark all read
          </Button>
        }
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Unread" value={unread} accent="red" />
        <StatTile label="Critical" value={critical} accent="red" />
        <StatTile label="Warning" value={warning} accent="amber" />
        <StatTile label="Total" value={list.length} accent="blue" />
      </div>

      <Tabs defaultValue="all" className="rise rise-2 mb-3">
        <TabsList>
          {["all", "unread", "Projects", "Payments", "Materials", "Approvals", "Service"].map((t) => (
            <TabsTrigger key={t} value={t}>{t === "all" ? "All" : t === "unread" ? "Unread" : t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Panel className="rise rise-3" pad={false}>
        <div className="divide-y divide-[rgba(133,164,204,0.10)]">
          {list.map((n, i) => (
            <div key={i} className={`flex items-center gap-3 p-3.5 ${!n.read ? "bg-[rgba(47,131,255,0.05)]" : ""}`}>
              <div
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background: n.p === "Critical" ? "#FF4664" : n.p === "Warning" ? "#FFAA2C" : "#2F83FF",
                  boxShadow: `0 0 8px ${n.p === "Critical" ? "#FF4664" : n.p === "Warning" ? "#FFAA2C" : "#2F83FF"}`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground">{n.t}</div>
                <div className="label-xs mt-0.5">{n.g}</div>
              </div>
              <StatusPill status={n.p} tone={n.p === "Critical" ? "critical" : n.p === "Warning" ? "warning" : "info"} />
              {n.path && (
                <Button size="sm" variant="ghost" className="text-signal hover:text-signal" onClick={() => nav({ to: n.path as never })}>
                  Open
                </Button>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
