"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/actions/auth.actions";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    
    // Quick client validation
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;
    
    if (password !== confirm) {
      setError("كلمة المرور وتأكيدها غير متطابقين");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      setLoading(false);
      return;
    }

    const res = await registerAction(formData);
    
    if (!res.success) {
      setError(res.error || "حدث خطأ غير متوقع");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-church-gradient flex items-center justify-center p-4" dir="rtl">
      <div className="church-card max-w-md w-full p-8 soft-shadow">
        <div className="text-center mb-8">
          <svg className="w-12 h-12 mx-auto text-church-red mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z" />
          </svg>
          <h1 className="font-title text-3xl text-church-red">إنشاء حساب جديد</h1>
        </div>
        
        {error && (
          <div className="bg-church-red/10 border border-church-red text-church-red px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label block mb-1">الاسم الكامل</label>
            <input 
              name="name" 
              type="text" 
              required 
              className="form-input w-full" 
              placeholder="اكتب اسمك تلاتي"
            />
          </div>

          <div>
            <label className="form-label block mb-1">البريد الإلكتروني</label>
            <input 
              name="email" 
              type="email" 
              required 
              dir="ltr"
              className="form-input w-full" 
              placeholder="name@example.com"
            />
          </div>
          
          <div>
            <label className="form-label block mb-1">كلمة المرور</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="form-input w-full" 
              placeholder="8 أحرف على الأقل"
            />
          </div>

          <div>
            <label className="form-label block mb-1">تأكيد كلمة المرور</label>
            <input 
              name="confirmPassword" 
              type="password" 
              required 
              className="form-input w-full" 
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="church-button-primary w-full py-3 mt-4"
          >
            {loading ? "جاري إنشاء الحساب..." : "تسجيل"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-church-text-muted hover:text-church-red transition-colors font-body text-sm text-center block">
            لديك حساب بالفعل؟ سجل دخولك
          </Link>
        </div>
      </div>
    </div>
  );
}
