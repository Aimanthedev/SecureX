import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, MonoChip, StatusPill, Panel, PanelHead, StatTile, TableShell, EmptyState } from "@/components/app/common";
import { fmtQAR, fmtDate } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/customers/$id")({
  head: () => ({ meta: [{ title: "Customer | AL HARIB CCTV COMPANY" }] }),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = useParams({ from: "/customers/$id" });
  const d = useData();
  const c = d.customers.find((x) => x.id === id);
  if (!c) {
    return (
      <EmptyState
        title="Customer not found"
        hint="This account may have been removed."
        action={<Link to="/customers" className="text-signal text-sm">Back to customers</Link>}
      />
    );
  }
  const projs = d.projects.filter((p) => p.customerId === c.id);
  const sites = d.sites.filter((s) => s.customerId === c.id);
  const outstanding = projs.reduce((s, p) => s + (p.invoiced - p.collected), 0);

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#2F83FF] shadow-[0_0_8px_#2F83FF]" />Customer Account</>}
        title={c.name}
        subtitle={`${c.industry} · Customer since ${fmtDate(c.since)}`}
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Projects" value={projs.length} accent="blue" />
        <StatTile label="Sites" value={sites.length} accent="cyan" />
        <StatTile label="Contracted" value={fmtQAR(projs.reduce((s, p) => s + p.contractValue, 0), { compact: true })} accent="purple" />
        <StatTile label="Outstanding" value={fmtQAR(outstanding, { compact: true })} accent="amber" />
      </div>

      <Tabs defaultValue="overview" className="rise rise-2">
        <TabsList>
          {["Overview", "Contacts", "Sites", "Projects", "AMC", "Tickets", "Documents"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase()}>{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Panel accent="blue" texture="grid">
            <PanelHead title="Contact & Address" accent="blue" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
              <div>
                <div className="label-xs">Main contact</div>
                <div className="mt-1 text-foreground">{c.contact}</div>
                <div className="num mt-0.5 text-xs text-muted-foreground">{c.phone}</div>
                <div className="text-xs text-muted-foreground">{c.email}</div>
              </div>
              <div>
                <div className="label-xs">Address</div>
                <div className="mt-1 text-foreground">{c.address}</div>
              </div>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="sites" className="mt-4">
          {sites.length === 0 ? (
            <EmptyState title="No sites recorded" />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {sites.map((s) => (
                <Panel key={s.id} accent="cyan">
                  <div className="font-medium text-foreground">{s.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.address}</div>
                </Panel>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <TableShell>
            <thead>
              <tr>{["Number", "Name", "Phase", "Value", "Planned end"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {projs.map((p) => (
                <tr key={p.id}>
                  <td><MonoChip>{p.number}</MonoChip></td>
                  <td><Link to="/projects/$id" params={{ id: p.id }} className="text-signal">{p.name}</Link></td>
                  <td><StatusPill status={p.phase} tone="info" /></td>
                  <td className="num">{fmtQAR(p.contractValue, { compact: true })}</td>
                  <td className="num text-xs">{fmtDate(p.plannedEnd)}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </TabsContent>

        {["contacts", "amc", "tickets", "documents"].map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            <EmptyState title={`No ${t} records to display`} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
