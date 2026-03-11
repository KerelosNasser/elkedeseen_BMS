import { requireAdmin } from "@/lib/auth-middleware";
import { getPendingApprovalsForAdmin } from "@/actions/approval.actions";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import ApprovalActionsClient from "./ApprovalActionsClient";

export default async function ApprovalsPage() {
  const admin = await requireAdmin();
  const pendingApprovals = await getPendingApprovalsForAdmin(admin.id);

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    const d = new Date(); d.setHours(Number(h), Number(m), 0);
    return format(d, "h:mm a", { locale: ar });
  };

  return (
    <div className="church-container church-section">
      <div className="animate-fade-up mb-8 text-center md:text-right">
        <h1 className="font-title text-3xl text-church-red">موافقاتك المعلقة</h1>
        <p className="text-church-text-muted mt-2">
          التصويت مطلوب لتأكيد هذه الحجوزات المتكررة على النظام.
        </p>
      </div>

      <div className="space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {pendingApprovals.length === 0 ? (
          <div className="church-card py-16 text-center text-church-text-light">
             <div className="church-ornament text-5xl mb-4 opacity-30">✧</div>
             <p className="font-title text-2xl text-church-text">لا توجد طلبات معلقة</p>
             <p className="font-body mt-2">أنت على اطلاع دائم، شكراً لمجهودك.</p>
          </div>
        ) : (
          pendingApprovals.map(appr => (
             <div key={appr.id} className="church-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-church-gold hover:border-church-red transition-all">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-title text-xl text-church-text font-bold">{appr.booking.title}</h3>
                    <span className="badge-pending rtl:mr-2 text-xs">حجز متكرر</span>
                  </div>
                  
                  <div className="text-sm font-body text-church-text-muted grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    <div className="flex gap-2"><span className="font-bold text-church-text min-w-[60px]">قاعة:</span> {appr.booking.venue.nameAr}</div>
                    <div className="flex gap-2"><span className="font-bold text-church-text min-w-[60px]">حاجز:</span> {appr.booking.booker.name}</div>
                    <div className="flex gap-2">
                      <span className="font-bold text-church-text min-w-[60px]">يبدأ من:</span> 
                      {format(new Date(appr.booking.weekDate), "d MMMM yyyy", { locale: ar })}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-church-text min-w-[60px]">ينتهي في:</span> 
                      {appr.booking.expiresAt ? format(new Date(appr.booking.expiresAt), "d MMMM yyyy", { locale: ar }) : "-"}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-church-text min-w-[60px]">التوقيت:</span> 
                      {formatTime(appr.booking.startTime)} - {formatTime(appr.booking.endTime)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center md:flex-col gap-3 pt-4 border-t md:border-t-0 md:border-r border-church-border-light md:pr-6 md:w-[150px]">
                  <ApprovalActionsClient approvalId={appr.id} />
                </div>
             </div>
          ))
        )}
      </div>
    </div>
  );
}
