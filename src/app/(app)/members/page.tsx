import Link from "next/link";
import { requireUser } from "@/lib/session";
import { filterOptions, findMembers } from "@/lib/members";
import { Card, EmptyState, PageHeader, Tag, inputClass } from "@/components/ui";

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
        title="Members"
        subtitle={`${members.length} ${members.length === 1 ? "member" : "members"} in the Community`}
      />

      <Card className="mb-5 p-3 sm:p-4">
        <form method="get" className="space-y-3">
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
            <button
              type="submit"
              className="flex-1 rounded-lg bg-navy-800 px-4 py-2.5 font-medium text-white hover:bg-navy-700 sm:flex-none"
            >
              Apply
            </button>
            {filtered ? (
              <Link
                href="/members"
                className="flex-1 rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-center font-medium text-navy-700 hover:bg-navy-50 sm:flex-none"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </Card>

      {members.length === 0 ? (
        <EmptyState>No members match these filters.</EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {members.map((member) => (
            <li key={member.id}>
              <Link href={`/members/${member.id}`} className="block h-full">
                <Card className="h-full p-4 transition-colors hover:border-gold-300">
                  <h2 className="font-semibold text-navy-900">{member.name}</h2>
                  <p className="text-sm text-navy-600">
                    {[member.roleTitle, member.company].filter(Boolean).join(" · ")}
                  </p>
                  {member.baseCountry ? (
                    <p className="mt-0.5 text-xs text-navy-400">Based in {member.baseCountry}</p>
                  ) : null}

                  {member.whatTheyDo ? (
                    <p className="mt-2 line-clamp-3 text-sm text-navy-700">{member.whatTheyDo}</p>
                  ) : null}

                  {member.markets.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {member.markets.slice(0, 4).map((market) => (
                        <Tag key={market}>{market}</Tag>
                      ))}
                      {member.markets.length > 4 ? (
                        <Tag>+{member.markets.length - 4}</Tag>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
