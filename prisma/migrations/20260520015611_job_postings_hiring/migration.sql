-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN "photoUrl" TEXT;

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT,
    "richDescription" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "productCostHint" TEXT,
    "commissionHint" TEXT,
    "targetIncomeHint" TEXT,
    "workModeHint" TEXT,
    "weeklyHoursHint" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobPosting_employerProfileId_fkey" FOREIGN KEY ("employerProfileId") REFERENCES "EmployerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatchRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerProfileId" TEXT NOT NULL,
    "employerProfileId" TEXT NOT NULL,
    "jobPostingId" TEXT,
    "initiatorUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "hiringStage" TEXT NOT NULL DEFAULT 'NONE',
    "introMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatchRequest_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchRequest_employerProfileId_fkey" FOREIGN KEY ("employerProfileId") REFERENCES "EmployerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchRequest_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MatchRequest_initiatorUserId_fkey" FOREIGN KEY ("initiatorUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MatchRequest" ("createdAt", "employerProfileId", "id", "initiatorUserId", "introMessage", "status", "updatedAt", "workerProfileId") SELECT "createdAt", "employerProfileId", "id", "initiatorUserId", "introMessage", "status", "updatedAt", "workerProfileId" FROM "MatchRequest";
DROP TABLE "MatchRequest";
ALTER TABLE "new_MatchRequest" RENAME TO "MatchRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
