-- CreateEnum
-- SQLite: Prisma stores enums as TEXT

-- AlterTable WorkerProfile
ALTER TABLE "WorkerProfile" ADD COLUMN "cvShareMode" TEXT NOT NULL DEFAULT 'ON_REQUEST';

-- AlterTable MatchRequest
ALTER TABLE "MatchRequest" ADD COLUMN "cvRequestedAt" DATETIME;
ALTER TABLE "MatchRequest" ADD COLUMN "cvGrantedAt" DATETIME;
