import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill, StatTile, Panel, EmptyState } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildAlerts } from "@/lib/alerts";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "Notifications | SecureX CCTV COMPANY" },
    { name: "description", content: "Critical, warning and informational signals across the platform." },
    { property: "og:title", content: "Notifications | SecureX CCTV COMPANY" },
    { property: "og:description", content: "Critical, warning and informational signals across the platform." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: NotifPage,
});

const GROUPS = ["All", "Unread", "Projects", "Payments", "Materials", "Approvals", "Service", "Procurement"];

function NotifPage() {
  const nav = useNavigate();
  const d = useData();
  const [group, setGroup] = useState("All");
  const all = useMemo(() => buildAlerts({ ...d.selectorCtx, purchaseOrders: d.purchaseOrders, amc: d.amc, tickets: d.tickets, customers: d.customers }), [d]);
  const unreadCount = all.filter((n) => !d.readNotificationIds.includes(n.id)).length;
  const critical = all.filter((n) => n.severity === "critical").length;
  const warning = all.filter((n) => n.severity === "warning").length;

  const filtered = all.filter((n) => {
    if (group === "All") return true;
    if (group === "Unread") return !d.readNotificationIds.includes(n.id);
    return n.group === group;
  });

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#FF4664] shadow-[0_0_8px_#FF4664]" />Alert Center</>}
        title="Notifications"
        subtitle="Signals across the platform, derived from live operational data"
        actions={
          <Button size="sm" variant="outline" className="border-input bg-transparent" onClick={() => { d.markAllNotificationsRead(all.map((n) => n.id)); toast("All marked read."); }}>
            Mark all read
          </Button>
        }
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Unread" value={unreadCount} accent="red" />
        <StatTile label="Critical" value={critical} accent="red" />
        <StatTile label="Warning" value={warning} accent="amber" />
        <StatTile label="Total" value={all.length} accent="blue" />
      </div>

      <Tabs value={group} onValueChange={setGroup} className="rise rise-2 mb-3">
        <TabsList>
          {GROUPS.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Panel className="rise rise-3" pad={false}>
        {filtered.length === 0 ? (
          <div className="p-4"><EmptyState title="Nothing here" hint="No signals match this filter." /></div>
        ) : (
          <div className="divide-y divide-[rgba(133,164,204,0.10)]">
            {filtered.map((n) => {
              const read = d.readNotificationIds.includes(n.id);
              return (
                <div key={n.id} className={`flex items-center gap-3 p-3.5 ${!read ? "bg-[rgba(47,131,255,0.05)]" : ""}`}>
                  <div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background: n.severity === "critical" ? "#FF4664" : n.severity === "warning" ? "#FFAA2C" : "#2F83FF",
                      boxShadow: `0 0 8px ${n.severity === "critical" ? "#FF4664" : n.severity === "warning" ? "#FFAA2C" : "#2F83FF"}`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-foreground">{n.title}</div>
                    <div className="label-xs mt-0.5">{n.group} · {n.sub}</div>
                  </div>
                  <StatusPill status={n.severity === "critical" ? "Critical" : n.severity === "warning" ? "Warning" : "Info"} tone={n.severity === "critical" ? "critical" : n.severity === "warning" ? "warning" : "info"} />
                  {!read && (
                    <Button size="sm" variant="ghost" onClick={() => d.markNotificationRead(n.id)}>Mark read</Button>
                  )}
                  {n.path && (
                    <Button size="sm" variant="ghost" className="text-signal hover:text-signal" onClick={() => { d.markNotificationRead(n.id); nav({ to: n.path as never }); }}>
                      Open
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
