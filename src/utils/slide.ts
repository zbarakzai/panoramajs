import {EpicScroll} from './scroll';

type SlideShowConfig = {
  delay?: number;
  interval: number;
  infinite: boolean;
  onBeforeStart: (slideIndex: number) => void;
};

export class SlideShow {
  private instance: EpicScroll;
  private running: boolean;
  private config: SlideShowConfig;

  constructor(instance: EpicScroll) {
    this.instance = instance;
    this.running = false;
    this.config = this.instance.config.slideshow as SlideShowConfig;
  }

  public start(): void {
    if (!this.running) {
      this.running = true;
      this.instance.slideIndex = this.instance.index;

      this.instance.interval = setInterval(() => {
        this.instance.config.onBeforeStart?.call(
          this.instance,
          this.instance.slideIndex,
        );

        setTimeout(() => {
          if (this.instance.config.infinite) {
            this.instance._overScroll(true);
          }

          if (this.instance.index < this.instance.pages.length - 1) {
            this.instance.slideIndex++;
          } else {
            this.instance.slideIndex = 0;
          }

          this.instance.scrollToIndex(this.instance.slideIndex);
        }, this.config.delay || 0);
      }, this.config.interval);
    }
  }

  public stop(): void {
    if (this.running) {
      clearInterval(this.instance.interval as number);
      this.instance.interval = null;
      this.running = false;
    }
  }
}
