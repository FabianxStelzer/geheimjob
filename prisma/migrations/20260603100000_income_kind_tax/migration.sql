-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN "salaryKind" TEXT NOT NULL DEFAULT 'BRUTTO';
ALTER TABLE "WorkerProfile" ADD COLUMN "taxClass" INTEGER;
ALTER TABLE "WorkerProfile" ADD COLUMN "churchTax" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "WorkerProfile" ADD COLUMN "federalState" TEXT;

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN "targetIncomeKind" TEXT NOT NULL DEFAULT 'BRUTTO';
