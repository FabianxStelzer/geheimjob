-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "gdprConsentAt" DATETIME,
    "termsAcceptedAt" DATETIME,
    "referralCode" TEXT NOT NULL,
    "referredByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "User_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "professionField" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "salaryExpectation" INTEGER,
    "salaryPublic" BOOLEAN NOT NULL DEFAULT true,
    "availability" TEXT NOT NULL,
    "socialLinkedin" TEXT,
    "socialXing" TEXT,
    "socialWebsite" TEXT,
    "bio" TEXT,
    "anonymousSlug" TEXT NOT NULL,
    "videoIntroUrl" TEXT,
    "cvPdfFilename" TEXT,
    "cvDraftJson" TEXT,
    "profileVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT,
    "website" TEXT,
    "openPositionsNote" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkerEmployerBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerProfileId" TEXT NOT NULL,
    "blockedEmployerUserId" TEXT,
    "blockedCompanyName" TEXT,
    CONSTRAINT "WorkerEmployerBlock_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkerEmployerBlock_blockedEmployerUserId_fkey" FOREIGN KEY ("blockedEmployerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerProfileId" TEXT NOT NULL,
    "employerProfileId" TEXT NOT NULL,
    "initiatorUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "introMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatchRequest_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchRequest_employerProfileId_fkey" FOREIGN KEY ("employerProfileId") REFERENCES "EmployerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchRequest_initiatorUserId_fkey" FOREIGN KEY ("initiatorUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchRequestId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_matchRequestId_fkey" FOREIGN KEY ("matchRequestId") REFERENCES "MatchRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "href" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlatformReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlatformReview_employerUserId_fkey" FOREIGN KEY ("employerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "currentPeriodEnd" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlacementFee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchRequestId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "stripePaymentId" TEXT,
    "paidAt" DATETIME,
    CONSTRAINT "PlacementFee_matchRequestId_fkey" FOREIGN KEY ("matchRequestId") REFERENCES "MatchRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "bonusCents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralReward_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReferralReward_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_userId_key" ON "WorkerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_anonymousSlug_key" ON "WorkerProfile"("anonymousSlug");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerProfile_userId_key" ON "EmployerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementFee_matchRequestId_key" ON "PlacementFee"("matchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralReward_referredUserId_key" ON "ReferralReward"("referredUserId");
