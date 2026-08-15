import type { ReactNode } from "react";

/**
 * The shared primitives, drawn to the adopted design language.
 *
 * Structure is rules, never shadows or  cards. Headings are serif,
 * sentences are sans, labels and states are mono. Gold is the keystone and
 * never a status.
 */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`gt-record ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  label,
  action,
}: {
  title: string;
  subtitle?: string;
  /** The mono classification above the title. */
  label?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-[var(--pf-rule)] pb-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {label ? <p className="gt-label gt-label--gold mb-2">{label}</p> : null}
          <h1 className="gt-heading">{title}</h1>
          {subtitle ? <p className="gt-prose mt-1.5">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}

/** A mono classification chip. Carries a market, an expertise, a country. */
export function Tag({
  children,
  tone = "plain",
}: {
  children: ReactNode;
  tone?: "plain" | "gold";
}) {
  const style =
    tone === "gold"
      ? "border-[var(--pf-gold-rule)] text-[var(--pf-gold-ink)]"
      : "border-[var(--pf-rule)] text-[var(--pf-ink-2)]";
  return (
    <span
      className={`inline-block border px-2 py-1 font-mono text-(length:--pt-mono-caption) tracking-[var(--pt-ls-count)] uppercase ${style}`}
    >
      {children}
    </span>
  );
}

/**
 * State colours come from the token set's state ramp. Gold is deliberately
 * absent: the design forbids it meaning verification, approval or success.
 */
const STATE_COLOUR: Record<string, string> = {
  OPEN: "text-[var(--pf-positive)]",
  IN_PROGRESS: "text-[var(--pf-review)]",
  MATCHED: "text-[var(--pf-positive)]",
  ON_HOLD: "text-[var(--pf-declared)]",
  CLOSED: "text-[var(--pf-mute)]",
  ACTIVE: "text-[var(--pf-positive)]",
  INACTIVE: "text-[var(--pf-declared)]",
  ARCHIVED: "text-[var(--pf-mute)]",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`gt-state ${STATE_COLOUR[status] ?? "text-[var(--pf-ink-3)]"}`}>
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
      <span className="gt-label mb-1.5 block">{label}</span>
      {children}
      {hint ? (
        <span className="mt-1.5 block font-sans text-(length:--pt-caption) text-[var(--pf-ink-3)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export const inputClass = "gt-field";
export const buttonClass = "gt-act gt-act--primary";
export const secondaryButtonClass = "gt-act";

/**
 * The outcome of an action. A refusal is drawn in the danger ink and a
 * completion in the positive ink — both as a rule and a word, never colour
 * alone, so the meaning survives a monochrome screen.
 */
export function Notice({ ok, children }: { ok: boolean; children: ReactNode }) {
  const tone = ok
    ? "border-[var(--pf-positive)] text-[var(--pf-positive)]"
    : "border-[var(--pf-danger)] text-[var(--pf-danger)]";
  return (
    <p role="status" className={`border-l-2 py-2 pl-3 text-(length:--pt-prose) ${tone}`}>
      <span className="gt-label mr-2 align-middle" style={{ color: "inherit" }}>
        {ok ? "Saved" : "Refused"}
      </span>
      <span className="align-middle text-[var(--pf-ink-2)]">{children}</span>
    </p>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="gt-record p-8 text-center">
      <p className="gt-prose mx-auto">{children}</p>
    </div>
  );
}

/** A mono label over a sans value — the key/value row the design uses. */
export function DetailBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <h3 className="gt-label">{label}</h3>
      <p className="gt-prose mt-1.5 whitespace-pre-line">{value}</p>
    </div>
  );
}
