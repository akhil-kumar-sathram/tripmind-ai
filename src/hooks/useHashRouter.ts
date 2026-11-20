import { useCallback, useEffect, useState } from 'react';

export type PageRoute =
  | { page: 'home' }
  | { page: 'explore' }
  | { page: 'plan' }
  | { page: 'my-trips' }
  | { page: 'about' }
  | { page: 'itinerary'; id: string };

function parseHashToRoute(hash: string): PageRoute {
  const cleaned = hash.replace(/^#/, '') || '/';
  const [path] = cleaned.split('?');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return { page: 'home' };
  if (segments[0] === 'explore') return { page: 'explore' };
  if (segments[0] === 'plan') return { page: 'plan' };
  if (segments[0] === 'my-trips') return { page: 'my-trips' };
  if (segments[0] === 'about') return { page: 'about' };
  if (segments[0] === 'itinerary' && segments[1]) {
    return { page: 'itinerary', id: decodeURIComponent(segments[1]) };
  }

  return { page: 'home' };
}

export function routeToHash(route: PageRoute): string {
  switch (route.page) {
    case 'home':
      return '#/';
    case 'explore':
      return '#/explore';
    case 'plan':
      return '#/plan';
    case 'my-trips':
      return '#/my-trips';
    case 'about':
      return '#/about';
    case 'itinerary':
      return `#/itinerary/${encodeURIComponent(route.id)}`;
  }
}

export function useHashRouter() {
  const [route, setRoute] = useState<PageRoute>(() => parseHashToRoute(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashToRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((nextRoute: PageRoute) => {
    const nextHash = routeToHash(nextRoute);
    if (window.location.hash === nextHash) {
      setRoute(nextRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = nextHash;
    }
  }, []);

  return { route, navigate };
}
