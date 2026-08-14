"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changeMyPassword } from "@/actions/accounts";
import type { ActionResult } from "@/actions/profile";
import { Card, Field, Notice, buttonClass, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full sm:w-auto`} disabled={pending}>
      {pending ? "Saving…" : "Change password"}
    </button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(changeMyPassword, null);

  return (
    <Card className="p-4 sm:p-5">
      <form action={formAction} className="space-y-4">
        <Field label="Current password">
          <input
            className={inputClass}
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field label="New password" hint="At least 10 characters.">
          <input
            className={inputClass}
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
          />
        </Field>
        <Field label="Confirm new password">
          <input
            className={inputClass}
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
          />
        </Field>

        {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}
        <SubmitButton />
      </form>
    </Card>
  );
}
