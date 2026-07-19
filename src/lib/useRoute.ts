import { useEffect, useState } from 'react';

export type Route =
  | { name: 'creator' }
  | { name: 'player'; gameId: string };

function parsePath(pathname: string): Route {
  const playerMatch = pathname.match(/^\/game\/([^/]+)\/?$/);
  if (playerMatch) {
    return { name: 'player', gameId: playerMatch[1] };
  }
  return { name: 'creator' };
}

/**
 * Minimal client-side router: evaluates window.location.pathname directly,
 * no react-router. Re-parses on browser back/forward (popstate) so the app
 * still responds to navigation triggered outside our own controls.
 */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    parsePath(window.location.pathname)
  );

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return route;
}
