"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSection, updateSection } from "@/actions/section.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const sectionSchema = z.object({
  id: z.string().optional(),
  nameAr: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  sortOrder: z.coerce.number(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionFormProps {
  initialData?: any;
}

export default function SectionForm({ initialData }: SectionFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema as any),
    defaultValues: initialData ? {
      id: initialData.id,
      nameAr: initialData.nameAr,
      sortOrder: initialData.sortOrder,
    } : {
      sortOrder: 0,
    },
  });

  const onSubmit = async (data: SectionFormValues) => {
    setIsPending(true);
    try {
      if (initialData) {
        await updateSection(initialData.id, data);
        toast.success("تم تحديث القسم بنجاح");
      } else {
        await createSection(data);
        toast.success("تم إضافة القسم بنجاح");
      }
      router.push("/admin/sections");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-church-text">اسم القسم (بالعربي)</label>
          <input
            {...register("nameAr")}
            placeholder="e.g. قاعات الدور الأرضي"
            className="church-input"
          />
          {errors.nameAr && <p className="text-xs text-red-500">{errors.nameAr.message}</p>}
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
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="church-button-primary py-3 px-8 flex items-center justify-center gap-2 min-w-[200px]"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "تحديث القسم" : "إضافة القسم"}
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
