import { requireAuth } from "@/lib/auth-middleware";
import Navbar from "@/components/layout/Navbar";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  if (user.status === "pending_approval") {
    redirect("/pending-approval");
  }

  return (
    <div className="min-h-screen bg-church-bg flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
