"use server";

import { db } from "@/db";
import { venues, bookings, users, sections } from "@/db/schema";
import { and, eq, gte, lte, or, asc } from "drizzle-orm";
import { endOfWeek, startOfWeek } from "date-fns";
import { VENUES_CONFIG } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth-middleware";
import { revalidatePath } from "next/cache";

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
  const result = await db.select({
    id: venues.id,
    nameAr: venues.nameAr,
    section: venues.section,
    sectionName: sections.nameAr,
    capacity: venues.capacity,
    isDouble: venues.isDouble,
    sortOrder: venues.sortOrder,
  })
  .from(venues)
  .leftJoin(sections, eq(venues.section, sections.id))
  .orderBy(asc(venues.sortOrder));
  
  return result;
}

export async function createVenue(data: typeof venues.$inferInsert) {
  await requireAdmin();
  const result = await db.insert(venues).values(data).returning();
  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return result[0];
}

export async function updateVenue(id: string, data: Partial<typeof venues.$inferInsert>) {
  await requireAdmin();
  const result = await db.update(venues).set(data).where(eq(venues.id, id)).returning();
  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return result[0];
}

export async function deleteVenue(id: string) {
  await requireAdmin();
  
  // Check for existing bookings
  const existingBookings = await db.select().from(bookings).where(eq(bookings.venueId, id)).limit(1);
  if (existingBookings.length > 0) {
    throw new Error("لا يمكن حذف القاعة لوجود حجوزات مرتبطة بها");
  }

  await db.delete(venues).where(eq(venues.id, id));
  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  return { success: true };
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
