"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";

type User = {
  name: string;
  role: string;
};

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "القاعات", href: "/venues" },
  ];

  if (isAdmin) {
    navLinks.push({ label: "لوحة التحكم", href: "/admin" });
    navLinks.push({ label: "الحجوزات", href: "/admin/bookings" });
    navLinks.push({ label: "الموافقات", href: "/admin/approvals" });
  }

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <header className="bg-white border-b-2 border-church-gold sticky top-0 z-50">
      <div className="church-container">
        <div className="flex items-center justify-between h-16">
          {/* Right Logo & Title */}
          <Link href="/" className="flex items-center gap-3">
            <svg className="w-8 h-8 text-church-red" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z" />
            </svg>
            <span className="font-title text-2xl text-church-red tracking-wide">
              كنيسة القديسيين
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-body font-semibold text-lg transition-colors py-5 border-b-2 ${
                    isActive 
                      ? "text-church-red border-church-gold" 
                      : "text-church-text-muted border-transparent hover:text-church-red hover:border-church-gold/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User info & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-body font-bold text-church-text leading-tight">{user.name}</span>
                  <span className={`badge ${isAdmin ? "bg-church-gold-light/40 text-church-gold-dark" : "bg-gray-100 text-gray-600"} text-[10px]`}>
                    {isAdmin ? "مسؤول" : "مستخدم"}
                  </span>
                </div>
                <form action={handleLogout}>
                  <button type="submit" className="church-button-ghost py-2 px-4 text-sm">
                    خروج
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="church-button-primary py-2 px-6 text-sm">
                دخول
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-church-text hover:text-church-red focus:outline-none"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={() => setMobileOpen(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-church-border-light">
              <span className="font-title text-xl text-church-red">القائمة</span>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 text-church-text-muted hover:text-church-red"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-2 flex-grow overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 px-4 rounded-md font-body text-lg ${
                      isActive 
                        ? "bg-church-gold-light/30 text-church-red font-bold" 
                        : "text-church-text hover:bg-church-bg"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-church-border-light bg-church-bg/30 mt-auto">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-church-gold-light/50 flex items-center justify-center text-church-gold-dark font-bold font-body">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-body font-bold text-church-text">{user.name}</div>
                      <div className={`text-xs ${isAdmin ? "text-church-gold-dark" : "text-church-text-light"}`}>
                        {isAdmin ? "مسؤول" : "مستخدم"}
                      </div>
                    </div>
                  </div>
                  <form action={handleLogout}>
                    <button type="submit" className="church-button-outline w-full py-2">
                      خروج
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="church-button-primary w-full py-2 !block text-center mt-2">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
