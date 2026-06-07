-- AlterTable PlatformSettings
ALTER TABLE "PlatformSettings" ADD COLUMN "twilioAccountSid" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "twilioAuthToken" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "twilioWhatsAppFrom" TEXT;
