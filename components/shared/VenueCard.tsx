"use client";

import { useState } from "react";
import WeekScheduleGrid from "./WeekScheduleGrid";
import { Users, CalendarDays, Maximize, ChevronDown, ChevronUp } from "lucide-react";

type BookingWithDetails = {
  id: string;
  venueId: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  status: "active" | "pending_approval" | "rejected";
  booker: {
    id: string;
    name: string;
    role: string;
  };
};

type Venue = {
  id: string;
  nameAr: string;
  section: "ground_floor" | "second_floor" | "education_building";
  capacity: number | null;
  isDouble: boolean;
  sortOrder: number;
};

interface VenueCardProps {
  venue: Venue;
  bookings: BookingWithDetails[];
  weekStart: Date;
}

export default function VenueCard({ venue, bookings, weekStart }: VenueCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Group bookings by day to show mini blocks
  const daysWithBookings = Array.from({ length: 7 }, (_, i) => {
    return bookings.filter(b => b.dayOfWeek === i).length > 0;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="church-card p-4 sm:p-5 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <h3 className="font-title text-xl sm:text-2xl text-church-red leading-tight">{venue.nameAr}</h3>
          <div className="flex gap-1.5 flex-wrap">
             {venue.capacity && (
               <span className="badge bg-church-bg-warm text-church-text-muted text-[10px] sm:text-xs py-0.5 px-2 flex items-center gap-1">
                 <Users className="w-3 h-3" />
                 {venue.capacity} فرد
               </span>
             )}
             {venue.isDouble && (
               <span className="badge bg-church-gold-light/60 text-church-gold-dark border border-church-gold/30 text-[10px] sm:text-xs py-0.5 px-2 flex items-center gap-1">
                 <Maximize className="w-3 h-3" />
                 مزدوجة
               </span>
             )}
          </div>
        </div>

        {/* Mini week summary */}
        <div className="mb-4 flex-1">
          <p className="text-[10px] text-church-text-muted mb-2 font-body font-semibold opacity-80">ارتباطات الأسبوع:</p>
          <div className="flex items-center gap-1 rtl:space-x-reverse" dir="rtl">
            {["أ", "إ", "ث", "أ", "خ", "ج", "س"].map((dayLabel, idx) => (
              <div 
                key={idx} 
                className={`flex-1 flex items-center justify-center text-[10px] font-bold rounded-[4px] h-7 sm:h-8
                  ${daysWithBookings[idx] ? 'bg-church-red/20 text-church-red border border-church-red/30' : 'bg-gray-50 text-gray-400 border border-gray-100'}
                `}
                title={daysWithBookings[idx] ? 'يوجد حجوزات' : 'متاح'}
              >
                {dayLabel}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          className={`church-button-outline w-full py-2 text-sm flex items-center justify-center gap-2 mt-auto transition-all ${expanded ? 'bg-church-red text-white' : ''}`}
        >
          <CalendarDays className="w-4 h-4" />
          {expanded ? "إخفاء الجدول" : "عرض الجدول"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Grid Contained with max-height to prevent context loss */}
      {expanded && (
        <div className="animate-fade-up w-full h-[400px] sm:h-[550px] overflow-hidden rounded-lg border border-church-border/50 bg-white/50 p-1 shadow-inner">
           <WeekScheduleGrid bookings={bookings} weekStart={weekStart} isDouble={venue.isDouble} />
        </div>
      )}
    </div>
  );
}
