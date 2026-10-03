import React, { useState, useMemo, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, FileText, HardHat, Wrench, Calendar, UserCircle2, Package, ShoppingCart,
  ShieldCheck, FolderOpen, UsersRound, BarChart3, Bell, Settings, Search, Plus, LogOut,
  PanelLeftClose, PanelLeftOpen, HelpCircle, ChevronRight, Menu, X, Radar, User, Sparkles, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROLES, useData, useUI } from "@/lib/data-context";
import { toast } from "sonner";
import { MonoChip } from "./common";

const NAV_GROUPS = [
  { group: "Main", items: [
    { to: "/", label: "Command Center", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: HardHat },
    { to: "/field", label: "Field Operations", icon: Wrench },
    { to: "/calendar", label: "Calendar", icon: Calendar },
  ]},
  { group: "Sales", items: [
    { to: "/sales", label: "Sales", icon: Users },
    { to: "/surveys", label: "Site Surveys", icon: Radar },
    { to: "/customers", label: "Customers", icon: UserCircle2 },
  ]},
  { group: "Operations", items: [
    { to: "/equipment", label: "Equipment", icon: Package },
    { to: "/procurement", label: "Procurement", icon: ShoppingCart },
    { to: "/employees", label: "Employees", icon: UsersRound },
    { to: "/documents", label: "Documents", icon: FolderOpen },
  ]},
  { group: "After-Sales", items: [
    { to: "/service", label: "Service and AMC", icon: ShieldCheck },
  ]},
  { group: "Intelligence", items: [
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ]},
  { group: "System", items: [
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
] as const;

const PAGE_TITLES: Record<string, string> = {
  "": "Command Center", projects: "Projects", field: "Field Operations", calendar: "Calendar",
  sales: "Sales", surveys: "Site Surveys", customers: "Customers",
  equipment: "Equipment", procurement: "Procurement", employees: "Employees", documents: "Documents",
  service: "Service and AMC", reports: "Reports", notifications: "Notifications", settings: "Settings",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isField = path.startsWith("/field");

  useEffect(() => { setMobileOpen(false); }, [path]);

  if (isField) return <div className="min-h-screen bg-background text-foreground">{children}</div>;

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 opacity-70" style={{
        background: "radial-gradient(900px 420px at 12% -8%, rgba(47,131,255,0.10), transparent 62%), radial-gradient(700px 420px at 96% 4%, rgba(150,84,255,0.08), transparent 60%)",
      }} />

      {/* Desktop sidebar */}
      <aside className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-[222px]",
      )}>
        <SidebarInner collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[254px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl"
            style={{ animation: "riseIn 240ms cubic-bezier(.2,.7,.3,1) both" }}>
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent">
              <X className="h-4 w-4" />
            </button>
            <SidebarInner collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1680px] flex-1 px-3 pb-24 pt-4 md:px-6 md:pb-8 md:pt-5">{children}</main>
        <MobileTabBar />
      </div>
    </div>
  );
}

function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", compact && "justify-center")}>
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ background: "linear-gradient(140deg,#2F83FF,#18D5FF 55%,#9654FF)", boxShadow: "0 12px 28px -14px rgba(47,131,255,0.9)" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#04101F" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 9.5 14.5 4.8l2.6 5.6L6.6 15z" />
          <path d="M9 15.6V20" /><path d="M6 20h6" />
        </svg>
      </div>
      {!compact && (
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold leading-tight tracking-[0.06em] text-white">SecureX</div>
          <div className="text-[8.5px] font-semibold uppercase tracking-[0.22em] text-[#66778D]">CCTV Company</div>
        </div>
      )}
    </div>
  );
}

