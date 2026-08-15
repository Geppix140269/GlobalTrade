/**
 * The network mark: an ink ring with gold nodes.
 *
 * Drawn at the line law's stroke weight, with no fill and no rounding. The
 * ring takes `currentColor` so the mark inverts with its ground; only the
 * nodes are fixed, because gold is the keystone on both grounds.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.75" />
      <ellipse
        cx="24"
        cy="24"
        rx="9.5"
        ry="20"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.55"
      />
      <path
        d="M4.4 17.5h39.2M4.4 30.5h39.2"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.55"
      />
      <circle cx="24" cy="4" r="3.4" fill="var(--pf-gold)" />
      <circle cx="41.3" cy="30.5" r="3.4" fill="var(--pf-gold)" />
      <circle cx="6.7" cy="30.5" r="3.4" fill="var(--pf-gold)" />
    </svg>
  );
}
