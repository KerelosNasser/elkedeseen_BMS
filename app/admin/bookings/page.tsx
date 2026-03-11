import { requireAdmin } from "@/lib/auth-middleware";
import { db } from "@/db";
import { bookings, venues, users } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { Calendar, Search, MapPin, Trash2, CheckCircle, XCircle } from "lucide-react";
// Assuming we have a delete action, we can add it later or trigger via client
import BookingsTableClient from "./BookingsTableClient";

export default async function AdminBookingsPage() {
  await requireAdmin();

  // Fetch all recent bookings (limit 100 for now)
  const allBookings = await db
    .select({
      booking: bookings,
      venue: venues,
      booker: { id: users.id, name: users.name, role: users.role }
    })
    .from(bookings)
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(users, eq(bookings.bookedBy, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(100);

  const formattedBookings = allBookings.map(r => ({
    ...r.booking,
    venue: r.venue,
    booker: r.booker
  }));

  return (
    <div className="church-container church-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-up">
        <h1 className="font-title text-3xl text-church-red">إدارة الحجوزات</h1>
        
        <div className="flex gap-3">
          <Link href="/admin/bookings/new" className="church-button-primary py-2 px-6 shadow-sm">
            حجز جديد +
          </Link>
        </div>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
         <BookingsTableClient initialBookings={formattedBookings} />
      </div>
    </div>
  );
}
