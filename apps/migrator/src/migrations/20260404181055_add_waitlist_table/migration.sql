CREATE TYPE "tokistack"."waitlist_status" AS ENUM('pending', 'invited', 'registered');
CREATE TABLE "tokistack"."waitlist" (
	"email" text PRIMARY KEY UNIQUE,
	"status" "tokistack"."waitlist_status" DEFAULT 'pending'::"tokistack"."waitlist_status" NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"token" text UNIQUE,
	"invited_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
