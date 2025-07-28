ALTER TABLE "User" RENAME COLUMN "lastMessageDate" TO "messageLimitResetAt";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "messageLimitResetAt" SET DATA TYPE timestamp;