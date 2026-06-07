-- AlterTable Subscription
ALTER TABLE "Subscription" ADD COLUMN "cancelExtraJobsAtPeriodEnd" BOOLEAN DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN "cancelHighlightAtPeriodEnd" BOOLEAN DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN "cancelContactAllAtPeriodEnd" BOOLEAN DEFAULT 0;
