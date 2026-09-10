import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill, StatTile, TableShell } from "@/components/app/common";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [
    { title: "Employees | AL HARIB CCTV COMPANY" },
    { name: "description", content: "Workload, availability and open task assignments for the field and office team." },
  ] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const d = useData();
  const available = d.employees.filter((e) => e.availability === "Available").length;
  const busy = d.employees.filter((e) => e.availability === "Busy").length;
  const onLeave = d.employees.filter((e) => e.availability === "On Leave").length;

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#2F83FF] shadow-[0_0_8px_#2F83FF]" />Workforce</>}
        title="Employees"
        subtitle="Workload, availability, and assignments"
      />

      <div className="rise rise-1 mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Team Size" value={d.employees.length} accent="blue" />
        <StatTile label="Available" value={available} accent="green" />
        <StatTile label="Busy" value={busy} accent="amber" />
        <StatTile label="On Leave" value={onLeave} accent="cyan" />
      </div>

      <div className="rise rise-2">
        <TableShell>
          <thead>
            <tr>
              {["Name", "Role", "Department", "Phone", "Load", "Availability", "Tasks due"].map((h) => (
                <th key={h} className={h === "Tasks due" ? "text-right" : "text-left"}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.employees.map((e) => {
              const td = d.tasks.filter((t) => t.assigneeId === e.id && t.status !== "Completed").length;
              return (
                <tr key={e.id}>
                  <td className="text-foreground">{e.name}</td>
                  <td className="text-xs text-muted-foreground">{e.role}</td>
                  <td className="text-xs text-muted-foreground">{e.department}</td>
                  <td className="num text-xs">{e.phone}</td>
                  <td><StatusPill status={e.workload > 80 ? "Heavy" : e.workload > 55 ? "Steady" : "Light"} tone={e.workload > 80 ? "warning" : e.workload > 55 ? "info" : "neutral"} /></td>
                  <td><StatusPill status={e.availability} tone={e.availability === "Available" ? "success" : e.availability === "Busy" ? "warning" : "neutral"} /></td>
                  <td className="num text-right">{td}</td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </div>
    </div>
  );
}
