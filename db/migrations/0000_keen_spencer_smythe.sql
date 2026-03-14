CREATE TABLE "booking_attendees" (
	"id" text PRIMARY KEY NOT NULL,
	"bookingId" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "booking_attendees_unique" UNIQUE("bookingId","userId")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"venueId" text NOT NULL,
	"bookedBy" text NOT NULL,
	"title" text NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL,
	"weekDate" text NOT NULL,
	"isRecurring" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"bookingId" text NOT NULL,
	"adminId" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"votedAt" timestamp with time zone,
	CONSTRAINT "recurring_approvals_unique" UNIQUE("bookingId","adminId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" text PRIMARY KEY NOT NULL,
	"nameAr" text NOT NULL,
	"section" text NOT NULL,
	"capacity" integer,
	"isDouble" boolean DEFAULT false NOT NULL,
	"sortOrder" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_attendees" ADD CONSTRAINT "booking_attendees_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_attendees" ADD CONSTRAINT "booking_attendees_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_venueId_venues_id_fk" FOREIGN KEY ("venueId") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_bookedBy_users_id_fk" FOREIGN KEY ("bookedBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_approvals" ADD CONSTRAINT "recurring_approvals_bookingId_bookings_id_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_approvals" ADD CONSTRAINT "recurring_approvals_adminId_users_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_attendees_booking_idx" ON "booking_attendees" USING btree ("bookingId");--> statement-breakpoint
CREATE INDEX "bookings_venue_day_idx" ON "bookings" USING btree ("venueId","dayOfWeek");--> statement-breakpoint
CREATE INDEX "bookings_expires_idx" ON "bookings" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "recurring_approvals_booking_idx" ON "recurring_approvals" USING btree ("bookingId");--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("name");