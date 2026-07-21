export const fmtQAR = (n: number, opts: { compact?: boolean } = {}) => {
  const abs = Math.abs(n);
  if (opts.compact && abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M QAR`;
  if (opts.compact && abs >= 1_000) return `${(n / 1_000).toFixed(1)}K QAR`;
  return `${new Intl.NumberFormat("en-US").format(Math.round(n))} QAR`;
};
export const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);
export const fmtPct = (n: number, d = 0) => `${n.toFixed(d)}%`;
export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${day} ${mon} ${d.getFullYear()}`;
};
export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(iso)}, ${hh}:${mm}`;
};
export const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
export const daysFromToday = (iso: string) => daysBetween(new Date().toISOString(), iso);
export const fmtPhone = (p: string) => p; // already Qatar-formatted in seed
