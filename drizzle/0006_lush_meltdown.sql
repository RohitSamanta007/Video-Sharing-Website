ALTER TABLE "post" ALTER COLUMN "isPublic" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "imageUrl" text NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "imageKey" text NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_slug_unique" UNIQUE("slug");