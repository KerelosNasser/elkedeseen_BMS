import Link from "next/link";
import { logoutAction } from "@/actions/auth.actions";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-church-bg">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-church-gold/10 border border-church-gold/20 p-8 text-center animate-fade-up">
        <div className="w-20 h-20 bg-church-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⏳</span>
        </div>
        
        <h1 className="font-title text-2xl text-church-gold-dark mb-4">طلبك قيد المراجعة</h1>
        
        <p className="text-church-text mb-8 leading-relaxed">
          شكراً لتسجيلك في Elkedeseen BMS. <br />
          حسابك الآن بانتظار مراجعة الإدارة. ستتمكن من استخدام التطبيق فور الموافقة على طلبك.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-church-text-light">
            سيتم إعلامك فور تفعيل الحساب.
          </p>
          
          <form action={logoutAction}>
            <button className="text-church-gold-dark font-semibold hover:underline">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
