import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useRouterState, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { DataProvider, UIProvider } from "@/lib/data-context";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/app/shell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl font-display font-bold text-signal">404</div>
        <h2 className="mt-3 text-lg font-semibold">Page not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">The record or page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-5 inline-flex items-center rounded-md bg-signal px-4 py-2 text-sm font-medium text-signal-foreground">Go to Command Center</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error instanceof Error ? error : new Error(String(error)), { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or return home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-signal px-4 py-2 text-sm text-signal-foreground">Try again</button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SecureX | CCTV Operations Dashboard" },
      { name: "description", content: "Operations platform for SecureX CCTV COMPANY, Qatar. Sales pipeline, site surveys, projects, field operations, service and AMC." },
      { property: "og:title", content: "SecureX | CCTV Operations Dashboard" },
      { property: "og:description", content: "End-to-end operations for a Qatar CCTV and security systems contractor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "icon", href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23d1343b'/%3E%3Ctext x='50%25' y='58%25' font-family='sans-serif' font-size='18' font-weight='700' fill='white' text-anchor='middle'%3EA%3C/text%3E%3C/svg%3E" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthScreen = pathname.startsWith("/login");
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <DataProvider>
          {isAuthScreen ? (
            <Outlet />
          ) : (
            <AppShell><Outlet /></AppShell>
          )}
          <Toaster position="top-right" richColors />
        </DataProvider>
      </UIProvider>
    </QueryClientProvider>
  );
}
