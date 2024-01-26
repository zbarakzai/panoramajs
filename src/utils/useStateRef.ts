import {useEffect, useReducer, useRef} from 'react';
import {panoramaReducer, panoramaInitialState} from './reducer';
import {PanoramaState} from '../dtos/panorama.types';

export function useStateRef() {
  const [state, dispatch] = useReducer(panoramaReducer, panoramaInitialState);
  const stateRef = useRef<PanoramaState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const stateProxy: PanoramaState = new Proxy({} as PanoramaState, {
    get(_, prop: keyof PanoramaState) {
      return stateRef.current[prop];
    },
  });

  return [stateProxy, dispatch] as const;
}
