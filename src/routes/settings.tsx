import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, PanelHead } from "@/components/app/common";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUI } from "@/lib/data-context";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings | AL HARIB CCTV COMPANY" },
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
              <Field label="Company name"><Input defaultValue="AL HARIB CCTV COMPANY" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Currency"><Input defaultValue="QAR" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Tax rate"><Input defaultValue="0%" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Date format"><Input defaultValue="dd MMM yyyy" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="nu" className="mt-3">
          <Panel accent="cyan" texture="grid">
            <PanelHead title="Numbering Formats" sub="Document series conventions" accent="cyan" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Project number format"><Input defaultValue="AHC-PRO-2026-000" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Work order format"><Input defaultValue="AHC-WO-2026-000" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="Purchase order format"><Input defaultValue="AHC-PO-2026-000" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
              <Field label="AMC format"><Input defaultValue="AHC-AMC-2026-000" className="border-[rgba(133,164,204,0.16)] bg-[#0D1929]" /></Field>
            </div>
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
              {["Failed test alerts", "Overdue PO alerts", "AMC expiring alerts", "Client approval reminders", "Payment collection reminders"].map((n) => (
                <li key={n} className="flex items-center justify-between rounded-lg border border-[rgba(133,164,204,0.10)] bg-[rgba(133,164,204,0.03)] px-3 py-2">
                  <span className="text-foreground/90">{n}</span>
                  <input type="checkbox" defaultChecked className="accent-signal" />
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="da" className="mt-3">
          <Panel accent="green" texture="dots">
            <PanelHead title="Data Management" sub="Export and portability" accent="green" />
            <Button variant="outline" className="border-[rgba(133,164,204,0.18)] bg-transparent" onClick={() => toast("Export prepared (demo).")}>Export all data</Button>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
