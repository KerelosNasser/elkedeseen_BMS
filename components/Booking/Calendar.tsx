"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────

export interface CalendarDay {
  date: Date;
  hasSlots?: boolean;
  disabled?: boolean;
}

interface CalendarGridProps {
  month: Date;
  selectedDate?: Date | null;
  availableDates?: Date[];
  onSelectDate?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
}

// ── Helpers ───────────────────────────────────────────────────

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isToday = (d: Date) => isSameDay(d, new Date());

const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// ── CalendarGrid ──────────────────────────────────────────────

const ARABIC_DAYS = ["أحد", "إث", "ثل", "أر", "خم", "جم", "سب"];
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export const CalendarGrid = ({
  month,
  selectedDate,
  availableDates = [],
  onSelectDate,
  minDate,
  maxDate,
  locale = "ar",
}: CalendarGridProps) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const days = useMemo(() => getDaysInMonth(year, monthIndex), [year, monthIndex]);

  // Pad beginning of week (0=Sunday)
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const isAvailable = (d: Date) =>
    availableDates.length === 0 ||
    availableDates.some((ad) => isSameDay(ad, d));

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  return (
    <div className="select-none" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Month header */}
      <div className="text-center mb-4">
        <p className="font-title text-lg text-church-red">
          {ARABIC_MONTHS[monthIndex]} {year}
        </p>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {ARABIC_DAYS.map((d) => (
          <div key={d} className="calendar-day text-xs font-semibold text-church-text-muted cursor-default">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const disabled = isDisabled(day);
          const available = isAvailable(day);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          const today = isToday(day);

          let dayClass = "calendar-day-default";
          if (disabled) dayClass = "calendar-day-disabled";
          else if (selected) dayClass = "calendar-day-selected";
          else if (today) dayClass = "calendar-day-today";
          else if (available) dayClass = "calendar-day-has-slots";

          return (
            <button
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate?.(day)}
              className={cn("calendar-day", dayClass)}
              aria-label={day.toLocaleDateString("ar")}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── DatePicker ────────────────────────────────────────────────

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

export const DatePicker = ({
  value,
  onChange,
  availableDates,
  minDate = new Date(),
  maxDate,
  placeholder = "اختر تاريخاً",
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => value ?? new Date());

  const formattedValue = value
    ? value.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const prevMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "form-input text-right flex items-center justify-between gap-2 cursor-pointer",
          open && "border-church-gold ring-2 ring-church-gold/20"
        )}
        dir="rtl"
      >
        <span className={value ? "text-church-text" : "text-church-text-light"}>
          {formattedValue ?? placeholder}
        </span>
        <CalendarIcon />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-2 right-0 sm:left-0 w-80 church-card p-4 soft-shadow-lg animate-fade-up">
            {/* Nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-church-bg-warm transition-colors text-church-text-muted">
                ‹
              </button>
              <span className="font-title text-church-red text-sm font-semibold">
                {new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(viewMonth)}
              </span>
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-church-bg-warm transition-colors text-church-text-muted">
                ›
              </button>
            </div>
            <CalendarGrid
              month={viewMonth}
              selectedDate={value}
              availableDates={availableDates}
              minDate={minDate}
              maxDate={maxDate}
              onSelectDate={(d) => {
                onChange?.(d);
                setOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-church-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);