"use client";

import { useState } from "react";
import { voteOnApproval } from "@/actions/approval.actions";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

export default function ApprovalActionsClient({ approvalId }: { approvalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleVote = async (approved: boolean) => {
    setLoading(approved ? "approve" : "reject");
    
    const res = await voteOnApproval(approvalId, approved);
    if (!res.success) {
      alert(res.error || "فشل التصويت");
    } else {
      router.refresh(); // Remove the item
    }
    
    setLoading(null);
  };

  return (
    <>
      <button
        onClick={() => handleVote(true)}
        disabled={loading !== null}
        className="w-full py-2 px-4 rounded-xl font-body font-bold text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 transition-colors flex flex-1 md:flex-none items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        موافقة
      </button>
      <button
        onClick={() => handleVote(false)}
        disabled={loading !== null}
        className="w-full py-2 px-4 rounded-xl font-body font-bold text-sm bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 transition-colors flex flex-1 md:flex-none items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        رفض
      </button>
    </>
  );
}
