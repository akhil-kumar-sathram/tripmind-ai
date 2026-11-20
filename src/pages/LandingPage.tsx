import { ArrowRight } from 'lucide-react';
import { HERO_IMAGE, SAMPLE_DESTINATIONS, TRAVEL_INSPIRATIONS } from '../data/sampleDestinations';
import { PageRoute } from '../hooks/useHashRouter';
import { Destination } from '../types/trip';
import { formatCurrency } from '../utils/formatters';
import { TravelImage } from '../components/TravelImage';

interface LandingPageProps {
  onNavigate: (route: PageRoute) => void;
  onExploreDestination: (slug: string) => void;
  onPlanForDestination: (destination: Destination) => void;
}

const WHY_ITEMS = [
  {
    index: '01.',
    title: 'Shaped around your real budget',
    description:
      'Every itinerary balances lodging, dining, transit, and activities against your total budget and preferred currency so there are no mid-trip surprises.',
  },
  {
    index: '02.',
    title: 'Paced for how you actually travel',
    description:
      'Choose a relaxed rhythm with long lunches, a balanced day-to-day flow, or a packed sightseeing schedule tailored to your travel companions.',
  },
  {
    index: '03.',
    title: 'Clear morning-to-evening timelines',
    description:
      'Skip scattered browser tabs. View neighborhood-grouped places to visit, dietary-aware dining notes, local transit guidance, and a practical packing list in one view.',
  },
  {
    index: '04.',
    title: 'Private local saving without accounts',
    description:
      'Keep your planned journeys right in your browser using localStorage. Reopen itineraries, check off packing items, or revise preferences anytime.',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: 'Step 1',
    title: 'Share your destination and preferences',
    description:
      'Enter where you are headed, your starting city, dates or trip length, budget, travel style, interests, and dietary or accommodation notes.',
  },
  {
    step: 'Step 2',
    title: 'Review a structured day-by-day plan',
    description:
      'Inspect morning, afternoon, and evening schedules alongside estimated daily costs, lodging tiers, local transit suggestions, and packing items.',
  },
  {
    step: 'Step 3',
    title: 'Save, refine, and travel with clarity',
    description:
      'Bookmark your itinerary to My Trips, track your packing checklist directly on the dashboard, or copy a clean text summary for your travel companions.',
  },
];

