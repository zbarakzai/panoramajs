import {EpicScroll} from './scroll';
import type {EpicScrollProps} from '../components/epicscroll';

class EpicScrollManager {
  static instance: EpicScrollManager;
  public scrollInstance?: EpicScroll | null;

  constructor() {
    if (!EpicScrollManager.instance) {
      this.scrollInstance = null;
      EpicScrollManager.instance = this;
    }

    return EpicScrollManager.instance;
  }

  initialize(options: EpicScrollProps) {
    if (!this.scrollInstance) {
      this.scrollInstance = new EpicScroll('main', options);
    }
  }

  getInstance() {
    return this.scrollInstance;
  }

  destroy() {
    this.scrollInstance = null;
  }
}

const instance = new EpicScrollManager();

export default instance;
