import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/securex-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — SecureX CCTV Company" },
      { name: "description", content: "Sign in to the SecureX CCTV Operations Dashboard." },
      { property: "og:title", content: "Sign In — SecureX CCTV Company" },
      { property: "og:description", content: "Sign in to the SecureX CCTV Operations Dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/" });
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-[0.10] blur-3xl" style={{ background: "radial-gradient(closest-side, var(--signal), transparent)" }} />
        <div className="absolute bottom-[-160px] right-[-120px] h-[380px] w-[520px] rounded-full opacity-[0.08] blur-3xl" style={{ background: "radial-gradient(closest-side, var(--sidebar-primary), transparent)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)", backgroundSize: "72px 72px", opacity: 0.28, maskImage: "radial-gradient(ellipse 90% 70% at 50% 40%, black, transparent)", WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 40%, black, transparent)" }} />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl border bg-card p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)] sm:p-10"
            style={{ boxShadow: "var(--panel-shadow)" }}
          >
            {/* Logo */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-1">
                <div aria-hidden className="absolute inset-0 -z-10 scale-125 rounded-full opacity-30 blur-xl" style={{ background: "radial-gradient(closest-side, var(--sidebar-primary), transparent)" }} />
                <img src={logoAsset.url} alt="SecureX logo" className="h-24 w-24 rounded-xl object-contain" />
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border bg-signal-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-signal">
                <ShieldCheck className="h-3.5 w-3.5" />
                SecureX
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
                Welcome to SecureX
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                CCTV Operations Dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@securex.qa"
                    autoComplete="email"
                    className="h-11 rounded-lg bg-surface-2 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => toast("Demo UI only")}
                    className="text-xs font-medium text-signal transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 rounded-lg bg-surface-2 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked className="border-input" />
                <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-lg text-[15px] font-semibold"
                style={{ background: "var(--action-gradient)" }}
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Demo access only — no backend connected
            </p>
          </div>

          {/* Brand credit */}
          <p className="mt-8 text-center text-xs font-medium tracking-wide text-muted-foreground/80">
            By <span className="font-semibold text-muted-foreground">Ruwyah Strategies &amp; Co</span>
          </p>
        </div>
      </main>
    </div>
  );
}
