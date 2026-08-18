"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAccount, resetAccountPassword } from "@/actions/accounts";
import type { ActionResult } from "@/actions/profile";
import { Card, Field, Notice, buttonClass, inputClass } from "@/components/ui";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full sm:w-auto`} disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export interface LinkableMember {
  id: string;
  name: string;
  company: string;
}

export function CreateAccountForm({ members }: { members: LinkableMember[] }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createAccount, null);

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="gt-label mb-3">Create a login</h2>
      <form action={formAction} className="space-y-4">
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            name="email"
            inputMode="email"
            autoCapitalize="none"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role">
            <select className={inputClass} name="role" defaultValue="MEMBER">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </Field>

          <Field
            label="Linked member profile"
            hint="The only profile this account will be able to edit."
          >
            <select className={inputClass} name="memberId" defaultValue="">
              <option value="">No profile (admin only)</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.company ? `, ${member.company}` : ""}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Initial password"
          hint="At least 10 characters. Share it securely; the member is asked to change it."
        >
          <input
            className={inputClass}
            type="text"
            name="password"
            autoComplete="off"
            minLength={10}
            required
          />
        </Field>

        {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}
        <SubmitButton label="Create account" />
      </form>
    </Card>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    resetAccountPassword,
    null,
  );

  return (
    <form action={formAction} className="mt-3 border-t border-[var(--pf-rule)] pt-3">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium text-[var(--pf-ink-3)]">
            New password
          </span>
          <input
            className={inputClass}
            type="text"
            name="password"
            autoComplete="off"
            minLength={10}
            placeholder="At least 10 characters"
          />
        </label>
        <SubmitButton label="Reset" />
      </div>
      {state ? (
        <div className="mt-2">
          <Notice ok={state.ok}>{state.message}</Notice>
        </div>
      ) : null}
    </form>
  );
}
