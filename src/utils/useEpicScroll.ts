import {useEffect, useState} from 'react';
import EpicScrollManager from './scroll-manager';

export const useEpicScroll = () => {
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
    next: () => scrollInstance?.next(),
    prev: () => scrollInstance?.prev(),
    orientate: (orientation: 'vertical' | 'horizontal') =>
      scrollInstance?.orientate(orientation),
    scrollToIndex: (index: number) => scrollInstance?.scrollToIndex(index),
  } as const;
};
