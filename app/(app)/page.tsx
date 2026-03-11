import { requireAuth } from "@/lib/auth-middleware";
import { getBookingsForUser } from "@/actions/booking.actions";
import { format, addDays, startOfToday } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Search } from "lucide-react";

export default async function HomePage() {
  const user = await requireAuth();
  const isAdmin = user.role === "admin";
  
  const myBookings = await getBookingsForUser(user.id);
  const today = startOfToday();
  const DAYS = [0, 1, 2, 3, 4, 5, 6]; 
  
  // Format times (assuming startTime is "HH:mm:ss")
  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(h), Number(m), 0);
    return format(date, "h:mm a", { locale: ar });
  };

  return (
    <div className="church-container church-section space-y-12">
      {/* Header */}
      <div className="text-center animate-fade-up">
        <h1 className="section-title">أهلاً بك، {user.name}</h1>
        <div className="gold-divider">
          <span className="church-ornament">♱</span>
        </div>
      </div>

      {isAdmin && (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-title text-2xl text-church-red">لوحة وصول سريعة</h2>
            <Link href="/admin/bookings/new" className="church-button-primary py-2 px-4 shadow-sm text-sm">
              حجز جديد +
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/bookings" className="church-card p-6 flex items-center justify-center gap-3 hover:bg-church-bg-warm transition-colors">
              <CalendarDays className="w-6 h-6 text-church-gold-dark" />
              <span className="font-title text-xl text-church-text">إدارة الحجوزات</span>
            </Link>
            <Link href="/admin/approvals" className="church-card p-6 flex items-center justify-center gap-3 hover:bg-church-bg-warm transition-colors">
              <span className="church-ornament text-xl">✤</span>
              <span className="font-title text-xl text-church-text">الموافقات المعلقة</span>
            </Link>
          </div>
        </div>
      )}

      {/* 7-Day Personal Schedule */}
      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <h2 className="font-title text-2xl text-church-gold-dark mb-6">جدولك للأيام السبعة القادمة</h2>
        
        <div className="space-y-6">
          {DAYS.map((offset) => {
            const date = addDays(today, offset);
            const dayOfWeek = date.getDay(); // 0-6 (Sun-Sat)
            const dateStr = format(date, "yyyy-MM-dd");

            // Match active or pending bookings for this day
            const dayBookings = myBookings.filter(b => {
              if (b.status === "rejected") return false;
              if (b.isRecurring) return b.dayOfWeek === dayOfWeek;
              return b.weekDate === dateStr && b.dayOfWeek === dayOfWeek;
            });

            // Sort by start time
            dayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={offset} className="church-card overflow-hidden">
                <div className="bg-church-bg-warm border-b border-church-border px-6 py-4 flex items-center gap-4">
                  <div className="bg-white px-4 py-2 rounded-lg border border-church-border shadow-sm text-center min-w-[80px]">
                    <div className="font-title text-lg text-church-red leading-none">{format(date, "EEEE", { locale: ar })}</div>
                    <div className="text-xs text-church-text-muted mt-1 font-body">{format(date, "d MMMM", { locale: ar })}</div>
                  </div>
                  {offset === 0 && (
                    <span className="badge bg-church-gold/20 text-church-gold-dark border border-church-gold/50 ml-auto">اليوم</span>
                  )}
                  {offset === 1 && (
                    <span className="badge bg-gray-100 text-gray-600 border border-gray-200 ml-auto">غداً</span>
                  )}
                </div>

                <div className="p-6">
                  {dayBookings.length === 0 ? (
                    <div className="text-center py-6 text-church-text-light flex flex-col items-center gap-2">
                      <span className="church-ornament opacity-40">✧</span>
                      <p className="text-sm font-body">لا يوجد حجوزات لك في هذا اليوم</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dayBookings.map((booking) => (
                        <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-church-border-light bg-white hover:border-church-gold/50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-church-text mb-1">{booking.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-church-text-muted mt-2">
                              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-church-red" /> {booking.venue.nameAr}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-church-gold" /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-r border-church-border-light pt-3 sm:pt-0 sm:pr-4">
                            <div className="flex flex-col gap-1 items-start sm:items-end">
                              <span className="text-xs text-church-text-light">بواسطة</span>
                              <span className={`badge ${booking.booker.role === 'admin' ? 'bg-church-gold-light/40 text-church-gold-dark' : 'bg-church-bg-warm text-church-text'}`}>
                                {booking.booker.name}
                              </span>
                            </div>
                            {booking.status === "pending_approval" && (
                              <span className="badge-pending rtl:mr-2">انتظار الموافقة</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
