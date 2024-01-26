import React, {
  useEffect,
  useRef,
  Children,
  cloneElement,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {useMediaQuery} from '../utils/useMediaQuery';
import type {PanoramaProps, RefFunctionType} from '../dtos/panorama.types';
import {
  debounce,
  getEvent,
  getYPosition,
  preventDefault,
  useBodyStyle,
  useScrollBarWidth,
} from '../utils/utils';
import {useStateRef} from '../utils/useStateRef';

type CssStyleObject = Partial<CSSStyleDeclaration> &
  Record<string, string | null>;

const KEY_PAGE_UP = 33;
const KEY_LEFT_ARROW = 37;
const KEY_PAGE_DOWN = 34;
const KEY_RIGHT_ARROW = 39;

export const Panorama = forwardRef<RefFunctionType, PanoramaProps>(
  (props, ref) => {
    const match = useMediaQuery(props.responsiveAt);
    const [state, dispatch] = useStateRef();
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scrollWidth = useScrollBarWidth();

    const processedChildren = Children.map(props.children, (child, index) => {
      if (React.isValidElement(child)) {
        const existingClassName = child.props.className || '';
        const additionalClassName = `pa-page ${index === 0 ? 'pa-active' : ''}`;

        return cloneElement(child as React.ReactElement, {
          className: `${existingClassName} ${additionalClassName}`.trim(),
        });
      }
      return child;
    });

    useEffect(() => {
      if (!state.responsive) {
        initializeConfig();
      }
    }, [scrollWidth, state.responsive, match]);

    useEffect(() => {
      if (!state.responsive) {
        initialize();
      }

      return () => {
        destroy();
      };
    }, [containerRef, state.responsive, match, state.horizontal]);

    useEffect(() => {
      if (props.infinite && !match && !state.responsive) {
        toggleInfinite(false, true);
      }
    }, [props.infinite, state.responsive, match]);

    useEffect(() => {
      if (state.responsive) {
        destroy();
      }
    }, [state.responsive]);

    useEffect(() => {
      if (match && !state.responsive) {
        dispatch({type: 'TOGGLE_RESPONSIVE', payload: true});
      } else {
        dispatch({type: 'TOGGLE_RESPONSIVE', payload: false});
      }
    }, [match]);

    useBodyStyle({
      margin: '0',
      padding: '0',
      overflow: 'hidden',
    });

    useImperativeHandle(ref, () => ({
      next,
      prev,
      scrollToIndex,
      setResponsive,
      orientate,
    }));

    const initializeConfig = () => {
      dispatch({type: 'SET_CONFIG', payload: {...state.config, ...props}});
      dispatch({
        type: 'TOGGLE_HORIZONTAL',
        payload: state.config.orientation === 'horizontal',
      });
      dispatch({type: 'SET_AXIS', payload: state.horizontal ? 'x' : 'y'});
      dispatch({type: 'SET_BAR', payload: scrollWidth});
      dispatch({
        type: 'TOGGLE_TOUCH',
        payload: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      });
    };

    const initialize = () => {
      if (containerRef.current) {
        containerRef.current.style.display = 'flex';
        containerRef.current.style.flexDirection = state.horizontal
          ? 'row'
          : 'column';
        const pages = Array.from(containerRef.current.children);

        dispatch({
          type: 'SET_PAGE_COUNT',
          payload: pages.length,
        });

        dispatch({
          type: 'SET_LAST_INDEX',
          payload: pages.length - 1,
        });

        bind();
        update();
        const data = getData();

        if (state.config.onInit) {
          state.config.onInit(data);
        }

        dispatch({type: 'TOGGLE_INITIALISED', payload: true});

        emit('init', data);
      }
    };

    const toggleInfinite = (destroy: boolean, force?: boolean) => {
      const container = containerRef.current;
      if (!container) return;

      const pages = Array.from(container.children);
      const lastIndex = pages.length - 1;

      if (destroy && props.infinite) {
        state.clones.forEach((clone) => {
          if (container.contains(clone)) {
            container.removeChild(clone);
          }
        });
        dispatch({type: 'SET_CLONES', payload: []});
        dispatch({
          type: 'SET_CONFIG',
          payload: {...state.config, ...props, infinite: false},
        });
        dispatch({type: 'SET_INFINIT', payload: false});
      } else if (!props.infinite || force) {
        if (!state.setInfinit) {
          const firstClone = pages[0].cloneNode(true) as HTMLElement;
          const lastClone = pages[lastIndex].cloneNode(true) as HTMLElement;

          firstClone.id = `${firstClone.id}-clone`;
          lastClone.id = `${lastClone.id}-clone`;
          firstClone.classList.add('pa-clone');
          lastClone.classList.add('pa-clone');
          firstClone.classList.remove('pa-active');
          lastClone.classList.remove('pa-active');

          dispatch({type: 'SET_CLONES', payload: [firstClone, lastClone]});
          dispatch({
            type: 'SET_CONFIG',
            payload: {...state.config, ...props, infinite: true},
          });

          container.insertBefore(lastClone, pages[0]);
          container.appendChild(firstClone);
          dispatch({type: 'SET_INFINIT', payload: true});
        }
      }

      update();
    };

    const update = () => {
      if (state.responsive) return;
      if (match) return;

      if (state.timer !== null) {
        clearTimeout(state.timer);
      }

      const data = {
        window: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        container: {
          height: wrapperRef.current?.scrollHeight as number,
          width: wrapperRef.current?.scrollWidth as number,
        },
      };

      dispatch({type: 'SET_DATA', payload: data});

      if (!wrapperRef.current) return;
      if (!containerRef.current) return;

      const size = state.size[state.axis];
      const opp = state.horizontal ? state.size.y : state.size.x;

      const wrapperStyle = wrapperRef.current.style as CssStyleObject;
      const overflowProperty = `overflow-${state.axis}`;

      if (overflowProperty in wrapperStyle) {
        wrapperStyle[overflowProperty] = 'scroll';
      }

      wrapperStyle[size] = `${data.window[size]}px`;
      wrapperStyle[opp] = `${data.window[opp] + state.bar}px`;

      const len = containerRef.current?.childNodes.length;

      const offset = props.infinite ? data.window[size] : 0;

      containerRef.current.style[size] = `${len * data.window[size]}px`;
      const padding = state.horizontal ? 'padding-bottom' : 'padding-right';

      wrapperStyle[padding] = `${state.bar}px`;
      const axisProperty = state.scrollAxis[state.axis];

      (wrapperRef.current as any)[axisProperty] =
        state.index * data.window[size] + offset;

      const scrollSize = len * data.window[size] - data.window[size];
      const scrollPosition = data.window[size] * state.index + offset;

      dispatch({type: 'SET_SCROLL_SIZE', payload: scrollSize});
      dispatch({type: 'SET_SCROLL_POSITION', payload: scrollPosition});

      containerRef.current.childNodes.forEach((child) => {
        if (child instanceof HTMLElement) {
          if (state.horizontal) {
            child.style.float = 'left';
          }

          child.style[size] = `${data.window[size]}px`;
          child.style[opp] = `${data.window[opp]}px`;
        }
      });

      if (props.infinite) {
        state.clones.forEach((clone) => {
          if (state.horizontal) {
            clone.style.float = 'left';
          }

          clone.style[size] = `${data.window[size]}px`;
          clone.style[opp] = `${data.window[opp]}px`;
        });
      }

      if (state.config.onUpdate) {
        state.config.onUpdate(getData());
      }

      emit('update', getData());
    };

    const setResponsive = (activate: boolean) => {
      if (activate) {
        dispatch({type: 'TOGGLE_RESPONSIVE', payload: true});
      }

      if (!activate) {
        dispatch({type: 'TOGGLE_RESPONSIVE', payload: false});
      }
    };

    const orientate = (orientation: 'vertical' | 'horizontal') => {
      switch (orientation) {
        case 'vertical':
          dispatch({type: 'TOGGLE_HORIZONTAL', payload: false});
          dispatch({type: 'SET_AXIS', payload: 'y'});
          if (containerRef.current) {
            containerRef.current.style.width = '';
          }
          break;

        case 'horizontal':
          dispatch({type: 'TOGGLE_HORIZONTAL', payload: true});
          dispatch({type: 'SET_AXIS', payload: 'x'});
          if (containerRef.current) {
            containerRef.current.style.height = '';
          }
          break;

        default:
          return false;
      }

      if (state.horizontal) {
        wrapperRef.current?.classList.add('pa-horizontal');
        wrapperRef.current?.classList.remove('pa-vertical');
      } else {
        wrapperRef.current?.classList.add('pa-vertical');
        wrapperRef.current?.classList.remove('pa-horizontal');
      }

      dispatch({
        type: 'SET_CONFIG',
        payload: {...state.config, ...props, orientation: orientation},
      });

      update();
    };

    const handleWheelEvent = (e: WheelEvent) => {
      setMovementDirection(e);
      handleEventWheel(e);
    };

    const handleTouchStartEvent = (e: MouseEvent | TouchEvent) => {
      setMovementDirection(e);
      handleTouchStart(e);
    };

    const handleKeyDownEvent = (e: KeyboardEvent) => {
      setMovementDirection(e);
      keydownEventHandler(e);
    };

    const handleTouchStopEvent = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;

      if (target?.tagName === 'BUTTON' || target?.tagName === 'A') {
        return; // Do not track this touch
      }

      setMovementDirection(e);
      handleTouchStop(e);
    };

    const handleDragEvent = (e: MouseEvent | TouchEvent) => {
      setMovementDirection(e);
      handleDrag(e);
    };

    const bind = () => {
      document.addEventListener('keydown', handleKeyDownEvent, false);

      window.addEventListener(
        'resize',
        debounce(() => update(), 150),
        false,
      );

      wrapperRef.current?.addEventListener('wheel', handleWheelEvent);

      wrapperRef.current?.addEventListener(
        state.touch ? 'touchstart' : 'mousedown',
        handleTouchStartEvent,
        {passive: false},
      );

      window.addEventListener(
        state.touch ? 'touchend' : 'mouseup',
        handleTouchStopEvent,
        {passive: false},
      );

      window.addEventListener(
        state.touch ? 'touchmove' : 'mousemove',
        handleDragEvent,
      );
    };

    const unbind = () => {
      document.removeEventListener('keydown', keydownEventHandler, false);

      window.removeEventListener(
        'resize',
        debounce(() => update(), 150),
        false,
      );

      wrapperRef.current?.removeEventListener('wheel', handleWheelEvent);

      wrapperRef.current?.removeEventListener(
        state.touch ? 'touchstart' : 'mousedown',
        handleTouchStartEvent,
        false,
      );

      window.removeEventListener(
        state.touch ? 'touchend' : 'mouseup',
        handleTouchStopEvent,
        false,
      );

      window.removeEventListener(
        state.touch ? 'touchmove' : 'mousemove',
        handleDragEvent,
      );
    };

    const destroy = () => {
      emit('destroy');

      unbind();

      if (wrapperRef.current) {
        wrapperRef.current.style.width = '';
        wrapperRef.current.style.height = '';
        wrapperRef.current.style.overflow = '';
      }

      if (containerRef.current) {
        containerRef.current.style.display = '';
        containerRef.current.style.height = '';
        containerRef.current.style.width = '';
        containerRef.current.classList.remove('pa-container');

        const pages = Array.from(containerRef.current.children);

        (pages as HTMLElement[]).forEach((page) => {
          page.style.cssText = '';
          page.style.height = '';
          page.style.width = '';
          page.style.float = '';
          page.classList.remove('pa-page');
          page.classList.remove('pa-active');
        });
      }

      if (props.infinite) {
        toggleInfinite(true);
      }

      dispatch({type: 'TOGGLE_INITIALISED', payload: false});
    };

    const keydownEventHandler = (e: KeyboardEvent) => {
      if (state.config.events?.keydown && (state.scrolling || state.dragging)) {
        e.preventDefault();
        return false;
      }

      let code = e.key || e.code || e.keyCode;

      if (e.key !== undefined) {
        code = e.key;
      } else if (e.code !== undefined) {
        code = e.code;
      }

      const directionOrLeftUp = `Arrow${state.axis === 'x' ? 'Left' : 'Up'}`;
      const directionRightDown = `Arrow${
        state.axis === 'x' ? 'Right' : 'Down'
      }`;

      switch (code) {
        case KEY_PAGE_UP:
        case KEY_LEFT_ARROW:
        case directionOrLeftUp:
        case 'PageUp':
          e.preventDefault();
          prev();
          break;

        case KEY_PAGE_DOWN:
        case KEY_RIGHT_ARROW:
        case directionRightDown:
        case 'PageDown':
          e.preventDefault();
          next();
          break;
      }
    };

    const next = () => {
      if (props.infinite) {
        let index = state.index;

        if (index === state.lastIndex) {
          index++;
          return scrollBy(-state.data.window[state.size[state.axis]], index);
        }
      }

      scrollToIndex(state.index + 1);
    };

    const prev = () => {
      if (props.infinite) {
        let index = state.index;

        if (index === 0) {
          index--;
          return scrollBy(state.data.window[state.size[state.axis]], index);
        }
      }

      scrollToIndex(state.index - 1);
    };

    const handleEventWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (state.config.events?.wheel && !state.scrolling) {
        let index = state.index;
        const oldIndex = state.index;

        const inc = e.deltaY > 0;

        if (props.infinite) {
          overScroll(inc);
        }

        if (inc) {
          if (state.index < state.pageCount - 1) {
            index++;
          }
        } else {
          if (state.index > 0) {
            index--;
          }
        }

        if (index !== oldIndex) {
          scrollToIndex(index);
        }
      }
    };

    const scrollToIndex = (index: number) => {
      const isValidIndex = index >= 0 && index <= state.pageCount - 1;

      if (!state.scrolling && isValidIndex) {
        const oldIndex = state.index;

        dispatch({type: 'SET_INDEX', payload: index});
        dispatch({type: 'SET_OLD_INDEX', payload: oldIndex});

        scrollBy(getScrollAmount(oldIndex, index));
      }
    };

    const overScroll = (isScrollingDown: boolean, scrolled: number = 0) => {
      let index = state.index;

      if (index === state.lastIndex && isScrollingDown) {
        index++;
        scrollBy(-state.data.window[state.size[state.axis]] - scrolled, index);
      } else if (index === 0 && !isScrollingDown) {
        index--;
        scrollBy(state.data.window[state.size[state.axis]] - scrolled, index);
      }
    };

    const scrollBy = (amount: number, index?: number) => {
      if (state.scrolling) return;

      startScrolling();

      setTimeout(() => executeScrollCallbacks('before'), 100);

      const timer = setupScrollTimer(amount, index);
      dispatch({type: 'SET_TIMER', payload: timer});
    };

    const startScrolling = () => {
      dispatch({type: 'TOGGLE_SCROLLING', payload: true});

      if (state.config.onBeforeStart) {
        state.config.onBeforeStart(state.oldIndex);
      }

      emit('scroll.before', getData());
    };

    const executeScrollCallbacks = (
      stage: 'before' | 'during' | 'after',
      data = getData(),
    ) => {
      switch (stage) {
        case 'before':
          state.config.onStart?.(data);
          emit('scroll.start', data);
          break;
        case 'during':
          state.config.onScroll?.(data);
          emit('scroll', data);
          break;
        case 'after':
          state.config.onFinish?.(data);
          emit('scroll.end', data);
          break;
      }
    };

    const setupScrollTimer = (amount: number, index?: number) => {
      return setTimeout(
        () => {
          const startTime = Date.now();
          const scrollFunction = createScrollFunction(startTime, amount, index);

          dispatch({
            type: 'SET_FRAME',
            payload: requestAnimationFrame(scrollFunction),
          });
        },

        state.dragging ? 0 : state.config.delay,
      );
    };

    const createScrollFunction = (
      startTime: number,
      amount: number,
      index?: number,
    ) => {
      return () => {
        const now = Date.now();
        const elapsedTime = now - startTime;

        if (state.config.animation && elapsedTime > state.config.animation) {
          finishScrolling(index);
          return false;
        }

        continueScrolling(elapsedTime, amount, startTime, index);
      };
    };

    const finishScrolling = (index?: number) => {
      let newIndex = state.index;

      cancelAnimationFrame(state.frame as number);
      if (containerRef.current) {
        containerRef.current.style.transform = '';
      }

      dispatch({type: 'SET_FRAME', payload: false});
      dispatch({type: 'TOGGLE_SCROLLING', payload: false});
      dispatch({type: 'SET_DRAGGING', payload: false});

      if (props.infinite) {
        if (index === state.pageCount) {
          newIndex = 0;
          dispatch({type: 'SET_INDEX', payload: newIndex});
        } else if (index === -1) {
          newIndex = state.lastIndex;
          dispatch({type: 'SET_INDEX', payload: newIndex});
        }
      }

      newIndex = props.infinite ? newIndex + 1 : newIndex;

      (
        containerRef.current?.childNodes[newIndex] as HTMLElement
      ).scrollIntoView();

      containerRef.current?.childNodes.forEach((child, i) => {
        const page = child as HTMLElement;
        if (i === newIndex) {
          page.classList.add('pa-active');
        } else {
          page.classList.remove('pa-active');
        }
      });

      dispatch({type: 'SET_SLIDE_INDEX', payload: newIndex});

      setTimeout(() => executeScrollCallbacks('after'), 100);
    };

    const continueScrolling = (
      elapsedTime: number,
      amount: number,
      startTime: number,
      index?: number,
    ) => {
      const start = state.dragging ? state.dragging : 0;

      const scrolled = calculateScrollDistance(
        elapsedTime,
        start as number,
        amount,
      );

      if (containerRef.current) {
        containerRef.current.style.transform = state.horizontal
          ? `translate3d(${scrolled}px, 0, 0)`
          : `translate3d(0, ${scrolled}px, 0)`;
      }

      dispatch({
        type: 'SET_SCROLL_POSITION',
        payload: getScrollOffset()[state.axis] - scrolled,
      });

      const data = getData();

      if (props.infinite) {
        if (index === state.pageCount) {
          data.scrolled = 0;
        } else if (index === -1) {
          data.scrolled = data.max;
        }
      }

      setTimeout(() => executeScrollCallbacks('during'), 10);

      dispatch({
        type: 'SET_FRAME',
        payload: requestAnimationFrame(
          createScrollFunction(startTime, amount, index),
        ),
      });
    };

    const calculateScrollDistance = (
      elapsedTime: number,
      start: number,
      amount: number,
    ): number => {
      return state.config.easing
        ? state.config.easing(
            elapsedTime,
            start,
            amount,
            state.config.animation as number,
          )
        : start +
            ((amount - start) * elapsedTime) /
              (state.config.animation as number);
    };

    const getScrollAmount = (oldIndex: number, newIndex?: number) => {
      if (newIndex === undefined) {
        newIndex = state.index;
      }

      const h = state.data.window[state.size[state.axis]];
      const a = h * oldIndex;
      const b = h * newIndex;

      return a - b;
    };

    const getScrollOffset = () => {
      return {
        x: wrapperRef.current?.scrollLeft as number,
        y: wrapperRef.current?.scrollTop as number,
      };
    };

    const setMovementDirection = (
      event: WheelEvent | TouchEvent | MouseEvent | KeyboardEvent,
    ) => {
      let direction: 'up' | 'down' | null = null;

      if (event instanceof WheelEvent) {
        direction = (event as WheelEvent).deltaY > 0 ? 'down' : 'up';
        dispatch({type: 'SET_MOVEMENT_DELTA_Y', payload: direction});
      } else if (event instanceof TouchEvent || event instanceof MouseEvent) {
        const currentY = getYPosition(event as WheelEvent);

        switch (event.type) {
          case 'touchstart':
          case 'mousedown':
            dispatch({type: 'SET_START_Y', payload: currentY});
            break;

          case 'touchmove':
          case 'mousemove':
            if (state.startY !== null) {
              direction = currentY > state.startY ? 'up' : 'down';
              dispatch({type: 'SET_MOVEMENT_DELTA_Y', payload: direction});
            }
            break;

          case 'touchend':
          case 'mouseup':
            if (state.startY !== null) {
              direction = currentY > state.startY ? 'up' : 'down';
              dispatch({type: 'SET_MOVEMENT_DELTA_Y', payload: direction});
            }
            break;
        }
      } else if (event instanceof KeyboardEvent) {
        let code = event.key || event.code || event.keyCode;

        if (event.key !== undefined) {
          code = event.key;
        } else if (event.code !== undefined) {
          code = event.code;
        }

        switch (code) {
          case KEY_PAGE_UP:
          case 'ArrowDown':
            dispatch({type: 'SET_MOVEMENT_DELTA_Y', payload: 'down'});
            break;
          case KEY_PAGE_DOWN:
          case 'ArrowUp':
            dispatch({type: 'SET_MOVEMENT_DELTA_Y', payload: 'up'});
            break;
        }
      }

      return direction ?? 'none';
    };

    const handleTouchStart = (e: MouseEvent | TouchEvent) => {
      const evt = getEvent(e, state.touch) as MouseEvent;

      if (state.scrolling || state.dragging) {
        return false;
      }

      if (e.type === 'touchstart') {
        if (!state.config.events?.touch) {
          if (!(evt.target as Element)?.closest('a')) {
            preventDefault(e);
          }

          return false;
        }
      }

      if (e.type === 'mousedown') {
        if (!state.config.events?.mouse || (e as MouseEvent).button !== 0) {
          return false;
        }
      }

      if (
        containerRef.current &&
        !containerRef.current.contains(evt.target as Element)
      ) {
        return false;
      }

      preventDefault(e);

      dispatch({type: 'SET_DRAGGING', payload: state.config.freeScroll});

      dispatch({
        type: 'SET_DOWN',
        payload: {
          x: evt.clientX,
          y: evt.clientY,
        },
      });

      dispatch({type: 'SET_START_INDEX', payload: state.index});

      if (state.config.onBeforeStart) {
        state.config.onBeforeStart(state.oldIndex);
      }
    };

    const handleTouchStop = (e: MouseEvent | TouchEvent) => {
      const evt = getEvent(e, state.touch);

      const oldIndex = state.index;
      let newIndex = state.index;

      const inc = () => {
        if (newIndex < state.pageCount - 1) {
          newIndex++;
          dispatch({type: 'SET_INDEX', payload: newIndex});
        }
      };

      const dec = () => {
        if (newIndex > 0) {
          newIndex--;
          dispatch({type: 'SET_INDEX', payload: newIndex});
        }
      };

      dispatch({type: 'SET_OLD_INDEX', payload: oldIndex});

      const diff =
        // @ts-expect-errorLater, we'll find suitable types for this section to avoid complexity due to TypeScript
        Math.abs(evt[state.mouseAxis[state?.axis]] - state.down[state?.axis]) >=
        // @ts-expect-errorLater, we'll find suitable types for this section to avoid complexity due to TypeScript
        state.config.swipeThreshold;

      const canChange = state.down && diff;

      if (state.dragging && !state.scrolling) {
        const scrolled = limitDrag(evt as MouseEvent);
        dispatch({type: 'SET_DRAGGING', payload: scrolled});

        if (canChange) {
          if (props.infinite) {
            overScroll(scrolled < 0, scrolled);
          }

          if (scrolled > 0) {
            dec();
          } else {
            inc();
          }
        }

        scrollBy(getScrollAmount(oldIndex) - scrolled);
        dispatch({type: 'SET_DOWN', payload: {x: 0, y: 0}});

        return;
      }

      if (state.down && !state.scrolling) {
        const evtAny = evt as any;
        const pos =
          evtAny[state.mouseAxis[state.axis]] < state.down[state.axis];
        const neg =
          evtAny[state.mouseAxis[state.axis]] > state.down[state.axis];

        if (canChange) {
          if (props.infinite) {
            overScroll(pos);
          }

          if (pos) {
            inc();
          } else if (neg) {
            dec();
          }
        }

        if (state.startIndex === newIndex) {
          if (state.config.onFinish) {
            state.config.onFinish(getData());
          }
        } else {
          scrollBy(getScrollAmount(oldIndex, newIndex));
        }

        dispatch({type: 'SET_DOWN', payload: {x: 0, y: 0}});
      }
    };

    const limitDrag = (e: MouseEvent) => {
      let scrolled: number;

      if (state.axis === 'x') {
        scrolled = e.clientX - (state.down ? state.down.x : 0);
      } else {
        scrolled = e.clientY - (state.down ? state.down.y : 0);
      }

      if (!props.infinite) {
        if (
          (state.index === 0 && scrolled > 0) ||
          (state.index === state.pageCount - 1 && scrolled < 0)
        ) {
          scrolled /= 10;
        }
      }

      return scrolled;
    };

    const handleDrag = (e: MouseEvent | TouchEvent) => {
      if (state.config.freeScroll && state.dragging && !state.scrolling) {
        const evt = getEvent(e, state.touch) as MouseEvent;

        const scrolled = limitDrag(evt);

        const data = getData();

        if (containerRef.current) {
          containerRef.current.style.transform = state.horizontal
            ? 'translate3d(' + scrolled + 'px, 0, 0)'
            : 'translate3d(0, ' + scrolled + 'px, 0)';
        }

        data.scrolled -= scrolled;

        if (state.config.onScroll) {
          state.config.onScroll(data);
        }

        emit('scroll', data);
      }
    };

    const getData = () => {
      const scrolled = props.infinite
        ? state.scrollPosition - state.data.window[state.size[state.axis]]
        : state.scrollPosition;

      const max = props.infinite
        ? state.scrollSize - state.data.window[state.size[state.axis]] * 2
        : state.scrollSize;

      return {
        index: state.index,
        percent: (scrolled / max) * 100,
        scrolled: scrolled,
        max: max,
        slideYDirection: state.movementDeltaY,
        currentPage: containerRef.current?.childNodes[
          state.oldIndex
        ] as HTMLElement,
        upcomingPage: containerRef.current?.childNodes[
          state.index
        ] as HTMLElement,
      };
    };

    const emit = (listener: string, ...args: unknown[]) => {
      if (listener in state.listeners === false) return;

      for (let i = 0; i < state.listeners[listener].length; i++) {
        state.listeners[listener][i]([].slice.call(args, 1));
      }
    };

    return (
      <div
        ref={wrapperRef}
        className={`pa-wrapper pa-${state.config.orientation}`}
      >
        <div
          ref={containerRef}
          className={`pa-container ${props.className}`}
          id="panorama"
        >
          {processedChildren}
        </div>
      </div>
    );
  },
);

Panorama.displayName = 'Panorama';
