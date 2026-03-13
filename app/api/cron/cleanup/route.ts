import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, bookingAttendees, recurringApprovals } from "@/db/schema";
import { lt, inArray } from "drizzle-orm";
import { subDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // 1. Find expired bookings (Older than 30 days past their expiry date)
    const expiredBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(lt(bookings.expiresAt, thirtyDaysAgo));

    if (expiredBookings.length > 0) {
      const expiredIds = expiredBookings.map((b) => b.id);

      // Delete in batch using inArray (much faster and efficient in PostgreSQL)
      await db.delete(bookingAttendees).where(inArray(bookingAttendees.bookingId, expiredIds));
      await db.delete(recurringApprovals).where(inArray(recurringApprovals.bookingId, expiredIds));
      await db.delete(bookings).where(inArray(bookings.id, expiredIds));

      return NextResponse.json({ 
        success: true, 
        message: `Cleaned up ${expiredIds.length} bookings`,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "No expired bookings found." 
    });
    
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
