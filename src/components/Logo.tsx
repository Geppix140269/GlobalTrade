/** Understated circular network mark — navy ring, gold nodes. */
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
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <ellipse cx="24" cy="24" rx="10" ry="21" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M3.6 17.5h40.8M3.6 30.5h40.8" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <circle cx="24" cy="3" r="3.1" fill="var(--color-gold-500)" />
      <circle cx="41" cy="30.5" r="3.1" fill="var(--color-gold-500)" />
      <circle cx="7" cy="30.5" r="3.1" fill="var(--color-gold-500)" />
    </svg>
  );
}
