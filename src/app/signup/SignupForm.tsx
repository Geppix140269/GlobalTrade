"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction, type SignupState } from "@/actions/signup";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
      {pending ? "Creating your account…" : "Create my account"}
    </button>
  );
}

export function SignupForm({ defaultCode }: { defaultCode: string }) {
  const [state, formAction] = useActionState<SignupState | null, FormData>(signUpAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Invite code">
        <input
          className={`${inputClass} font-mono tracking-wider uppercase`}
          name="inviteCode"
          defaultValue={defaultCode}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="GTN-XXXX-XXXX"
          required
        />
      </Field>

      <Field label="Your name">
        <input className={inputClass} name="name" autoComplete="name" required />
      </Field>

      <Field label="Company" hint="Optional — you can add it later.">
        <input className={inputClass} name="company" autoComplete="organization" />
      </Field>

      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          name="email"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="username"
          required
        />
      </Field>

      <Field label="Password" hint="At least 10 characters.">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>

      <Field label="Confirm password">
        <input
          className={inputClass}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>

      {state?.error ? <Notice ok={false}>{state.error}</Notice> : null}

      <SubmitButton />
    </form>
  );
}
