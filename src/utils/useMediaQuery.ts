import React from 'react';

type ScreenSize = 'small' | 'medium' | 'large' | 'xLarge';

const defaultScreenSizes = {
  small: '(max-width: 768px)',
  medium: '(min-width: 769px) and (max-width: 992px)',
  large: '(min-width: 993px) and (max-width: 1200px)',
  xLarge: '(min-width: 1201px)',
};

export function useIsClient() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export function useMediaQuery(screenSize?: ScreenSize) {
  const isClient = useIsClient();

  if (!screenSize) {
    return;
  }

  const query = defaultScreenSizes[screenSize];
  const subscribe = React.useCallback(
    (callback: (e: MediaQueryListEvent) => void) => {
      if (!isClient) return () => {};

      const matchMedia = window.matchMedia(query);
      matchMedia.addEventListener('change', callback);
      return () => {
        matchMedia.removeEventListener('change', callback);
      };
    },
    [query, isClient],
  );

  const getSnapshot = () => {
    return isClient && query ? window.matchMedia(query).matches : false;
  };

  const getServerSnapshot = () => false;

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
