import { getAllSections } from "@/actions/section.actions";
import { requireAdmin } from "@/lib/auth-middleware";
import { LayoutGrid, Plus, Edit2, Trash2, ListOrdered } from "lucide-react";
import Link from "next/link";
import DeleteSectionButton from "@/components/admin/DeleteSectionButton";

export default async function AdminSectionsPage() {
  await requireAdmin();
  const sections = await getAllSections();

  return (
    <div className="church-container church-section space-y-8">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-title text-3xl text-church-red">إدارة الأقسام</h1>
          <p className="text-church-text-muted mt-2">تنظيم القاعات في مجموعات (مثل: الدور الأرضي، المبنى التعليمي)</p>
        </div>
        <Link href="/admin/sections/new" className="church-button-primary py-2 px-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          إضافة قسم
        </Link>
      </div>

      <div className="church-card p-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="hidden md:block overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>المعرف (ID)</th>
                <th>الاسم بالعربي</th>
                <th>الترتيب</th>
                <th className="text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-sm">{s.id}</td>
                  <td className="font-bold">{s.nameAr}</td>
                  <td>
                    <div className="flex items-center gap-2">
                        <ListOrdered className="w-4 h-4 text-church-gold" />
                        {s.sortOrder}
                    </div>
                  </td>
                  <td className="text-left">
                    <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/sections/edit/${s.id}`} className="p-2 bg-gray-50 text-church-text-light hover:text-church-gold-dark rounded-lg transition-colors border border-church-border-light">
                            <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteSectionButton id={s.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-church-text-light">لا يوجد أقسام مضافة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {sections.map((s) => (
            <div key={s.id} className="border border-church-border-light rounded-xl p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                    <div className="font-bold text-church-text">{s.nameAr}</div>
                    <div className="text-[10px] font-mono text-church-text-light">{s.id}</div>
                </div>
                <div className="flex items-center gap-2">
                        <Link href={`/admin/sections/edit/${s.id}`} className="p-2 bg-gray-50 text-church-text-light rounded-lg border border-church-border-light">
                            <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteSectionButton id={s.id} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-church-text-muted">
                <ListOrdered className="w-3 h-3 text-church-gold" />
                <span>الترتيب: {s.sortOrder}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
