"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createVenue, updateVenue } from "@/actions/venue.actions";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const venueSchema = z.object({
  id: z.string().optional(),
  nameAr: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  section: z.string().min(1, "يرجى اختيار القسم"),
  capacity: z.coerce.number().min(1, "السعة يجب أن تكون 1 على الأقل"),
  isDouble: z.boolean(),
  sortOrder: z.coerce.number(),
}).strict();

type VenueFormValues = z.infer<typeof venueSchema>;

interface VenueFormProps {
  initialData?: any;
}

export default function VenueForm({ initialData }: VenueFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [sections, setSections] = useState<{ id: string, nameAr: string }[]>([]);

  // Fetch sections
  useEffect(() => {
    import("@/actions/section.actions").then(mod => mod.getAllSections()).then(setSections);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema as any),
    defaultValues: initialData ? {
      id: initialData.id,
      nameAr: initialData.nameAr,
      section: initialData.section,
      capacity: initialData.capacity || 0,
      isDouble: initialData.isDouble,
      sortOrder: initialData.sortOrder,
    } : {
      nameAr: "",
      section: "",
      isDouble: false,
      sortOrder: 10,
    },
  });

  const onSubmit = async (data: VenueFormValues) => {
    setIsPending(true);
    setError(null);
    try {
      if (initialData) {
        await updateVenue(initialData.id, data);
      } else {
        await createVenue(data as any);
      }
      router.push("/admin/venues");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 animate-in fade-in zoom-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-church-text">اسم القاعة (بالعربي)</label>
          <input
            {...register("nameAr")}
            placeholder="e.g. قاعة الدور الأرضي"
            className="church-input"
          />
          {errors.nameAr && <p className="text-xs text-red-500">{errors.nameAr.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-church-text">القسم</label>
          <select {...register("section")} className="church-input">
            <option value="">اختر القسم...</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.nameAr}</option>
            ))}
          </select>
          {errors.section && <p className="text-xs text-red-500">{errors.section.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-church-text">السعة (عدد الأشخاص)</label>
          <input
            type="number"
            {...register("capacity")}
            className="church-input"
          />
          {errors.capacity && <p className="text-xs text-red-500">{errors.capacity.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-church-text">ترتيب العرض</label>
          <input
            type="number"
            {...register("sortOrder")}
            className="church-input"
          />
          <p className="text-[10px] text-church-text-light">
            يستخدم لترتيب الظهور (الرقم الأصغر يظهر أولاً). الأرقام المكررة مسموح بها.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-church-bg-warm p-4 rounded-xl border border-church-border-light">
          <input
            type="checkbox"
            id="isDouble"
            {...register("isDouble")}
            className="w-5 h-5 accent-church-gold cursor-pointer"
          />
          <label htmlFor="isDouble" className="text-sm font-semibold text-church-text cursor-pointer select-none">
            قاعة مزدوجة؟ (تسمح بالحجز الجزئي)
          </label>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="church-button-primary py-3 px-8 flex items-center justify-center gap-2 min-w-[200px]"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "تحديث القاعة" : "إضافة القاعة"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 text-church-text px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
