import SectionForm from "@/components/admin/SectionForm";
import { requireAdmin } from "@/lib/auth-middleware";
import { db } from "@/db";
import { sections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface EditSectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSectionPage({ params }: EditSectionPageProps) {
  await requireAdmin();
  const { id } = await params;

  const result = await db.select().from(sections).where(eq(sections.id, id)).limit(1);
  if (result.length === 0) {
    notFound();
  }

  const section = result[0];

  return (
    <div className="church-container church-section space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-title text-3xl text-church-red">تعديل القسم: {section.nameAr}</h1>
        <p className="text-church-text-muted mt-2">تحديث بيانات القسم الحالي</p>
      </div>

      <div className="church-card p-6 md:p-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <SectionForm initialData={section} />
      </div>
    </div>
  );
}
