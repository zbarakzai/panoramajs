import {useEffect, useState} from 'react';
import PanormaManager from './panorama-manager';

export const usePanorama = () => {
  const [scrollInstance, setScrollInstance] = useState(
    PanormaManager.getInstance(),
  );

  useEffect(() => {
    if (!scrollInstance) {
      const instance = PanormaManager.getInstance();
      if (instance) {
        setScrollInstance(instance);
      }
    }
  }, [scrollInstance]);

  return {
    next: () => {
      scrollInstance?.next();
    },
    prev: () => {
      scrollInstance?.prev();
    },
    setResponsive: (activate: boolean) => {
      scrollInstance?.setResponsive(activate);
    },
    orientate: (orientation: 'vertical' | 'horizontal') => {
      scrollInstance?.orientate(orientation);
    },
    scrollToIndex: (index: number) => {
      scrollInstance?.scrollToIndex(index);
    },
  } as const;
};
