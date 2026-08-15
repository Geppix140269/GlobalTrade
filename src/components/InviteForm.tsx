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

export interface ClaimableMember {
  id: string;
  name: string;
  company: string;
}

export function CreateInviteForm({ members }: { members: ClaimableMember[] }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createInvite, null);

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="gt-label mb-3">Create an invite code</h2>
      <form action={formAction} className="space-y-4">
        <Field
          label="Claim an existing profile"
          hint="Leave as “New members” for a shared code. Pick a person to give them ownership of the profile already in the directory — that code works once and is theirs alone."
        >
          <select className={inputClass} name="memberId" defaultValue="">
            <option value="">New members — creates a fresh profile</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
                {member.company ? ` — ${member.company}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Role granted"
          hint="Anyone who uses this code receives this role. Only choose Admin for a code you send to one named person."
        >
          <select className={inputClass} name="role" defaultValue="MEMBER">
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin — full control of the directory</option>
          </select>
        </Field>

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
          <Field
            label="Maximum uses"
            hint="Blank = unlimited. Ignored for a claim code, which is always single use."
          >
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
