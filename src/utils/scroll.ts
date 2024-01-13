/**
 * This file contains code derived from Pageable by Karl Saunders.
 *
 * The original source has been substantially modified, and the
 * code has been completely rewritten in TypeScript and ES6,
 * by Zakiullah Barakzai on 2024.
 *
 * Copyright (c) 2018 Karl Saunders | BSD & MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {SlideShow} from './slide';
import {PanoramaProps} from '../components/panorama';

type CssStyleObject = Partial<CSSStyleDeclaration> &
  Record<string, string | null>;

type EventListenerCallback = (data?: unknown) => void;

interface ContainerType extends HTMLElement {
  pageable?: unknown;
}

type SizeType = 'width' | 'height';

export class Panorama {
  private container?: ContainerType | null;
  public config!: PanoramaProps;
  private events!: {[key: string]: boolean};
  public pages!: HTMLElement[];
  private horizontal!: boolean;
  private anchors!: string[];
  private axis!: 'x' | 'y';
  private mouseAxis!: {x: string; y: string};
  private scrollAxis!: {x: string; y: string};
  private size!: {x: SizeType; y: SizeType};
  private bar!: number;
  public index!: number;
  public slideIndex!: number;
  private oldIndex!: number;
  private down!: {
    x: number;
    y: number;
  };
  private initialised!: boolean;
  private touch!: boolean;
  private wrapper!: HTMLDivElement;
  private pageCount!: number;
  private lastIndex!: number;
  private clones!: HTMLElement[];
  private dragging!: boolean | undefined | number;
  private frame!: number | boolean;
  private data!: {
    window: {width: number; height: number};
    container: {width: number; height: number};
  };
  private timer!: number | null | NodeJS.Timeout;
  private scrollSize!: number;
  private scrollPosition!: number;
  private listeners!: {[key: string]: ((...args: unknown[]) => void)[]};
  private callbacks!: {
    wheel: (e: WheelEvent) => void;
    update: () => void;
    start: (e: MouseEvent | TouchEvent) => void;
    drag: (e: MouseEvent | TouchEvent) => void;
    stop: (e: MouseEvent | TouchEvent) => void;
    prev: () => void;
    next: () => void;
    keydown: (e: KeyboardEvent) => void;
  };
  private scrolling!: boolean;
  private slider!: {start: () => void; stop: () => void} | null;
  private startIndex!: number;
  public interval!: number | NodeJS.Timer | null;
  private prevTime!: number;
  private scrollDirection!: 'up' | 'down';
  private scrollIntensities: number[] = [];
  private rateOfChange: number[] = [];
  private startY!: number;
  private movementDeltaY!: 'up' | 'down';

  constructor(container: string | HTMLElement, options: PanoramaProps) {
    if (container === undefined) {
      console.error('Error:', 'No container defined.');
      return;
    }

    this.container =
      typeof container === 'string'
        ? (document.querySelector(container) as ContainerType)
        : container;

    if (!this.container) {
      console.error('Error:', 'The container could not be found.');
      return;
    }

    const defaults: Omit<PanoramaProps, 'children'> = {
      animation: 700,
      delay: 0,
      throttle: 50,
      orientation: 'vertical',
      easing: (t, b, c, d = 0) => {
        if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
        return (c / 2) * ((t -= 2) * t * t + 2) + b;
      },
      onInit: this.noop,
      onUpdate: this.noop,
      onBeforeStart: this.noop,
      onStart: this.noop,
      onScroll: this.noop,
      onFinish: this.noop,
      swipeThreshold: 50,
      freeScroll: false,
      slideshow: undefined,
      infinite: false,
      childSelector: '[data-anchor]',
      events: {wheel: true, mouse: true, touch: true, keydown: true},
    };

    this.config = {...defaults, ...options};
    this.events = this.config.events || {};

    this.pages = Array.from(
      this.container.querySelectorAll(this.config.childSelector || ''),
    );

    if (!this.pages.length) {
      console.error(
        'Error:',
        'No child nodes matching the selector ' +
          this.config.childSelector +
          ' could be found.',
      );
      return;
    }

    this.horizontal = this.config.orientation === 'horizontal';
    this.anchors = [];

    this.pages.forEach((page, i) => {
      let clean = '';
      const anchor = this.getDataAttr(page, 'anchor');

      if (anchor) {
        clean = anchor.replace(/\s+/, '-').toLowerCase();
      } else {
        if (Array.isArray(this.config.anchors) && this.config.anchors.length) {
          clean = this.config.anchors[i].replace(/\s+/, '-').toLowerCase();
        } else {
          clean = page.className.replace(/\s+/, '-').toLowerCase();
        }
      }

      if (page.id !== clean) {
        page.id = clean;
      }

      // this.anchors.push("#" + clean);
      page.classList.add('pg-page');
      if (i == 0) {
        page.classList.add('pg-active');
      } else {
        page.classList.remove('pg-active');
      }
    });

    this.axis = this.horizontal ? 'x' : 'y';
    this.mouseAxis = {
      x: 'clientX',
      y: 'clientY',
    };
    this.scrollAxis = {
      x: 'scrollLeft',
      y: 'scrollTop',
    };
    this.size = {
      x: 'width',
      y: 'height',
    };
    this.bar = this._getScrollBarWidth();
    this.index = 0;
    this.slideIndex = 0;
    this.oldIndex = 0;
    this.down = {x: 0, y: 0};
    this.initialised = false;
    this.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.init();
  }

  public init() {
    if (!this.initialised && !this.container?.pageable) {
      const o = this.config;
      this.wrapper = document.createElement('div');
      this.container?.parentNode?.insertBefore(this.wrapper, this.container);
      this.wrapper.appendChild(this.container as ContainerType);
      this.wrapper.classList.add('pg-wrapper');
      this.wrapper.classList.add('pg-' + o.orientation);
      this.wrapper.classList.add('pg-wrapper');
      this.container?.classList.add('pg-container');

      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';

      if (this.container) {
        // TODO: later will check why we ned flex here
        // this.container.style.display = "inline-block";

        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
      }

      this.pageCount = this.pages.length;
      this.lastIndex = this.pageCount - 1;

      if (o.infinite) {
        this._toggleInfinite(false, true);
      }

      this.bind();
      this.update();

      const data = this._getData();
      this.config.onInit?.call(this, data);

      this.emit('init', data);
      this.initialised = true;
      if (this.container) {
        this.container.pageable = this;
      }

      if (o.slideshow) {
        this.slider = new SlideShow(this);
        this.slider.start();
      }
    }
  }

  private noop(): void {}

  private getDataAttr(el: HTMLElement, prop: string) {
    return el.dataset ? el.dataset[prop] : el.getAttribute('data-' + prop);
  }

  private _getScrollBarWidth(): number {
    const div = document.createElement('div');
    div.style.cssText =
      'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(div);
    const scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);

    return scrollbarWidth;
  }

  private _toggleInfinite(destroy: boolean, force?: boolean): void {
    if (destroy && this.config.infinite) {
      this.clones.forEach((clone) => {
        this.container?.removeChild(clone);
      });

      this.config.infinite = false;
    } else if (!this.config.infinite || force) {
      this.config.infinite = true;
      const first = this.pages[0].cloneNode(true) as HTMLElement;
      const last = this.pages[this.lastIndex].cloneNode(true) as HTMLElement;
      first.id = `${first.id}-clone`;
      last.id = `${last.id}-clone`;
      first.classList.add('pg-clone');
      last.classList.add('pg-clone');
      first.classList.remove('pg-active');
      last.classList.remove('pg-active');
      this.clones = [first, last];
      this.container?.insertBefore(last, this.pages[0]);
      this.container?.appendChild(first);
    }

    this.update();
  }

  private update(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer as number);
    }

    this.data = {
      window: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      container: {
        height: this.wrapper.scrollHeight,
        width: this.wrapper.scrollWidth,
      },
    };

    const size = this.size[this.axis];
    const opp = this.horizontal ? this.size.y : this.size.x;

    const wrapperStyle = this.wrapper.style as CssStyleObject;
    const overflowProperty = `overflow-${this.axis}`;

    if (overflowProperty in wrapperStyle) {
      wrapperStyle[overflowProperty] = 'scroll';
    }

    wrapperStyle[size] = `${this.data.window[size]}px`;
    wrapperStyle[opp] = `${this.data.window[opp] + this.bar}px`;

    const len = this.config.infinite
      ? this.pages.length + 2
      : this.pages.length;

    const offset = this.config.infinite ? this.data.window[size] : 0;

    if (this.container) {
      this.container.style[size] = `${len * this.data.window[size]}px`;
    }

    const padding = this.horizontal ? 'padding-bottom' : 'padding-right';

    wrapperStyle[padding] = `${this.bar}px`;

    const axisProperty = this.scrollAxis[this.axis];

    if (typeof axisProperty === 'string') {
      (this.wrapper as any)[axisProperty] =
        this.index * this.data.window[size] + offset;
    }

    this.scrollSize = len * this.data.window[size] - this.data.window[size];
    this.scrollPosition = this.data.window[size] * this.index + offset;

    this.pages.forEach((page) => {
      if (this.horizontal) {
        page.style.float = 'left';
      }
      page.style[size] = `${this.data.window[size]}px`;
      page.style[opp] = `${this.data.window[opp]}px`;
    });

    if (this.config.infinite) {
      this.clones.forEach((clone) => {
        if (this.horizontal) {
          clone.style.float = 'left';
        }
        clone.style[size] = `${this.data.window[size]}px`;
        clone.style[opp] = `${this.data.window[opp]}px`;
      });
    }

    this.config.onUpdate?.call(this, this._getData());
    this.emit('update', this._getData()); // Assuming emit is a method in Pageable
  }

  public setResponsive(activate: boolean) {
    if (activate) {
      this.destroy();
    }

    if (!activate) {
      this.init();
    }
  }

  public orientate(type: string) {
    switch (type) {
      case 'vertical':
        this.horizontal = false;
        this.axis = 'y';
        if (this.container) {
          this.container.style.width = '';
        }
        break;

      case 'horizontal':
        this.horizontal = true;
        this.axis = 'x';
        if (this.container) {
          this.container.style.height = '';
        }
        break;

      default:
        return false;
    }

    if (this.horizontal) {
      this.wrapper.classList.add('pg-horizontal');
      this.wrapper.classList.remove('pg-vertical');
    } else {
      this.wrapper.classList.add('pg-vertical');
      this.wrapper.classList.remove('pg-horizontal');
    }

    this.config.orientation = type;
    this.update();
  }

  public slideshow() {
    return this.slider;
  }

  public destroy() {
    if (this.initialised) {
      // emit "destroy" event
      this.emit('destroy'); // remove event listeners

      this.unbind(); // reset body styling

      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';

      if (this.container) {
        this.container.style.display = '';
        this.container.style.height = '';
        this.container.style.width = '';
        this.container.classList.remove('pg-container');
        this.wrapper.parentNode?.replaceChild(this.container, this.wrapper); // reset the pages
      }

      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i];
        page.style.height = '';
        page.style.width = '';
        page.style.float = '';
        page.classList.remove('pg-page');
        page.classList.remove('pg-active');
      } // remove event listeners from the nav buttons

      ['Prev', 'Next'].forEach((dir) => {
        const str = 'nav' + dir + 'El';

        const element = this[str as keyof this];

        if (element instanceof HTMLElement) {
          element.classList.remove('active', 'pg-nav');
        }
      });

      if (this.config.infinite) {
        this._toggleInfinite(true);
      }

      if (this.config.slideshow) {
        this.slider?.stop();
        this.slider = null;
      }

      this.initialised = false;
      delete this.container?.pageable;
    }
  }

  public on(listener: string, callback: EventListenerCallback): void {
    this.listeners = this.listeners || {};
    this.listeners[listener] = this.listeners[listener] || [];
    this.listeners[listener].push(callback);
  }

  public off(listener: string, callback: EventListenerCallback) {
    this.listeners = this.listeners || {};
    if (listener in this.listeners === false) return;
    this.listeners[listener].splice(
      this.listeners[listener].indexOf(callback),
      1,
    );
  }

  private _getData(): {
    index: number;
    percent: number;
    scrolled: number;
    max: number;
    slideDirection: 'up' | 'down';
    currentPage: HTMLElement;
    upcomingPage: HTMLElement;
  } {
    const scrolled = this.config.infinite
      ? this.scrollPosition - this.data.window[this.size[this.axis]]
      : this.scrollPosition;

    const max = this.config.infinite
      ? this.scrollSize - this.data.window[this.size[this.axis]] * 2
      : this.scrollSize;

    return {
      index: this.index,
      percent: (scrolled / max) * 100,
      scrolled: scrolled,
      max: max,
      slideDirection: this.getSlideMovementDirection(),
      currentPage: this.pages[this.oldIndex],
      upcomingPage: this.pages[this.index],
    };
  }

  private emit(listener: string, ...args: unknown[]): void {
    this.listeners = this.listeners || {};
    if (listener in this.listeners === false) return;

    for (let i = 0; i < this.listeners[listener].length; i++) {
      this.listeners[listener][i].apply(this, [].slice.call(args, 1));
    }
  }

  public bind(): void {
    this.callbacks = {
      wheel: this._wheel.bind(this),
      update: this.throttle(this.update.bind(this), this.config.throttle),
      start: this._start.bind(this),
      drag: this._drag.bind(this),
      stop: this._stop.bind(this),
      prev: this.prev.bind(this),
      next: this.next.bind(this),
      keydown: this._keydown.bind(this),
    };

    document.addEventListener('keydown', this.callbacks.keydown, false);
    window.addEventListener(
      'resize',
      debounce(() => this.callbacks.update(), 150),
      false,
    );

    this.wrapper.addEventListener('wheel', (e) => {
      this.setMovementDirection(e);
      this.callbacks.wheel.call(this, e);
    });

    this.wrapper.addEventListener(
      this.touch ? 'touchstart' : 'mousedown',
      (e) => {
        this.setMovementDirection(e);
        this.callbacks.start.call(this, e);
      },
      false,
    );

    window.addEventListener(
      this.touch ? 'touchend' : 'mouseup',
      (e) => {
        this.setMovementDirection(e);
        this.callbacks.stop.call(this, e);
      },
      false,
    );

    window.addEventListener(this.touch ? 'touchmove' : 'mousemove', (e) => {
      this.setMovementDirection(e);
      this.callbacks.drag.call(this, e);
    });
  }

  private handleMouseWheelNavigation(e: WheelEvent) {
    // @ts-expect-error This is necessary because the types for e.wheelDelta, e.deltaY, and e.detail are not properly recognized.
    const deltaYValue = e.wheelDelta || -e.deltaY || -e.detail;
    const delta = Math.max(-1, Math.min(1, deltaYValue));

    const curTime = new Date().getTime();

    this.scrollDirection = delta < 0 ? 'down' : 'up';

    this._preventDefault(e);

    // Update the scroll intensities array
    this.updateScrollIntensities(Math.abs(deltaYValue));

    // Clear old data if enough time has passed
    const timeDiff = curTime - this.prevTime;
    this.prevTime = curTime;

    if (timeDiff > 200) {
      this.scrollIntensities = [];
      this.rateOfChange = [];
    }

    // Check for acceleration and vertical scrolling
    if (
      !this.scrolling &&
      this.isAccelerating() &&
      this.config.orientation === 'vertical'
    ) {
      this.scrollDirection === 'up' ? this.prev() : this.next();
    }
  }

  private updateScrollIntensities(intensity: number) {
    if (this.scrollIntensities.length >= 2) {
      // Calculate rate of change in intensity
      const length = this.scrollIntensities.length;
      const recentChange = intensity - this.scrollIntensities[length - 1];
      this.rateOfChange.push(recentChange);
    }

    this.scrollIntensities.push(intensity);
  }

  private isAccelerating() {
    const threshold = 10;
    const minimumDataPoints = 5;
    const initialThreshold = 10; // A lower threshold for initial scrolls

    // Ensure we have enough data to make a determination
    if (this.rateOfChange.length < minimumDataPoints) {
      // Check if the initial scrolls exceed a basic threshold
      if (this.rateOfChange.length > 0) {
        const initialRateOfChange =
          this.rateOfChange[this.rateOfChange.length - 1];
        return initialRateOfChange > initialThreshold;
      }
      return false;
    }

    const recentChanges = this.rateOfChange.slice(-10); // Check the last 10 changes
    let increasingCount = 0;
    let totalIncrease = 0;

    for (let i = 1; i < recentChanges.length; i++) {
      if (recentChanges[i] > recentChanges[i - 1]) {
        increasingCount++;
        totalIncrease += recentChanges[i] - recentChanges[i - 1];
      }
    }

    // Checking if the increasingCount and totalIncrease meet the required threshold
    return increasingCount >= 5 && totalIncrease > threshold;
  }

  private unbind() {
    this.wrapper.removeEventListener('wheel', this.callbacks.wheel);
    window.removeEventListener('resize', this.callbacks.update);

    this.wrapper.removeEventListener(
      this.touch ? 'touchstart' : 'mousedown',
      this.callbacks.start,
    );

    window.addEventListener(
      this.touch ? 'touchmove' : 'mousemove',
      this.callbacks.drag,
    );

    window.removeEventListener(
      this.touch ? 'touchend' : 'mouseup',
      this.callbacks.stop,
    );
    document.removeEventListener('keydown', this.callbacks.keydown);
  }

  private setMovementDirection(event: WheelEvent | TouchEvent | MouseEvent) {
    switch (event.type) {
      case 'wheel':
        this.movementDeltaY = (event as WheelEvent).deltaY > 0 ? 'down' : 'up';
        break;

      case 'touchstart':
      case 'mousedown':
        this.startY = this.getYPosition(event);
        break;

      case 'touchmove':
      case 'mousemove':
        if (this.startY !== null) {
          const currentY = this.getYPosition(event);
          this.movementDeltaY = currentY > this.startY ? 'up' : 'down';
        }
        break;

      case 'touchend':
      case 'mouseup':
        if (this.startY !== null) {
          const endY = this.getYPosition(event);
          if (endY > this.startY) {
            this.movementDeltaY = 'up';
          } else if (endY < this.startY) {
            this.movementDeltaY = 'down';
          }
        }
        break;
    }
    return 'none';
  }

  private getYPosition(event: TouchEvent | MouseEvent): number {
    return event instanceof TouchEvent
      ? event.changedTouches[0].clientY
      : event.clientY;
  }

  private getSlideMovementDirection() {
    return this.movementDeltaY;
  }

  public scrollToPage(page: number) {
    this.scrollToIndex(page - 1);
  }

  private _wheel(e: WheelEvent) {
    e.preventDefault();

    if (this.events.wheel && !this.scrolling) {
      let index = this.index;
      const oldIndex = this.index;
      const inc = e.deltaY > 0;

      if (this.config.infinite) {
        this._overScroll(inc);
      }

      if (inc) {
        if (this.index < this.pages.length - 1) {
          index++;
        }
      } else {
        if (this.index > 0) {
          index--;
        }
      }

      if (index !== oldIndex) {
        this.oldIndex = oldIndex;

        this.scrollToIndex(index);
      }
    }
  }

  private _drag(e: MouseEvent | TouchEvent) {
    if (this.config.freeScroll && this.dragging && !this.scrolling) {
      const evt = this._getEvent(e) as MouseEvent;

      const scrolled = this._limitDrag(evt);

      const data = this._getData();

      if (this.container) {
        this.container.style.transform = this.horizontal
          ? 'translate3d(' + scrolled + 'px, 0, 0)'
          : 'translate3d(0, ' + scrolled + 'px, 0)';
      }

      data.scrolled -= scrolled; // update position so user-defined callbacks will recieve the new value

      this.config.onScroll?.call(this, data, 'drag'); // emit the "scroll" event

      this.emit('scroll', data);
    }
  }

  private _stop(e: MouseEvent | TouchEvent) {
    const evt = this._getEvent(e); // increment index

    const inc = () => {
      this.index < this.pages.length - 1 && this.index++;
    };

    const dec = () => {
      0 < this.index && this.index--;
    };

    this.oldIndex = this.index;

    const diff =
      // @ts-expect-errorLater, we'll find suitable types for this section to avoid complexity due to TypeScript
      Math.abs(evt[this.mouseAxis[this?.axis]] - this.down[this?.axis]) >=
      // @ts-expect-errorLater, we'll find suitable types for this section to avoid complexity due to TypeScript
      this.config.swipeThreshold;

    const canChange = this.down && diff; // restart slideshow

    if (this.config.slideshow) {
      this.slider?.start();
    } // free scroll

    if (this.dragging && !this.scrolling) {
      const scrolled = this._limitDrag(evt as MouseEvent);

      this.dragging = scrolled;

      if (canChange) {
        if (this.config.infinite) {
          this._overScroll(scrolled < 0, scrolled);
        }

        if (scrolled > 0) {
          dec();
        } else {
          inc();
        }
      }

      this._scrollBy(this._getScrollAmount(this.oldIndex) - scrolled);

      this.down = {x: 0, y: 0};
      return;
    }

    if (this.down && !this.scrolling) {
      const evtAny = evt as any;
      const pos = evtAny[this.mouseAxis[this.axis]] < this.down[this.axis];
      const neg = evtAny[this.mouseAxis[this.axis]] > this.down[this.axis];

      if (canChange) {
        if (this.config.infinite) {
          this._overScroll(pos);
        }

        if (pos) {
          inc();
        } else if (neg) {
          dec();
        }
      } // only scroll if index changed

      if (this.startIndex === this.index) {
        this.config.onFinish?.call(this, this._getData());
      } else {
        this._scrollBy(this._getScrollAmount(this.oldIndex));
      }

      this.down = {x: 0, y: 0};
    }
  }

  private _limitDrag(e: MouseEvent): number {
    let scrolled: number;

    if (this.axis === 'x') {
      scrolled = e.clientX - (this.down ? this.down.x : 0);
    } else {
      scrolled = e.clientY - (this.down ? this.down.y : 0);
    }

    if (!this.config.infinite) {
      if (
        (this.index === 0 && scrolled > 0) ||
        (this.index === this.pages.length - 1 && scrolled < 0)
      ) {
        scrolled /= 10;
      }
    }

    return scrolled;
  }

  public prev() {
    if (this.config.infinite) {
      let index = this.index;

      if (index === 0) {
        index--;
        return this._scrollBy(this.data.window[this.size[this.axis]], index);
      }
    }

    this.scrollToIndex(this.index - 1);
  }

  public next() {
    if (this.config.infinite) {
      let index = this.index;

      if (index === this.lastIndex) {
        index++;
        return this._scrollBy(-this.data.window[this.size[this.axis]], index);
      }
    }

    this.scrollToIndex(this.index + 1);
  }

  private _keydown(e: KeyboardEvent) {
    if (this.config.events && this.config.events.keydown) {
      if (this.scrolling || this.dragging) {
        e.preventDefault();
        return false;
      }

      let code: string | number = e.key || e.keyCode;

      if (e.key !== undefined) {
        code = e.key;
      } else if (e.code !== undefined) {
        code = e.code;
      }

      const dir1 = 'Arrow' + (this.axis === 'x' ? 'Left' : 'Up');
      const dir2 = 'Arrow' + (this.axis === 'x' ? 'Right' : 'Down');

      if (code) {
        switch (code) {
          case 33:
          case 37:
          case dir1:
          case 'PageUp':
            e.preventDefault();
            this.scrollDirection = 'up';
            this.prev();
            break;

          case 34:
          case 39:
          case dir2:
          case 'PageDown':
            e.preventDefault();
            this.scrollDirection = 'down';
            this.next();
            break;
        }
      }
    }
  }

  public scrollToAnchor(id: string) {
    this.scrollToIndex(this.anchors.indexOf(id));
  }

  public scrollToIndex(index: number) {
    if (!this.scrolling && index >= 0 && index <= this.pages.length - 1) {
      const oldIndex = this.index;
      this.index = index;
      this.oldIndex = oldIndex;

      this._scrollBy(this._getScrollAmount(oldIndex));
    }
  }

  private _getScrollAmount(oldIndex: number, newIndex?: number) {
    if (newIndex === undefined) {
      newIndex = this.index;
    }

    const h = this.data.window[this.size[this.axis]];
    const a = h * oldIndex;
    const b = h * newIndex;
    return a - b;
  }

  public _overScroll(inc: boolean, scrolled: number = 0): void {
    let index = this.index;

    if (index === this.lastIndex && inc) {
      index++;

      this._scrollBy(-this.data.window[this.size[this.axis]] - scrolled, index);
    } else if (index === 0 && !inc) {
      index--;

      this._scrollBy(this.data.window[this.size[this.axis]] - scrolled, index);
    }
  }

  private _scrollBy(amount: number, index?: number) {
    if (this.scrolling) return false;

    this.scrolling = true;

    this.config.onBeforeStart?.call(this, this.oldIndex);
    this.emit('scroll.before', this._getData());

    if (this.config.slideshow) {
      this.slider?.stop();
    }

    this.timer = setTimeout(
      () => {
        const st = Date.now();
        const offset = this._getScrollOffset();

        const scroll = () => {
          const now = Date.now();
          const ct = now - st;

          if (this.config.animation && ct > this.config.animation) {
            cancelAnimationFrame(this.frame as number);

            if (this.container && this.container.style.transform) {
              this.container.style.transform = '';
            }

            this.frame = false;
            this.scrolling = false;
            this.dragging = false;

            if (this.config.slideshow) {
              this.slider?.start();
            }
            if (this.config.infinite) {
              if (index === this.pageCount) {
                this.index = 0;
              } else if (index === -1) {
                this.index = this.lastIndex;
              }
            }

            const data = this._getData();
            this.pages[this.index].scrollIntoView();

            this.pages.forEach((page, i) => {
              if (i === this.index) {
                page.classList.add('pg-active');
              } else {
                page.classList.remove('pg-active');
              }
            });

            this.slideIndex = this.index;
            this.config.onFinish?.call(this, data); // emit "scroll.end" event
            this.emit('scroll.end', data);
            return false;
          }

          const start = this.dragging ? this.dragging : 0;

          if (this.config.easing) {
            const scrolled = this.config.easing(
              ct,
              start as number,
              amount,
              this.config.animation as number,
            );

            if (this.container) {
              this.container.style.transform = this.horizontal
                ? 'translate3d(' + scrolled + 'px, 0, 0)'
                : 'translate3d(0, ' + scrolled + 'px, 0)';
            }

            this.scrollPosition = offset[this.axis] - scrolled;
          }

          const data = this._getData();

          if (this.config.infinite) {
            if (index === this.pageCount) {
              data.scrolled = 0;
            } else if (index === -1) {
              data.scrolled = data.max;
            }
          }

          this.config.onScroll?.call(this, data);
          this.emit('scroll', data);
          this.frame = requestAnimationFrame(scroll);
        };

        this.config.onStart?.call(this, this._getData()); // emit "scroll.start" event
        this.emit('scroll.start', this._getData());
        this.frame = requestAnimationFrame(scroll);
      },
      this.dragging ? 0 : this.config.delay,
    );
  }

  private _getScrollOffset() {
    return {
      x: this.wrapper.scrollLeft,
      y: this.wrapper.scrollTop,
    };
  }

  private _start(e: MouseEvent | TouchEvent) {
    const evt = this._getEvent(e) as MouseEvent;

    if (this.scrolling || this.dragging) {
      return false;
    } // preventing action here allows us to still have the the event listeners
    // attached so touch and mouse can be toggled at any time

    if (e.type === 'touchstart') {
      if (!this.events.touch) {
        if (!(evt.target as Element)?.closest('a')) {
          this._preventDefault(e);
        }

        return false;
      }
    }

    if (e.type === 'mousedown') {
      if (!this.events.mouse || (e as MouseEvent).button !== 0) {
        return false;
      }
    }

    if (
      !(evt.target as Element)?.closest(this.config.childSelector as string)
    ) {
      return false;
    }

    this._preventDefault(e);

    this.dragging = this.config.freeScroll;

    if (this.config.slideshow) {
      this.slider?.stop();
    }

    this.down = {
      x: evt.clientX,
      y: evt.clientY,
    };

    this.startIndex = this.index;
    this.config.onBeforeStart?.call(this, this.index);
  }

  private _getEvent(
    e: MouseEvent | TouchEvent | Touch,
  ): MouseEvent | TouchEvent | Touch {
    if (this.touch) {
      if ((e as TouchEvent).type === 'touchend') {
        return (e as TouchEvent).changedTouches[0];
      }

      return (e as TouchEvent).touches[0];
    }

    return e;
  }

  public _preventDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  throttle<T extends unknown[], R>(
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
}

type Procedure = (...args: any[]) => void;

function debounce<F extends Procedure>(
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
