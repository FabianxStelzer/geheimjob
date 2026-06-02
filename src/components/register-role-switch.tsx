import Link from "next/link";

export function RegisterRoleSwitch({ current }: { current: "worker" | "employer" }) {
  return (
    <p className="text-center text-sm text-[var(--gj-muted)]">
      {current === "worker" ? (
        <>
          Sie suchen Talente für Ihr Unternehmen?{" "}
          <Link
            href="/register/arbeitgeber"
            className="font-semibold text-[var(--gj-primary)] hover:underline"
          >
            Als Arbeitgeber registrieren
          </Link>
        </>
      ) : (
        <>
          Sie suchen eine neue Stelle?{" "}
          <Link
            href="/register/arbeitnehmer"
            className="font-semibold text-[var(--gj-primary)] hover:underline"
          >
            Als Arbeitnehmer registrieren
          </Link>
        </>
      )}
    </p>
  );
}
