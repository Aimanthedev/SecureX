import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader, StatusPill, ProgressBar } from "@/components/app/common";
import { Card } from "@/components/ui/card";
export const Route = createFileRoute("/employees")({ head: () => ({ meta: [{ title: "Employees | AL HARIB CCTV COMPANY" }] }), component: EmployeesPage });
function EmployeesPage() {
  const d = useData();
  return (
    <div>
      <PageHeader title="Employees" subtitle="Workload, availability, and assignments" />
      <Card className="p-0"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-muted-foreground bg-muted/40"><tr>{["Name","Role","Department","Phone","Workload","Availability","Tasks due"].map((h) => <th key={h} className="text-left py-2 px-3">{h}</th>)}</tr></thead><tbody>{d.employees.map((e) => { const td = d.tasks.filter((t)=>t.assigneeId===e.id && t.status!=="Completed").length; return (<tr key={e.id} className="border-t hairline"><td className="py-2 px-3">{e.name}</td><td className="py-2 px-3 text-xs">{e.role}</td><td className="py-2 px-3 text-xs">{e.department}</td><td className="py-2 px-3 num text-xs">{e.phone}</td><td className="py-2 px-3 w-40"><ProgressBar value={e.workload} /></td><td className="py-2 px-3"><StatusPill status={e.availability} tone={e.availability==="Available"?"success":e.availability==="Busy"?"warning":"neutral"} /></td><td className="py-2 px-3 num">{td}</td></tr>);})}</tbody></table></Card>
    </div>
  );
}
