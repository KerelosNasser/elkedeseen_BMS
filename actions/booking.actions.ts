"use server";

import { db } from "@/db";
import { bookings, users, bookingAttendees, venues, recurringApprovals } from "@/db/schema";
import { and, eq, gte, lte, or, sql, inArray } from "drizzle-orm";
import { endOfWeek, startOfWeek } from "date-fns";
import { revalidatePath } from "next/cache";
import { sendBookingNotification, sendApprovalRequestNotification } from "@/lib/mail";

const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export type BookingWithVenueAndBooker = typeof bookings.$inferSelect & {
  venue: typeof venues.$inferSelect;
  booker: {
    id: string;
    name: string;
    role: string;
  };
  approvals?: (typeof recurringApprovals.$inferSelect & {
    admin: { name: string };
  })[];
};

export async function getBookingsForUser(userId: string): Promise<BookingWithVenueAndBooker[]> {
  const now = new Date();
  
  // 1. Fetch where user is the booker
  const bookedByMe = await db
    .select({
      booking: bookings,
      venue: venues,
      booker: { id: users.id, name: users.name, role: users.role },
    })
    .from(bookings)
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(users, eq(bookings.bookedBy, users.id))
    .where(
      and(
        eq(bookings.bookedBy, userId),
        gte(bookings.expiresAt, now),
        or(eq(bookings.status, "active"), eq(bookings.status, "pending_approval"))
      )
    );

  // 2. Fetch where user is an attendee
  const attending = await db
    .select({
      booking: bookings,
      venue: venues,
      booker: { id: users.id, name: users.name, role: users.role },
    })
    .from(bookingAttendees)
    .innerJoin(bookings, eq(bookingAttendees.bookingId, bookings.id))
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(users, eq(bookings.bookedBy, users.id))
    .where(
      and(
        eq(bookingAttendees.userId, userId),
        gte(bookings.expiresAt, now),
        or(eq(bookings.status, "active"), eq(bookings.status, "pending_approval"))
      )
    );

  // Merge and deduplicate
  const allBookingsMap = new Map<string, BookingWithVenueAndBooker>();
  
  const processResult = (arr: any[]) => {
    arr.forEach(r => {
      allBookingsMap.set(r.booking.id, {
        ...r.booking,
        venue: r.venue,
        booker: r.booker
      });
    });
  };

  processResult(bookedByMe);
  processResult(attending);

  const finalBookings = Array.from(allBookingsMap.values());

  // Enrich with approval info for pending ones
  for (const b of finalBookings) {
    if (b.status === "pending_approval") {
      const approvals = await db
        .select({
          id: recurringApprovals.id,
          bookingId: recurringApprovals.bookingId,
          adminId: recurringApprovals.adminId,
          approved: recurringApprovals.approved,
          votedAt: recurringApprovals.votedAt,
          admin: { name: users.name }
        })
        .from(recurringApprovals)
        .innerJoin(users, eq(recurringApprovals.adminId, users.id))
        .where(eq(recurringApprovals.bookingId, b.id));
      
      b.approvals = approvals;
    }
  }

  return finalBookings;
}

export type UserSearchResult = {
  id: string;
  name: string;
  role: string;
};

export async function searchAttendees(query: string): Promise<UserSearchResult[]> {
  if (!query || query.length < 2) return [];

  const results = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(or(
      // basic ILIKE search, Drizzle 'ilike' might be needed depending on DB, but 'like' with % works too
      // Neon/Postgres supports ILIKE
      sql`${users.name} LIKE ${'%' + query + '%'}`,
      sql`${users.email} LIKE ${'%' + query + '%'}`
    ))
    .limit(10);

  return results;
}

export async function checkConflict(venueId: string, _weekDate: string, dayOfWeek: number, startTime: string, endTime: string): Promise<boolean> {
  const conflicting = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.venueId, venueId),
        eq(bookings.dayOfWeek, dayOfWeek),
        or(eq(bookings.status, "active"), eq(bookings.status, "pending_approval")),
        sql`${bookings.startTime} < ${endTime}`,
        sql`${bookings.endTime} > ${startTime}`,
        or(
          eq(bookings.isRecurring, true),
          eq(bookings.weekDate, _weekDate)
        )
      )
    )
    .limit(1);

  return conflicting.length > 0;
}

