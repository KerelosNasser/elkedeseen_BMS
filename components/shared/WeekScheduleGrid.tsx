"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { ar } from "date-fns/locale";

type BookingWithDetails = {
  id: string;
  venueId: string;
  title: string;
  dayOfWeek: number;
  startTime: string; // "HH:mm:ss"
  endTime: string;
  isRecurring: boolean;
  status: "active" | "pending_approval" | "rejected";
  booker: {
    id: string;
    name: string;
    role: string;
  };
};

interface WeekScheduleGridProps {
  bookings: BookingWithDetails[];
  weekStart: Date;
  isDouble?: boolean;
  onSlotClick?: (day: number, time: string) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7 to 23
const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday (aligned with date-fns getDay)

export default function WeekScheduleGrid({ bookings, weekStart, isDouble, onSlotClick }: WeekScheduleGridProps) {
  const startDate = startOfWeek(weekStart, { weekStartsOn: 0 }); // Sunday

  // Helper to parse "HH:mm:ss" to minutes since 00:00
  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  // Convert total minutes to Y coordinate (1 slot = 30 mins = 40px)
  // Grid starts at 7:00 (420 mins)
  const getSlotTop = (timeStr: string) => {
    const totalMins = parseTimeToMinutes(timeStr);
    const minsFromStart = totalMins - 7 * 60;
    return (minsFromStart / 30) * 40; // 40px per 30 mins
  };

  const getSlotHeight = (startStr: string, endStr: string) => {
    const startMins = parseTimeToMinutes(startStr);
    const endMins = parseTimeToMinutes(endStr);
    const duration = endMins - startMins;
    return (duration / 30) * 40;
  };

  const formatHourLabel = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0);
    return format(date, "h a", { locale: ar });
  };

  return (
    <div className="w-full overflow-x-auto church-scroll pb-4" dir="rtl">
      <div className="min-w-[800px] border border-church-border-light rounded-lg bg-white overflow-hidden">
        {/* Header Row: Days */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-church-border bg-church-bg-card">
          <div className="p-3 text-center border-l border-church-border-light text-church-text-muted font-body text-sm font-semibold flex items-end justify-center">
            الوقت
          </div>
          {DAYS.map((dayIdx) => {
            const date = addDays(startDate, dayIdx);
            return (
              <div key={dayIdx} className="p-3 text-center border-l border-church-border-light last:border-l-0">
                <div className="font-title text-church-text font-bold text-lg leading-none">
                  {format(date, "EEEE", { locale: ar })}
                </div>
                <div className="font-body text-xs text-church-text-muted mt-1">
                  {format(date, "d MMM", { locale: ar })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Body */}
        <div className="relative flex">
          {/* Times Column */}
          <div className="w-[80px] flex-shrink-0 border-l border-church-border bg-church-bg-card/30">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[80px] border-b border-church-border-light relative">
                <div className="absolute top-0 right-0 w-full -translate-y-1/2 text-center text-xs font-body text-church-text-muted">
                  {formatHourLabel(hour)}
                </div>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {DAYS.map((dayIdx) => {
            const dayBookings = bookings.filter((b) => b.dayOfWeek === dayIdx);
            
            return (
              <div key={dayIdx} className="flex-1 relative border-l border-church-border-light last:border-l-0">
                {/* Horizontal Grid Lines */}
                {HOURS.map((hour) => (
                  <div key={`h-${hour}`} className="absolute w-full border-b border-church-border-light/50 h-[80px]" style={{ top: (hour - 7) * 80 }} />
                ))}
                {/* Half-hour lines */}
                {HOURS.map((hour) => (
                  <div key={`h-half-${hour}`} className="absolute w-full border-b border-church-border-light/30 border-dashed h-[40px]" style={{ top: (hour - 7) * 80 + 40 }} />
                ))}

                {/* Interactive Base Grid (for new bookings if admin) */}
                {onSlotClick && (
                  <div className="absolute inset-0 z-0 flex flex-col">
                    {Array.from({ length: 32 }).map((_, slotIdx) => {
                      const hour = Math.floor(slotIdx / 2) + 7;
                      const mins = (slotIdx % 2) * 30;
                      const timeStr = `${hour.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
                      
                      return (
                        <div 
                          key={`clickable-${slotIdx}`}
                          className="h-[40px] w-full hover:bg-church-gold/10 cursor-pointer transition-colors"
                          onClick={() => onSlotClick(dayIdx, timeStr)}
                          title={`حجز الساعة ${formatHourLabel(hour).replace('ص', 'صباحاً').replace('م', 'مساءً')}`}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Bookings */}
                {dayBookings.map((booking) => {
                  const top = getSlotTop(booking.startTime);
                  const height = getSlotHeight(booking.startTime, booking.endTime);
                  
                  // Pending status
                  if (booking.status === "pending_approval") {
                    return (
                      <div
                        key={booking.id}
                        className="absolute w-[calc(100%-4px)] right-[2px] rounded-md z-10 overflow-hidden font-body flex flex-col p-1.5 shadow-sm bg-gray-100 text-gray-700 border-r-4 border-gray-400"
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="text-xs font-bold truncate">{booking.title}</div>
                        <div className="flex items-center gap-1 mt-auto">
                          <span className="text-[10px] bg-white/60 px-1 rounded truncate flex-1">{booking.booker.name}</span>
                          <span className="text-[10px] bg-gray-200 px-1 rounded">انتظار</span>
                        </div>
                      </div>
                    );
                  }

                  // Active Recurring
                  if (booking.isRecurring) {
                    return (
                      <div
                        key={booking.id}
                        className="absolute w-[calc(100%-4px)] right-[2px] rounded-md z-10 overflow-hidden font-body flex flex-col p-1.5 shadow-sm bg-church-gold-light/40 text-church-text border-r-4 border-church-gold"
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="text-[11px] font-bold truncate leading-tight">{booking.title}</div>
                        <div className="flex items-center gap-1 mt-auto">
                          <span className="text-[10px] bg-white/60 px-1 rounded truncate flex-1">{booking.booker.name}</span>
                          <span title="حجز متكرر">🔄</span>
                          {isDouble && <span className="text-[9px] bg-white/60 px-1 font-bold">أ+ب</span>}
                        </div>
                      </div>
                    );
                  }

                  // Active Regular
                  return (
                    <div
                      key={booking.id}
                      className="absolute w-[calc(100%-4px)] right-[2px] rounded-md z-10 overflow-hidden font-body flex flex-col p-1.5 shadow-sm bg-church-red/10 text-church-red-dark border-r-4 border-church-red"
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="text-[11px] font-bold truncate leading-tight">{booking.title}</div>
                      <div className="flex items-center gap-1 mt-auto">
                        <span className="text-[10px] bg-white/60 px-1 rounded truncate flex-1">{booking.booker.name}</span>
                         {isDouble && <span className="text-[9px] bg-white/60 px-1 font-bold">أ+ب</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
