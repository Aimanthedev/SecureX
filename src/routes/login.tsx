import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type CSSProperties } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUI } from "@/lib/data-context";
import logo from "@/assets/securex-transparent.png.asset.json";
import darkLogo from "@/assets/securex-transparent-dark.png.asset.json";
import shield from "@/assets/securex-shield.png.asset.json";
import outline from "@/assets/securex-shield-outline.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "SecureX | CCTV Operations Dashboard" },
    { name: "description", content: "Sign in to the SecureX CCTV Operations Dashboard." },
    { property: "og:title", content: "SecureX | CCTV Operations Dashboard" },
    { property: "og:description", content: "SecureX command center for CCTV and security operations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useUI();
  const [showPassword, setShowPassword] = useState(false);
  const [entering, setEntering] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleSignIn = (event: FormEvent) => {
    event.preventDefault();
    if (entering) return;
    window.sessionStorage.setItem("securex-demo-access", "active");
    setEntering(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => { navigate({ to: "/" }); }, reducedMotion ? 150 : 1350);
  };

  return (
    <div className="login-screen relative flex min-h-svh flex-col bg-background text-foreground">
      {!entering && <Button type="button" variant="ghost" size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="absolute right-5 top-5 z-10 text-muted-foreground">
        {theme === "dark" ? <Sun /> : <Moon />}
      </Button>}

      {entering ? (
        <main className="login-transition flex flex-1 items-center justify-center" aria-label="Opening Command Center" aria-busy="true">
          <div className="login-shield relative" style={{ "--shield-outline": `url("${outline.url}")` } as CSSProperties}>
            <img src={shield.url} alt="SecureX shield" className="login-shield-fill h-full w-full object-contain" />
            <div aria-hidden className="login-shield-outline absolute inset-0" />
          </div>
        </main>
      ) : (
        <>
          <main className="flex flex-1 items-center justify-center px-6 pb-6 pt-16 sm:px-8">
            <section className="login-composition w-full max-w-[352px]" aria-labelledby="login-heading">
              <div className="mb-7 flex justify-center">
                <img src={theme === "dark" ? darkLogo.url : logo.url} alt="SecureX" className="h-[124px] w-[160px] object-contain" />
              </div>
              <h1 id="login-heading" className="text-center text-2xl font-semibold">Welcome back</h1>
              <form onSubmit={handleSignIn} noValidate className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" className="login-input h-12 rounded-lg px-3.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="login-input h-12 rounded-lg px-3.5 pr-12" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(value => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" className="login-remember" />
                    <Label htmlFor="remember" className="cursor-pointer text-xs font-normal text-muted-foreground">Remember me</Label>
                  </div>
                  <Button type="button" variant="link" onClick={() => toast("Demo UI only")} className="h-auto p-0 text-xs font-medium text-login-blue">Forgot password?</Button>
                </div>
                <Button type="submit" className="login-submit mt-2 h-12 w-full rounded-lg text-sm font-semibold">Sign In</Button>
              </form>
            </section>
          </main>
          <footer className="px-6 pb-7 pt-6 text-center text-xs text-muted-foreground">By <span className="font-medium">Ruwyah Strategies &amp; Co</span></footer>
        </>
      )}
    </div>
  );
}
