import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, bookingAttendees, recurringApprovals } from "@/db/schema";
import { lt, eq } from "drizzle-orm";
import { subDays } from "date-fns";

export async function GET(request: Request) {
  try {
    // Optional: Secure this endpoint so only Vercel Cron or authorized request can trigger it.
    // Assuming simple shared secret in Authorization header: `Bearer ${process.env.CRON_SECRET}`
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const thirtyDaysAgo = subDays(new Date(), 30);

    // 1. Find expired bookings
    const expiredBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(lt(bookings.expiresAt, thirtyDaysAgo));

    if (expiredBookings.length === 0) {
      return NextResponse.json({ success: true, message: "No expired bookings found" });
    }

    const expiredIds = expiredBookings.map((b) => b.id);

    // 2. Delete related attendees
    for (const bookingId of expiredIds) {
      await db.delete(bookingAttendees).where(eq(bookingAttendees.bookingId, bookingId));
      await db.delete(recurringApprovals).where(eq(recurringApprovals.bookingId, bookingId));
    }

    // 3. Delete bookings
    for (const bookingId of expiredIds) {
      await db.delete(bookings).where(eq(bookings.id, bookingId));
    }

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${expiredIds.length} expired bookings`,
      deletedIds: expiredIds 
    });
    
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
