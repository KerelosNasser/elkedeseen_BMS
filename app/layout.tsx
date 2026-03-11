import { Aref_Ruqaa, Amiri, Cairo } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const aref = Aref_Ruqaa({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-title" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-subtitle" });
const cairo = Cairo({ subsets: ["arabic"], weight: ["300", "400", "500", "600", "700", "900"], variable: "--font-body" });

export const metadata = {
  title: "كنيسة القديسيين",
  description: "نظام حجز القاعات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn("antialiased", aref.variable, amiri.variable, cairo.variable)}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
