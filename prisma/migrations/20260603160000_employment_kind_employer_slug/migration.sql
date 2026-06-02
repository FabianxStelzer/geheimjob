-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN "publicSlug" TEXT;
ALTER TABLE "EmployerProfile" ADD COLUMN "companyDescription" TEXT;

-- AlterTable
ALTER TABLE "WorkerProfile" ADD COLUMN "employmentKind" TEXT;

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN "employmentKind" TEXT;

-- Backfill publicSlug for existing employers
UPDATE "EmployerProfile" SET "publicSlug" = lower(hex(randomblob(8))) WHERE "publicSlug" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployerProfile_publicSlug_key" ON "EmployerProfile"("publicSlug");
