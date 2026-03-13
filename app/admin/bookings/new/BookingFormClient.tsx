"use client";

import { useState } from "react";
import { UserSearchResult, createBooking } from "@/actions/booking.actions";
import AttendeeSelector from "@/components/shared/AttendeeSelector";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, Clock, Loader2, MapPin } from "lucide-react";
import { format, addMonths } from "date-fns";
import { SECTIONS_MAP } from "@/lib/constants";

interface Venue {
  id: string;
  nameAr: string;
  section: "ground_floor" | "second_floor" | "education_building" | "other" | "dev_center";
  isDouble: boolean;
}

interface Props {
  venues: Venue[];
  currentUserId: string;
  currentUserName: string;
}

const DURATIONS = [
  { label: "30 دقيقة", value: 30 },
  { label: "ساعة", value: 60 },
  { label: "ساعة ونصف", value: 90 },
  { label: "ساعتان", value: 120 },
  { label: "3 ساعات", value: 180 },
];

export default function BookingFormClient({ venues, currentUserId, currentUserName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [venueId, setVenueId] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [durationMins, setDurationMins] = useState(60);
  const [isRecurring, setIsRecurring] = useState(false);
  const [expiresAtStr, setExpiresAtStr] = useState("");
  const [attendees, setAttendees] = useState<UserSearchResult[]>([]);

  const selectedVenue = venues.find(v => v.id === venueId);

  const calculateEndTime = (start: string, mins: number) => {
    const [h, m] = start.split(":").map(Number);
    const totalMins = h * 60 + m + mins;
    const endH = Math.floor(totalMins / 60);
    const endM = totalMins % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !venueId || !dateStr || !startTime) {
      setError("برجاء ملء جميع الحقول المطلوبة");
      return;
    }

    if (isRecurring && !expiresAtStr) {
      setError("برجاء تحديد تاريخ انتهاء الحجز المتكرر");
      return;
    }

    setLoading(true);

    try {
      const selectedDate = new Date(dateStr);
      const dayOfWeek = selectedDate.getDay();
      
      const endTime = calculateEndTime(startTime, durationMins);
      const startSec = `${startTime}:00`;

      // If single booking, expires right after the day.
      // If recurring, expires at the selected expiresAtStr date.
      let expiresAt = new Date(dateStr);
      expiresAt.setHours(23, 59, 59);

      if (isRecurring) {
        expiresAt = new Date(expiresAtStr);
        expiresAt.setHours(23, 59, 59);
      }

      const attendeeIds = [currentUserId, ...attendees.map(a => a.id)];
      // deduplicate just in case
      const uniqueAttendeeIds = Array.from(new Set(attendeeIds));

      const res = await createBooking({
        venueId,
        title,
        weekDate: dateStr,
        dayOfWeek,
        startTime: startSec,
        endTime,
        isRecurring,
        expiresAt: expiresAt.toISOString(),
        bookedBy: currentUserId,
        attendeeIds: uniqueAttendeeIds
      });

      if (!res.success) {
        setError(res.error || "حدث خطأ غير متوقع");
        setLoading(false);
        return;
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "حدث خطأ في النظام");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
      {error && (
        <div className="bg-church-red/10 border-r-4 border-church-red p-4 rounded-lg flex items-start gap-3 animate-fade-up">
          <AlertCircle className="w-5 h-5 text-church-red mt-0.5 shrink-0" />
          <p className="text-church-red-dark font-body text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-r-4 border-emerald-500 p-4 rounded-lg flex items-start gap-3 animate-fade-up">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-emerald-700 font-body text-sm font-semibold">تم حفظ الحجز بنجاح! جاري تحويلك...</p>
        </div>
      )}

      {selectedVenue?.isDouble && (
        <div className="bg-church-gold-light/20 border-r-4 border-church-gold p-4 rounded-lg flex items-start gap-3 animate-fade-up">
          <AlertCircle className="w-5 h-5 text-church-gold-dark mt-0.5 shrink-0" />
          <div className="text-church-gold-dark font-body text-sm">
            <span className="font-bold">تنبيه قاعة مزدوجة:</span> هذه القاعة تشغل مساحة قاعتين كاملتين (أ + ب). برجاء التأكد من الحاجة الفعلية لهذه المساحة.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="form-label block mb-2">اسم الحدث / الموضوع</label>
          <input
            type="text"
            className="form-input w-full"
            placeholder="مثال: اجتماع إعداد خدام، درس كتاب..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Venue */}
        <div className="md:col-span-2">
          <label className="form-label block mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-church-red" /> القاعة</label>
          <select
            className="form-input w-full cursor-pointer"
            value={venueId}
            onChange={e => setVenueId(e.target.value)}
            required
          >
            <option value="" disabled>اختر القاعة...</option>
            {Object.entries(SECTIONS_MAP).map(([sectionKey, sectionName]) => {
              const sectionVenues = venues.filter(v => v.section === sectionKey);
              if (sectionVenues.length === 0) return null;
              
              return (
                <optgroup key={sectionKey} label={sectionName}>
                  {sectionVenues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.nameAr} {v.isDouble ? "(مزدوجة)" : ""}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="form-label block mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-church-gold-dark" /> التاريخ</label>
          <input
            type="date"
            className="form-input w-full"
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        {/* Time and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label block mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-church-gold-dark" /> وقت البدء</label>
            <input
              type="time"
              className="form-input w-full"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label block mb-2">المدة</label>
            <select
              className="form-input w-full cursor-pointer"
              value={durationMins}
              onChange={e => setDurationMins(Number(e.target.value))}
            >
              {DURATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurring Toggle */}
        <div className="md:col-span-2 mt-4">
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-church-border-light rounded-xl hover:bg-church-bg-warm transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 text-church-red rounded border-gray-300 focus:ring-church-red"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
            />
            <div>
              <div className="font-title text-lg text-church-text mb-1">حجز متكرر (أسبوعياً)</div>
              <div className="font-body text-xs text-church-text-muted">يتكرر هذا الحجز كل أسبوع في نفس اليوم والوقت</div>
            </div>
          </label>
        </div>

        {/* Recurring Expiry */}
        {isRecurring && (
          <div className="md:col-span-2 animate-fade-up">
            <label className="form-label block mb-2">يتكرر حتى تاريخ</label>
            <input
              type="date"
              className="form-input w-full"
              value={expiresAtStr}
              onChange={e => setExpiresAtStr(e.target.value)}
              min={dateStr || new Date().toISOString().split("T")[0]}
              max={format(addMonths(new Date(), 6), "yyyy-MM-dd")}
              required={isRecurring}
            />
            <p className="text-xs text-church-text-light mt-2 font-body">يمكنك الحجز المتكرر لمدة أقصاها 6 أشهر مقدماً. تتطلب الحجوزات المتكررة موافقة مسؤولين آخرين.</p>
          </div>
        )}

        {/* Attendees */}
        <div className="md:col-span-2 mt-4">
          <AttendeeSelector
            value={attendees}
            onChange={setAttendees}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-church-border text-left">
        <button
          type="submit"
          disabled={loading}
          className="church-button-primary py-3 px-8 text-lg min-w-[200px] flex items-center justify-center gap-2"
        >
          {loading ? (
             <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
          ) : (
             "تأكيد الحجز"
          )}
        </button>
      </div>
    </form>
  );
}
