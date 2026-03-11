"use client";

import { useState } from "react";
import WeekScheduleGrid from "./WeekScheduleGrid";
import { Users, CalendarDays, Maximize } from "lucide-react";

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
    <div className="flex flex-col gap-4">
      <div className="church-card-padded flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-title text-2xl text-church-red">{venue.nameAr}</h3>
          <div className="flex gap-2 flex-wrap justify-end">
             {venue.capacity && (
               <span className="badge bg-church-bg-warm text-church-text-muted flex items-center gap-1">
                 <Users className="w-3 h-3" />
                 {venue.capacity} فرد
               </span>
             )}
             {venue.isDouble && (
               <span className="badge bg-church-gold-light/60 text-church-gold-dark border border-church-gold/30 flex items-center gap-1">
                 <Maximize className="w-3 h-3" />
                 مزدوجة
               </span>
             )}
          </div>
        </div>

        {/* Mini week summary */}
        <div className="mb-6 flex-1">
          <p className="text-xs text-church-text-muted mb-2 font-body font-semibold">ارتباطات هذا الأسبوع:</p>
          <div className="flex items-center gap-1 rtl:space-x-reverse" dir="rtl">
            {["أ", "إ", "ث", "أ", "خ", "ج", "س"].map((dayLabel, idx) => (
              <div 
                key={idx} 
                className={`flex-1 flex items-center justify-center text-[10px] font-bold rounded-sm h-6
                  ${daysWithBookings[idx] ? 'bg-church-red/20 text-church-red border border-church-red/30' : 'bg-gray-100 text-gray-400 border border-gray-200'}
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
          className="church-button-outline w-full py-2.5 text-sm flex items-center justify-center gap-2 mt-auto"
        >
          <CalendarDays className="w-4 h-4" />
          {expanded ? "إخفاء الجدول" : "عرض الجدول الكامل"}
        </button>
      </div>

      {/* Expanded Grid */}
      {expanded && (
        <div className="animate-fade-up w-full col-span-1 sm:col-span-2 lg:col-span-3">
           <WeekScheduleGrid bookings={bookings} weekStart={weekStart} isDouble={venue.isDouble} />
        </div>
      )}
    </div>
  );
}
