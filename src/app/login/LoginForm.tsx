"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/actions/auth-actions";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState | null, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email">
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          required
        />
      </Field>

      <Field label="Password">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state?.error ? <Notice ok={false}>{state.error}</Notice> : null}

      <SubmitButton />
    </form>
  );
}
