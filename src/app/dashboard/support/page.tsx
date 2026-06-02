import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContactSupportForm } from "@/components/contact-support-form";
import { getSupportSettings } from "@/lib/platform-content";

export default async function SupportCenterPage() {
  const session = await auth();
  const support = await getSupportSettings();

  let defaultName = "";
  if (session?.user?.role === "WORKER") {
    const p = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      select: { displayName: true },
    });
    defaultName = p?.displayName ?? "";
  } else if (session?.user?.role === "EMPLOYER") {
    const p = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
      select: { contactName: true },
    });
    defaultName = p?.contactName ?? "";
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Support-Center</h2>
        {support.intro ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--gj-text-secondary)]">{support.intro}</p>
        ) : (
          <p className="mt-2 text-sm text-[var(--gj-muted)]">
            Fragen zur Plattform? Schreiben Sie uns — wir melden uns zurück.
          </p>
        )}
        <dl className="mt-6 space-y-3 text-sm">
          {support.email ? (
            <div className="flex flex-wrap justify-between gap-2 border-b border-[var(--gj-border)] pb-3">
              <dt className="text-[var(--gj-muted)]">E-Mail</dt>
              <dd>
                <a
                  href={`mailto:${support.email}`}
                  className="font-medium text-[var(--gj-primary)] hover:underline"
                >
                  {support.email}
                </a>
              </dd>
            </div>
          ) : null}
          {support.phone ? (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-[var(--gj-muted)]">Telefon</dt>
              <dd>
                <a
                  href={`tel:${support.phone.replace(/\s/g, "")}`}
                  className="font-medium text-[var(--gj-primary)] hover:underline"
                >
                  {support.phone}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
        {!support.email && !support.phone ? (
          <p className="mt-4 text-xs text-amber-800">
            Kontaktdaten werden vom Betreiber im Super-Admin hinterlegt.
          </p>
        ) : null}
      </section>

      <section className="gj-card p-6">
        <h3 className="text-base font-semibold">Kontaktformular</h3>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Ihre Nachricht wird an unser Team weitergeleitet.
        </p>
        <div className="mt-6">
          <ContactSupportForm
            defaultName={defaultName}
            defaultEmail={session?.user?.email ?? ""}
          />
        </div>
      </section>
    </div>
  );
}
