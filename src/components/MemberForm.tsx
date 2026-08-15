"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/actions/profile";
import { Card, Field, Notice, buttonClass, inputClass } from "@/components/ui";

export interface MemberFormValues {
  id?: string;
  name: string;
  company: string;
  roleTitle: string;
  baseCountry: string;
  markets: string[];
  whatTheyDo: string;
  expertise: string[];
  currentFocus: string;
  lookingFor: string;
  canOffer: string;
  website: string;
  linkedin: string;
  email: string;
  phone: string;
  status?: string;
}

const EMPTY: MemberFormValues = {
  name: "",
  company: "",
  roleTitle: "",
  baseCountry: "",
  markets: [],
  whatTheyDo: "",
  expertise: [],
  currentFocus: "",
  lookingFor: "",
  canOffer: "",
  website: "",
  linkedin: "",
  email: "",
  phone: "",
  status: "ACTIVE",
};

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full sm:w-auto`} disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--pf-ink-3)] uppercase">
        {title}
      </h2>
      {children}
    </Card>
  );
}

export function MemberForm({
  action,
  member = EMPTY,
  submitLabel = "Save",
  showStatus = false,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  member?: MemberFormValues;
  submitLabel?: string;
  showStatus?: boolean;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const textarea = `${inputClass} min-h-24`;

  return (
    <form action={formAction} className="space-y-3">
      {member.id ? <input type="hidden" name="memberId" value={member.id} /> : null}

      <Section title="Who you are">
        <Field label="Name">
          <input className={inputClass} name="name" defaultValue={member.name} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company">
            <input className={inputClass} name="company" defaultValue={member.company} />
          </Field>
          <Field label="Role">
            <input className={inputClass} name="roleTitle" defaultValue={member.roleTitle} />
          </Field>
        </div>
        <Field label="Base country">
          <input className={inputClass} name="baseCountry" defaultValue={member.baseCountry} />
        </Field>
      </Section>

      <Section title="What you do">
        <Field label="What you do" hint="A short description other members can act on.">
          <textarea className={textarea} name="whatTheyDo" defaultValue={member.whatTheyDo} />
        </Field>
        <Field label="Markets covered" hint="Separate with commas, e.g. UAE, Africa, Worldwide">
          <textarea
            className={`${inputClass} min-h-16`}
            name="markets"
            defaultValue={member.markets.join(", ")}
          />
        </Field>
        <Field
          label="Products / services / expertise"
          hint="Separate with commas, e.g. Olive oil, Seafood, Trade finance"
        >
          <textarea
            className={`${inputClass} min-h-16`}
            name="expertise"
            defaultValue={member.expertise.join(", ")}
          />
        </Field>
      </Section>

      <Section title="Where you are now">
        <Field label="Current focus">
          <textarea className={textarea} name="currentFocus" defaultValue={member.currentFocus} />
        </Field>
        <Field label="What you are looking for">
          <textarea className={textarea} name="lookingFor" defaultValue={member.lookingFor} />
        </Field>
        <Field label="What you can help others with">
          <textarea className={textarea} name="canOffer" defaultValue={member.canOffer} />
        </Field>
      </Section>

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              name="email"
              inputMode="email"
              autoCapitalize="none"
              defaultValue={member.email}
            />
          </Field>
          <Field label="Telephone / WhatsApp">
            <input
              className={inputClass}
              name="phone"
              inputMode="tel"
              defaultValue={member.phone}
            />
          </Field>
        </div>
        <Field label="Website" hint="Include https://">
          <input
            className={inputClass}
            name="website"
            inputMode="url"
            autoCapitalize="none"
            placeholder="https://"
            defaultValue={member.website}
          />
        </Field>
        <Field label="LinkedIn" hint="Include https://">
          <input
            className={inputClass}
            name="linkedin"
            inputMode="url"
            autoCapitalize="none"
            placeholder="https://"
            defaultValue={member.linkedin}
          />
        </Field>
      </Section>

      {showStatus ? (
        <Section title="Directory status">
          <Field label="Status" hint="Only active profiles appear in the member directory.">
            <select className={inputClass} name="status" defaultValue={member.status ?? "ACTIVE"}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
        </Section>
      ) : null}

      {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}

      <div className="sm: sticky bottom-0 -mx-4 border-t border-[var(--pf-rule)] bg-[var(--pf-surface)] px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <SaveButton label={submitLabel} />
      </div>
    </form>
  );
}
