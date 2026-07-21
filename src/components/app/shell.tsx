import React, { useState, useMemo } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, FileText, ClipboardList, HardHat, Wrench, Calendar, UserCircle2, Package, ShoppingCart, ShieldCheck, FolderOpen, UsersRound, BarChart3, Bell, Settings, Search, Plus, Sun, Moon, LogOut, PanelLeftClose, PanelLeftOpen, HelpCircle, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ROLES, useData, useUI } from "@/lib/data-context";
import { toast } from "sonner";
import { MonoChip } from "./common";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/sales", label: "Sales", icon: Users },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/surveys", label: "Site Surveys", icon: ClipboardList },
  { to: "/projects", label: "Projects", icon: HardHat },
  { to: "/field", label: "Field Operations", icon: Wrench },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/customers", label: "Customers", icon: UserCircle2 },
  { to: "/equipment", label: "Equipment", icon: Package },
  { to: "/procurement", label: "Procurement", icon: ShoppingCart },
  { to: "/service", label: "Service and AMC", icon: ShieldCheck },
  { to: "/documents", label: "Documents", icon: FolderOpen },
  { to: "/employees", label: "Employees", icon: UsersRound },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isField = path.startsWith("/field");

  if (isField) return <div className="min-h-screen bg-background text-foreground">{children}</div>;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar - desktop */}
      <aside className={cn("hidden md:flex flex-col shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200", collapsed ? "w-16" : "w-60")}>
        <SidebarInner collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>
      {/* Sidebar - mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-60 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            <SidebarInner collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0 p-4 md:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({ collapsed, onToggle, onNavigate }: { collapsed: boolean; onToggle: () => void; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useUI();
  return (
    <>
      <div className={cn("flex items-center gap-2 px-3 py-4 border-b border-sidebar-border", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-md bg-brand grid place-items-center text-brand-foreground font-display font-bold shrink-0">A</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display font-bold text-[15px] leading-tight tracking-wide text-sidebar-primary-foreground">AL HARIB</div>
            <div className="text-[10px] uppercase tracking-widest text-brand font-medium">CCTV COMPANY</div>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((n) => {
          const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 mx-2 my-0.5 px-3 py-2 rounded-md text-[13px] transition-colors",
                active ? "bg-signal text-signal-foreground font-medium" : "hover:bg-sidebar-accent text-sidebar-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{n.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-2 text-[11px]">
            <div className="font-medium text-sidebar-primary-foreground">Yousef Al-Emadi</div>
            <div className="text-sidebar-foreground/70">{role}</div>
            <div className="text-sidebar-foreground/50 mt-0.5">AL HARIB CCTV COMPANY</div>
          </div>
        )}
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => toast("Signed out (demo)")}> <LogOut className="w-4 h-4" /> {!collapsed && <span className="text-xs">Log out</span>}</Button>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent ml-auto" onClick={onToggle}>
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { theme, setTheme, role, setRole, density, setDensity } = useUI();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const crumbs = useMemo(() => {
    const parts = path.split("/").filter(Boolean);
    return parts.length ? parts : ["command-center"];
  }, [path]);
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur border-b hairline">
      <div className="flex items-center gap-2 px-3 md:px-6 h-14">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}><PanelLeftOpen className="w-5 h-5" /></Button>
        <nav className="hidden md:flex items-center text-xs text-muted-foreground gap-1 min-w-0">
          <Link to="/" className="hover:text-foreground flex items-center gap-1"><Home className="w-3 h-3" /> Command</Link>
          {crumbs[0] !== "command-center" && (<><ChevronRight className="w-3 h-3" /><span className="capitalize text-foreground truncate">{crumbs[0].replace(/-/g, " ")}</span></>)}
          {crumbs[1] && (<><ChevronRight className="w-3 h-3" /><MonoChip>{crumbs[1]}</MonoChip></>)}
        </nav>
        <div className="flex-1" />
        <GlobalSearch />
        <QuickCreate />
        <Select value={role} onValueChange={(v) => { setRole(v as never); toast(`Role preview: ${v}`); }}>
          <SelectTrigger className="hidden md:flex h-9 w-[180px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")} title={`Density: ${density}`}>
          <span className="text-[10px] font-mono uppercase">{density === "compact" ? "Cmp" : "Cmf"}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => nav({ to: "/notifications" })}><Bell className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => toast("Help center opens shortly.")}><HelpCircle className="w-4 h-4" /></Button>
        <div className="w-8 h-8 rounded-full bg-signal/15 grid place-items-center text-signal text-xs font-semibold">YE</div>
      </div>
    </header>
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
    d.quotations.filter((qu) => qu.number.toLowerCase().includes(term) || qu.opportunityName.toLowerCase().includes(term)).slice(0, 5).forEach((qu) => out.push({ group: "Quotations", label: qu.opportunityName, sub: qu.number, go: () => nav({ to: "/quotations" }) }));
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
        <Button variant="outline" className="hidden md:flex h-9 w-[260px] justify-start text-xs text-muted-foreground font-normal">
          <Search className="w-3.5 h-3.5 mr-2" /> Search projects, cameras, docs. <kbd className="ml-auto text-[10px] px-1 rounded bg-muted">Ctrl K</kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <div className="p-3 border-b hairline">
          <Input autoFocus placeholder="Search across the system." value={q} onChange={(e) => setQ(e.target.value)} className="border-0 shadow-none focus-visible:ring-0 text-sm" />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim() === "" && <div className="p-4 text-xs text-muted-foreground">Try: camera CP-01, project AHC-PRO-2026-041, customer Msheireb, IP 10.20.30.101.</div>}
          {q.trim() !== "" && Object.keys(grouped).length === 0 && <div className="p-4 text-xs text-muted-foreground">No results.</div>}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">{group}</div>
              {items.map((r, i) => (
                <button key={i} onClick={() => { r.go(); setOpen(false); setQ(""); }} className="w-full text-left px-2 py-2 rounded hover:bg-accent flex items-center justify-between gap-3">
                  <div className="min-w-0"><div className="text-sm truncate">{r.label}</div><div className="text-[11px] text-muted-foreground truncate">{r.sub}</div></div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
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
    { l: "New quotation", go: () => nav({ to: "/quotations" }) },
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
        <Button size="sm" className="h-9 bg-signal text-signal-foreground hover:bg-signal/90"><Plus className="w-4 h-4 mr-1" />Create</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((i) => <DropdownMenuItem key={i.l} onClick={i.go} className="text-xs">{i.l}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
