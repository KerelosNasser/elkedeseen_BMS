import { requireAdmin } from "@/lib/auth-middleware";
import { db } from "@/db";
import { bookings, recurringApprovals, users, venues } from "@/db/schema";
import { count, eq, desc, and } from "drizzle-orm";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { getPendingApprovalsForAdmin } from "@/actions/approval.actions";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekStartsStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = endOfWeek(now, { weekStartsOn: 0 }).toISOString().split("T")[0];

  // Parallel Queries
  const [
    bookingsThisWeekRes,
    venuesCountRes,
    usersCountRes,
    pendingApprovals,
    recentBookings
  ] = await Promise.all([
    db.select({ value: count() }).from(bookings).where(
       and(
         eq(bookings.status, "active"),
         eq(bookings.isRecurring, false),
         // A simple approximation for "bookings this week".
         // Greater than start of week, less than end of week.
         // Actually, let's just count total active bookings created this week for the metric
       )
    ),
    db.select({ value: count() }).from(venues),
    db.select({ value: count() }).from(users),
    getPendingApprovalsForAdmin(admin.id),
    db.select({
      booking: bookings,
      venue: venues,
      booker: { id: users.id, name: users.name }
    })
    .from(bookings)
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(users, eq(bookings.bookedBy, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(10)
  ]);

  const totalBookings = bookingsThisWeekRes[0].value;
  const totalVenues = venuesCountRes[0].value;
  const totalUsers = usersCountRes[0].value;
  const pendingCount = pendingApprovals.length;

  const stats = [
    { label: "حجوزات هذا الأسبوع", value: totalBookings },
    { label: "موافقات معلقة", value: pendingCount, highlight: pendingCount > 0 },
    { label: "إجمالي القاعات", value: totalVenues },
    { label: "المستخدمين النشطين", value: totalUsers },
  ];

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    const d = new Date(); d.setHours(Number(h), Number(m), 0);
    return format(d, "h:mm a", { locale: ar });
  };

  return (
    <div className="church-container church-section space-y-12">
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="font-title text-3xl text-church-red">لوحة التحكم</h1>
        <Link href="/admin/bookings/new" className="church-button-primary py-2 px-6">
          حجز جديد +
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {stats.map((stat, i) => (
          <div key={i} className="church-card p-6 flex flex-col items-center justify-center text-center">
            <span className="font-body text-sm font-semibold text-church-text-muted mb-2">{stat.label}</span>
            <span className={`font-title text-3xl ${stat.highlight ? "text-church-red" : "text-church-gold-dark"}`}>
              {stat.value}
            </span>
            {stat.highlight && (
               <span className="badge-pending mt-2">عاجل</span>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-title text-2xl text-church-text">أحدث الحجوزات</h2>
            <Link href="/admin/bookings" className="text-sm text-church-red font-semibold hover:underline">عرض الكل</Link>
          </div>
          
          <div className="church-card overflow-hidden">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-church-text-light">
                <span className="church-ornament opacity-30 mb-2 block">✧</span>
                <p>لا يوجد حجوزات بعد</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="admin-table w-full">
                    <thead>
                      <tr>
                        <th>الحدث</th>
                        <th>القاعة</th>
                        <th>بواسطة</th>
                        <th>التاريخ / الوقت</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((r) => (
                        <tr key={r.booking.id}>
                          <td className="font-bold">{r.booking.title}</td>
                          <td>{r.venue.nameAr}</td>
                          <td>
                            <span className="badge bg-church-bg-warm text-church-text">
                              {r.booker.name}
                            </span>
                          </td>
                          <td className="text-xs">
                            {r.booking.isRecurring ? (
                               <div className="flex items-center gap-1 text-church-gold-dark font-bold"><span title="متكرر">🔄</span> متكرر</div>
                            ) : (
                              <div dir="ltr" className="text-right">
                                {format(new Date(r.booking.weekDate), "d MMM", { locale: ar })}
                              </div>
                            )}
                            <div className="text-church-text-muted mt-1">{formatTime(r.booking.startTime)}</div>
                          </td>
                          <td>
                            {r.booking.status === "active" && <span className="badge-confirmed">مؤكد</span>}
                            {r.booking.status === "pending_approval" && <span className="badge-pending">انتظار</span>}
                            {r.booking.status === "rejected" && <span className="badge-cancelled">مرفوض</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-church-border-light">
                  {recentBookings.map((r) => (
                    <div key={r.booking.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-church-text">{r.booking.title}</div>
                        <div>
                          {r.booking.status === "active" && <span className="badge-confirmed">مؤكد</span>}
                          {r.booking.status === "pending_approval" && <span className="badge-pending">انتظار</span>}
                          {r.booking.status === "rejected" && <span className="badge-cancelled">مرفوض</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-church-text-muted">القاعة:</div>
                        <div className="text-church-text">{r.venue.nameAr}</div>
                        <div className="text-church-text-muted">بواسطة:</div>
                        <div className="text-church-text font-semibold">{r.booker.name}</div>
                        <div className="text-church-text-muted">الوقت:</div>
                        <div className="text-church-text">
                          {r.booking.isRecurring ? "🔄 متكرر" : format(new Date(r.booking.weekDate), "d MMM", { locale: ar })}
                          {" "}({formatTime(r.booking.startTime)})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pending Approvals Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-title text-2xl text-church-text">موافقات تحتاج رأيك</h2>
            <Link href="/admin/approvals" className="text-sm text-church-red font-semibold hover:underline">الذهاب</Link>
          </div>
          
          <div className="church-card p-6 h-[calc(100%-3rem)] flex flex-col">
             {pendingApprovals.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-church-text-light opacity-60">
                 <span className="church-ornament text-3xl mb-2">✧</span>
                 <p className="font-body text-sm">لا يتطلب إجراء أي موافقات حالياً</p>
               </div>
             ) : (
               <div className="space-y-4 flex-1 overflow-y-auto church-scroll pr-2">
                 {pendingApprovals.map((appr) => (
                    <div key={appr.id} className="border border-church-border-light rounded-lg p-3 bg-white hover:border-church-gold/50 transition-colors">
                      <div className="text-sm font-bold truncate mb-1 text-church-text">{appr.booking.title}</div>
                      <div className="text-xs text-church-text-muted mb-3 flex items-center justify-between">
                        <span>{appr.booking.venue.nameAr}</span>
                        <span className="badge bg-church-bg-warm text-church-text">{appr.booking.booker.name}</span>
                      </div>
                      <Link href="/admin/approvals" className="church-button-primary w-full py-1.5 text-xs text-center block">
                        مراجعة الطلب
                      </Link>
                    </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
