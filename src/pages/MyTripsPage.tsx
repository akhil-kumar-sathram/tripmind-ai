import { ArrowRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { TravelImage } from '../components/TravelImage';
import { PageRoute } from '../hooks/useHashRouter';
import { Itinerary } from '../types/trip';
import { formatCurrency, formatRelativeSavedDate } from '../utils/formatters';

interface MyTripsPageProps {
  savedTrips: Itinerary[];
  storageError: string | null;
  onOpenTrip: (trip: Itinerary) => void;
  onDeleteTrip: (tripId: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export function MyTripsPage({
  savedTrips,
  storageError,
  onOpenTrip,
  onDeleteTrip,
  onNavigate,
}: MyTripsPageProps) {
  const [pendingDelete, setPendingDelete] = useState<Itinerary | null>(null);

  return (
    <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3DDD2] pb-8">
        <div className="space-y-2.5 max-w-2xl">
          <p className="text-sm font-medium text-[#C86D3B]">Saved Locally in Browser</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E201D]">
            My Trips
          </h1>
          <p className="text-base text-[#575B54] leading-relaxed">
            Reopen your bookmarked itineraries, review packing progress, or clear past plans. Saved trips are stored privately in this browser’s localStorage with no database required.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate({ page: 'plan' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer min-h-[42px] whitespace-nowrap self-start md:self-auto"
        >
          Plan a New Trip
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {storageError && (
        <div
          role="alert"
          className="bg-[#FDF6F4] border border-[#E5BFB8] rounded-xl p-4 text-sm text-[#7F271B]"
        >
          {storageError}
        </div>
      )}

      {savedTrips.length === 0 ? (
        <EmptyState
          title="No saved trips yet"
          description="Generate a personalized itinerary in the trip planner or pick a destination from Explore, then choose Save Trip to keep it here."
          primaryActionLabel="Plan My Trip"
          onPrimaryAction={() => onNavigate({ page: 'plan' })}
          secondaryActionLabel="Explore Destinations"
          onSecondaryAction={() => onNavigate({ page: 'explore' })}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {savedTrips.map((trip) => {
            const packedCount = trip.packingChecklist.filter((item) => item.checked).length;
            const totalPack = trip.packingChecklist.length;

            return (
              <article
                key={trip.id}
                className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <TravelImage
                    src={trip.heroImage}
                    alt={trip.heroImageAlt}
                    fallbackTitle={trip.destination}
                    className="w-full h-full"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    <p className="text-xs font-medium text-[#787C74] tabular-nums">
                      {trip.dateRangeLabel} · {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}
                    </p>
                    <h2 className="font-serif text-2xl font-semibold text-[#1E201D]">
                      {trip.destination}
                      {trip.country ? `, ${trip.country}` : ''}
                    </h2>
                    <p className="text-sm text-[#575B54] leading-relaxed line-clamp-2">
                      {trip.summary}
                    </p>

                    <div className="pt-2 space-y-1 text-xs text-[#575B54] tabular-nums">
                      <p>
                        Style: <span className="text-[#1E201D] font-medium">{trip.travelStyle}</span> · Pace:{' '}
                        <span className="text-[#1E201D] font-medium">{trip.pace}</span>
                      </p>
                      <p>
                        Budget:{' '}
                        <span className="text-[#1B4332] font-semibold">
                          {formatCurrency(trip.totalBudget, trip.currency)}
                        </span>{' '}
                        · Packed {packedCount}/{totalPack} items
                      </p>
                      <p className="text-[#787C74]">{formatRelativeSavedDate(trip.createdAt)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EFECE4] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenTrip(trip)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer min-h-[40px] whitespace-nowrap"
                    >
                      Open Itinerary
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingDelete(trip)}
                      aria-label={`Delete saved trip to ${trip.destination}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#A63A2B] hover:bg-[#F8ECE9] rounded-md transition-colors cursor-pointer min-h-[40px]"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete saved trip?"
        description={
          pendingDelete
            ? `Remove "${pendingDelete.destination}" from your saved trips in this browser? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete Trip"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            onDeleteTrip(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
      />
    </main>
  );
}
