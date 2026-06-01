/** CI: „geheim“ Smaragd + „job.de“ Dunkel — Plus Jakarta Sans 800, letter-spacing -0.5px */
export function BrandLogo({
  variant = "light",
  className = "text-base",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  if (variant === "dark") {
    return (
      <span className={`gj-logo font-extrabold tracking-[-0.05em] ${className}`}>
        <span className="text-[var(--gj-primary-light)]">geheim</span>
        <span className="text-white">job.de</span>
      </span>
    );
  }

  return (
    <span className={`gj-logo font-extrabold tracking-[-0.05em] ${className}`}>
      <span className="text-[var(--gj-primary)]">geheim</span>
      <span className="text-[var(--gj-text)]">job.de</span>
    </span>
  );
}

/** Platzhalter-Avatar / Icon mit Primärverlauf (135°) */
export function BrandAvatar({
  children,
  className = "h-9 w-9 text-sm",
  rounded = "xl",
}: {
  children: React.ReactNode;
  className?: string;
  rounded?: "full" | "xl" | "2xl";
}) {
  const r = rounded === "full" ? "rounded-full" : rounded === "2xl" ? "rounded-2xl" : "rounded-xl";
  return (
    <span
      className={`gj-gradient-primary inline-flex shrink-0 items-center justify-center font-bold text-white shadow-sm ${r} ${className}`}
    >
      {children}
    </span>
  );
}
