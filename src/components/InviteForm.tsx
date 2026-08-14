"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createInvite } from "@/actions/invites";
import type { ActionResult } from "@/actions/profile";
import { Card, Field, Notice, buttonClass, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full sm:w-auto`} disabled={pending}>
      {pending ? "Creating…" : "Create code"}
    </button>
  );
}

export function CreateInviteForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createInvite, null);

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-navy-400 uppercase">
        Create an invite code
      </h2>
      <form action={formAction} className="space-y-4">
        <Field label="Label" hint="For your reference, e.g. “WhatsApp Community”.">
          <input className={inputClass} name="label" placeholder="WhatsApp Community" />
        </Field>

        <Field label="Code" hint="Leave blank to generate one automatically.">
          <input
            className={`${inputClass} font-mono tracking-wider uppercase`}
            name="code"
            autoCapitalize="characters"
            placeholder="GTN-XXXX-XXXX"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Maximum uses" hint="Blank = unlimited.">
            <input className={inputClass} name="maxUses" inputMode="numeric" placeholder="50" />
          </Field>
          <Field label="Expires in (days)" hint="Blank = never.">
            <input
              className={inputClass}
              name="expiresInDays"
              inputMode="numeric"
              placeholder="30"
            />
          </Field>
        </div>

        {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}
        <SubmitButton />
      </form>
    </Card>
  );
}
