"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/auth.actions";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    
    const res = await loginAction(formData);
    
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
          <h1 className="font-title text-3xl text-church-red">تسجيل الدخول</h1>
        </div>
        
        {error && (
          <div className="bg-church-red/10 border border-church-red text-church-red px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
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
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="church-button-primary w-full py-3 mt-4"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/register" className="text-church-text-muted hover:text-church-red transition-colors font-body text-sm text-center block">
            ليس لديك حساب؟ سجّل الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
