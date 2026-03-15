"use client";

import { useState, useTransition } from "react";
import { updateUserStatus } from "@/actions/user.actions";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface UserStatusActionsProps {
  userId: string;
  status: 'active' | 'pending_approval' | 'rejected';
}

export default function UserStatusActions({ userId, status }: UserStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = async (action: 'active' | 'rejected') => {
    const confirmMsg = action === 'active' 
      ? "هل أنت متأكد من الموافقة على طلب العضوية هذا؟" 
      : "هل أنت متأكد من رفض طلب العضوية هذا؟";

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      try {
        const result = await updateUserStatus(userId, action);
        if (result.success) {
          toast.success(action === 'active' ? "تم تفعيل الحساب بنجاح" : "تم رفض الحساب");
        }
      } catch (error: any) {
        toast.error(error.message || "فشل تحديث الحالة");
      }
    });
  };

  if (status === 'active') return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction('active')}
        disabled={isPending}
        className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
        title="موافقة"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={isPending}
        className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
        title="رفض"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
