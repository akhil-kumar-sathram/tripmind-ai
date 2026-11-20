import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Edit3,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { TravelImage } from '../components/TravelImage';
import { Itinerary, PackingItem } from '../types/trip';
import { buildPlainTextSummary, formatCurrency } from '../utils/formatters';

interface ItineraryPageProps {
  itinerary: Itinerary;
  isSaved: boolean;
  isRegenerating?: boolean;
  onSaveTrip: (itinerary: Itinerary) => void;
  onUpdateItinerary: (itinerary: Itinerary) => void;
  onEditTrip: (itinerary: Itinerary) => void;
  onRegenerateTrip: (itinerary: Itinerary) => void;
  onBack: () => void;
  onNotify: (type: 'success' | 'info' | 'error', title: string, description?: string) => void;
}

export function ItineraryPage({
  itinerary,
  isSaved,
  isRegenerating = false,
  onSaveTrip,
  onUpdateItinerary,
  onEditTrip,
  onRegenerateTrip,
  onBack,
  onNotify,
}: ItineraryPageProps) {
  const [selectedDay, setSelectedDay] = useState<'all' | number>('all');
  const [newPackingItem, setNewPackingItem] = useState('');
  const [copied, setCopied] = useState(false);

  const visibleDays = useMemo(() => {
    if (selectedDay === 'all') return itinerary.days;
    return itinerary.days.filter((day) => day.dayNumber === selectedDay);
  }, [itinerary.days, selectedDay]);

  const dailyAverage =
    itinerary.numberOfDays > 0 ? itinerary.estimatedTotalCost / itinerary.numberOfDays : 0;
  const perTraveler =
    itinerary.travelers > 0 ? itinerary.estimatedTotalCost / itinerary.travelers : 0;

  const packedCount = itinerary.packingChecklist.filter((item) => item.checked).length;

  const breakdownItems = useMemo(() => {
    const shopping = itinerary.budgetBreakdown.shopping ?? 0;
    const miscellaneous = itinerary.budgetBreakdown.miscellaneous ?? 0;
    const total =
      itinerary.budgetBreakdown.accommodation +
      itinerary.budgetBreakdown.food +
      itinerary.budgetBreakdown.activities +
      itinerary.budgetBreakdown.transportation +
      shopping +
      miscellaneous;
    const safeTotal = total > 0 ? total : 1;

    const base = [
      {
        label: 'Accommodation',
        amount: itinerary.budgetBreakdown.accommodation,
        percent: Math.round((itinerary.budgetBreakdown.accommodation / safeTotal) * 100),
        barColor: 'bg-[#1B4332]',
      },
      {
        label: 'Food & Dining',
        amount: itinerary.budgetBreakdown.food,
        percent: Math.round((itinerary.budgetBreakdown.food / safeTotal) * 100),
        barColor: 'bg-[#C86D3B]',
      },
      {
        label: 'Activities & Entry',
        amount: itinerary.budgetBreakdown.activities,
        percent: Math.round((itinerary.budgetBreakdown.activities / safeTotal) * 100),
        barColor: 'bg-[#4E7A65]',
      },
      {
        label: 'Transportation',
        amount: itinerary.budgetBreakdown.transportation,
        percent: Math.round((itinerary.budgetBreakdown.transportation / safeTotal) * 100),
        barColor: 'bg-[#8F9E92]',
      },
    ];

    if (shopping > 0 || itinerary.dataSource === 'gemini-ai') {
      base.push({
        label: 'Shopping',
        amount: shopping,
        percent: Math.round((shopping / safeTotal) * 100),
        barColor: 'bg-[#C9A27E]',
      });
    }

    if (miscellaneous > 0 || itinerary.dataSource === 'gemini-ai') {
      base.push({
        label: 'Miscellaneous',
        amount: miscellaneous,
        percent: Math.round((miscellaneous / safeTotal) * 100),
        barColor: 'bg-[#C6BEB0]',
      });
    }

    return base;
  }, [itinerary.budgetBreakdown, itinerary.dataSource]);

  const handleTogglePackingItem = (itemId: string) => {
    const nextChecklist = itinerary.packingChecklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateItinerary({ ...itinerary, packingChecklist: nextChecklist });
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPackingItem.trim();
    if (!trimmed) return;

    const added: PackingItem = {
      id: `pack-custom-${Date.now()}`,
      item: trimmed,
      category: 'Local Extras',
      checked: false,
    };

    onUpdateItinerary({
      ...itinerary,
      packingChecklist: [...itinerary.packingChecklist, added],
    });
    setNewPackingItem('');
    onNotify('info', 'Added to packing list', `"${trimmed}" was added to your checklist.`);
  };

  const handleCopySummary = async () => {
    const text = buildPlainTextSummary(itinerary);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onNotify('success', 'Summary copied', 'Itinerary overview copied to your clipboard.');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      onNotify('error', 'Clipboard unavailable', 'Unable to copy automatically in this browser.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#575B54] hover:text-[#1E201D] transition-colors cursor-pointer py-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isRegenerating}
            onClick={() => onRegenerateTrip(itinerary)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1E201D] bg-[#FDFBF7] hover:bg-[#EFECE4] disabled:opacity-50 border border-[#D8D1C4] rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[40px] whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
            {itinerary.dataSource === 'gemini-ai' ? 'Regenerate' : 'Generate AI Version'}
          </button>

          <button
            type="button"
            onClick={() => onEditTrip(itinerary)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1E201D] bg-[#FDFBF7] hover:bg-[#EFECE4] border border-[#D8D1C4] rounded-md transition-colors cursor-pointer min-h-[40px] whitespace-nowrap"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
            Customize Trip
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1E201D] bg-[#FDFBF7] hover:bg-[#EFECE4] border border-[#D8D1C4] rounded-md transition-colors cursor-pointer min-h-[40px] whitespace-nowrap"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>

          <button
            type="button"
            onClick={() => onSaveTrip(itinerary)}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer min-h-[40px] whitespace-nowrap ${
              isSaved
                ? 'bg-[#EFECE4] text-[#1B4332] border border-[#1B4332]/30 hover:bg-[#E5DFD2]'
                : 'bg-[#1B4332] text-[#FDFBF7] hover:bg-[#143326]'
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Bookmark className="w-4 h-4" aria-hidden="true" />
            )}
            {isSaved ? 'Saved in My Trips' : 'Save Trip'}
          </button>
        </div>
      </div>

      {/* Destination Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-[#1E201D] min-h-[320px] sm:min-h-[400px] flex items-end">
        <TravelImage
          src={itinerary.heroImage}
          alt={itinerary.heroImageAlt}
          fallbackTitle={itinerary.destination}
          priority
          className="absolute inset-0 w-full h-full"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#141714]/88 via-[#141714]/45 to-transparent"
        />

        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-[#EFECE4]/90 tabular-nums">
            <span>{itinerary.dateRangeLabel}</span>
            <span aria-hidden="true">·</span>
            <span>
              {itinerary.travelers} {itinerary.travelers === 1 ? 'traveler' : 'travelers'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{itinerary.travelStyle}</span>
            <span aria-hidden="true">·</span>
            <span>{itinerary.pace}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#FDFBF7] tracking-tight">
            {itinerary.destination}
            {itinerary.country ? `, ${itinerary.country}` : ''}
          </h1>

          {itinerary.tripTitle && (
            <p className="font-serif italic text-lg sm:text-xl text-[#EFECE4]/95">
              {itinerary.tripTitle}
            </p>
          )}

          {itinerary.startingLocation && (
            <p className="text-sm text-[#EFECE4]/85">
              Departing from {itinerary.startingLocation} · Accommodation preference:{' '}
              {itinerary.accommodationPreference}
            </p>
          )}
        </div>
      </section>

      {/* Honest Source & Cost Estimate Disclosure */}
      <div className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        {itinerary.dataSource === 'gemini-ai' ? (
          <p className="text-[#575B54] leading-relaxed">
            <span className="font-semibold text-[#1E201D]">AI-Generated Estimate:</span> Personalized with Gemini AI using your trip preferences. All budget numbers, daily expenses, and lodging areas are approximate estimates rather than real-time prices or confirmed availability.
          </p>
        ) : (
          <p className="text-[#575B54] leading-relaxed">
            <span className="font-semibold text-[#1E201D]">Curated Sample Preview:</span> This Explore destination preview uses curated sample travel data. Click <span className="font-medium text-[#1E201D]">Generate AI Version</span> or <span className="font-medium text-[#1E201D]">Customize Trip</span> to create a live Gemini AI plan.
          </p>
        )}
      </div>

      {/* Budget Overview & Trip Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Trip Summary */}
        <div className="lg:col-span-7 bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#C86D3B]">Trip Summary</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E201D]">
              Overview of your {itinerary.numberOfDays}-day plan
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#575B54] leading-relaxed">
            {itinerary.summary}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EFECE4] text-sm">
            <div>
              <dt className="text-xs text-[#787C74]">Selected Interests</dt>
              <dd className="text-[#1E201D] font-medium mt-0.5">
                {itinerary.interests.length > 0 ? itinerary.interests.join(' · ') : 'General sightseeing'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#787C74]">Dietary Note</dt>
              <dd className="text-[#1E201D] font-medium mt-0.5">{itinerary.dietaryPreference}</dd>
            </div>
            {itinerary.additionalInstructions && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#787C74]">Your Additional Instructions</dt>
                <dd className="text-[#1E201D] mt-0.5 leading-relaxed">
                  {itinerary.additionalInstructions}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Budget Overview */}
        <div className="lg:col-span-5 bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#C86D3B]">
                {itinerary.dataSource === 'gemini-ai' ? 'AI-Generated Budget Estimate' : 'Budget Overview'}
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[#1E201D] mt-1">
                Estimated Breakdown
              </h2>
            </div>
            <span className="text-xs font-medium text-[#787C74]">{itinerary.currency}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-5 border-b border-[#EFECE4] tabular-nums">
            <div>
              <p className="text-xs text-[#787C74]">Target Budget</p>
              <p className="font-serif text-2xl font-semibold text-[#1E201D] mt-0.5">
                {formatCurrency(itinerary.totalBudget, itinerary.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#787C74]">Estimated Total</p>
              <p className="font-serif text-2xl font-semibold text-[#1B4332] mt-0.5">
                {formatCurrency(itinerary.estimatedTotalCost, itinerary.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#787C74]">Daily Average</p>
              <p className="text-sm font-semibold text-[#1E201D] mt-0.5">
                {formatCurrency(dailyAverage, itinerary.currency)} / day
              </p>
            </div>
            <div>
              <p className="text-xs text-[#787C74]">Per Traveler</p>
              <p className="text-sm font-semibold text-[#1E201D] mt-0.5">
                {formatCurrency(perTraveler, itinerary.currency)} / person
              </p>
            </div>
          </div>

          {/* Proportional Allocation Bar */}
          <div className="space-y-3">
            <div
              className="h-2.5 w-full rounded-full overflow-hidden flex bg-[#EFECE4]"
              aria-hidden="true"
            >
              {breakdownItems.map((item) => (
                <div
                  key={item.label}
                  style={{ width: `${item.percent}%` }}
                  className={item.barColor}
                />
              ))}
            </div>

            <ul className="space-y-2 text-xs sm:text-sm tabular-nums">
              {breakdownItems.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[#575B54]">
                    <span className={`w-2.5 h-2.5 rounded-xs shrink-0 ${item.barColor}`} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="font-medium text-[#1E201D]">
                    {formatCurrency(item.amount, itinerary.currency)}{' '}
                    <span className="text-[#787C74] font-normal">({item.percent}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Main Content Split: Daily Timeline + Practical Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Daily Itinerary Timeline */}
        <section aria-label="Daily itinerary" className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3DDD2] pb-5">
            <div>
              <p className="text-xs font-semibold text-[#C86D3B]">Day-by-Day Schedule</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E201D] mt-1">
                Daily Itinerary Timeline
              </h2>
            </div>

            {/* Interactive Day Filter Tabs */}
            <div
              role="tablist"
              aria-label="Filter itinerary by day"
              className="flex flex-wrap items-center gap-1.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedDay === 'all'}
                onClick={() => setSelectedDay('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
                  selectedDay === 'all'
                    ? 'bg-[#1B4332] text-[#FDFBF7]'
                    : 'bg-[#EFECE4] text-[#575B54] hover:text-[#1E201D]'
                }`}
              >
                All Days
              </button>
              {itinerary.days.map((day) => {
                const active = selectedDay === day.dayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedDay(day.dayNumber)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap tabular-nums min-h-[36px] ${
                      active
                        ? 'bg-[#1B4332] text-[#FDFBF7]'
                        : 'bg-[#EFECE4] text-[#575B54] hover:text-[#1E201D]'
                    }`}
                  >
                    Day {day.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            {visibleDays.map((day) => (
              <article
                key={day.dayNumber}
                className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-6"
              >
                <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#EFECE4]">
                  <div>
                    <p className="text-xs font-medium text-[#787C74] tabular-nums">
                      Day {day.dayNumber}
                      {day.dateLabel ? ` · ${day.dateLabel}` : ''}
                    </p>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1E201D] mt-0.5">
                      {day.theme}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-[#1B4332] tabular-nums whitespace-nowrap">
                    Est. daily cost: {formatCurrency(day.estimatedDailyCost, itinerary.currency)}
                  </p>
                </header>

                {/* Vertical Timeline */}
                <ol className="relative space-y-7 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[#DDD6C8]">
                  {day.activities.map((activity) => (
                    <li key={activity.id} className="relative pl-7">
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-[#FDFBF7] ${
                          activity.slot === 'Morning'
                            ? 'bg-[#1B4332]'
                            : activity.slot === 'Afternoon'
                              ? 'bg-[#C86D3B]'
                              : 'bg-[#4E7A65]'
                        }`}
                      />

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#787C74] tabular-nums">
                            <span className="text-[#1E201D] font-semibold">{activity.slot}</span>
                            <span aria-hidden="true">·</span>
                            <span>{activity.timeRange}</span>
                            <span aria-hidden="true">·</span>
                            <span>{activity.place}</span>
                          </div>
                          <span className="text-xs font-medium text-[#575B54] tabular-nums">
                            Est. {formatCurrency(activity.estimatedCost, itinerary.currency)}
                          </span>
                        </div>

                        <h4 className="font-serif text-lg font-semibold text-[#1E201D]">
                          {activity.title}
                        </h4>

                        <p className="text-sm text-[#575B54] leading-relaxed">
                          {activity.description}
                        </p>

                        {activity.foodRecommendation && (
                          <p className="text-xs sm:text-sm text-[#1B4332] bg-[#F5F1E9] rounded-md px-3.5 py-2.5 leading-relaxed">
                            <span className="font-semibold">Dining note:</span>{' '}
                            {activity.foodRecommendation}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Daily Highlights: Attractions, Food & Local Transit */}
                {(day.recommendedAttractions?.length ||
                  day.dayFoodRecommendations?.length ||
                  day.dayTransportation?.length) ? (
                  <div className="pt-5 border-t border-[#EFECE4] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {day.recommendedAttractions && day.recommendedAttractions.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-semibold text-[#1E201D]">Key Attractions</p>
                        <p className="text-[#575B54] leading-relaxed">
                          {day.recommendedAttractions.join(' · ')}
                        </p>
                      </div>
                    )}
                    {day.dayFoodRecommendations && day.dayFoodRecommendations.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-semibold text-[#1E201D]">Food Suggestions</p>
                        <p className="text-[#575B54] leading-relaxed">
                          {day.dayFoodRecommendations.join(' · ')}
                        </p>
                      </div>
                    )}
                    {day.dayTransportation && day.dayTransportation.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-semibold text-[#1E201D]">Day Transit</p>
                        <p className="text-[#575B54] leading-relaxed">
                          {day.dayTransportation.join(' · ')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          {/* Accommodation Suggestions by Type */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#EFECE4] pb-4 space-y-1">
              <p className="text-xs font-semibold text-[#C86D3B]">Where to Stay</p>
              <h2 className="font-serif text-2xl font-semibold text-[#1E201D]">
                Accommodation Types & Recommended Areas
              </h2>
              <p className="text-xs text-[#787C74]">
                Suggested stay styles and neighborhoods suited to your budget — not live hotel availability or booking quotes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {itinerary.accommodations.map((stay) => (
                <div
                  key={stay.tier}
                  className="bg-[#F7F4EE]/70 border border-[#E5E0D5] rounded-lg p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#1B4332]">{stay.tier}</p>
                    <h3 className="font-serif text-lg font-semibold text-[#1E201D]">{stay.name}</h3>
                    <p className="text-xs text-[#787C74]">{stay.neighborhood}</p>
                    <p className="text-sm text-[#575B54] leading-relaxed">{stay.description}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1E201D] pt-3 border-t border-[#E3DDD2] tabular-nums">
                    ~{formatCurrency(stay.estimatedNightlyRate, itinerary.currency)} / night
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Transportation Suggestions */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 sm:p-8 space-y-5">
            <div className="border-b border-[#EFECE4] pb-4">
              <p className="text-xs font-semibold text-[#C86D3B]">Mobility & Transit</p>
              <h2 className="font-serif text-2xl font-semibold text-[#1E201D] mt-1">
                Transportation Suggestions
              </h2>
            </div>

            <div className="divide-y divide-[#EFECE4]">
              {itinerary.transportation.map((transit) => (
                <div
                  key={transit.title}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1 max-w-xl">
                    <p className="text-xs font-medium text-[#787C74]">{transit.category}</p>
                    <h3 className="font-serif text-lg font-semibold text-[#1E201D]">
                      {transit.title}
                    </h3>
                    <p className="text-sm text-[#575B54] leading-relaxed">{transit.details}</p>
                  </div>
                  <p className="text-sm font-medium text-[#1B4332] tabular-nums whitespace-nowrap">
                    {transit.estimatedCostLabel}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </section>

        {/* Right Editorial Sidebar: Places, Food, Tips & Interactive Packing Checklist */}
        <aside className="lg:col-span-4 space-y-7">
          {/* Places to Visit */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-4">
            <div className="border-b border-[#EFECE4] pb-3">
              <h2 className="font-serif text-xl font-semibold text-[#1E201D]">Places to Visit</h2>
            </div>
            <ul className="space-y-3.5">
              {itinerary.placesToVisit.map((place) => (
                <li key={place.name} className="space-y-0.5">
                  <p className="text-sm font-semibold text-[#1E201D]">{place.name}</p>
                  <p className="text-xs text-[#575B54] leading-relaxed">{place.highlight}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Food Recommendations */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-4">
            <div className="border-b border-[#EFECE4] pb-3">
              <h2 className="font-serif text-xl font-semibold text-[#1E201D]">
                Food Recommendations
              </h2>
            </div>
            <ul className="divide-y divide-[#EFECE4]">
              {itinerary.foodRecommendations.map((food) => (
                <li key={food.name} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1E201D]">{food.name}</p>
                    <span className="text-xs font-medium text-[#1B4332] tabular-nums whitespace-nowrap">
                      ~{formatCurrency(food.estimatedCost, itinerary.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-[#787C74]">
                    {food.dishType} · {food.neighborhood}
                  </p>
                  <p className="text-xs text-[#575B54] leading-relaxed">{food.note}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Travel Tips */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-4">
            <div className="border-b border-[#EFECE4] pb-3">
              <h2 className="font-serif text-xl font-semibold text-[#1E201D]">Travel Tips</h2>
            </div>
            <ol className="space-y-3 text-sm text-[#575B54] leading-relaxed">
              {itinerary.travelTips.map((tip, index) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <span className="font-serif font-semibold text-[#C86D3B] tabular-nums">
                    0{index + 1}.
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Interactive Packing Checklist */}
          <section className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-6 space-y-4">
            <div className="flex items-baseline justify-between gap-2 border-b border-[#EFECE4] pb-3">
              <h2 className="font-serif text-xl font-semibold text-[#1E201D]">Packing Checklist</h2>
              <span className="text-xs font-medium text-[#1B4332] tabular-nums">
                {packedCount}/{itinerary.packingChecklist.length} packed
              </span>
            </div>

            <ul className="space-y-2.5">
              {itinerary.packingChecklist.map((entry) => (
                <li key={entry.id}>
                  <label className="flex items-start gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={entry.checked}
                      onChange={() => handleTogglePackingItem(entry.id)}
                      className="mt-1 w-4 h-4 rounded border-[#C6BEB0] accent-[#1B4332] cursor-pointer shrink-0"
                    />
                    <span className="text-sm leading-snug">
                      <span
                        className={
                          entry.checked
                            ? 'line-through text-[#8F938B]'
                            : 'text-[#1E201D]'
                        }
                      >
                        {entry.item}
                      </span>
                      <span className="block text-[11px] text-[#787C74] mt-0.5">
                        {entry.category}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddPackingItem} className="pt-3 border-t border-[#EFECE4] flex gap-2">
              <label htmlFor="new-packing-item" className="sr-only">
                Add a custom packing item
              </label>
              <input
                id="new-packing-item"
                type="text"
                value={newPackingItem}
                onChange={(e) => setNewPackingItem(e.target.value)}
                placeholder="Add custom item..."
                className="flex-1 min-w-0 px-3 py-2 text-xs bg-white border border-[#D8D1C4] rounded-md text-[#1E201D] placeholder:text-[#959890] focus:border-[#1B4332] min-h-[38px]"
              />
              <button
                type="submit"
                aria-label="Add packing item"
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer min-h-[38px] shrink-0"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </section>
        </aside>
      </div>
    </main>
  );
}
