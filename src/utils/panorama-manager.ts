import {Panorama} from './scroll';
import type {PanoramaProps} from '../components/panorama';

class PanoramaManager {
  static instance: PanoramaManager;
  public scrollInstance?: Panorama | null;

  constructor() {
    if (!PanoramaManager.instance) {
      this.scrollInstance = null;
      PanoramaManager.instance = this;
    }

    return PanoramaManager.instance;
  }

  initialize(options: PanoramaProps) {
    if (!this.scrollInstance) {
      this.scrollInstance = new Panorama('#panorama', options);
    }
  }

  getInstance() {
    return this.scrollInstance;
  }

  destroy() {
    this.scrollInstance = null;
  }
}

const instance = new PanoramaManager();

export default instance;
