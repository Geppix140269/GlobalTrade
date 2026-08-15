import Link from "next/link";
import { requireUser } from "@/lib/session";
import { filterOptions, findMembers } from "@/lib/members";
import { EmptyState, PageHeader, Tag, inputClass } from "@/components/ui";

export const metadata = { title: "Members — Global Trade Network" };

interface SearchParams {
  q?: string;
  country?: string;
  market?: string;
  expertise?: string;
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser();
  const params = await searchParams;

  const [members, options] = await Promise.all([
    findMembers({
      q: params.q,
      country: params.country,
      market: params.market,
      expertise: params.expertise,
    }),
    filterOptions(),
  ]);

  const filtered = Boolean(params.q || params.country || params.market || params.expertise);

  return (
    <>
      <PageHeader
        label="The Community"
        title="Members"
        subtitle="Who is in the network, what they do and which markets they cover."
        action={
          <p className="gt-meta">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        }
      />

      {/* The filter sits on the derived ground: it is a thing the directory
          works out, not a thing a member stated. */}
      <form method="get" className="gt-derived mb-[var(--pt-space-5)] p-[var(--pt-space-4)]">
        <div className="space-y-3">
          <input
            className={inputClass}
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search name, company, market, expertise…"
            aria-label="Search members"
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              className={inputClass}
              name="country"
              defaultValue={params.country ?? ""}
              aria-label="Filter by base country"
            >
              <option value="">All countries</option>
              {options.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className={inputClass}
              name="market"
              defaultValue={params.market ?? ""}
              aria-label="Filter by market covered"
            >
              <option value="">All markets</option>
              {options.markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className={inputClass}
              name="expertise"
              defaultValue={params.expertise ?? ""}
              aria-label="Filter by expertise"
            >
              <option value="">All expertise</option>
              {options.expertise.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="gt-act gt-act--primary flex-1 sm:flex-none">
              Apply
            </button>
            {filtered ? (
              <Link href="/members" className="gt-act flex-1 no-underline sm:flex-none">
                Clear
              </Link>
            ) : null}
          </div>
        </div>
      </form>

      {members.length === 0 ? (
        <EmptyState>No members match these filters.</EmptyState>
      ) : (
        /* The register: a strong rule opens it, lighter rules divide the rows. */
        <ul className="border-t border-[var(--pf-rule-strong)]">
          {members.map((member) => (
            <li key={member.id} className="border-b border-[var(--pf-rule)]">
              <Link
                href={`/members/${member.id}`}
                className="group block px-1 py-[var(--pt-space-5)] text-[var(--pf-ink)] no-underline"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="gt-row-title text-[var(--pf-ink)] group-hover:text-[var(--pf-gold-ink)]">
                    {member.name}
                  </h2>
                  {member.baseCountry ? (
                    <span className="gt-meta">{member.baseCountry}</span>
                  ) : null}
                </div>

                <p className="mt-1 font-sans text-(length:--pt-body) text-[var(--pf-ink-2)]">
                  {[member.roleTitle, member.company].filter(Boolean).join(" · ")}
                </p>

                {member.whatTheyDo ? (
                  <p className="gt-prose mt-2 line-clamp-2">{member.whatTheyDo}</p>
                ) : null}

                {member.markets.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {member.markets.slice(0, 5).map((market) => (
                      <Tag key={market}>{market}</Tag>
                    ))}
                    {member.markets.length > 5 ? <Tag>+{member.markets.length - 5}</Tag> : null}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
