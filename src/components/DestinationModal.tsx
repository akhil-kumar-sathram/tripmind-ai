import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import { useEffect } from 'react';
import { Destination } from '../types/trip';
import { formatCurrency } from '../utils/formatters';
import { TravelImage } from './TravelImage';

interface DestinationModalProps {
  destination: Destination | null;
  isGenerating?: boolean;
  onClose: () => void;
  onGenerateAiTrip: (destination: Destination) => void;
  onCustomizeTrip: (destination: Destination) => void;
}

export function DestinationModal({
  destination,
  isGenerating = false,
  onClose,
  onGenerateAiTrip,
  onCustomizeTrip,
}: DestinationModalProps) {
  useEffect(() => {
    if (!destination) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [destination, onClose]);

  if (!destination) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1E201D]/55 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 sm:h-64 w-full">
          <TravelImage
            src={destination.image}
            alt={destination.imageAlt}
            fallbackTitle={destination.name}
            priority
            className="w-full h-full"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#141714]/80 via-[#141714]/25 to-transparent"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close destination details"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1E201D]/70 hover:bg-[#1E201D] text-[#FDFBF7] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 text-[#FDFBF7] space-y-1">
            <p className="text-xs font-medium text-[#EFECE4]/90">
              {destination.country} · {destination.region} · Best for {destination.bestTravelStyle}
            </p>
            <h2
              id="destination-modal-title"
              className="font-serif text-2xl sm:text-3xl font-semibold"
            >
              {destination.name}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm sm:text-base text-[#575B54] leading-relaxed">
            {destination.shortDescription}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-[#EFECE4] text-sm tabular-nums">
            <div>
              <dt className="text-xs text-[#787C74]">Ideal Duration</dt>
              <dd className="font-semibold text-[#1E201D] mt-0.5">{destination.idealDays} days</dd>
            </div>
            <div>
              <dt className="text-xs text-[#787C74]">Suggested Budget</dt>
              <dd className="font-semibold text-[#1B4332] mt-0.5">
                ~{formatCurrency(destination.suggestedBudgetUSD, 'USD')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#787C74]">Best Season</dt>
              <dd className="font-medium text-[#1E201D] mt-0.5">{destination.bestSeason}</dd>
            </div>
          </dl>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#1E201D]">Notable Highlights</p>
            <p className="text-sm text-[#575B54] leading-relaxed">
              {destination.highlights.join(' · ')}
            </p>
          </div>

          <p className="text-xs text-[#787C74] leading-relaxed">
            Curated destination guide for inspiration. Choose below to generate a fresh personalized itinerary with Gemini AI or customize your own dates, departure city, and budget first.
          </p>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onCustomizeTrip(destination)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1E201D] bg-[#EFECE4] hover:bg-[#E5DFD2] disabled:opacity-50 rounded-md transition-colors cursor-pointer min-h-[42px] whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              Customize in Planner
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onGenerateAiTrip(destination)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] disabled:opacity-60 rounded-md transition-colors cursor-pointer min-h-[42px] whitespace-nowrap"
            >
              Generate AI Itinerary
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
