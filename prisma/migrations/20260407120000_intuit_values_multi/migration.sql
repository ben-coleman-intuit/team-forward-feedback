-- Migrate single intuitValue text to JSON array of strings

ALTER TABLE "FeedbackSubmission" ADD COLUMN "intuitValues" JSONB;

UPDATE "FeedbackSubmission" SET "intuitValues" = jsonb_build_array("intuitValue");

ALTER TABLE "FeedbackSubmission" DROP COLUMN "intuitValue";

ALTER TABLE "FeedbackSubmission" ALTER COLUMN "intuitValues" SET NOT NULL;
