-- AlterTable EmployerProfile
ALTER TABLE "EmployerProfile" ADD COLUMN "productsAndServices" TEXT;
ALTER TABLE "EmployerProfile" ADD COLUMN "employeeCountRange" TEXT;
ALTER TABLE "EmployerProfile" ADD COLUMN "foundedYear" INTEGER;
ALTER TABLE "EmployerProfile" ADD COLUMN "companyBenefits" TEXT;
ALTER TABLE "EmployerProfile" ADD COLUMN "companyCulture" TEXT;

-- CreateTable UserNotificationPrefs
CREATE TABLE "UserNotificationPrefs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailMatchRequest" BOOLEAN NOT NULL DEFAULT true,
    "emailMatchAccepted" BOOLEAN NOT NULL DEFAULT true,
    "emailMatchRejected" BOOLEAN NOT NULL DEFAULT true,
    "emailCvRequest" BOOLEAN NOT NULL DEFAULT true,
    "emailCvGranted" BOOLEAN NOT NULL DEFAULT true,
    "emailNewMessage" BOOLEAN NOT NULL DEFAULT true,
    "emailHiringStage" BOOLEAN NOT NULL DEFAULT true,
    "emailNewJobMatch" BOOLEAN NOT NULL DEFAULT true,
    "emailNewTalent" BOOLEAN NOT NULL DEFAULT true,
    "emailBilling" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserNotificationPrefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserNotificationPrefs_userId_key" ON "UserNotificationPrefs"("userId");
