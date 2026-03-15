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
const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

export default function WeekScheduleGrid({ bookings, weekStart, isDouble, onSlotClick }: WeekScheduleGridProps) {
  const startDate = startOfWeek(weekStart, { weekStartsOn: 0 }); // Sunday

  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const getSlotTop = (timeStr: string) => {
    const totalMins = parseTimeToMinutes(timeStr);
    const minsFromStart = totalMins - 7 * 60;
    return `calc((${minsFromStart} / 30) * var(--slot-height))`;
  };

  const getSlotHeight = (startStr: string, endStr: string) => {
    const startMins = parseTimeToMinutes(startStr);
    const endMins = parseTimeToMinutes(endStr);
    const duration = endMins - startMins;
    return `calc((${duration} / 30) * var(--slot-height))`;
  };

  const formatHourLabel = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0);
    return format(date, "h a", { locale: ar });
  };

  return (
    <div 
      className="w-full h-full overflow-auto church-scroll relative border border-church-border-light rounded-lg bg-white shadow-sm"
      dir="rtl"
      style={{ 
        "--slot-height": "36px", 
        "--hour-height": "calc(var(--slot-height) * 2)",
        "--desktop-slot-height": "44px"
      } as any}
    >
      <div className="min-w-[700px] sm:min-w-[850px] relative [--current-slot:var(--slot-height)] sm:[--current-slot:var(--desktop-slot-height)]">
        
        <div className="sticky top-0 z-30 grid grid-cols-[60px_repeat(7,1fr)] border-b border-church-border bg-church-bg-card shadow-sm">
          <div className="sticky right-0 z-40 p-2 text-center border-l border-church-border-light bg-church-bg-card text-church-text-muted font-body text-[10px] sm:text-[11px] font-bold flex items-end justify-center">
            الوقت
          </div>
          {DAYS.map((dayIdx) => {
            const date = addDays(startDate, dayIdx);
            return (
              <div key={dayIdx} className="p-2 text-center border-l border-church-border-light last:border-l-0">
                <div className="font-title text-church-text font-bold text-sm sm:text-lg leading-none">
                  {format(date, "EEEE", { locale: ar })}
                </div>
                <div className="font-body text-[10px] sm:text-xs text-church-text-muted mt-0.5">
                  {format(date, "d MMM", { locale: ar })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative flex">
          <div className="w-[60px] shrink-0 border-l border-church-border bg-white sticky right-0 z-20">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="border-b border-church-border-light relative" 
                style={{ height: "calc(var(--current-slot) * 2)" }}
              >
                <div className="absolute top-0 right-0 w-full -translate-y-1/2 text-center text-[10px] font-body font-semibold text-church-text-muted bg-white/80 py-0.5">
                  {formatHourLabel(hour)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 relative">
            {DAYS.map((dayIdx) => {
              const dayBookings = bookings.filter((b) => b.dayOfWeek === dayIdx);
              
              return (
                <div key={dayIdx} className="relative border-l border-church-border-light last:border-l-0 min-h-full">
                  {HOURS.map((hour) => (
                    <div 
                      key={`h-${hour}`} 
                      className="absolute w-full border-b border-church-border-light/50" 
                      style={{ top: `calc(${hour - 7} * var(--current-slot) * 2)`, height: "calc(var(--current-slot) * 2)" }} 
                    />
                  ))}
                  {HOURS.map((hour) => (
                    <div 
                      key={`h-half-${hour}`} 
                      className="absolute w-full border-b border-church-border-light/20 border-dashed" 
                      style={{ top: `calc((${hour - 7} * 2 + 1) * var(--current-slot))`, height: "var(--current-slot)" }} 
                    />
                  ))}

                  {/* Interactive Base Grid */}
                  {onSlotClick && (
                    <div className="absolute inset-0 z-0">
                      {Array.from({ length: 32 }).map((_, slotIdx) => {
                        const hour = Math.floor(slotIdx / 2) + 7;
                        const mins = (slotIdx % 2) * 30;
                        const timeStr = `${hour.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
                        
                        return (
                          <div 
                            key={`clickable-${slotIdx}`}
                            className="w-full hover:bg-church-gold/10 cursor-pointer transition-colors"
                            style={{ height: "var(--current-slot)" }}
                            onClick={() => onSlotClick(dayIdx, timeStr)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Bookings */}
                  {dayBookings.map((booking) => {
                    const top = getSlotTop(booking.startTime);
                    const height = getSlotHeight(booking.startTime, booking.endTime);
                    
                    const blockBaseClass = "absolute w-[calc(100%-4px)] right-[2px] rounded-sm z-10 overflow-hidden font-body flex flex-col p-1 shadow-sm border-r-4 transition-all hover:scale-[1.02] hover:z-20";
                    
                    let statusClass = "bg-church-red/10 text-church-red-dark border-church-red";
                    let statusLabel = null;

                    if (booking.status === "pending_approval") {
                      statusClass = "bg-amber-50 text-amber-900 border-amber-400";
                      statusLabel = "انتظار";
                    } else if (booking.isRecurring) {
                      statusClass = "bg-church-gold-light/40 text-church-text border-church-gold";
                      statusLabel = "🔄";
                    }

                    return (
                      <div
                        key={booking.id}
                        className={`${blockBaseClass} ${statusClass}`}
                        style={{ top, height } as any}
                        title={`${booking.title} (${booking.startTime.slice(0,5)} - ${booking.endTime.slice(0,5)})`}
                      >
                        <div className="text-[9px] sm:text-[11px] font-bold truncate leading-tight">{booking.title}</div>
                        <div className="flex items-center gap-1 mt-auto overflow-hidden">
                          <span className="text-[8px] sm:text-[9px] bg-white/60 px-1 rounded truncate flex-1 opacity-80">{booking.booker.name}</span>
                          {statusLabel && <span className="text-[9px] font-bold">{statusLabel}</span>}
                          {isDouble && <span className="text-[8px] sm:text-[9px] bg-white/60 px-0.5 font-bold rounded">أ+ب</span>}
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
    </div>
  );
}
