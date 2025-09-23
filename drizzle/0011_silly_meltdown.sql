CREATE TABLE "savedVideo" (
	"userId" text NOT NULL,
	"postId" uuid NOT NULL,
	"createdAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "savedVideo" ADD CONSTRAINT "savedVideo_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savedVideo" ADD CONSTRAINT "savedVideo_postId_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;