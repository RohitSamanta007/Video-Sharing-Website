ALTER TABLE "post" ADD COLUMN "screenshotUrls" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "screenshotKeys" text[] DEFAULT '{}' NOT NULL;