import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { BrandMark } from "@/components/BrandMark";

/**
 * The shareable card.
 *
 * A member profile lives behind the login, which means a link to one previews
 * as an empty grey box in WhatsApp: the crawler is redirected before it can
 * read anything. This route is the public face of that link.
 *
 * WHAT IS PUBLIC HERE, AND ONLY THIS: name, role, company and base country —
 * the four things a link preview has to carry to be worth sending. Email,
 * telephone, markets, expertise, what the member is looking for and every
 * request stay behind the login, on /members/[id].
 *
 * A signed-in member never sees this page: `src/middleware.ts` notices the
 * session cookie and sends them to the full profile instead.
 *
 * CACHED ON PURPOSE. The page holds no per-visitor state, so it is rendered
 * once and revalidated. A link-preview crawler gets an answer in milliseconds
 * from the edge without waking the database — which matters because the
 * database sleeps when idle, and a crawler that waits does not draw a card.
 * Profile edits call revalidatePath("/m/<slug>"), so a change shows up at once
 * rather than at the end of the window.
 */

/** Long, because every edit revalidates explicitly. */
export const revalidate = 3600;

/**
 * Prerendered at build so the card is on the edge before the first crawler
 * asks for it. Without this Next treats the segment as dynamic and sends
 * `no-store`, which is what kept every preview waiting on the database.
 *
 * A member added after the build is still served — `dynamicParams` stays on,
 * so an unknown slug renders once and is cached from then on. If the database
 * cannot be reached at build time the list is simply empty and every card
 * falls back to that on-demand path, because a directory that cannot deploy
 * is worse than one whose previews are a second slower.
 */
export async function generateStaticParams() {
  try {
    const members = await prisma.member.findMany({
      where: { status: "ACTIVE", slug: { not: null } },
      select: { slug: true },
    });
    return members.map((m) => ({ slug: m.slug as string }));
  } catch {
    return [];
  }
}

interface Params {
  params: Promise<{ slug: string }>;
}

const cardFields = {
  id: true,
  name: true,
  roleTitle: true,
  company: true,
  baseCountry: true,
} as const;

async function findMember(slug: string) {
  return prisma.member.findFirst({
    where: { slug, status: "ACTIVE" },
    select: cardFields,
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const member = await findMember(slug);
  if (!member) return { title: "Global Trade Network — Community Directory" };

  const line = [member.roleTitle, member.company].filter(Boolean).join(" · ");
  const title = member.company ? `${member.name} — ${member.company}` : member.name;
  const description = [
    line,
    member.baseCountry ? `Based in ${member.baseCountry}.` : "",
    "In the Global Trade Network Community Directory. Sign in to see markets, expertise and contacts.",
  ]
    .filter(Boolean)
    .join(" · ");

  const url = `${siteUrl()}/m/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      siteName: "Global Trade Network",
      title,
      description,
      url,
      images: [
        { url: "/opengraph-image.png", width: 1200, height: 630, alt: "Global Trade Network" },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
    // Previewable, never indexed: the crawler that builds a chat card reads the
    // tags directly, so the directory can stay out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function ShareCardPage({ params }: Params) {
  const { slug } = await params;
  const member = await findMember(slug);
  if (!member) notFound();

  const line = [member.roleTitle, member.company].filter(Boolean).join(" · ");

  return (
    <main className="flex min-h-screen flex-col justify-center bg-[var(--pf-inverse-ground)] px-[var(--pt-gutter)] py-[var(--pt-space-7)]">
      <div className="mx-auto w-full max-w-[30rem]">
        <div className="mb-[var(--pt-space-6)] flex items-center gap-3">
          <BrandMark size={28} ground="ink" />
          <span className="font-mono text-(length:--pt-mono-affordance) tracking-[var(--pt-ls-micro)] text-[var(--pf-inverse-mute)] uppercase">
            Global Trade Network · Community Directory
          </span>
        </div>

        <div className="bg-[var(--pf-surface)] p-[var(--pt-space-5)]">
          <h1 className="gt-heading">{member.name}</h1>
          {line ? (
            <p className="mt-1 font-sans text-(length:--pt-sub-title) text-[var(--pf-ink-2)]">
              {line}
            </p>
          ) : null}
          {member.baseCountry ? <p className="gt-meta mt-2">{member.baseCountry}</p> : null}

          <p className="gt-prose mt-[var(--pt-space-5)] border-t border-[var(--pf-rule)] pt-[var(--pt-space-4)]">
            The full profile — markets covered, products and expertise, what they are looking for
            and how to reach them — is visible to Community members.
          </p>

          <div className="mt-[var(--pt-space-4)] flex flex-wrap gap-2">
            <Link
              href={`/login?next=/members/${member.id}`}
              className="gt-act gt-act--primary no-underline"
            >
              Sign in to view
            </Link>
            <Link href="/signup" className="gt-act no-underline">
              I have an invite code
            </Link>
          </div>
        </div>

        <p className="mt-[var(--pt-space-5)] text-center font-sans text-(length:--pt-caption) text-[var(--pf-inverse-mute)]">
          A private directory for the Global Trade Network Community.
        </p>
      </div>
    </main>
  );
}
