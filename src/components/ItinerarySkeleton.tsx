interface ItinerarySkeletonProps {
  destinationLabel?: string;
  isRegenerating?: boolean;
}

export function ItinerarySkeleton({
  destinationLabel,
  isRegenerating = false,
}: ItinerarySkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      aria-label="Planning your adventure"
      className="max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-10"
    >
      <div className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-serif text-xl font-semibold text-[#1B4332]">
            {isRegenerating ? 'Planning a fresh adventure...' : 'Planning your adventure...'}
          </p>
          <p className="text-sm text-[#575B54]">
            {destinationLabel
              ? `Crafting a personalized itinerary, estimated budget breakdown, and packing checklist for ${destinationLabel}.`
              : 'Crafting your personalized day-by-day itinerary, estimated budget breakdown, and travel tips.'}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="w-6 h-6 rounded-full border-2 border-[#1B4332]/25 border-t-[#1B4332] animate-spin shrink-0"
        />
      </div>

      <div className="h-72 sm:h-96 w-full rounded-xl bg-[#E7E1D5] animate-pulse" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-lg p-5 space-y-3"
          >
            <div className="h-3 w-20 bg-[#E7E1D5] rounded animate-pulse" />
            <div className="h-7 w-28 bg-[#DFD8CA] rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {[0, 1, 2].map((day) => (
            <div
              key={day}
              className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 w-56 bg-[#E7E1D5] rounded animate-pulse" />
                <div className="h-4 w-24 bg-[#EFECE4] rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                {[0, 1, 2].map((slot) => (
                  <div key={slot} className="space-y-2 pt-3 border-t border-[#EFECE4]">
                    <div className="h-4 w-32 bg-[#EFECE4] rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-[#E7E1D5] rounded animate-pulse" />
                    <div className="h-4 w-full bg-[#F1EDE5] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-4">
            <div className="h-5 w-40 bg-[#E7E1D5] rounded animate-pulse" />
            <div className="h-4 w-full bg-[#EFECE4] rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-[#EFECE4] rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-[#EFECE4] rounded animate-pulse" />
          </div>
          <div className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-3">
            <div className="h-5 w-36 bg-[#E7E1D5] rounded animate-pulse" />
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-4 w-full bg-[#EFECE4] rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
