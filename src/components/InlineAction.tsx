"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/actions/profile";

function Button({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "…" : label}
    </button>
  );
}

/**
 * A one-click admin action (change status, disable access). Fields are posted as
 * hidden inputs; the server action re-checks admin rights before acting.
 */
export function InlineAction({
  action,
  fields,
  label,
  tone = "neutral",
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  fields: Record<string, string>;
  label: string;
  tone?: "neutral" | "danger";
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  const className =
    tone === "danger"
      ? "rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      : "rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-60";

  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button label={label} className={className} />
      {state && !state.ok ? <span className="text-xs text-red-700">{state.message}</span> : null}
    </form>
  );
}
