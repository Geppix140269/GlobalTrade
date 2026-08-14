import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-navy-100 bg-white shadow-[0_1px_2px_rgba(13,26,49,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-navy-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Tag({ children, tone = "navy" }: { children: ReactNode; tone?: "navy" | "gold" }) {
  const styles =
    tone === "gold"
      ? "bg-gold-100 text-gold-600 border-gold-300"
      : "bg-navy-50 text-navy-600 border-navy-100";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  IN_PROGRESS: "bg-sky-50 text-sky-700 border-sky-200",
  MATCHED: "bg-gold-100 text-gold-600 border-gold-300",
  ON_HOLD: "bg-amber-50 text-amber-700 border-amber-200",
  CLOSED: "bg-navy-50 text-navy-400 border-navy-100",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-amber-50 text-amber-700 border-amber-200",
  ARCHIVED: "bg-navy-50 text-navy-400 border-navy-100",
};

export function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-navy-50 text-navy-600 border-navy-100";
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-navy-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-navy-400">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-navy-900 " +
  "placeholder:text-navy-200 focus:border-navy-600 focus:outline-none " +
  "focus:ring-2 focus:ring-navy-600/15";

export const buttonClass =
  "inline-flex items-center justify-center rounded-lg bg-navy-800 px-4 py-2.5 " +
  "font-medium text-white transition-colors hover:bg-navy-700 active:bg-navy-900 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-navy-200 bg-white " +
  "px-4 py-2.5 font-medium text-navy-700 transition-colors hover:bg-navy-50 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Notice({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2 text-sm ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {children}
    </p>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Card className="p-8 text-center text-sm text-navy-400">
      <p>{children}</p>
    </Card>
  );
}

export function DetailBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide text-navy-400 uppercase">{label}</h3>
      <p className="mt-1 whitespace-pre-line text-navy-800">{value}</p>
    </div>
  );
}
