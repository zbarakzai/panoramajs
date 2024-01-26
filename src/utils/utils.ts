import {useState, useEffect} from 'react';

type Procedure = (...args: any[]) => void;

export function useScrollBarWidth() {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    const div = document.createElement('div');
    div.style.cssText =
      'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(div);

    const calculatedWidth = div.offsetWidth - div.clientWidth;
    setScrollbarWidth(calculatedWidth);

    return () => {
      if (div && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    };
  }, []);

  return scrollbarWidth;
}

export const useBodyStyle = (styles: Partial<CSSStyleDeclaration>) => {
  useEffect(() => {
    const originalBodyStyle = {...document.body.style};
    Object.assign(document.body.style, styles);

    return () => {
      Object.assign(document.body.style, originalBodyStyle);
    };
  }, [styles]);
};

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds: number,
  immediate: boolean = false,
): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
    const context = this;
    const later = () => {
      timeoutId = undefined;
      if (!immediate) func.apply(context, args);
    };

    const shouldCallNow = immediate && timeoutId === undefined;
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = setTimeout(later, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(context, args);
    }
  };
}

export function getYPosition(event: TouchEvent | MouseEvent): number {
  return event instanceof TouchEvent
    ? event.changedTouches[0].clientY
    : event.clientY;
}

export function getEvent(
  e: MouseEvent | TouchEvent | Touch,
  touch: boolean,
): MouseEvent | TouchEvent | Touch {
  if (touch) {
    if ((e as TouchEvent).type === 'touchend') {
      return (e as TouchEvent).changedTouches[0];
    }

    return (e as TouchEvent).touches[0];
  }

  return e;
}

export function preventDefault(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

export function throttle<T extends unknown[], R>(
  fn: (...args: T) => R,
  limit?: number,
  context?: unknown,
): (...args: T) => R | void {
  let wait = false;
  return function (this: unknown, ...args: T): R | void {
    const ctx = context || this;

    if (!wait) {
      const result: R = fn.apply(ctx, args);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);

      return result;
    }
  };
}
