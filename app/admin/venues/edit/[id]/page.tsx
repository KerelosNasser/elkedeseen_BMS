import VenueForm from "@/components/admin/VenueForm";
import { requireAdmin } from "@/lib/auth-middleware";
import { db } from "@/db";
import { venues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface EditVenuePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  await requireAdmin();
  const { id } = await params;

  const result = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
  if (result.length === 0) {
    notFound();
  }

  const venue = result[0];

  return (
    <div className="church-container church-section space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-title text-3xl text-church-red">تعديل القاعة: {venue.nameAr}</h1>
        <p className="text-church-text-muted mt-2">تحديث بيانات القاعة الحالية</p>
      </div>

      <div className="church-card p-6 md:p-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <VenueForm initialData={venue} />
      </div>
    </div>
  );
}
