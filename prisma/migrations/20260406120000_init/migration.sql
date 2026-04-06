-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "FeedbackSubmission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subjectMemberId" TEXT NOT NULL,
    "subjectDisplayName" TEXT NOT NULL,
    "submitterName" TEXT NOT NULL,
    "submitterEmail" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "skillScores" JSONB NOT NULL,
    "intuitValue" TEXT NOT NULL,
    "narrativeBestWork" TEXT NOT NULL,
    "narrativeAdvice" TEXT NOT NULL,
    "narrativeOther" TEXT NOT NULL,
    "submitterIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "FeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackSubmission_subjectMemberId_idx" ON "FeedbackSubmission"("subjectMemberId");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_createdAt_idx" ON "FeedbackSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_submitterEmail_idx" ON "FeedbackSubmission"("submitterEmail");
