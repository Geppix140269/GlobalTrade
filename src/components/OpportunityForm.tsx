"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/actions/profile";
import { Card, Field, Notice, buttonClass, inputClass } from "@/components/ui";

export interface OpportunityFormValues {
  id?: string;
  requesterId: string | null;
  requesterName: string;
  requesterCompany: string;
  type: string;
  market: string;
  request: string;
  supportNeeded: string;
  notes: string;
  status: string;
  relevantMemberIds: string[];
}

export interface SelectableMember {
  id: string;
  name: string;
  company: string;
}

const EMPTY: OpportunityFormValues = {
  requesterId: null,
  requesterName: "",
  requesterCompany: "",
  type: "",
  market: "",
  request: "",
  supportNeeded: "",
  notes: "",
  status: "OPEN",
  relevantMemberIds: [],
};

const STATUSES = [
  ["OPEN", "Open"],
  ["IN_PROGRESS", "In Progress"],
  ["MATCHED", "Matched"],
  ["ON_HOLD", "On Hold"],
  ["CLOSED", "Closed"],
] as const;

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full sm:w-auto`} disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export function OpportunityForm({
  action,
  opportunity = EMPTY,
  members,
  submitLabel = "Save request",
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  opportunity?: OpportunityFormValues;
  members: SelectableMember[];
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const textarea = `${inputClass} min-h-24`;

  return (
    <form action={formAction} className="space-y-3">
      {opportunity.id ? <input type="hidden" name="id" value={opportunity.id} /> : null}

      <Card className="space-y-4 p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--pf-ink-3)] uppercase">
          Requester
        </h2>
        <Field label="Requester name">
          <input
            className={inputClass}
            name="requesterName"
            defaultValue={opportunity.requesterName}
            required
          />
        </Field>
        <Field label="Company">
          <input
            className={inputClass}
            name="requesterCompany"
            defaultValue={opportunity.requesterCompany}
          />
        </Field>
        <Field
          label="Link to member profile"
          hint="Optional. Links the request to a profile in the directory."
        >
          <select
            className={inputClass}
            name="requesterId"
            defaultValue={opportunity.requesterId ?? ""}
          >
            <option value="">Not linked</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
                {member.company ? `, ${member.company}` : ""}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card className="space-y-4 p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--pf-ink-3)] uppercase">
          The request
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" hint="e.g. Buyers / Distribution, Trade Services">
            <input className={inputClass} name="type" defaultValue={opportunity.type} />
          </Field>
          <Field label="Market / country">
            <input className={inputClass} name="market" defaultValue={opportunity.market} />
          </Field>
        </div>
        <Field label="Request / opportunity">
          <textarea
            className={textarea}
            name="request"
            defaultValue={opportunity.request}
            required
          />
        </Field>
        <Field label="Support needed">
          <textarea
            className={textarea}
            name="supportNeeded"
            defaultValue={opportunity.supportNeeded}
          />
        </Field>
        <Field label="Notes" hint="Internal context. Visible to all members.">
          <textarea className={textarea} name="notes" defaultValue={opportunity.notes} />
        </Field>
        <Field label="Status">
          <select className={inputClass} name="status" defaultValue={opportunity.status}>
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card className="space-y-3 p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--pf-ink-3)] uppercase">
          Members who could contribute
        </h2>
        <p className="text-sm text-[var(--pf-ink-3)]">
          One member may have the supplier, another the buyer, another logistics or finance. Tick
          everyone who could contribute a piece of this opportunity.
        </p>
        <div className="max-h-72 space-y-1 overflow-y-auto border border-[var(--pf-rule)] p-2">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-2.5 p-2 hover:bg-[var(--pf-sunken)]"
            >
              <input
                type="checkbox"
                name="relevantMemberIds"
                value={member.id}
                defaultChecked={opportunity.relevantMemberIds.includes(member.id)}
                className="size-4 accent-[var(--pf-ink)]"
              />
              <span className="text-sm text-[var(--pf-ink)]">
                {member.name}
                {member.company ? (
                  <span className="text-[var(--pf-ink-3)]"> · {member.company}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </Card>

      {state ? <Notice ok={state.ok}>{state.message}</Notice> : null}
      <SaveButton label={submitLabel} />
    </form>
  );
}
