import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/lib/data-context";
import { PageHeader } from "@/components/app/common";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { fmtQAR } from "@/lib/format";
export const Route = createFileRoute("/reports")({ head: () => ({ meta: [{ title: "Reports | AL HARIB CCTV COMPANY" }] }), component: ReportsPage });
const CATS = ["Executive","Project","Sales","Financial","Service and AMC","Compliance and Quality"];
function ReportsPage() {
  const d = useData();
  const planActual = d.projects.map((p) => ({ name: p.number.split("-").pop(), planned: p.plannedProgress, actual: p.actualProgress }));
  const cams = [{name:"Planned", v: d.devices.length},{name:"Installed",v:d.devices.filter((x)=>x.status!=="Faulty").length},{name:"Tested",v:d.devices.filter((x)=>x.testResult==="Pass").length},{name:"Failed",v:d.devices.filter((x)=>x.testResult==="Fail").length}];
  const collected = [{m:"Feb",v:120000},{m:"Mar",v:180000},{m:"Apr",v:260000},{m:"May",v:340000},{m:"Jun",v:410000},{m:"Jul",v:305000}];
  return (
    <div>
      <PageHeader title="Reports" subtitle="Business answers, not decoration" actions={<><Button variant="outline" size="sm" onClick={() => toast("Saved view")}>Save view</Button><Button variant="outline" size="sm" onClick={() => toast("CSV exported (demo)")}>Export CSV</Button><Button size="sm" onClick={() => window.print()}>Print</Button></>} />
      <Tabs defaultValue={CATS[0]}><TabsList>{CATS.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}</TabsList>
        <TabsContent value="Executive" className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4"><div className="text-sm font-medium mb-2">Planned vs Actual (by project)</div><div className="h-56"><ResponsiveContainer><BarChart data={planActual}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip contentStyle={{fontSize:12}} /><Bar dataKey="planned" fill="var(--muted-foreground)" /><Bar dataKey="actual" fill="var(--signal)" /></BarChart></ResponsiveContainer></div></Card>
          <Card className="p-4"><div className="text-sm font-medium mb-2">Cameras planned vs installed vs tested</div><div className="h-56"><ResponsiveContainer><BarChart data={cams}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip contentStyle={{fontSize:12}} /><Bar dataKey="v" fill="var(--signal)" /></BarChart></ResponsiveContainer></div></Card>
          <Card className="p-4 lg:col-span-2"><div className="text-sm font-medium mb-2">Collections trend</div><div className="h-56"><ResponsiveContainer><LineChart data={collected}><XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} tickFormatter={(v) => `${v/1000}K`} /><Tooltip contentStyle={{fontSize:12}} formatter={(v: number) => fmtQAR(v)} /><Line type="monotone" dataKey="v" stroke="var(--signal)" strokeWidth={2} /></LineChart></ResponsiveContainer></div></Card>
        </TabsContent>
        {CATS.slice(1).map((c) => <TabsContent key={c} value={c} className="mt-3"><Card className="p-6 text-sm text-muted-foreground">Reports in this category are available in the demo. Charts and drill-downs match the Executive template above.</Card></TabsContent>)}
      </Tabs>
    </div>
  );
}
