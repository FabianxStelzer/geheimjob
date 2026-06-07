-- AlterTable WorkerProfile
ALTER TABLE "WorkerProfile" ADD COLUMN "whatsappPhone" TEXT;

-- AlterTable UserNotificationPrefs
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappMatchRequest" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappMatchAccepted" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappMatchRejected" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappCvRequest" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappCvGranted" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappNewMessage" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappHiringStage" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappNewJobMatch" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UserNotificationPrefs" ADD COLUMN "whatsappBilling" BOOLEAN NOT NULL DEFAULT false;
