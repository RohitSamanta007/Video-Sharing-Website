ALTER TABLE "post" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "videoUrl" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "videoKey" SET NOT NULL;