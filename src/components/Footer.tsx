import { PageRoute, routeToHash } from '../hooks/useHashRouter';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleLink = (e: React.MouseEvent, route: PageRoute) => {
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <footer className="bg-[#EFECE4] border-t border-[#E3DDD2] mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#DCD5C7]">
          <div className="md:col-span-5 space-y-4">
            <a
              href={routeToHash({ page: 'home' })}
              onClick={(e) => handleLink(e, { page: 'home' })}
              className="font-serif text-2xl font-semibold tracking-tight text-[#1B4332] inline-block"
            >
              TripMind AI
            </a>
            <p className="text-sm text-[#575B54] leading-relaxed max-w-md">
              Thoughtful, personalized travel planning structured around your budget, pace, and curiosity. Built as a lightweight college web project ready for Gemini API integration.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="font-sans text-sm font-semibold text-[#1E201D]">Navigation</h2>
            <ul className="space-y-2.5 text-sm text-[#575B54]">
              <li>
                <a
                  href={routeToHash({ page: 'home' })}
                  onClick={(e) => handleLink(e, { page: 'home' })}
                  className="hover:text-[#1B4332] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href={routeToHash({ page: 'plan' })}
                  onClick={(e) => handleLink(e, { page: 'plan' })}
                  className="hover:text-[#1B4332] transition-colors"
                >
                  Plan a Trip
                </a>
              </li>
              <li>
                <a
                  href={routeToHash({ page: 'explore' })}
                  onClick={(e) => handleLink(e, { page: 'explore' })}
                  className="hover:text-[#1B4332] transition-colors"
                >
                  Explore Destinations
                </a>
              </li>
              <li>
                <a
                  href={routeToHash({ page: 'my-trips' })}
                  onClick={(e) => handleLink(e, { page: 'my-trips' })}
                  className="hover:text-[#1B4332] transition-colors"
                >
                  My Trips
                </a>
              </li>
              <li>
                <a
                  href={routeToHash({ page: 'about' })}
                  onClick={(e) => handleLink(e, { page: 'about' })}
                  className="hover:text-[#1B4332] transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h2 className="font-sans text-sm font-semibold text-[#1E201D]">How It Works</h2>
            <p className="text-sm text-[#575B54] leading-relaxed">
              TripMind AI connects your travel preferences to a serverless Gemini API route to generate personalized day-by-day plans, while saving your favorite itineraries privately in your browser via localStorage.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#787C74]">
          <p>© {new Date().getFullYear()} TripMind AI. All rights reserved.</p>
          <p>Local browser persistence · No account or database required</p>
        </div>
      </div>
    </footer>
  );
}
