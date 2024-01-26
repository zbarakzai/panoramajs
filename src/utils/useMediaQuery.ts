import React from 'react';

type ScreenSize = 'small' | 'medium' | 'large' | 'xLarge';

const defaultScreenSizes = {
  small: '(max-width: 768px)',
  medium: '(min-width: 769px) and (max-width: 992px)',
  large: '(min-width: 993px) and (max-width: 1200px)',
  xLarge: '(min-width: 1201px)',
};

export function useMediaQuery(screenSize?: ScreenSize) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!screenSize) {
    return;
  }

  const query = defaultScreenSizes[screenSize];

  const subscribe = React.useCallback(
    (callback: (e: MediaQueryListEvent) => void) => {
      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener('change', callback);
      return () => {
        matchMedia.removeEventListener('change', callback);
      };
    },
    [query, screenSize],
  );

  const getSnapshot = () => {
    return query ? window.matchMedia(query).matches : false;
  };

  const getServerSnapshot = () => true;

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
