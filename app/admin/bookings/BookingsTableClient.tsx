"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, Filter, Trash2, Clock, CheckCircle } from "lucide-react";
import { deleteBooking } from "@/actions/booking.actions";
import { useRouter } from "next/navigation";

export default function BookingsTableClient({ initialBookings }: { initialBookings: any[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filtered = initialBookings.filter(b => {
    // Search match
    const searchString = `${b.title} ${b.venue.nameAr} ${b.booker.name}`.toLowerCase();
    const matchesSearch = searchString.includes(query.toLowerCase());
    
    // Status match
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    const d = new Date(); d.setHours(Number(h), Number(m), 0);
    return format(d, "h:mm a", { locale: ar });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحجز نهائياً؟")) return;
    
    setIsDeleting(id);
    const res = await deleteBooking(id);
    if (res.success) {
      router.refresh(); // reload data
    } else {
      alert(res.error || "فشل الحذف");
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-church-text-light w-5 h-5" />
          <input
            type="text"
            placeholder="ابحث باسم الحدث، القاعة، أو الحاجز..."
            className="form-input w-full pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="min-w-[200px] flex items-center gap-2">
          <Filter className="text-church-text-light w-5 h-5" />
          <select
            className="form-input flex-1 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            <option value="active">مؤكد</option>
            <option value="pending_approval">انتظار</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      <div className="church-card overflow-hidden overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-church-text-light">
             <div className="church-ornament opacity-30 text-4xl mb-3">✧</div>
             <p className="font-body text-lg">لم يتم العثور على حجوزات مطابقة للبحث</p>
          </div>
        ) : (
          <table className="admin-table w-full min-w-[800px]">
            <thead>
              <tr>
                <th>الحدث</th>
                <th>القاعة</th>
                <th>بواسطة</th>
                <th>التاريخ / الوقت</th>
                <th>الحالة</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td className="font-bold text-church-text">{b.title}</td>
                  <td className="text-church-text-muted">{b.venue.nameAr}</td>
                  <td>
                    <span className="badge bg-church-bg-warm text-church-text border border-church-border">
                      {b.booker.name}
                    </span>
                  </td>
                  <td>
                    {b.isRecurring ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs badge bg-church-gold-light/40 text-church-gold-dark border border-church-gold/30">
                          <Clock className="w-3 h-3 inline ml-1"/> מתكرر
                        </span>
                        <span className="text-xs text-church-text-muted mt-1">
                          ينتهي: {b.expiresAt ? format(new Date(b.expiresAt), "d MMM yyyy", { locale: ar }) : "-"}
                        </span>
                      </div>
                    ) : (
                      <div dir="ltr" className="text-right text-sm">
                        {format(new Date(b.weekDate), "d MMMM yyyy", { locale: ar })}
                      </div>
                    )}
                    <div className="text-xs text-church-text-muted mt-1">
                      {formatTime(b.startTime)} - {formatTime(b.endTime)}
                    </div>
                  </td>
                  <td>
                    {b.status === "active" && <span className="badge-confirmed">مؤكد</span>}
                    {b.status === "pending_approval" && <span className="badge-pending">انتظار</span>}
                    {b.status === "rejected" && <span className="badge-cancelled">مرفوض</span>}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={isDeleting === b.id}
                      className="p-2 text-church-text-light hover:text-church-red hover:bg-church-red/10 rounded-full transition-colors focus:outline-none disabled:opacity-50"
                      title="حذف الحجز"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
