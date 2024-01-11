import {useEffect, useState} from 'react';
import EpicScrollManager from './panorama-manager';

export const usePanorama = () => {
  const [scrollInstance, setScrollInstance] = useState(
    EpicScrollManager.getInstance(),
  );

  useEffect(() => {
    if (!scrollInstance) {
      const instance = EpicScrollManager.getInstance();
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
