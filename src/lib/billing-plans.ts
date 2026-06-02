import type { EmployerPlan } from "@prisma/client";

export type AddonCode = "EXTRA_JOB" | "HIGHLIGHT" | "CONTACT_ALL";

export type PlanDefinition = {
  code: EmployerPlan;
  name: string;
  priceEur: number;
  description: string;
  features: string[];
  jobSlots: number;
  talentPool: boolean;
  canPublishJobs: boolean;
  includesHighlight: boolean;
  notifyTalentsOnNewJob: boolean;
  notifyOnNewTalentSignup: boolean;
  /** Fallback Env-Variable, wenn stripePriceId leer */
  stripePriceEnv: string;
  /** Aus Super-Admin oder .env */
  stripePriceId?: string;
};

export type AddonDefinition = {
  code: AddonCode;
  name: string;
  priceEur: number;
  description: string;
  stripePriceEnv: string;
  stripePriceId?: string;
};

/** Standard-Katalog (wird mit DB-Overrides aus Super-Admin zusammengeführt). */
export const PLAN_CATALOG_DEFAULT: PlanDefinition[] = [
  {
    code: "STARTER",
    name: "Starter",
    priceEur: 147,
    description: "Talentpool einsehen, keine Stellenanzeigen",
    features: [
      "Vollzugriff auf den Talentpool",
      "Kandidaten kontaktieren (einzeln)",
      "Keine Stellenanzeigen",
    ],
    jobSlots: 0,
    talentPool: true,
    canPublishJobs: false,
    includesHighlight: false,
    notifyTalentsOnNewJob: false,
    notifyOnNewTalentSignup: false,
    stripePriceEnv: "STRIPE_PRICE_STARTER",
  },
  {
    code: "PLUS",
    name: "Plus",
    priceEur: 347,
    description: "Talentpool + 5 Stellenanzeigen",
    features: [
      "Alles aus Starter",
      "Bis zu 5 veröffentlichte Stellen gleichzeitig",
    ],
    jobSlots: 5,
    talentPool: true,
    canPublishJobs: true,
    includesHighlight: false,
    notifyTalentsOnNewJob: false,
    notifyOnNewTalentSignup: false,
    stripePriceEnv: "STRIPE_PRICE_PLUS",
  },
  {
    code: "PREMIUM",
    name: "Premium",
    priceEur: 997,
    description: "Talentpool + 15 Stellen + Hervorhebung + Talent-Alerts",
    features: [
      "Alles aus Plus",
      "Bis zu 15 Stellen gleichzeitig",
      "Stellen-Hervorhebung inklusive",
      "Passende Talente werden bei neuer Stelle benachrichtigt",
      "Sofortbenachrichtigung bei neuem Talent",
    ],
    jobSlots: 15,
    talentPool: true,
    canPublishJobs: true,
    includesHighlight: true,
    notifyTalentsOnNewJob: true,
    notifyOnNewTalentSignup: true,
    stripePriceEnv: "STRIPE_PRICE_PREMIUM",
  },
];

export const ADDON_CATALOG_DEFAULT: AddonDefinition[] = [
  {
    code: "EXTRA_JOB",
    name: "Zusatzstelle",
    priceEur: 97,
    description: "+1 zusätzliche Stellenanzeige pro Monat",
    stripePriceEnv: "STRIPE_PRICE_ADDON_EXTRA_JOB",
  },
  {
    code: "HIGHLIGHT",
    name: "Hervorhebung",
    priceEur: 119,
    description: "Hervorgehobene Darstellung Ihrer Stellen",
    stripePriceEnv: "STRIPE_PRICE_ADDON_HIGHLIGHT",
  },
  {
    code: "CONTACT_ALL",
    name: "Alle kontaktieren",
    priceEur: 79,
    description: "Schnellkontakt zu allen sichtbaren Talenten im Pool",
    stripePriceEnv: "STRIPE_PRICE_ADDON_CONTACT_ALL",
  },
];

/** @deprecated Nutze getPlanCatalog() — nur noch für Client-Defaults */
export const PLAN_CATALOG = PLAN_CATALOG_DEFAULT;
export const ADDON_CATALOG = ADDON_CATALOG_DEFAULT;
