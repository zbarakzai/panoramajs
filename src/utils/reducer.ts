import type {Reducer} from 'react';

import type {
  PanoramaProps,
  PanoramaState,
  SizeType,
} from '../dtos/panorama.types';

export type PanoramaActionsType =
  | {type: 'SET_CONFIG'; payload: PanoramaProps}
  | {type: 'SET_PAGES'; payload: HTMLElement[]}
  | {type: 'TOGGLE_HORIZONTAL'; payload: boolean}
  | {type: 'TOGGLE_RESPONSIVE'; payload: boolean}
  | {type: 'SET_AXIS'; payload: 'x' | 'y'}
  | {type: 'SET_MOUSE_AXIS'; payload: {x: string; y: string}}
  | {type: 'SET_SCROLL_AXIS'; payload: {x: string; y: string}}
  | {type: 'SET_SIZE'; payload: {x: string; y: string}}
  | {type: 'SET_BAR'; payload: number}
  | {type: 'SET_INDEX'; payload: number}
  | {type: 'SET_SLIDE_INDEX'; payload: number}
  | {type: 'SET_OLD_INDEX'; payload: number}
  | {type: 'SET_DOWN'; payload: {x: number; y: number}}
  | {type: 'TOGGLE_INITIALISED'; payload: boolean}
  | {type: 'TOGGLE_TOUCH'; payload: boolean}
  | {type: 'SET_PAGE_COUNT'; payload: number}
  | {type: 'SET_LAST_INDEX'; payload: number}
  | {type: 'SET_CLONES'; payload: HTMLElement[]}
  | {type: 'SET_DRAGGING'; payload: boolean | undefined | number}
  | {type: 'SET_INFINIT'; payload: boolean}
  | {type: 'SET_FRAME'; payload: number | boolean}
  | {
      type: 'SET_DATA';
      payload: {
        window: {width: number; height: number};
        container: {width: number; height: number};
      };
    }
  | {type: 'SET_TIMER'; payload: number | null | NodeJS.Timeout}
  | {type: 'SET_SCROLL_SIZE'; payload: number}
  | {type: 'SET_SCROLL_POSITION'; payload: number}
  | {
      type: 'SET_LISTENERS';
      payload: {[key: string]: ((...args: unknown[]) => void)[]};
    }
  | {
      type: 'SET_CALLBACKS';
      payload: {
        wheel: (e: WheelEvent) => void;
        update: () => void;
        start: (e: MouseEvent | TouchEvent) => void;
        drag: (e: MouseEvent | TouchEvent) => void;
        stop: (e: MouseEvent | TouchEvent) => void;
        prev: () => void;
        next: () => void;
        keydown: (e: KeyboardEvent) => void;
      };
    }
  | {type: 'TOGGLE_SCROLLING'; payload: boolean}
  | {
      type: 'SET_SLIDER';
      payload: {start: () => void; stop: () => void} | null;
    }
  | {type: 'SET_START_INDEX'; payload: number}
  | {type: 'SET_INTERVAL'; payload: number | NodeJS.Timer | null}
  | {type: 'SET_PREV_TIME'; payload: number}
  | {type: 'SET_SCROLL_DIRECTION'; payload: 'up' | 'down'}
  | {type: 'SET_SCROLL_INTENSITIES'; payload: number[]}
  | {type: 'SET_RATE_OF_CHANGE'; payload: number[]}
  | {
      type: 'SET_START_Y';
      payload: number;
    }
  | {type: 'SET_MOVEMENT_DELTA_Y'; payload: 'up' | 'down'};

