import { getAllVenues, getBookingsForVenue } from "@/actions/venue.actions";
import { getAllSections } from "@/actions/section.actions";
import VenueCard from "@/components/shared/VenueCard";
import { startOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
  const [allVenues, allSections] = await Promise.all([
    getAllVenues(),
    getAllSections()
  ]);
  
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday

  // Fetch all bookings for all venues for the current week.
  const venuesWithBookingsPromises = allVenues.map(async (venue) => {
    const bookings = await getBookingsForVenue(venue.id, weekStart);
    return { venue, bookings };
  });

  const venuesWithBookings = await Promise.all(venuesWithBookingsPromises);

  return (
    <div className="church-container church-section">
      <div className="text-center mb-12 animate-fade-up">
        <h1 className="section-title">دليل القاعات</h1>
        <div className="gold-divider">
          <span className="church-ornament">♱</span>
        </div>
        <p className="section-subtitle mt-4">
          استعرض القاعات المتاحة وجدول الحجوزات الخاص بكل قاعة
        </p>
      </div>

      <div className="space-y-16">
        {allSections.map((section) => {
          const sectionVenues = venuesWithBookings.filter((v) => v.venue.section === section.id);
          
          if (sectionVenues.length === 0) return null;

          return (
            <div key={section.id} className="animate-fade-up">
              <h2 className="font-title text-3xl text-church-gold-dark mb-2 text-right">{section.nameAr}</h2>
              <div className="gold-divider-simple mb-8" />
              
              {/* Grid for Venue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionVenues.map(({ venue, bookings }) => (
                  <div key={venue.id} className="h-full">
                    <VenueCard venue={venue as any} bookings={bookings} weekStart={weekStart} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
