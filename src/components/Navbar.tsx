import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageRoute, routeToHash } from '../hooks/useHashRouter';

interface NavbarProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
  savedTripsCount: number;
}

const NAV_ITEMS: { label: string; route: PageRoute; key: PageRoute['page'] }[] = [
  { label: 'Home', route: { page: 'home' }, key: 'home' },
  { label: 'Explore', route: { page: 'explore' }, key: 'explore' },
  { label: 'My Trips', route: { page: 'my-trips' }, key: 'my-trips' },
  { label: 'About', route: { page: 'about' }, key: 'about' },
];

export function Navbar({ currentRoute, onNavigate, savedTripsCount }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentRoute]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, route: PageRoute) => {
    e.preventDefault();
    onNavigate(route);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F4EE]/95 backdrop-blur-sm border-b border-[#E3DDD2]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href={routeToHash({ page: 'home' })}
          onClick={(e) => handleLinkClick(e, { page: 'home' })}
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1B4332] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm"
        >
          TripMind AI
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute.page === item.key;
            const label =
              item.key === 'my-trips' && savedTripsCount > 0
                ? `${item.label} (${savedTripsCount})`
                : item.label;

            return (
              <a
                key={item.key}
                href={routeToHash(item.route)}
                onClick={(e) => handleLinkClick(e, item.route)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#1B4332]'
                    : 'text-[#575B54] hover:text-[#1E201D]'
                }`}
              >
                {label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#C86D3B] transition-opacity duration-150 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate({ page: 'plan' })}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            Plan My Trip
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-[#1E201D] hover:bg-[#EFECE4] transition-colors duration-150 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="md:hidden bg-[#FDFBF7] border-b border-[#E3DDD2] px-5 pt-3 pb-5 space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute.page === item.key;
            const label =
              item.key === 'my-trips' && savedTripsCount > 0
                ? `${item.label} (${savedTripsCount})`
                : item.label;

            return (
              <a
                key={item.key}
                href={routeToHash(item.route)}
                onClick={(e) => handleLinkClick(e, item.route)}
                aria-current={isActive ? 'page' : undefined}
                className={`block px-3 py-3 text-base font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#EFECE4] text-[#1B4332]'
                    : 'text-[#1E201D] hover:bg-[#F7F4EE]'
                }`}
              >
                {label}
              </a>
            );
          })}
          <div className="pt-3 border-t border-[#E3DDD2]">
            <button
              type="button"
              onClick={() => {
                onNavigate({ page: 'plan' });
                setMobileOpen(false);
              }}
              className="w-full py-3 px-4 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer min-h-[44px]"
            >
              Plan My Trip
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
