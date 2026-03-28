CREATE TABLE IF NOT EXISTS "Staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(128) NOT NULL,
	"role" text NOT NULL,
	"category" varchar NOT NULL,
	"contactMethod" varchar DEFAULT 'video-call' NOT NULL,
	"department" text,
	"bio" text,
	"language" varchar(10) DEFAULT 'en',
	"googleAccessToken" text,
	"googleRefreshToken" text,
	"googleTokenExpiresAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Staff_email_unique" UNIQUE("email")
);