export const panoramaInitialState: PanoramaState = {
  config: {
    animation: 700,
    delay: 0,
    throttle: 50,
    orientation: 'vertical',
    easing: (t, b, c, d = 0) => {
      if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
      return (c / 2) * ((t -= 2) * t * t + 2) + b;
    },
    onInit: () => {},
    onUpdate: () => {},
    onBeforeStart: () => {},
    onStart: () => {},
    onScroll: () => {},
    onFinish: () => {},
    swipeThreshold: 50,
    freeScroll: false,
    infinite: false,
    events: {wheel: true, mouse: true, touch: true, keydown: true},
  },
  events: {},
  pages: [],
  horizontal: false,
  anchors: [],
  axis: 'y',
  mouseAxis: {x: 'clientX', y: 'clientY'},
  scrollAxis: {x: 'scrollLeft', y: 'scrollTop'},
  size: {x: 'width', y: 'height'},
  bar: 0,
  index: 0,
  slideIndex: 0,
  oldIndex: 0,
  down: {x: 0, y: 0},
  initialised: false,
  touch:
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0),
  pageCount: 0,
  lastIndex: 0,
  setInfinit: false,
  clones: [],
  dragging: false,
  frame: false,
  data: {
    window: {width: 0, height: 0},
    container: {width: 0, height: 0},
  },
  timer: null,
  scrollSize: 0,
  scrollPosition: 0,
  listeners: {},
  callbacks: {
    wheel: () => {},
    update: () => {},
    start: () => {},
    drag: () => {},
    stop: () => {},
    prev: () => {},
    next: () => {},
    keydown: () => {},
  },
  scrolling: false,
  responsive: false,
  slider: null,
  startIndex: 0,
  interval: null,
  prevTime: 0,
  scrollDirection: 'down',
  scrollIntensities: [],
  rateOfChange: [],
  startY: 0,
  movementDeltaY: 'up',
};

export const panoramaReducer: Reducer<PanoramaState, PanoramaActionsType> = (
  state,
  action,
) => {
  switch (action.type) {
    case 'SET_CONFIG':
      return {...state, config: action.payload};
    case 'SET_PAGES':
      return {...state, pages: action.payload};
    case 'TOGGLE_HORIZONTAL':
      return {...state, horizontal: action.payload};
    case 'SET_AXIS':
      return {...state, axis: action.payload};
    case 'SET_MOUSE_AXIS':
      return {...state, mouseAxis: action.payload};
    case 'SET_SCROLL_AXIS':
      return {...state, scrollAxis: action.payload};
    case 'SET_SIZE':
      return {
        ...state,
        size: {
          x: action.payload.x as SizeType,
          y: action.payload.y as SizeType,
        },
      };
    case 'SET_BAR':
      return {...state, bar: action.payload};
    case 'SET_INDEX':
      return {...state, index: action.payload};
    case 'SET_SLIDE_INDEX':
      return {...state, slideIndex: action.payload};
    case 'SET_OLD_INDEX':
      return {...state, oldIndex: action.payload};
    case 'SET_DOWN':
      return {...state, down: action.payload};
    case 'TOGGLE_INITIALISED':
      return {...state, initialised: action.payload};
    case 'TOGGLE_TOUCH':
      return {...state, touch: action.payload};
    case 'SET_PAGE_COUNT':
      return {...state, pageCount: action.payload};
    case 'SET_LAST_INDEX':
      return {...state, lastIndex: action.payload};
    case 'SET_CLONES':
      return {...state, clones: action.payload};
    case 'SET_DRAGGING':
      return {...state, dragging: action.payload};
    case 'SET_FRAME':
      return {...state, frame: action.payload};
    case 'SET_TIMER':
      return {...state, timer: action.payload};
    case 'SET_SCROLL_SIZE':
      return {...state, scrollSize: action.payload};
    case 'SET_SCROLL_POSITION':
      return {...state, scrollPosition: action.payload};
    case 'SET_LISTENERS':
      return {...state, listeners: action.payload};
    case 'SET_CALLBACKS':
      return {...state, callbacks: action.payload};
    case 'TOGGLE_SCROLLING':
      return {...state, scrolling: action.payload};
    case 'SET_SLIDER':
      return {...state, slider: action.payload};
    case 'SET_START_INDEX':
      return {...state, startIndex: action.payload};
    case 'SET_INTERVAL':
      return {...state, interval: action.payload};
    case 'SET_PREV_TIME':
      return {...state, prevTime: action.payload};
    case 'SET_SCROLL_DIRECTION':
      return {...state, scrollDirection: action.payload};
    case 'SET_SCROLL_INTENSITIES':
      return {...state, scrollIntensities: action.payload};
    case 'SET_RATE_OF_CHANGE':
      return {...state, rateOfChange: action.payload};
    case 'SET_START_Y':
      return {...state, startY: action.payload};
    case 'SET_MOVEMENT_DELTA_Y':
      return {...state, movementDeltaY: action.payload};
    case 'SET_DATA':
      return {...state, data: action.payload as any};
    case 'SET_INFINIT':
      return {...state, setInfinit: action.payload};
    case 'TOGGLE_RESPONSIVE':
      return {...state, responsive: action.payload};
    default:
      return state;
  }
};
