import SectionForm from "@/components/Admin/SectionForm";
import { requireAdmin } from "@/lib/auth-middleware";

export default async function NewSectionPage() {
  await requireAdmin();

  return (
    <div className="church-container church-section space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-title text-3xl text-church-red">إضافة قسم جديد</h1>
        <p className="text-church-text-muted mt-2">قم بإدخال بيانات القسم الجديد لتنظيم القاعات</p>
      </div>

      <div className="church-card p-6 md:p-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <SectionForm />
      </div>
    </div>
  );
}
