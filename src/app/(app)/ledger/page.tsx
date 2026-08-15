import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { EmptyState, PageHeader, StatusPill, Tag } from "@/components/ui";

export const metadata = { title: "The Ledger — Global Trade Network" };

interface SearchParams {
  market?: string;
  type?: string;
}

/** "Africa / Middle East" names two markets; the filter should match either. */
function marketsOf(market: string): string[] {
  return market
    .split("/")
    .map((m) => m.trim())
    .filter(Boolean);
}

/**
 * One page a member can read top to bottom to answer "is there anything here
 * for me". The working list at /requests is filtered and chronological; this
 * is the same material grouped by the person who raised it, with what they
 * offer in return, so a reader sees both halves of a possible trade at once.
 */
export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser();
  const params = await searchParams;

  const [requests, members] = await Promise.all([
    prisma.opportunity.findMany({
      where: { status: { not: "CLOSED" } },
      orderBy: [{ requesterName: "asc" }, { type: "asc" }],
      include: { requester: { select: { id: true, canOffer: true } } },
    }),
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        company: true,
        baseCountry: true,
        expertise: true,
        canOffer: true,
      },
    }),
  ]);

  const allMarkets = [...new Set(requests.flatMap((r) => marketsOf(r.market)))].sort();
  const allTypes = [...new Set(requests.map((r) => r.type).filter(Boolean))].sort();

  const shown = requests.filter((r) => {
    const okMarket = !params.market || marketsOf(r.market).includes(params.market);
    const okType = !params.type || r.type === params.type;
    return okMarket && okType;
  });

  const byRequester = new Map<string, typeof shown>();
  for (const r of shown) {
    const list = byRequester.get(r.requesterName) ?? [];
    list.push(r);
    byRequester.set(r.requesterName, list);
  }

  const filtered = Boolean(params.market || params.type);
  const tallies = [
    { n: shown.length, label: filtered ? "Requests shown" : "Open requests" },
    { n: byRequester.size, label: "Members asking" },
    { n: members.length, label: "In the directory" },
    { n: allMarkets.length, label: "Markets named" },
  ];

  return (
    <>
      <PageHeader
        label="Global Trade Network"
        title="What the Community is looking for"
        subtitle="Every open request, and what each member can help with in return. Find something you can act on, then open that member's profile for their full details and contacts."
      />

      <div className="mb-[var(--pt-space-6)] flex flex-wrap gap-x-[var(--pt-space-7)] gap-y-[var(--pt-space-4)] tabular-nums">
        {tallies.map((t) => (
          <div key={t.label}>
            <span className="block font-serif text-[30px] leading-none">{t.n}</span>
            <span className="gt-label mt-2 block">{t.label}</span>
          </div>
        ))}
      </div>

      <form method="get" className="gt-derived mb-[var(--pt-space-6)] p-[var(--pt-space-4)]">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="gt-label mb-1.5 block">Market</span>
            <select className="gt-field" name="market" defaultValue={params.market ?? ""}>
              <option value="">Every market</option>
              {allMarkets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="gt-label mb-1.5 block">Type</span>
            <select className="gt-field" name="type" defaultValue={params.type ?? ""}>
              <option value="">Every type</option>
              {allTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button type="submit" className="gt-act gt-act--primary">
              Apply
            </button>
            {filtered ? (
              <Link href="/ledger" className="gt-act no-underline">
                Clear
              </Link>
            ) : null}
          </div>
        </div>
      </form>

      {shown.length === 0 ? (
        <EmptyState>Nothing matches those filters. Clear them to see every request.</EmptyState>
      ) : (
        [...byRequester.entries()].map(([name, rows]) => {
          const first = rows[0];
          const canOffer = first?.requester?.canOffer ?? "";
          const href = first?.requester ? `/members/${first.requester.id}` : "/requests";

          return (
            <section key={name} className="mt-[var(--pt-space-7)] first:mt-0">
              <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--pf-rule-strong)] pb-2.5">
                <div>
                  <h2 className="gt-heading">{name}</h2>
                  <p className="mt-0.5 font-sans text-(length:--pt-small) text-[var(--pf-ink-2)]">
                    {first?.requesterCompany}
                  </p>
                </div>
                <p className="gt-meta">{rows.length} open</p>
              </header>

              {canOffer ? (
                <div className="mt-[var(--pt-space-4)] border-l-2 border-[var(--pf-gold-rule)] pl-3.5">
                  <p className="gt-label gt-label--gold">Can help with</p>
                  <p className="gt-prose mt-1">{canOffer}</p>
                </div>
              ) : null}

              <ol>
                {rows.map((r) => (
                  <li
                    key={r.id}
                    className="border-b border-[var(--pf-rule)] py-[var(--pt-space-5)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={r.status} />
                      {r.type ? <Tag tone="gold">{r.type}</Tag> : null}
                      {r.market ? <Tag>{r.market}</Tag> : null}
                    </div>

                    <p className="mt-3 max-w-[70ch] font-sans text-(length:--pt-sub-title) text-[var(--pf-ink)]">
                      {r.request}
                    </p>

                    {r.supportNeeded ? (
                      <div className="mt-2.5">
                        <p className="gt-label">Support needed</p>
                        <p className="gt-prose mt-0.5">{r.supportNeeded}</p>
                      </div>
                    ) : null}

                    <Link
                      href={href}
                      className="mt-3 inline-block border-b border-[var(--pf-gold-rule)] pb-0.5 font-mono text-(length:--pt-mono-affordance) tracking-[var(--pt-ls-micro)] uppercase no-underline"
                    >
                      See {name.split(" ")[0]}&rsquo;s profile →
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })
      )}

      <section className="mt-[var(--pt-space-8)]">
        <h2 className="gt-heading">Who can help</h2>
        <p className="gt-prose mt-1">
          What members have offered to the Community, in their own words.
        </p>

        <ul className="mt-[var(--pt-space-5)] border-t border-[var(--pf-rule-strong)]">
          {members.map((m) => (
            <li key={m.id} className="border-b border-[var(--pf-rule)] py-[var(--pt-space-5)]">
              <Link
                href={`/members/${m.id}`}
                className="gt-row-title text-[var(--pf-ink)] no-underline hover:text-[var(--pf-gold-ink)]"
              >
                {m.name}
              </Link>
              <p className="mt-0.5 font-sans text-(length:--pt-small) text-[var(--pf-ink-2)]">
                {[m.company, m.baseCountry].filter(Boolean).join(" · ")}
              </p>
              {m.canOffer ? <p className="gt-prose mt-2">{m.canOffer}</p> : null}
              {m.expertise.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.expertise.slice(0, 8).map((e) => (
                    <Tag key={e}>{e}</Tag>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
