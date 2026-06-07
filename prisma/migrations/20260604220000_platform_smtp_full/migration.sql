-- AlterTable PlatformSettings
ALTER TABLE "PlatformSettings" ADD COLUMN "smtpHost" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "smtpPort" INTEGER DEFAULT 587;
ALTER TABLE "PlatformSettings" ADD COLUMN "smtpSecure" BOOLEAN DEFAULT 0;
ALTER TABLE "PlatformSettings" ADD COLUMN "smtpUser" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "smtpPass" TEXT;
