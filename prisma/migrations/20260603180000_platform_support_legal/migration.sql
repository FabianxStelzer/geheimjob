-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN "supportEmail" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "supportPhone" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "supportIntro" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "privacyContent" TEXT;
ALTER TABLE "PlatformSettings" ADD COLUMN "termsContent" TEXT;

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
