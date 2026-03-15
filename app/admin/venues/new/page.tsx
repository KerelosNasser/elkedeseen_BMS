import VenueForm from "@/components/admin/VenueForm";
import { requireAdmin } from "@/lib/auth-middleware";

export default async function NewVenuePage() {
  await requireAdmin();

  return (
    <div className="church-container church-section space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-title text-3xl text-church-red">إضافة قاعة جديدة</h1>
        <p className="text-church-text-muted mt-2">قم بإدخال بيانات القاعة الجديدة وسيتم إدراجها في الخيارات فوراً</p>
      </div>

      <div className="church-card p-6 md:p-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <VenueForm />
      </div>
    </div>
  );
}
