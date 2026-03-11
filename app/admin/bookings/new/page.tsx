import { requireAdmin } from "@/lib/auth-middleware";
import { getAllVenues } from "@/actions/venue.actions";
import BookingFormClient from "./BookingFormClient";

export default async function NewBookingPage() {
  const admin = await requireAdmin();
  const venues = await getAllVenues();

  return (
    <div className="church-container church-section">
      <div className="flex items-center justify-between animate-fade-up mb-8">
        <h1 className="font-title text-3xl text-church-red">حجز قاعة جديد</h1>
      </div>
      
      <div className="church-card p-6 md:p-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <p className="text-church-text-muted font-body mb-8">
          برجاء ملء تفاصيل الحجز. سيتم فحص التعارض بشكل تلقائي. الحجوزات المتكررة تتطلب موافقة باقي المسؤولين.
        </p>

        <BookingFormClient 
          venues={venues} 
          currentUserId={admin.id} 
          currentUserName={admin.name} 
        />
      </div>
    </div>
  );
}
