import { getAllVenues } from "@/actions/venue.actions";
import { requireAdmin } from "@/lib/auth-middleware";
import { MapPin, Users, Layers, ExternalLink, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import DeleteVenueButton from "@/components/admin/DeleteVenueButton";

export default async function AdminVenuesPage() {
  await requireAdmin();
  const venues = await getAllVenues();

  return (
    <div className="church-container church-section space-y-8">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="font-title text-3xl text-church-red">إدارة القاعات</h1>
          <p className="text-church-text-muted mt-2">إضافة، تعديل، أو حذف قاعات الكنيسة</p>
        </div>
        <Link href="/admin/venues/new" className="church-button-primary py-2 px-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          إضافة قاعة
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((v, i) => (
          <div 
            key={v.id} 
            className="church-card p-6 flex flex-col animate-fade-up" 
            style={{ animationDelay: `${(i + 1) * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-church-bg-warm p-3 rounded-xl border border-church-border-light text-church-red">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/venues/edit/${v.id}`} className="p-2 bg-gray-50 text-church-text-light hover:text-church-gold-dark rounded-lg transition-colors border border-church-border-light">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <DeleteVenueButton id={v.id} />
              </div>
            </div>

            <h3 className="font-title text-xl text-church-text mb-2">{v.nameAr}</h3>
            
            <div className="space-y-3 mt-auto pt-4 border-t border-church-border-light">
              <div className="flex items-center gap-2 text-sm text-church-text-muted">
                <Layers className="w-4 h-4 text-church-gold" />
                <span>{v.sectionName || v.section}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-church-text-muted">
                  <Users className="w-4 h-4 text-church-gold" />
                  <span>السعة: {v.capacity || "غير محدد"}</span>
                </div>
                {v.isDouble && (
                  <span className="badge bg-church-gold/10 text-church-gold-dark border border-church-gold/30 text-[10px]">مزدوجة</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {venues.length === 0 && (
          <div className="col-span-full py-20 text-center church-card border-dashed">
            <span className="church-ornament text-4xl opacity-20 block mb-4">✧</span>
            <p className="text-church-text-light font-body">لا يوجد قاعات مضافة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