export function LandingPage({
  onNavigate,
  onExploreDestination,
  onPlanForDestination,
}: LandingPageProps) {
  const featured = SAMPLE_DESTINATIONS.filter((d) => d.featured);
  const leadDestination = featured[0];
  const companionDestinations = featured.slice(1, 4);

  return (
    <main>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 sm:pt-10 pb-16 sm:pb-20">
        <div className="relative rounded-2xl overflow-hidden bg-[#1E201D] min-h-[520px] sm:min-h-[600px] flex items-end">
          <TravelImage
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fallbackTitle="Amalfi Coast, Italy"
            priority
            className="absolute inset-0 w-full h-full"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#141714]/88 via-[#141714]/45 to-[#141714]/15"
          />

          <div className="relative z-10 w-full p-7 sm:p-12 lg:p-16 max-w-3xl space-y-6">
            <p className="text-sm font-medium text-[#EFECE4]/90 tracking-wide">
              Personalized itinerary design · Budget-aware · Built for curious travelers
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold text-[#FDFBF7] leading-[1.1] tracking-tight">
              Your next adventure, thoughtfully planned.
            </h1>
            <p className="text-base sm:text-lg text-[#EFECE4]/90 leading-relaxed max-w-2xl">
              TripMind AI organizes destinations, daily schedules, local dining, and realistic cost estimates around your pace, interests, and budget—turning scattered research into a calm, workable itinerary.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate({ page: 'plan' })}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors duration-150 cursor-pointer min-h-[46px] whitespace-nowrap"
              >
                Plan My Trip
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'explore' })}
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-medium text-[#FDFBF7] bg-[#FDFBF7]/15 hover:bg-[#FDFBF7]/25 border border-[#FDFBF7]/40 rounded-md transition-colors duration-150 cursor-pointer min-h-[46px] whitespace-nowrap"
              >
                Explore Destinations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations — Editorial Asymmetric Layout */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 border-t border-[#E3DDD2]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-sm font-medium text-[#C86D3B]">Curated Destination Previews</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E201D] tracking-tight">
              Featured places to begin your next journey
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'explore' })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:text-[#C86D3B] transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            View all destinations
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* Lead Editorial Card */}
          {leadDestination && (
            <article className="lg:col-span-7 bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <TravelImage
                  src={leadDestination.image}
                  alt={leadDestination.imageAlt}
                  fallbackTitle={leadDestination.name}
                  className="w-full h-full hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#787C74] tabular-nums">
                    <span>{leadDestination.country}</span>
                    <span aria-hidden="true">·</span>
                    <span>{leadDestination.bestTravelStyle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{leadDestination.idealDays} days ideal</span>
                    <span aria-hidden="true">·</span>
                    <span>From {formatCurrency(leadDestination.suggestedBudgetUSD, 'USD')}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E201D]">
                    {leadDestination.name}
                  </h3>
                  <p className="text-sm sm:text-base text-[#575B54] leading-relaxed">
                    {leadDestination.shortDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#EFECE4]">
                  <button
                    type="button"
                    onClick={() => onExploreDestination(leadDestination.slug)}
                    className="px-4 py-2.5 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer min-h-[40px] whitespace-nowrap"
                  >
                    Explore Destination
                  </button>
                  <button
                    type="button"
                    onClick={() => onPlanForDestination(leadDestination)}
                    className="text-sm font-medium text-[#1B4332] hover:text-[#C86D3B] transition-colors cursor-pointer py-2 whitespace-nowrap"
                  >
                    Customize this trip
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Companion Vertical Editorial Stack */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {companionDestinations.map((dest) => (
              <article
                key={dest.id}
                className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-12 flex-1"
              >
                <div className="sm:col-span-5 min-h-[170px] sm:min-h-full">
                  <TravelImage
                    src={dest.image}
                    alt={dest.imageAlt}
                    fallbackTitle={dest.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="sm:col-span-7 p-5 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-[#787C74]">
                      {dest.country} · {dest.bestTravelStyle}
                    </p>
                    <h3 className="font-serif text-xl font-semibold text-[#1E201D]">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-[#575B54] leading-relaxed line-clamp-2">
                      {dest.shortDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => onExploreDestination(dest.slug)}
                      className="text-sm font-medium text-[#1B4332] hover:text-[#C86D3B] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Explore destination →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why TripMind AI — Editorial Numbered Layout */}
      <section className="bg-[#EFECE4]/70 border-y border-[#E3DDD2] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-sm font-medium text-[#C86D3B]">Why TripMind AI</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E201D] leading-tight">
              Designed like a well-edited travel notebook, not a noisy spreadsheet.
            </h2>
            <p className="text-base text-[#575B54] leading-relaxed">
              Good travel planning respects your time before the flight even boards. TripMind AI brings structure to your trip preferences while leaving space for genuine discovery.
            </p>
          </div>

          <div className="lg:col-span-7 divide-y divide-[#DCD5C7]">
            {WHY_ITEMS.map((item) => (
              <div key={item.index} className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6">
                <div className="sm:col-span-2 font-serif text-xl font-semibold text-[#C86D3B] tabular-nums">
                  {item.index}
                </div>
                <div className="sm:col-span-10 space-y-1.5">
                  <h3 className="font-serif text-xl font-semibold text-[#1E201D]">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#575B54] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl space-y-2.5 mb-12">
          <p className="text-sm font-medium text-[#C86D3B]">How It Works</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E201D]">
            From first idea to ready-to-use itinerary in three clear steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <div
              key={item.step}
              className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl p-7 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#1B4332] tracking-wide">{item.step}</p>
                <h3 className="font-serif text-xl font-semibold text-[#1E201D]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#575B54] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Travel Inspiration Cards */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-4 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pt-14 border-t border-[#E3DDD2]">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-sm font-medium text-[#C86D3B]">Travel Inspiration</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E201D]">
              Journey ideas curated for different travel moods
            </h2>
          </div>
          <p className="text-sm text-[#787C74] max-w-sm">
            Curated destination ideas you can turn into a personalized Gemini AI itinerary in one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {TRAVEL_INSPIRATIONS.map((story) => (
            <article
              key={story.id}
              className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <TravelImage
                  src={story.image}
                  alt={story.imageAlt}
                  fallbackTitle={story.regionLabel}
                  className="w-full h-full hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#787C74]">
                    {story.regionLabel} · {story.durationLabel}
                  </p>
                  <h3 className="font-serif text-xl font-semibold text-[#1E201D]">
                    {story.title}
                  </h3>
                  <p className="text-sm text-[#575B54] leading-relaxed">{story.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onExploreDestination(story.destinationSlug)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:text-[#C86D3B] transition-colors cursor-pointer self-start"
                >
                  Explore & plan with AI
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Closing Quiet Conversion Band */}
        <div className="mt-20 bg-[#1B4332] text-[#FDFBF7] rounded-2xl px-7 py-12 sm:px-12 sm:py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-xl space-y-2.5">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FDFBF7]">
              Ready to map out your upcoming trip?
            </h2>
            <p className="text-sm sm:text-base text-[#E5ECE8] leading-relaxed">
              Enter your destination, dates, budget, and interests to preview a tailored day-by-day itinerary and save it to your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'plan' })}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-medium text-[#1E201D] bg-[#F7F4EE] hover:bg-white rounded-md transition-colors cursor-pointer min-h-[46px] whitespace-nowrap shrink-0"
          >
            Plan My Trip
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}
