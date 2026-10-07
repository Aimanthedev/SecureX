import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Camera,
  ClipboardCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ScanLine,
  ShieldCheck,
  Sun,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUI } from "@/lib/data-context";
import logoAsset from "@/assets/securex-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "SecureX | CCTV Operations Dashboard" },
      { name: "description", content: "Sign in to the SecureX CCTV Operations Dashboard." },
      { property: "og:title", content: "SecureX | CCTV Operations Dashboard" },
      { property: "og:description", content: "Secure operations for CCTV projects, compliance, field teams, service, and accounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useUI();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    window.sessionStorage.setItem("securex-demo-access", "active");
    navigate({ to: "/" });
  };

  return (
    <div className="login-screen relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden className="login-atmosphere pointer-events-none absolute inset-0">
        <div className="login-orb login-orb-brand" />
        <div className="login-orb login-orb-blue" />
        <div className="login-scan-lines" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="absolute right-4 top-4 z-30 rounded-full border-border bg-card/80 backdrop-blur-xl sm:right-6 sm:top-6"
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </Button>

      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[minmax(0,1.15fr)_minmax(440px,0.85fr)]">
        <section className="relative flex min-h-[46vh] flex-col justify-between overflow-hidden px-6 pb-10 pt-16 sm:px-10 lg:min-h-screen lg:px-[clamp(3rem,7vw,7rem)] lg:py-14">
          <div aria-hidden className="login-diagonal login-diagonal-one" />
          <div aria-hidden className="login-diagonal login-diagonal-two" />

          <div className="relative z-10">
            <div className="login-logo-frame mb-9 w-fit rounded-2xl p-3">
              <img src={logoAsset.url} alt="SecureX" className="h-20 w-auto object-contain sm:h-24" />
            </div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-login-blue/30 bg-login-blue-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-login-blue">
              <ScanLine className="h-3.5 w-3.5" />
              Unified security operations
            </div>
            <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[clamp(3.5rem,5vw,5.75rem)]">
              Secure Operations.
              <span className="mt-1 block text-login-gradient">One Command Center.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base lg:text-lg lg:leading-8">
              Manage CCTV projects, MOI compliance, field teams, service contracts, documents, and accounts from one unified dashboard.
            </p>

            <div className="mt-8 flex max-w-2xl flex-wrap gap-2.5">
              <FeatureChip icon={Camera} label="CCTV Project Control" />
              <FeatureChip icon={ClipboardCheck} label="MOI Compliance Tracking" />
              <FeatureChip icon={Wrench} label="AMC & Service Management" />
            </div>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-login-blue/30 bg-login-blue-soft text-login-blue">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Built for CCTV &amp; Security System Companies
          </div>
        </section>

        <section className="flex items-center justify-center px-4 pb-20 pt-6 sm:px-8 lg:min-h-screen lg:px-[clamp(2rem,5vw,5rem)] lg:py-20">
          <div className="w-full max-w-[500px]">
            <div className="login-card relative overflow-hidden rounded-2xl border p-6 sm:p-9">
              <div aria-hidden className="login-card-accent absolute inset-x-0 top-0 h-px" />

              <div className="flex items-start justify-between gap-4">
                <div className="login-logo-frame rounded-xl p-2.5">
                  <img src={logoAsset.url} alt="SecureX logo" className="h-16 w-auto object-contain sm:h-[72px]" />
                </div>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success-soft px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Systems online
                </span>
              </div>

              <h2 className="mt-7 text-3xl font-bold">Welcome back</h2>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to SecureX Command Center</p>

              <form onSubmit={handleSignIn} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      defaultValue="demo@securex.qa"
                      autoComplete="email"
                      className="h-12 rounded-xl border-input bg-surface-2 pl-10 focus-visible:ring-login-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Password
                    </Label>
                    <Button type="button" variant="link" onClick={() => toast("Demo UI only")} className="h-auto p-0 text-xs text-login-blue">
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      defaultValue="securex-demo"
                      autoComplete="current-password"
                      className="h-12 rounded-xl border-input bg-surface-2 pl-10 pr-11 focus-visible:ring-login-blue"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Checkbox id="remember" defaultChecked className="border-input data-[state=checked]:bg-primary" />
                  <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">Remember me</Label>
                </div>

                <Button type="submit" size="lg" className="login-submit h-12 w-full rounded-xl text-sm font-semibold">
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 rounded-xl border border-border bg-surface-2/70 p-3.5">
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Demo credentials</div>
                <div className="mt-2 grid gap-1 font-mono text-[11px] text-foreground sm:grid-cols-2">
                  <span>demo@securex.qa</span>
                  <span className="sm:text-right">securex-demo</span>
                </div>
              </div>

              <p className="mt-5 text-center text-[11px] text-muted-foreground">Demo UI only — no backend connected</p>
            </div>

            <p className="mt-7 text-center text-xs font-medium tracking-wide text-muted-foreground">
              By <span className="font-semibold text-foreground">Ruwyah Strategies &amp; Co</span>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: typeof Camera; label: string }) {
  return (
    <div className="login-feature-chip flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium text-foreground backdrop-blur-md">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-login-blue-soft text-login-blue">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </div>
  );
}
