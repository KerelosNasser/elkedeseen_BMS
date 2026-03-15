"use client";

import { useTransition } from "react";
import { deleteVenue } from "@/actions/venue.actions";
import { Trash2 } from "lucide-react";

export default function DeleteVenueButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("هل أنت متأكد من حذف هذه القاعة؟ سيتم رفض الحذف إذا كان هناك حجوزات مرتبطة بها.")) return;

    startTransition(async () => {
      try {
        const result = await deleteVenue(id);
        if (result.success) {
          alert("تم حذف القاعة بنجاح");
        }
      } catch (err: any) {
        alert(err.message || "فشل حذف القاعة");
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
