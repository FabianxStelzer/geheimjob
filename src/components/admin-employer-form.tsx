"use client";

import { adminRevokeEmployerSubscription, adminSetEmployerSubscription } from "@/app/actions/admin-billing";

export function AdminEmployerForm({
  userId,
  companyName,
  email,
  plan,
  billingStatus,
  paymentMethod,
  extraJobSlots,
  addonHighlight,
  addonContactAll,
  adminNote,
}: {
  userId: string;
  companyName: string;
  email: string;
  plan: string;
  billingStatus: string;
  paymentMethod: string;
  extraJobSlots: number;
  addonHighlight: boolean;
  addonContactAll: boolean;
  adminNote: string;
}) {
  return (
    <details className="gj-card mt-2 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--gj-primary)]">
        {companyName} verwalten
      </summary>
      <form action={adminSetEmployerSubscription} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="userId" value={userId} />
        <label className="block sm:col-span-2">
          <span className="gj-label">E-Mail</span>
          <p className="mt-1 text-sm text-[var(--gj-text)]">{email}</p>
        </label>
        <label className="block">
          <span className="gj-label">Paket</span>
          <select name="plan" defaultValue={plan} className="gj-select">
            <option value="NONE">Keins</option>
            <option value="STARTER">Starter</option>
            <option value="PLUS">Plus</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </label>
        <label className="block">
          <span className="gj-label">Status</span>
          <select name="billingStatus" defaultValue={billingStatus} className="gj-select">
            <option value="INACTIVE">Inaktiv</option>
            <option value="PENDING">Ausstehend (Legacy)</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PAST_DUE">Überfällig</option>
            <option value="CANCELED">Gekündigt</option>
          </select>
        </label>
        <label className="block">
          <span className="gj-label">Zahlungsart</span>
          <select name="paymentMethod" defaultValue={paymentMethod || ""} className="gj-select">
            <option value="">—</option>
            <option value="STRIPE">Stripe</option>
            <option value="INVOICE">Rechnung</option>
          </select>
        </label>
        <label className="block">
          <span className="gj-label">Laufzeit (Tage)</span>
          <input name="periodDays" type="number" defaultValue={30} className="gj-input" />
        </label>
        <label className="block">
          <span className="gj-label">Zusatz-Stellen</span>
          <input name="extraJobSlots" type="number" defaultValue={extraJobSlots} className="gj-input" />
        </label>
        <label className="flex items-center gap-2">
          <input name="addonHighlight" type="checkbox" defaultChecked={addonHighlight} />
          <span className="text-sm">Hervorhebung</span>
        </label>
        <label className="flex items-center gap-2">
          <input name="addonContactAll" type="checkbox" defaultChecked={addonContactAll} />
          <span className="text-sm">Alle kontaktieren</span>
        </label>
        <label className="block sm:col-span-2">
          <span className="gj-label">Admin-Notiz</span>
          <textarea name="adminNote" rows={2} defaultValue={adminNote} className="gj-textarea" />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className="gj-btn-primary">
            Speichern &amp; Zugang setzen
          </button>
        </div>
      </form>
      <form action={adminRevokeEmployerSubscription} className="mt-2">
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" className="gj-btn-danger text-sm">
          Zugang entziehen
        </button>
      </form>
    </details>
  );
}
