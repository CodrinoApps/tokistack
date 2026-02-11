CREATE SCHEMA "tokistack";

CREATE TABLE "tokistack"."account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "tokistack"."invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" uuid NOT NULL
);

CREATE TABLE "tokistack"."member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "tokistack"."organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text
);

CREATE TABLE "tokistack"."session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"active_organization_id" text
);

CREATE TABLE "tokistack"."user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "tokistack"."verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "account_userId_idx" ON "tokistack"."account" ("user_id");
CREATE INDEX "invitation_organizationId_idx" ON "tokistack"."invitation" ("organization_id");
CREATE INDEX "invitation_email_idx" ON "tokistack"."invitation" ("email");
CREATE INDEX "member_organizationId_idx" ON "tokistack"."member" ("organization_id");
CREATE INDEX "member_userId_idx" ON "tokistack"."member" ("user_id");
CREATE UNIQUE INDEX "organization_slug_uidx" ON "tokistack"."organization" ("slug");
CREATE INDEX "session_userId_idx" ON "tokistack"."session" ("user_id");
CREATE INDEX "verification_identifier_idx" ON "tokistack"."verification" ("identifier");
ALTER TABLE "tokistack"."account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tokistack"."user"("id") ON DELETE CASCADE;
ALTER TABLE "tokistack"."invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tokistack"."organization"("id") ON DELETE CASCADE;
ALTER TABLE "tokistack"."invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "tokistack"."user"("id") ON DELETE CASCADE;
ALTER TABLE "tokistack"."member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tokistack"."organization"("id") ON DELETE CASCADE;
ALTER TABLE "tokistack"."member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tokistack"."user"("id") ON DELETE CASCADE;
ALTER TABLE "tokistack"."session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tokistack"."user"("id") ON DELETE CASCADE;