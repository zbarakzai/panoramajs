// Define types for each state property
export type ContainerType = HTMLElement | null;

export type OverflowType = 'overflow-x' | 'overflow-y';

export interface PanoramaProps {
  className?: string;
  /** CSS3 selector string for the pages */
  childSelector?: string;
  /** The duration in ms of the scroll animation */
  animation?: number;
  /** The delay in ms before the scroll animation starts */
  delay?: number;
  /** The interval in ms that the resize callback is fired */
  throttle?: number;
  /** Specifies the scrolling direction: either 'vertical' or 'horizontal' */
  orientation?: 'vertical' | 'horizontal';
  /** Swipe/Mouse drag distance (px) before firing the page change event */
  swipeThreshold?: number;
  /** Allow manual scrolling when dragging instead of automatically moving to next page */
  freeScroll?: boolean;
  /** Enable infinite scrolling */
  infinite?: boolean;
  /** Activates the responsive mode of the page. When set, scroll snap is disabled and contents are responsive on the page. */
  responsiveAt?: 'small' | 'medium' | 'large' | 'xLarge';
  /** Define the page anchors */
  anchors?: string[];
  /** Represents the child components or elements to be rendered inside this component. */
  children: React.ReactNode;
  /** Enable slideshow that cycles through your pages automatically */
  slideshow?: SlideshowConfig;
  /**  Configuration object for enabling or disabling various event-driven features. */
  events?: EventsConfig;
  /** Specifies the easing function to be used for transitions and animations. */
  easing?: EasingFunction;
  /** Called when the component is initialized, with initial slide data */
  onInit?: (data: SlideData) => void;
  /** Called when the component updates, with updated slide data */
  onUpdate?: (data: SlideData) => void;
  /** Called before the start of a scroll action, with the index of the old slide */
  onBeforeStart?: (oldIndex: number) => void;
  /** Called at the start of a scroll action, with the identifier (id) of the new slide */
  onStart?: (data: SlideData) => void;
  /** Called during the scroll action, with current slide data and optional scroll type */
  onScroll?: (data: SlideData, type?: string) => void;
  /** Called when the scroll action finishes, with the final slide data */
  onFinish?: (data: SlideData) => void;
}

export type SlideData = {
  /** Index of the current slide */
  index: number;
  /** Percentage of the current scroll position relative to the slide */
  percent: number;
  /** Absolute scrolled distance in pixels */
  scrolled: number;
  /** Maximum scrollable distance in pixels */
  max: number;
  /** Show the movement direction */
  slideYDirection: 'up' | 'down';
  currentPage: HTMLElement;
  upcomingPage: HTMLElement;
};

type EasingFunction = (
  /** Current time in the animation frame, typically the progress of the animation */
  currentTime: number,
  /** Starting position value for the animation */
  startPos: number,
  /** Ending position value for the animation */
  endPos: number,
  /** Total time duration of the animation */
  interval: number,
) => number; // Returns the calculated position value based on the easing function

type SlideshowConfig = {
  /** Time in ms between page change */
  interval: number;
  /** Delay in ms after the interval has ended and before changing page */
  delay: number;
};

type EventsConfig = {
  /** enable / disable mousewheel scrolling */
  wheel: boolean;
  /** enable / disable mouse drag scrolling */
  mouse: boolean;
  /** enable / disable touch / swipe scrolling */
  touch: boolean;
  /** enable / disable keyboard navigation */
  keydown: boolean;
};

export type SizeType = 'width' | 'height';

export type PanoramaState = {
  config: Omit<PanoramaProps, 'children'>;
  events: {[key: string]: boolean};
  pages: HTMLElement[];
  horizontal: boolean;
  anchors: string[];
  axis: 'x' | 'y';
  mouseAxis: {x: string; y: string};
  scrollAxis: {x: string; y: string};
  size: {x: SizeType; y: SizeType};
  bar: number;
  responsive: boolean;
  index: number;
  slideIndex: number;
  oldIndex: number;
  setInfinit: boolean;
  down: {x: number; y: number};
  initialised: boolean;
  touch: boolean;
  pageCount: number;
  lastIndex: number;
  clones: HTMLElement[];
  dragging: boolean | undefined | number;
  frame: number | boolean;
  data: {
    window: {width: number; height: number};
    container: {width: number; height: number};
  };
  timer: number | null | NodeJS.Timeout;
  scrollSize: number;
  scrollPosition: number;
  listeners: {[key: string]: ((...args: unknown[]) => void)[]};
  callbacks: {
    wheel: (e: WheelEvent) => void;
    update: () => void;
    start: (e: MouseEvent | TouchEvent) => void;
    drag: (e: MouseEvent | TouchEvent) => void;
    stop: (e: MouseEvent | TouchEvent) => void;
    prev: () => void;
    next: () => void;
    keydown: (e: KeyboardEvent) => void;
  };
  scrolling: boolean;
  slider: {start: () => void; stop: () => void} | null;
  startIndex: number;
  interval: number | NodeJS.Timer | null;
  prevTime: number;
  scrollDirection: 'up' | 'down';
  scrollIntensities: number[];
  rateOfChange: number[];
  startY: number;
  movementDeltaY: 'up' | 'down';
};

export interface RefFunctionType {
  next: () => void;
  prev: () => void;
  setResponsive: (activate: boolean) => void;
  orientate: (orientation: 'vertical' | 'horizontal') => void;
  scrollToIndex: (index: number) => void;
}
