"use server";

import { db } from "@/db";
import { bookings, recurringApprovals, users, venues } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-middleware";
import { sendBookingStatusUpdateNotification } from "@/lib/mail";
import { revalidatePath } from "next/cache";

export type ApprovalWithDetails = typeof recurringApprovals.$inferSelect & {
  booking: typeof bookings.$inferSelect & {
    venue: typeof venues.$inferSelect;
    booker: {
      id: string;
      name: string;
      role: string;
    };
  };
};

export async function getPendingApprovalsForAdmin(adminId: string): Promise<ApprovalWithDetails[]> {
  const results = await db
    .select({
      approval: recurringApprovals,
      booking: bookings,
      venue: venues,
      booker: { id: users.id, name: users.name, role: users.role }
    })
    .from(recurringApprovals)
    .innerJoin(bookings, eq(recurringApprovals.bookingId, bookings.id))
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(users, eq(bookings.bookedBy, users.id))
    .where(
      and(
        eq(recurringApprovals.adminId, adminId),
        eq(bookings.status, "pending_approval"),
        eq(recurringApprovals.approved, false)
      )
    )
    .orderBy(bookings.createdAt);

  return results.map(r => ({
    ...r.approval,
    booking: {
      ...r.booking,
      venue: r.venue,
      booker: r.booker
    }
  }));
}

export async function voteOnApproval(approvalId: string, approved: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    // Verify approval exists and belongs to this admin
    const [approvalRecord] = await db
      .select()
      .from(recurringApprovals)
      .where(
        and(
          eq(recurringApprovals.id, approvalId),
          eq(recurringApprovals.adminId, admin.id)
        )
      );

    if (!approvalRecord) {
      return { success: false, error: "طلب الموافقة غير موجود أو لست مصرحا به" };
    }

    if (!approved) {
      // If rejected, reject the booking immediately 
      await db.update(bookings)
        .set({ status: "rejected" })
        .where(eq(bookings.id, approvalRecord.bookingId));
        
      // Fetch details for email
      const [bookingDetails] = await db
        .select({
          user: users,
          venue: venues,
          booking: bookings
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.bookedBy, users.id))
        .innerJoin(venues, eq(bookings.venueId, venues.id))
        .where(eq(bookings.id, approvalRecord.bookingId));

      if (bookingDetails) {
        await sendBookingStatusUpdateNotification({
          to: bookingDetails.user.email,
          venueName: bookingDetails.venue.nameAr,
          title: bookingDetails.booking.title,
          status: 'rejected',
          adminName: admin.name
        });
      }

      // Delete the pending approvals so they disappear from other admins' queues
      await db.delete(recurringApprovals)
        .where(eq(recurringApprovals.bookingId, approvalRecord.bookingId));
        
      return { success: true };
    }

    // If approved
    await db.update(recurringApprovals)
      .set({ approved: true })
      .where(eq(recurringApprovals.id, approvalId));

    // Check if ALL are approved
    const remainingUnapproved = await db
      .select()
      .from(recurringApprovals)
      .where(
        and(
          eq(recurringApprovals.bookingId, approvalRecord.bookingId),
          eq(recurringApprovals.approved, false)
        )
      );

    if (remainingUnapproved.length === 0) {
      // All admins approved, activate the booking
      await db.update(bookings)
        .set({ status: "active" })
        .where(eq(bookings.id, approvalRecord.bookingId));
        
      // Fetch details for email
      const [bookingDetails] = await db
        .select({
          user: users,
          venue: venues,
          booking: bookings
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.bookedBy, users.id))
        .innerJoin(venues, eq(bookings.venueId, venues.id))
        .where(eq(bookings.id, approvalRecord.bookingId));

      if (bookingDetails) {
        await sendBookingStatusUpdateNotification({
          to: bookingDetails.user.email,
          venueName: bookingDetails.venue.nameAr,
          title: bookingDetails.booking.title,
          status: 'active'
        });
      }

      // Clean up approvals since they are no longer needed
      await db.delete(recurringApprovals)
        .where(eq(recurringApprovals.bookingId, approvalRecord.bookingId));
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Vote error:", error);
    return { success: false, error: "حدث خطأ غير متوقع" };
  }
}

