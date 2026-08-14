import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface MemberFilters {
  q?: string;
  country?: string;
  market?: string;
  expertise?: string;
  includeInactive?: boolean;
}

/**
 * Builds the directory query. Members see active profiles only; the admin views
 * pass includeInactive so deactivated and archived records stay manageable.
 */
export function memberWhere(filters: MemberFilters): Prisma.MemberWhereInput {
  const and: Prisma.MemberWhereInput[] = [];

  if (!filters.includeInactive) and.push({ status: "ACTIVE" });
  if (filters.country) and.push({ baseCountry: filters.country });
  if (filters.market) and.push({ markets: { has: filters.market } });
  if (filters.expertise) and.push({ expertise: { has: filters.expertise } });

  const q = filters.q?.trim();
  if (q) {
    const contains = { contains: q, mode: "insensitive" } as const;
    and.push({
      OR: [
        { name: contains },
        { company: contains },
        { roleTitle: contains },
        { baseCountry: contains },
        { whatTheyDo: contains },
        { currentFocus: contains },
        { lookingFor: contains },
        { canOffer: contains },
        { markets: { has: q } },
        { expertise: { has: q } },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function findMembers(filters: MemberFilters) {
  return prisma.member.findMany({
    where: memberWhere(filters),
    orderBy: [{ name: "asc" }],
  });
}

/** Distinct values for the filter dropdowns, taken from live data. */
export async function filterOptions() {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: { baseCountry: true, markets: true, expertise: true },
  });

  const countries = new Set<string>();
  const markets = new Set<string>();
  const expertise = new Set<string>();

  for (const m of members) {
    if (m.baseCountry) countries.add(m.baseCountry);
    for (const value of m.markets) markets.add(value);
    for (const value of m.expertise) expertise.add(value);
  }

  const sorted = (set: Set<string>) => [...set].sort((a, b) => a.localeCompare(b));
  return {
    countries: sorted(countries),
    markets: sorted(markets),
    expertise: sorted(expertise),
  };
}

/** Fields that make a profile genuinely useful to other members. */
const COMPLETION_FIELDS = [
  "company",
  "roleTitle",
  "baseCountry",
  "whatTheyDo",
  "currentFocus",
  "lookingFor",
  "canOffer",
] as const;

export interface Completion {
  missing: string[];
  complete: boolean;
}

const LABELS: Record<string, string> = {
  company: "Company",
  roleTitle: "Role",
  baseCountry: "Base country",
  whatTheyDo: "What you do",
  currentFocus: "Current focus",
  lookingFor: "What you are looking for",
  canOffer: "What you can help with",
  markets: "Markets covered",
  expertise: "Products / expertise",
};

export function profileCompletion(
  member: Record<string, unknown> & { markets: string[]; expertise: string[] },
): Completion {
  const missing: string[] = [];
  for (const field of COMPLETION_FIELDS) {
    if (!String(member[field] ?? "").trim()) missing.push(LABELS[field] ?? field);
  }
  if (member.markets.length === 0) missing.push(LABELS.markets ?? "markets");
  if (member.expertise.length === 0) missing.push(LABELS.expertise ?? "expertise");
  return { missing, complete: missing.length === 0 };
}
