CREATE TABLE IF NOT EXISTS "OAuthConnection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"service" varchar(64) NOT NULL,
	"accessToken" varchar(512) NOT NULL,
	"refreshToken" varchar(512),
	"expiresAt" timestamp,
	"scope" varchar(512),
	"externalUserId" varchar(128) NOT NULL,
	"externalUserName" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OAuthConnection" ADD CONSTRAINT "OAuthConnection_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
