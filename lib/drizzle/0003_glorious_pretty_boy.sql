ALTER TABLE "User" ADD COLUMN "passwordResetToken" varchar(255);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "passwordResetExpires" timestamp;