import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { docTone } from '@/lib/moi-data';

export function Badge({ status }: { status: string }) {
  return <span className={`moi-badge moi-${docTone(status.replace(' risk', ''))}`}>{status}</span>;
}
export function SectionTitle({ icon: Icon, title, detail, children }: { icon: LucideIcon; title: string; detail?: string; children?: ReactNode }) {
  return <header className="moi-section-title"><div className="flex min-w-0 items-center gap-2.5"><Icon className="h-4 w-4 shrink-0 text-login-blue" /><div className="min-w-0"><h2 className="text-sm font-semibold">{title}</h2>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</div></div>{children}</header>;
}
export function Frame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`moi-frame ${className}`}>{children}</section>;
}
