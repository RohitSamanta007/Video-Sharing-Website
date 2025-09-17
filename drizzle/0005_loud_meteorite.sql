CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"videoUrl" text NOT NULL,
	"videoKey" text NOT NULL,
	"isPublic" boolean DEFAULT false,
	"createdAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "postCategory" (
	"postId" uuid NOT NULL,
	"categoryId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "postCategory" ADD CONSTRAINT "postCategory_postId_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postCategory" ADD CONSTRAINT "postCategory_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;