function SidebarInner({ collapsed, onToggle, onNavigate }: { collapsed: boolean; onToggle: () => void; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useUI();
  return (
    <>
      <div className={cn("px-3.5 pb-3 pt-4", collapsed && "px-2")}>
        <Logo compact={collapsed} />
        {!collapsed && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[rgba(32,211,154,0.20)] bg-[rgba(32,211,154,0.07)] px-2.5 py-1.5">
            <span className="live-dot" />
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#20D39A]">Operations online</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-3.5 overflow-y-auto px-2 py-2">
        {NAV_GROUPS.map((g) => (
          <div key={g.group}>
            {!collapsed && <div className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4A5B71]">{g.group}</div>}
            <div className="space-y-[3px]">
              {g.items.map((n) => {
                const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={onNavigate}
                    title={collapsed ? n.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[12.5px] transition-all duration-150",
                      active
                        ? "bg-signal font-semibold text-white shadow-[0_10px_26px_-12px_rgba(47,131,255,0.95)]"
                        : "text-[#8494A8] hover:bg-[rgba(133,164,204,0.07)] hover:text-white",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className={cn("h-[16px] w-[16px] shrink-0", active && "text-white")} />
                    {!collapsed && <span className="truncate">{n.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2.5">
        {!collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent p-2 text-left transition-colors hover:border-sidebar-primary/35">
                <span className="relative">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(47,131,255,0.16)] text-[11px] font-semibold text-signal">YE</span>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar-accent bg-success" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-medium text-white">Yousef Al-Emadi</span>
                  <span className="block truncate text-[10px] text-sidebar-foreground">{role}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-xs">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={() => toast("Profile (demo)")}>Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => toast("Preferences (demo)")}>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={() => toast("Signed out (demo)")}><LogOut className="mr-2 h-3.5 w-3.5" />Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(47,131,255,0.16)] text-[11px] font-semibold text-signal mx-auto">YE</div>
        )}
        <button
          onClick={onToggle}
          className={cn("mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-[11px] text-[#66778D] transition-colors hover:bg-[rgba(133,164,204,0.07)] hover:text-white")}
        >
          {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <><PanelLeftClose className="h-3.5 w-3.5" /> Collapse</>}
        </button>
      </div>
    </>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { role, setRole, density, setDensity, theme, setTheme } = useUI();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const parts = useMemo(() => path.split("/").filter(Boolean), [path]);
  const title = PAGE_TITLES[parts[0] ?? ""] ?? (parts[0] ?? "Command Center");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--topbar-bg)] backdrop-blur-xl">
      <div className="flex h-[58px] items-center gap-2 px-3 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}><Menu className="h-5 w-5" /></Button>

        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">{title}</div>
          <div className="hidden items-center gap-1.5 text-[10.5px] text-muted-foreground md:flex">
            <Link to="/" className="hover:text-foreground">SecureX</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="capitalize text-muted-foreground">{title}</span>
            {parts[1] && <><ChevronRight className="h-3 w-3" /><MonoChip>{parts[1]}</MonoChip></>}
          </div>
        </div>

        <div className="flex-1" />
        <GlobalSearch />
        <QuickCreate />

        <Select value={role} onValueChange={(v) => { setRole(v as never); toast(`Role preview: ${v}`); }}>
          <SelectTrigger className="hidden h-9 w-[172px] rounded-xl border-border bg-card text-[11.5px] lg:flex"><SelectValue /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
        </Select>

        <IconBtn onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")} title={`Density: ${density}`}>
          <span className="font-mono text-[9px] uppercase">{density === "compact" ? "Cmp" : "Cmf"}</span>
        </IconBtn>
        <IconBtn onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </IconBtn>
        <IconBtn onClick={() => nav({ to: "/notifications" })} title="Notifications">
          <span className="relative"><Bell className="h-4 w-4" /><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#FF4664]" /></span>
        </IconBtn>
        <IconBtn onClick={() => toast("Help center opens shortly.")} title="Help"><HelpCircle className="h-4 w-4" /></IconBtn>
        <div className="ml-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-signal/30 bg-signal-soft text-[11px] font-semibold text-signal">YE</div>
      </div>
    </header>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-signal/40 hover:bg-accent hover:text-foreground sm:inline-flex"
    >
      {children}
    </button>
  );
}

const MOBILE_TABS = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: HardHat },
  { to: "/field", label: "Field", icon: Wrench },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/settings", label: "Profile", icon: User },
] as const;

function MobileTabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  return (
    <>
      <button
        onClick={() => nav({ to: "/projects" })}
        className="fixed bottom-[74px] right-4 z-40 grid h-13 w-13 place-items-center rounded-full p-4 text-white shadow-[0_18px_40px_-14px_rgba(47,131,255,0.9)] md:hidden"
        style={{ background: "linear-gradient(140deg,#2F83FF,#18D5FF)" }}
        aria-label="Create"
      >
        <Plus className="h-5 w-5" />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--topbar-bg)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_TABS.map((t) => {
            const active = t.to === "/" ? path === "/" : path.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to} className="flex flex-col items-center gap-1 py-2.5">
                <span className={cn("grid h-8 w-12 place-items-center rounded-xl transition-all", active ? "bg-signal text-signal-foreground shadow-[0_10px_22px_-12px_var(--glow)]" : "text-muted-foreground")}>
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className={cn("text-[9.5px] font-medium", active ? "text-foreground" : "text-muted-foreground")}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const d = useData();
  const nav = useNavigate();
  const results = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return [] as { group: string; label: string; sub: string; go: () => void }[];
    const out: { group: string; label: string; sub: string; go: () => void }[] = [];
    d.projects.filter((p) => (p.name + p.number).toLowerCase().includes(term)).slice(0, 5).forEach((p) => out.push({ group: "Projects", label: p.name, sub: p.number, go: () => nav({ to: "/projects/$id", params: { id: p.id } }) }));
    d.customers.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 5).forEach((c) => out.push({ group: "Customers", label: c.name, sub: c.contact, go: () => nav({ to: "/customers/$id", params: { id: c.id } }) }));
    d.leads.filter((l) => (l.company + l.contactName).toLowerCase().includes(term)).slice(0, 5).forEach((l) => out.push({ group: "Leads", label: l.company, sub: l.stage, go: () => nav({ to: "/sales" }) }));
    d.devices.filter((dv) => (dv.label + dv.serial + dv.ip + dv.mac).toLowerCase().includes(term)).slice(0, 5).forEach((dv) => out.push({ group: "Devices", label: dv.label + " · " + dv.model, sub: dv.serial, go: () => nav({ to: "/projects/$id", params: { id: dv.projectId } }) }));
    d.employees.filter((e) => e.name.toLowerCase().includes(term)).slice(0, 5).forEach((e) => out.push({ group: "Employees", label: e.name, sub: e.role, go: () => nav({ to: "/employees" }) }));
    d.tickets.filter((t) => (t.title + t.number).toLowerCase().includes(term)).slice(0, 5).forEach((t) => out.push({ group: "Tickets", label: t.title, sub: t.number, go: () => nav({ to: "/service" }) }));
    d.documents.filter((doc) => doc.name.toLowerCase().includes(term)).slice(0, 5).forEach((doc) => out.push({ group: "Documents", label: doc.name, sub: doc.category, go: () => nav({ to: "/documents" }) }));
    return out;
  }, [q, d, nav]);
  const grouped = useMemo(() => {
    const g: Record<string, typeof results> = {};
    results.forEach((r) => { (g[r.group] ||= []).push(r); });
    return g;
  }, [results]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hidden h-9 w-[190px] items-center gap-2 rounded-full border border-border bg-card px-3.5 text-[11.5px] text-muted-foreground transition-colors hover:border-signal/40 md:flex lg:w-[300px] xl:w-[380px]">
          <Search className="h-3.5 w-3.5" />
          <span className="truncate">Search projects, customers, cameras, documents…</span>
          <kbd className="ml-auto hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] lg:inline">⌘K</kbd>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl border-border bg-popover p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input autoFocus placeholder="Search projects, customers, cameras, documents…" value={q} onChange={(e) => setQ(e.target.value)} className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0" />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim() === "" && <div className="p-4 text-[11.5px] text-muted-foreground">Try: camera CP-01, project AHC-PRO-2026-041, customer Msheireb, IP 10.20.30.101.</div>}
          {q.trim() !== "" && Object.keys(grouped).length === 0 && <div className="p-4 text-[11.5px] text-muted-foreground">No results.</div>}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="label-xs px-2 py-1">{group}</div>
              {items.map((r, i) => (
                <button key={i} onClick={() => { r.go(); setOpen(false); setQ(""); }} className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-muted">
                  <div className="min-w-0"><div className="truncate text-[13px]">{r.label}</div><div className="truncate text-[11px] text-muted-foreground">{r.sub}</div></div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickCreate() {
  const nav = useNavigate();
  const items = [
    { l: "New lead", go: () => nav({ to: "/sales" }) },
    
    { l: "New site survey", go: () => nav({ to: "/surveys" }) },
    { l: "New project", go: () => nav({ to: "/projects" }) },
    { l: "New task", go: () => nav({ to: "/projects" }) },
    { l: "New site visit", go: () => nav({ to: "/calendar" }) },
    { l: "New service ticket", go: () => nav({ to: "/service" }) },
    { l: "New purchase request", go: () => nav({ to: "/procurement" }) },
    { l: "Upload document", go: () => nav({ to: "/documents" }) },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-[image:var(--action-gradient)] px-3 text-[12.5px] font-semibold text-signal-foreground shadow-[0_12px_28px_-14px_var(--glow)] transition-transform hover:-translate-y-[1px]">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Create</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs"><Sparkles className="h-3.5 w-3.5 text-signal" /> Quick Create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((i) => <DropdownMenuItem key={i.l} onClick={i.go} className="text-xs">{i.l}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
