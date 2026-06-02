-- AlterTable
ALTER TABLE "WorkerEmployerBlock" ADD COLUMN "blockedWebsiteDomain" TEXT;
ALTER TABLE "WorkerEmployerBlock" ADD COLUMN "blockedManagingDirectorName" TEXT;

-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN "managingDirectorName" TEXT;