export async function createBooking(data: any) {
  try {
    const { venueId, title, weekDate, dayOfWeek, startTime, endTime, isRecurring, expiresAt, bookedBy, attendeeIds } = data;

    const hasConflict = await checkConflict(venueId, weekDate, dayOfWeek, startTime, endTime);
    if (hasConflict) {
      return { success: false, error: "يوجد تعارض في هذه القاعة بهذا الموعد!" };
    }

    const status = isRecurring ? "pending_approval" : "active";

    const [newBooking] = await db.insert(bookings).values({
      venueId,
      title,
      weekDate,
      dayOfWeek,
      startTime,
      endTime,
      isRecurring,
      expiresAt: new Date(expiresAt),
      bookedBy,
      status
    }).returning();

    if (attendeeIds && attendeeIds.length > 0) {
      const attendeesData = attendeeIds.map((userId: string) => ({
        bookingId: newBooking.id,
        userId
      }));
      await db.insert(bookingAttendees).values(attendeesData);
    }

    if (isRecurring) {
      const allAdmins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
      const otherAdmins = allAdmins.filter(a => a.id !== bookedBy);
      
      if (otherAdmins.length > 0) {
        const approvalsData = otherAdmins.map(admin => ({
          bookingId: newBooking.id,
          adminId: admin.id,
          approved: false
        }));
        await db.insert(recurringApprovals).values(approvalsData);
      } else {
        await db.update(bookings).set({ status: "active" }).where(eq(bookings.id, newBooking.id));
      }
    }

    // --- Email Notifications ---
    try {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      
      if (adminEmails.length > 0) {
        const venue = await db.query.venues.findFirst({ where: eq(venues.id, venueId) });
        const booker = await db.query.users.findFirst({ where: eq(users.id, bookedBy) });
        
        if (venue && booker) {
          const allAdmins = await db.select().from(users).where(eq(users.role, "admin"));
          const adminEmailsFromDb = allAdmins.map(a => a.email);
          
          // Use config emails as fallback or addition
          const combinedEmails = Array.from(new Set([...adminEmailsFromDb, ...adminEmails]));

          if (combinedEmails.length > 0) {
            if (!isRecurring) {
              // Notify all admins about normal booking
              await sendBookingNotification({
                venueName: venue.nameAr,
                bookerName: booker.name,
                bookerEmail: booker.email,
                date: weekDate,
                startTime,
                endTime,
                adminEmails: combinedEmails
              });
            } else {
              // Notify other admins (excluding the booker) about approval request
              const otherAdminsEmails = allAdmins
                .filter(a => a.id !== bookedBy)
                .map(a => a.email);

              if (otherAdminsEmails.length > 0) {
                await sendApprovalRequestNotification({
                  venueName: venue.nameAr,
                  bookerName: booker.name,
                  bookerEmail: booker.email,
                  dayOfWeek: daysAr[dayOfWeek],
                  startTime,
                  endTime,
                  adminEmails: otherAdminsEmails
                });
              }
            }
          }
        }
      }
    } catch (mailError) {
      console.error("Failed to trigger email notifications:", mailError);
      // Don't fail the booking if email fails
    }

    revalidatePath("/");
    return { success: true, bookingId: newBooking.id };
  } catch (error) {
    console.error("Failed to create booking", error);
    return { success: false, error: "حدث خطأ أثناء حفظ الحجز" };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    // Delete Attendees First (Cascading could be set in schema, but doing it manually is safe)
    await db.delete(bookingAttendees).where(eq(bookingAttendees.bookingId, bookingId));
    
    // Delete Approvals
    await db.delete(recurringApprovals).where(eq(recurringApprovals.bookingId, bookingId));

    // Delete Booking
    await db.delete(bookings).where(eq(bookings.id, bookingId));
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return { success: false, error: "حدث خطأ أثناء حذف الحجز" };
  }
}

