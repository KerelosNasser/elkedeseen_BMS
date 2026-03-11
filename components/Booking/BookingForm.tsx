"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SlotVariant } from "@/lib/tokens";
import Button from "../ui/button";
import Card, { CardBody, CardFooter, CardHeader } from "../ui/card";
import { DatePicker } from "./Calendar";
import BookingSlot from "./BookingSlot";

// ── Types ──────────────────────────────────────────────────────

export interface TimeSlot {
  id: string;
  time: string;
  period: "AM" | "PM";
  label?: string;
  status: SlotVariant;
  capacity?: number;
  booked?: number;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  date: Date | null;
  slotId: string | null;
  notes: string;
  serviceType: string;
}

interface BookingFormProps {
  slots?: TimeSlot[];
  serviceTypes?: string[];
  onSubmit?: (data: BookingFormData) => Promise<void> | void;
  availableDates?: Date[];
  className?: string;
}

// ── Default data ───────────────────────────────────────────────

const DEFAULT_SLOTS: TimeSlot[] = [
  { id: "1", time: "8:00", period: "AM", label: "الصباح", status: "available", capacity: 20, booked: 5 },
  { id: "2", time: "10:00", period: "AM", label: "الضحى", status: "available", capacity: 20, booked: 12 },
  { id: "3", time: "12:00", period: "PM", label: "الظهر", status: "booked", capacity: 20, booked: 20 },
  { id: "4", time: "4:00", period: "PM", label: "العصر", status: "available", capacity: 20, booked: 3 },
  { id: "5", time: "6:00", period: "PM", label: "المغرب", status: "available", capacity: 20, booked: 8 },
  { id: "6", time: "8:00", period: "PM", label: "العشاء", status: "gold", capacity: 10, booked: 2 },
];

const DEFAULT_SERVICES = ["القداس الإلهي", "صلاة الساعات", "تناول الأسرار", "اجتماع خدمة", "تأبين", "زواج"];

// ── Form Field ─────────────────────────────────────────────────

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

const Field = ({ label, error, hint, required, children }: FieldProps) => (
  <div dir="rtl">
    <label className="form-label">
      {label}
      {required && <span className="text-church-red ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="form-error">{error}</p>}
    {hint && !error && <p className="form-hint">{hint}</p>}
  </div>
);

// ── BookingForm ────────────────────────────────────────────────

const BookingForm = ({
  slots = DEFAULT_SLOTS,
  serviceTypes = DEFAULT_SERVICES,
  onSubmit,
  availableDates,
  className,
}: BookingFormProps) => {
  const [form, setForm] = useState<BookingFormData>({
    name: "",
    phone: "",
    email: "",
    date: null,
    slotId: null,
    notes: "",
    serviceType: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!form.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!form.date) newErrors.date = "يرجى اختيار التاريخ";
    if (!form.slotId) newErrors.slotId = "يرجى اختيار الموعد";
    if (!form.serviceType) newErrors.serviceType = "يرجى اختيار نوع الخدمة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit?.(form);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card padded className={cn("text-center animate-fade-up", className)} dir="rtl">
        <div className="py-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-church-gold-light/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-church-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-title text-h3-ar text-church-red">تم الحجز بنجاح</h3>
          <p className="font-body text-church-text-muted">سيتم التواصل معك قريبًا لتأكيد الموعد</p>
          <div className="gold-divider-simple w-32 mx-auto" />
          <Button variant="outline" onClick={() => setSuccess(false)}>
            حجز جديد
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader ornament="✦">
        <h3 className="font-title text-h2-ar text-church-red text-center" dir="rtl">
          حجز موعد
        </h3>
        <p className="font-subtitle text-sm text-center text-church-text-muted mt-1" dir="rtl">
          الرجاء تعبئة البيانات التالية
        </p>
      </CardHeader>

      <CardBody>
        <div className="space-y-5">
          {/* Personal info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الاسم الكامل" required error={errors.name}>
              <input
                className={cn("form-input", errors.name && "form-input-error")}
                placeholder="مثال: يوسف سمير"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                dir="rtl"
              />
            </Field>
            <Field label="رقم الهاتف" required error={errors.phone}>
              <input
                className={cn("form-input", errors.phone && "form-input-error")}
                placeholder="01xxxxxxxxx"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                dir="rtl"
                type="tel"
              />
            </Field>
          </div>

          <Field label="البريد الإلكتروني" hint="اختياري">
            <input
              className="form-input"
              placeholder="example@mail.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              type="email"
              dir="ltr"
            />
          </Field>

          {/* Service type */}
          <Field label="نوع الخدمة" required error={errors.serviceType}>
            <select
              className={cn("form-input cursor-pointer", errors.serviceType && "form-input-error")}
              value={form.serviceType}
              onChange={(e) => set("serviceType", e.target.value)}
              dir="rtl"
            >
              <option value="">اختر الخدمة</option>
              {serviceTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          {/* Date */}
          <Field label="التاريخ" required error={errors.date}>
            <DatePicker
              value={form.date}
              onChange={(d) => set("date", d)}
              availableDates={availableDates}
            />
          </Field>

          {/* Time slots */}
          <div dir="rtl">
            <label className="form-label">
              الموعد <span className="text-church-red">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
              {slots.map((slot) => (
                <BookingSlot
                  key={slot.id}
                  time={slot.time}
                  period={slot.period}
                  label={slot.label}
                  status={form.slotId === slot.id ? "selected" : slot.status}
                  capacity={slot.capacity}
                  booked={slot.booked}
                  onClick={() => set("slotId", slot.id)}
                />
              ))}
            </div>
            {errors.slotId && <p className="form-error">{errors.slotId}</p>}
          </div>

          {/* Notes */}
          <Field label="ملاحظات">
            <textarea
              className="form-input resize-none"
              rows={3}
              placeholder="أي ملاحظات إضافية..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              dir="rtl"
            />
          </Field>
        </div>
      </CardBody>

      <CardFooter className="justify-end gap-3">
        <Button variant="ghost" onClick={() => setForm({
          name: "", phone: "", email: "", date: null, slotId: null, notes: "", serviceType: ""
        })}>
          مسح
        </Button>
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          تأكيد الحجز ✦
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;