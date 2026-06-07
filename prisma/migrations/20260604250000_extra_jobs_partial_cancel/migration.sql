-- Teil-Kündigung Zusatzstellen: Anzahl statt Boolean
ALTER TABLE "Subscription" ADD COLUMN "extraJobsCancelCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "Subscription"
SET "extraJobsCancelCount" = "extraJobSlots"
WHERE "cancelExtraJobsAtPeriodEnd" = 1;

-- SQLite: Spalte entfernen durch Tabellen-Neuaufbau
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'NONE',
    "billingStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
    "paymentMethod" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "extraJobSlots" INTEGER NOT NULL DEFAULT 0,
    "addonHighlight" BOOLEAN NOT NULL DEFAULT false,
    "addonContactAll" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "extraJobsCancelCount" INTEGER NOT NULL DEFAULT 0,
    "cancelHighlightAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelContactAllAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" (
    "id", "userId", "plan", "billingStatus", "paymentMethod",
    "stripeSubscriptionId", "stripeCustomerId", "stripePriceId", "status",
    "extraJobSlots", "addonHighlight", "addonContactAll", "currentPeriodEnd",
    "cancelAtPeriodEnd", "extraJobsCancelCount", "cancelHighlightAtPeriodEnd",
    "cancelContactAllAtPeriodEnd", "adminNote", "updatedAt"
)
SELECT
    "id", "userId", "plan", "billingStatus", "paymentMethod",
    "stripeSubscriptionId", "stripeCustomerId", "stripePriceId", "status",
    "extraJobSlots", "addonHighlight", "addonContactAll", "currentPeriodEnd",
    "cancelAtPeriodEnd", "extraJobsCancelCount", "cancelHighlightAtPeriodEnd",
    "cancelContactAllAtPeriodEnd", "adminNote", "updatedAt"
FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
PRAGMA foreign_keys=ON;
