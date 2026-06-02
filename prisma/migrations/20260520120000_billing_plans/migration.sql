-- AlterTable JobPosting
ALTER TABLE "JobPosting" ADD COLUMN "highlighted" BOOLEAN NOT NULL DEFAULT false;

-- Redefine Subscription with billing fields (SQLite)
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
    "adminNote" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("id", "userId", "stripeSubscriptionId", "stripePriceId", "status", "currentPeriodEnd", "updatedAt", "plan", "billingStatus")
SELECT "id", "userId", "stripeSubscriptionId", "stripePriceId", "status", "currentPeriodEnd", "updatedAt",
  CASE WHEN "status" = 'active' THEN 'PLUS' ELSE 'NONE' END,
  CASE WHEN "status" = 'active' THEN 'ACTIVE' ELSE 'INACTIVE' END
FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
PRAGMA foreign_keys=ON;
