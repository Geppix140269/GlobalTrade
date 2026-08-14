import { z } from "zod";

/** Comma or newline separated free text -> trimmed, de-duplicated list. */
export function parseList(input: FormDataEntryValue | null | undefined): string[] {
  if (typeof input !== "string") return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of input.split(/[,\n]/)) {
    const value = part.trim();
    if (value.length === 0) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), {
    message: "Must be a full URL starting with http:// or https://",
  });

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || z.string().email().safeParse(v).success, {
    message: "Must be a valid email address",
  });

/** Fields a member may submit for their own profile. */
export const memberProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  company: z.string().trim().max(160).default(""),
  roleTitle: z.string().trim().max(120).default(""),
  baseCountry: z.string().trim().max(80).default(""),
  markets: z.array(z.string().trim().min(1).max(80)).max(40).default([]),
  whatTheyDo: z.string().trim().max(4000).default(""),
  expertise: z.array(z.string().trim().min(1).max(80)).max(60).default([]),
  currentFocus: z.string().trim().max(4000).default(""),
  lookingFor: z.string().trim().max(4000).default(""),
  canOffer: z.string().trim().max(4000).default(""),
  website: optionalUrl.default(""),
  linkedin: optionalUrl.default(""),
  email: optionalEmail.default(""),
  phone: z.string().trim().max(60).default(""),
});

export const memberStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

/** Admin submits the same profile fields plus status. */
export const adminMemberSchema = memberProfileSchema.extend({
  status: memberStatusSchema.default("ACTIVE"),
});

export const opportunityStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "MATCHED",
  "CLOSED",
  "ON_HOLD",
]);

export const opportunitySchema = z.object({
  requesterId: z.string().trim().default(""),
  requesterName: z.string().trim().min(1, "Requester is required").max(160),
  requesterCompany: z.string().trim().max(160).default(""),
  type: z.string().trim().max(80).default(""),
  market: z.string().trim().max(160).default(""),
  request: z.string().trim().min(1, "Request is required").max(4000),
  supportNeeded: z.string().trim().max(4000).default(""),
  notes: z.string().trim().max(4000).default(""),
  status: opportunityStatusSchema.default("OPEN"),
  relevantMemberIds: z.array(z.string().trim().min(1)).max(50).default([]),
});

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200, "Password is too long");

export const accountSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required").max(200),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  memberId: z.string().trim().default(""),
  password: passwordSchema,
});

export function readProfileForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    roleTitle: String(formData.get("roleTitle") ?? ""),
    baseCountry: String(formData.get("baseCountry") ?? ""),
    markets: parseList(formData.get("markets")),
    whatTheyDo: String(formData.get("whatTheyDo") ?? ""),
    expertise: parseList(formData.get("expertise")),
    currentFocus: String(formData.get("currentFocus") ?? ""),
    lookingFor: String(formData.get("lookingFor") ?? ""),
    canOffer: String(formData.get("canOffer") ?? ""),
    website: String(formData.get("website") ?? ""),
    linkedin: String(formData.get("linkedin") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
}

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the values you entered.";
}
