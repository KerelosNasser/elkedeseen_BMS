"use client";

import { useTransition } from "react";
import { deleteSection } from "@/actions/section.actions";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteSectionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ لا يمكن حذفه إذا كان يحتوي على قاعات.")) return;

    startTransition(async () => {
      try {
        const result = await deleteSection(id);
        if (result.success) {
          toast.success("تم حذف القسم بنجاح");
        }
      } catch (err: any) {
        toast.error(err.message || "فشل حذف القسم");
      }
    });
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className={`p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors border border-red-100 ${isPending ? "opacity-50" : ""}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
