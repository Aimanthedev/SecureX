import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, PanelHead } from "@/components/app/common";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData, useUI } from "@/lib/data-context";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings | SecureX CCTV COMPANY" },
    { name: "description", content: "Company profile, numbering formats, appearance, language and data preferences." },
  ] }),
  component: SettingsPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-xs">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function SettingsPage() {
  const { theme, setTheme, lang, setLang } = useUI();
  const d = useData();
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <div>
      <PageHeader
        eyebrow={<><span className="h-1.5 w-1.5 rounded-full bg-[#66778D] shadow-[0_0_8px_#66778D]" />Configuration</>}
        title="Settings"
        subtitle="Company, appearance, numbering, and preferences"
      />

      <Tabs defaultValue="co" className="rise rise-1">
        <TabsList>
          {["Company", "Numbering", "Appearance", "Language", "Notifications", "Data"].map((t) => (
            <TabsTrigger key={t} value={t.toLowerCase().slice(0, 2)}>{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="co" className="mt-3">
          <Panel accent="blue" texture="grid">
            <PanelHead title="Company Profile" sub="Legal identity and formatting defaults" accent="blue" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Company name"><Input value={d.companyProfile.name} onChange={(e) => d.setCompanyProfile({ name: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Currency"><Input value={d.companyProfile.currency} onChange={(e) => d.setCompanyProfile({ currency: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Tax rate"><Input value={d.companyProfile.taxRate} onChange={(e) => d.setCompanyProfile({ taxRate: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Date format"><Input value={d.companyProfile.dateFormat} onChange={(e) => d.setCompanyProfile({ dateFormat: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
            </div>
            <div className="mt-4"><Button size="sm" onClick={() => toast.success("Company profile saved.")} className="bg-signal text-white hover:bg-signal/90">Save</Button></div>
          </Panel>
        </TabsContent>

        <TabsContent value="nu" className="mt-3">
          <Panel accent="cyan" texture="grid">
            <PanelHead title="Numbering Formats" sub="Document series conventions" accent="cyan" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Project number format"><Input value={d.numberingFormats.project} onChange={(e) => d.setNumberingFormats({ project: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Work order format"><Input value={d.numberingFormats.workOrder} onChange={(e) => d.setNumberingFormats({ workOrder: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Purchase order format"><Input value={d.numberingFormats.purchaseOrder} onChange={(e) => d.setNumberingFormats({ purchaseOrder: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="AMC format"><Input value={d.numberingFormats.amc} onChange={(e) => d.setNumberingFormats({ amc: e.target.value })} className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
            </div>
            <div className="mt-4"><Button size="sm" onClick={() => toast.success("Numbering formats saved.")} className="bg-signal text-white hover:bg-signal/90">Save</Button></div>
          </Panel>
        </TabsContent>

        <TabsContent value="ap" className="mt-3">
          <Panel accent="purple" texture="grid">
            <PanelHead title="Appearance" sub="Interface theme" accent="purple" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Theme">
                <Select value={theme} onValueChange={(v) => setTheme(v as never)}>
                  <SelectTrigger className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="la" className="mt-3">
          <Panel accent="magenta" texture="grid">
            <PanelHead title="Language" sub="Interface locale" accent="magenta" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Language">
                <Select value={lang} onValueChange={(v) => { setLang(v as never); toast("Language preference saved."); }}>
                  <SelectTrigger className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية (RTL stub)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="no" className="mt-3">
          <Panel accent="amber" texture="dots">
            <PanelHead title="Notification Preferences" sub="Alert triggers" accent="amber" />
            <ul className="space-y-2 text-sm">
              {Object.keys(d.notificationPrefs).map((n) => (
                <li key={n} className="flex items-center justify-between rounded-lg border border-[rgba(133,164,204,0.10)] bg-[rgba(133,164,204,0.03)] px-3 py-2">
                  <span className="text-foreground/90">{n}</span>
                  <input type="checkbox" checked={d.notificationPrefs[n]} onChange={() => d.toggleNotificationPref(n)} className="accent-signal" />
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="da" className="mt-3">
          <Panel accent="green" texture="dots">
            <PanelHead title="Data Management" sub="Export and portability" accent="green" />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-[rgba(133,164,204,0.18)] bg-transparent" onClick={() => exportAllData(d)}>Export all data (JSON)</Button>
              <Button variant="outline" className="border-[rgba(255,70,100,0.3)] bg-transparent text-[#FF4664] hover:bg-[rgba(255,70,100,0.08)]" onClick={() => setResetOpen(true)}>Reset demo data</Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Reset clears everything you've created or changed locally and restores the original demo dataset shipped with the app.</p>
          </Panel>
        </TabsContent>
      </Tabs>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
            <AlertDialogDescription>This clears every local edit, created record and preference and restores the original SecureX demo dataset. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { d.resetDemoData(); setResetOpen(false); toast.success("Demo data reset to defaults."); }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function exportAllData(d: ReturnType<typeof useData>) {
  const payload = {
    customers: d.customers, projects: d.projects, leads: d.leads, tickets: d.tickets,
    amc: d.amc, documents: d.documents, products: d.products, employees: d.employees,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "securex-data-export.json"; a.click();
  URL.revokeObjectURL(url);
  toast.success("Data exported.");
}
