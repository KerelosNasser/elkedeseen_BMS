CREATE TABLE "sections" (
	"id" text PRIMARY KEY NOT NULL,
	"nameAr" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_section_sections_id_fk" FOREIGN KEY ("section") REFERENCES "public"."sections"("id") ON DELETE no action ON UPDATE no action;