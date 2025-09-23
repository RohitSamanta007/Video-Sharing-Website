ALTER TABLE "post" ALTER COLUMN "videoKey" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "videoKey" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "slugIndex" ON "post" USING btree ("slug");