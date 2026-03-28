ALTER TABLE "Staff" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "role" varchar DEFAULT 'student';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
