import Image from "next/image";

/**
 * The Ponte mark, as used by the Global Trade Network directory.
 *
 * BRAND AUTHORITY
 * Ponte Brand Identity v1 — 2026-08-10 — APPROVED AND FROZEN, via
 * ponte-trade/docs/authority/DESIGN.md §11. The assets in `public/brand/`
 * are the exported files, not a copy of them.
 *
 * THE MARK IS REFERENCED, NEVER DRAWN. No arch geometry appears in this
 * file or in any other source file here, which is the standard's binding
 * rule: a second copy of a drawing is how a brand stops being one. This
 * component is the only place the asset is loaded, and
 * `scripts/check-brand.mjs` fails the build if the path reappears in source.
 *
 * GROUNDS. On the ink ground the mark reverses directly onto it — no chip,
 * because a chip on ink is invisible and adds nothing. On paper it sits in
 * an ink chip, per the vNext handoff §1a.
 *
 * WHAT THIS PRODUCT DOES NOT USE. The `Ponte.trade` lockup names the
 * company, and this directory is not that company — it carries the mark and
 * the design language, and keeps its own name in type beside it. The
 * exported lockups are in `public/brand/` for documents and letterhead.
 */
export function BrandMark({
  size = 30,
  ground = "ink",
}: {
  size?: number;
  /** The ground the mark sits on, which decides reversal and the chip. */
  ground?: "ink" | "paper";
}) {
  const src = ground === "ink" ? "/brand/ponte-mark-reversed.svg" : "/brand/ponte-mark.svg";

  const mark = (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      priority
      aria-hidden="true"
      className="shrink-0"
    />
  );

  if (ground === "ink") return mark;

  // On paper the mark is carried in an ink chip at the handoff's proportion:
  // a 25px mark in a 38px chip.
  const chip = Math.round(size * (38 / 25));
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center bg-[var(--pf-ink)]"
      style={{ width: chip, height: chip }}
    >
      <Image
        src="/brand/ponte-mark-reversed.svg"
        alt=""
        width={size}
        height={size}
        aria-hidden="true"
      />
    </span>
  );
}
