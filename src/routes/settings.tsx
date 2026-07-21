import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/common";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUI } from "@/lib/data-context";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export const Route = createFileRoute("/settings")({ head: () => ({ meta: [{ title: "Settings | AL HARIB CCTV COMPANY" }] }), component: SettingsPage });
function SettingsPage() {
  const { theme, setTheme, lang, setLang } = useUI();
  return (
    <div>
      <PageHeader title="Settings" subtitle="Company, appearance, numbering, and preferences" />
      <Tabs defaultValue="co">
        <TabsList>{["Company","Numbering","Appearance","Language","Notifications","Data"].map((t) => <TabsTrigger key={t} value={t.toLowerCase().slice(0,2)}>{t}</TabsTrigger>)}</TabsList>
        <TabsContent value="co" className="mt-3"><Card className="p-4 grid grid-cols-2 gap-3 text-sm"><label><span className="text-xs text-muted-foreground">Company name</span><Input defaultValue="AL HARIB CCTV COMPANY" /></label><label><span className="text-xs text-muted-foreground">Currency</span><Input defaultValue="QAR" /></label><label><span className="text-xs text-muted-foreground">Tax rate</span><Input defaultValue="0%" /></label><label><span className="text-xs text-muted-foreground">Date format</span><Input defaultValue="dd MMM yyyy" /></label></Card></TabsContent>
        <TabsContent value="nu" className="mt-3"><Card className="p-4 grid grid-cols-2 gap-3 text-sm"><label><span className="text-xs text-muted-foreground">Project number format</span><Input defaultValue="AHC-PRO-2026-000" /></label><label><span className="text-xs text-muted-foreground">Quotation format</span><Input defaultValue="AHC-QTN-2026-000" /></label><label><span className="text-xs text-muted-foreground">Purchase order format</span><Input defaultValue="AHC-PO-2026-000" /></label><label><span className="text-xs text-muted-foreground">AMC format</span><Input defaultValue="AHC-AMC-2026-000" /></label></Card></TabsContent>
        <TabsContent value="ap" className="mt-3"><Card className="p-4 grid grid-cols-2 gap-3 text-sm"><label><span className="text-xs text-muted-foreground">Theme</span><Select value={theme} onValueChange={(v) => setTheme(v as never)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select></label></Card></TabsContent>
        <TabsContent value="la" className="mt-3"><Card className="p-4 grid grid-cols-2 gap-3 text-sm"><label><span className="text-xs text-muted-foreground">Language</span><Select value={lang} onValueChange={(v) => { setLang(v as never); toast("Language preference saved."); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">العربية (RTL stub)</SelectItem></SelectContent></Select></label></Card></TabsContent>
        <TabsContent value="no" className="mt-3"><Card className="p-4 text-sm"><ul className="space-y-2">{["Failed test alerts","Overdue PO alerts","AMC expiring alerts","Client approval reminders","Payment collection reminders"].map((n) => (<li key={n} className="flex items-center justify-between"><span>{n}</span><input type="checkbox" defaultChecked className="accent-signal" /></li>))}</ul></Card></TabsContent>
        <TabsContent value="da" className="mt-3"><Card className="p-4 text-sm"><Button variant="outline" onClick={() => toast("Export prepared (demo).")}>Export all data</Button></Card></TabsContent>
      </Tabs>
    </div>
  );
}
