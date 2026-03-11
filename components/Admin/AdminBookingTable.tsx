"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Card from "../ui/card";

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceType: string;
  date: Date;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
}

interface AdminBookingTableProps {
  bookings: Booking[];
  onStatusChange?: (id: string, status: BookingStatus) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────

const statusLabels: Record<BookingStatus, string> = {
  confirmed: "مؤكد",
  pending: "قيد الانتظار",
  cancelled: "ملغي",
};

const statusBadge: Record<BookingStatus, string> = {
  confirmed: "badge-confirmed",
  pending: "badge-pending",
  cancelled: "badge-cancelled",
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("ar-EG", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

// ── AdminBookingTable ──────────────────────────────────────────

const AdminBookingTable = ({
  bookings,
  onStatusChange,
  onDelete,
  className,
}: AdminBookingTableProps) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.name.includes(search) ||
      b.phone.includes(search) ||
      b.serviceType.includes(search);
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <Card padded className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-title text-h3-ar text-church-red whitespace-nowrap" dir="rtl">
            إدارة الحجوزات
          </h2>
          <span className="badge badge-pending">{bookings.length} حجز</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <input
            className="form-input text-sm"
            placeholder="ابحث بالاسم أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            dir="rtl"
          />
          {/* Status filter */}
          <select
            className="form-input text-sm cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as BookingStatus | "all")}
            dir="rtl"
          >
            <option value="all">كل الحالات</option>
            <option value="confirmed">مؤكد</option>
            <option value="pending">قيد الانتظار</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </Card>

      {/* Table wrapper */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto church-scroll">
          <table className="admin-table" dir="rtl">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>الخدمة</th>
                <th>التاريخ</th>
                <th>الوقت</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-church-text-muted font-body">
                    لا توجد حجوزات مطابقة
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-semibold text-church-text">{booking.name}</td>
                    <td className="font-mono text-church-text-muted" dir="ltr">{booking.phone}</td>
                    <td>{booking.serviceType}</td>
                    <td className="text-church-text-muted">{formatDate(booking.date)}</td>
                    <td className="font-mono">{booking.time}</td>
                    <td>
                      <span className={cn("badge", statusBadge[booking.status])}>
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {booking.status === "pending" && (
                          <button
                            onClick={() => onStatusChange?.(booking.id, "confirmed")}
                            className="church-button church-button-primary text-xs px-3 py-1.5"
                            title="تأكيد"
                          >
                            ✓
                          </button>
                        )}
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => onStatusChange?.(booking.id, "cancelled")}
                            className="church-button church-button-outline text-xs px-3 py-1.5 border-church-text-light text-church-text-muted"
                            title="إلغاء"
                          >
                            ✕
                          </button>
                        )}
                        <button
                          onClick={() => onDelete?.(booking.id)}
                          className="p-1.5 rounded-lg text-church-text-light hover:text-church-red hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Footer summary */}
      <div className="flex flex-wrap gap-3 justify-end" dir="rtl">
        {(["confirmed", "pending", "cancelled"] as BookingStatus[]).map((s) => {
          const count = bookings.filter((b) => b.status === s).length;
          return (
            <div key={s} className={cn("badge text-xs px-3 py-1.5", statusBadge[s])}>
              {statusLabels[s]}: {count}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default AdminBookingTable;