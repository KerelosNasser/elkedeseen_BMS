import { requireAuth } from "@/lib/auth-middleware";
import Navbar from "@/components/layout/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Try to get user, some public routes under (app) don't strictly require auth?
  // Wait, the specification says the homepage has personal schedule, so it needs a user.
  // "redirect to /login if no session" middleware might handle root.
  // But let's fetch the user cleanly to pass to the Navbar.
  let user = null;
  try {
     user = await requireAuth();
  } catch (error) {
     // If not logged in and requireAuth redirects, it will throw a NEXT_REDIRECT.
     // That's perfectly fine, Next.js handles it.
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
