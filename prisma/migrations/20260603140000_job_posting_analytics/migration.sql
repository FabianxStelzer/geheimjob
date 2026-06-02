-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN "detailViewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "JobPostingView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobPostingId" TEXT NOT NULL,
    "workerUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobPostingView_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPostingView_jobPostingId_workerUserId_key" ON "JobPostingView"("jobPostingId", "workerUserId");
CREATE INDEX "JobPostingView_jobPostingId_idx" ON "JobPostingView"("jobPostingId");
