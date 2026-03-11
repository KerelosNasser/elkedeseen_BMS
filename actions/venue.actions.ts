"use server";

import { db } from "@/db";
import { venues, bookings, users } from "@/db/schema";
import { and, eq, gte, lte, or } from "drizzle-orm";
import { endOfWeek, startOfWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export type VenueWithBookings = typeof venues.$inferSelect & {
  bookings: BookingWithDetails[];
};

export type BookingWithDetails = typeof bookings.$inferSelect & {
  booker: {
    id: string;
    name: string;
    role: string;
  };
};

export async function getAllVenues() {
  const allVenues = await db.select().from(venues).orderBy(venues.sortOrder);
  return allVenues;
}

export async function getBookingsForVenue(venueId: string, weekStart: Date): Promise<BookingWithDetails[]> {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 }); // Sunday

  // Convert to strings for date comparison (YYYY-MM-DD)
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const results = await db
    .select({
      booking: bookings,
      booker: {
        id: users.id,
        name: users.name,
        role: users.role,
      },
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.bookedBy, users.id))
    .where(
      and(
        eq(bookings.venueId, venueId),
        eq(bookings.status, "active"),
        // Note: CRON deletes expired ones, but we also filter them securely here just in case
        gte(bookings.expiresAt, new Date()),
        or(
          and(
            gte(bookings.weekDate, weekStartStr),
            lte(bookings.weekDate, weekEndStr)
          ),
          eq(bookings.isRecurring, true)
        )
      )
    );

  return results.map((r) => ({
    ...r.booking,
    booker: r.booker,
  }));
}
