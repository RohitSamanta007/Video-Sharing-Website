ALTER TABLE "post" ALTER COLUMN "isPublic" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "isPending" boolean DEFAULT true;