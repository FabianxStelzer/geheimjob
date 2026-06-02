-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "stripeSecretKey" TEXT,
    "stripeWebhookSecret" TEXT,
    "stripePublishableKey" TEXT,
    "billingCatalogJson" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "PlatformSettings" ("id", "billingCatalogJson", "updatedAt")
VALUES ('default', '{}', CURRENT_TIMESTAMP);
