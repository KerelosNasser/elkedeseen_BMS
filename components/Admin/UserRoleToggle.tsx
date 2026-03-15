"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/actions/user.actions";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is available or similar toast library

interface UserRoleToggleProps {
  userId: string;
  currentRole: 'admin' | 'user';
}

export default function UserRoleToggle({ userId, currentRole }: UserRoleToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = async () => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = newRole === 'admin' 
      ? "هل أنت متأكد من ترقية هذا المستخدم إلى منسق (Admin)؟" 
      : "هل أنت متأكد من سحب صلاحيات المنسق من هذا المستخدم؟";

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
          toast.success("تم تحديث الدور بنجاح");
        }
      } catch (error: any) {
        alert(error.message || "فشل تحديث الدور");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`church-button-primary py-1.5 px-3 shadow-none text-xs flex items-center gap-2 ${
        currentRole === 'admin' 
          ? "bg-church-red hover:bg-red-700" 
          : "bg-church-gold-dark hover:bg-church-gold"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {currentRole === 'admin' ? (
        <>
          <ShieldAlert className="w-3.5 h-3.5" />
          سحب صلاحية
        </>
      ) : (
        <>
          <ShieldCheck className="w-3.5 h-3.5" />
          ترقية لمنسق
        </>
      )}
    </button>
  );
}
