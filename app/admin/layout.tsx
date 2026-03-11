import { requireAdmin } from "@/lib/auth-middleware";
import Navbar from "@/components/layout/Navbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-church-bg flex flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
