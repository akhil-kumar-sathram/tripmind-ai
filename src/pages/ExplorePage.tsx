import { ArrowRight, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { TravelImage } from '../components/TravelImage';
import { SAMPLE_DESTINATIONS } from '../data/sampleDestinations';
import { Destination, TRAVEL_STYLES, TravelStyle } from '../types/trip';
import { formatCurrency } from '../utils/formatters';

interface ExplorePageProps {
  onExploreDestination: (slug: string) => void;
  onPlanForDestination: (destination: Destination) => void;
}

const REGIONS: ('All Regions' | Destination['region'])[] = [
  'All Regions',
  'Europe',
  'Asia',
  'Africa',
  'South America',
];

export function ExplorePage({ onExploreDestination, onPlanForDestination }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'All' | TravelStyle>('All');
  const [selectedRegion, setSelectedRegion] = useState<'All Regions' | Destination['region']>('All Regions');

  const filteredDestinations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return SAMPLE_DESTINATIONS.filter((dest) => {
      const matchesStyle =
        selectedStyle === 'All' ||
        dest.bestTravelStyle === selectedStyle ||
        dest.secondaryStyles.includes(selectedStyle);

      const matchesRegion = selectedRegion === 'All Regions' || dest.region === selectedRegion;

      const matchesQuery =
        !query ||
        dest.name.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        dest.shortDescription.toLowerCase().includes(query) ||
        dest.bestTravelStyle.toLowerCase().includes(query) ||
        dest.highlights.some((h) => h.toLowerCase().includes(query));

      return matchesStyle && matchesRegion && matchesQuery;
    });
  }, [searchQuery, selectedStyle, selectedRegion]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedStyle !== 'All' || selectedRegion !== 'All Regions';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStyle('All');
    setSelectedRegion('All Regions');
  };

  return (
    <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-medium text-[#C86D3B]">Destination Directory</p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#1E201D] leading-tight">
          Explore curated destinations
        </h1>
        <p className="text-base text-[#575B54] leading-relaxed">
          Browse curated destination guides by travel style, region, or interest. Open any destination to inspect highlights and generate a live personalized Gemini AI itinerary, or customize it in the trip planner.
        </p>
      </div>

      {/* Search & Filter Interface */}
      <section
        aria-label="Search and filter destinations"
        className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7 relative">
            <Search
              className="w-4 h-4 text-[#787C74] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="explore-search" className="sr-only">
              Search destinations by city, country, or highlight
            </label>
            <input
              id="explore-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, country, or landmark (e.g., Kyoto, Alps, food)..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-[#D8D1C4] rounded-md text-[#1E201D] placeholder:text-[#959890] focus:border-[#1B4332] min-h-[42px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#787C74] hover:text-[#1E201D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-5 flex flex-wrap items-center gap-1.5 md:justify-end">
            {REGIONS.map((region) => {
              const active = selectedRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap min-h-[38px] ${
                    active
                      ? 'bg-[#1B4332] text-[#FDFBF7]'
                      : 'bg-[#EFECE4] text-[#575B54] hover:text-[#1E201D]'
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Style Filter Bar */}
        <div className="pt-4 border-t border-[#EFECE4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by travel style">
            <button
              type="button"
              onClick={() => setSelectedStyle('All')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
                selectedStyle === 'All'
                  ? 'bg-[#C86D3B] text-[#FDFBF7] border-[#C86D3B]'
                  : 'bg-white text-[#575B54] border-[#D8D1C4] hover:border-[#1E201D]/40'
              }`}
            >
              All Styles
            </button>
            {TRAVEL_STYLES.map((style) => {
              const active = selectedStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
                    active
                      ? 'bg-[#C86D3B] text-[#FDFBF7] border-[#C86D3B]'
                      : 'bg-white text-[#575B54] border-[#D8D1C4] hover:border-[#1E201D]/40'
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#787C74] tabular-nums">
            <span>
              Showing {filteredDestinations.length} of {SAMPLE_DESTINATIONS.length} destinations
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-medium text-[#1B4332] hover:text-[#C86D3B] underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Destination Grid or Empty State */}
      {filteredDestinations.length === 0 ? (
        <EmptyState
          title="No destinations match your filters"
          description="Try clearing a travel style filter or searching a broader region, or type any destination directly in the trip planner."
          primaryActionLabel="Clear All Filters"
          onPrimaryAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredDestinations.map((dest) => (
            <article
              key={dest.id}
              className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <TravelImage
                  src={dest.image}
                  alt={dest.imageAlt}
                  fallbackTitle={dest.name}
                  className="w-full h-full hover:scale-[1.02] transition-transform duration-300"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#787C74] tabular-nums">
                    <span>{dest.country}</span>
                    <span aria-hidden="true">·</span>
                    <span>Best for {dest.bestTravelStyle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{dest.idealDays} days</span>
                  </div>

                  <h2 className="font-serif text-2xl font-semibold text-[#1E201D]">
                    {dest.name}
                  </h2>

                  <p className="text-sm text-[#575B54] leading-relaxed">
                    {dest.shortDescription}
                  </p>

                  <p className="text-xs text-[#787C74] pt-1 tabular-nums">
                    Best season: {dest.bestSeason} · Suggested budget {formatCurrency(dest.suggestedBudgetUSD, 'USD')}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EFECE4] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onExploreDestination(dest.slug)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer min-h-[40px] whitespace-nowrap"
                  >
                    Explore
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onPlanForDestination(dest)}
                    className="text-sm font-medium text-[#1B4332] hover:text-[#C86D3B] transition-colors cursor-pointer py-2 whitespace-nowrap"
                  >
                    Plan custom trip
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
