import React from 'react';
import {Panorama, usePanorama, SlideData} from './index';

import './style.css';

export default {
  component: Panorama,
};

export function Default() {
  const {next, scrollToIndex} = usePanorama();

  const onStart = (data: SlideData) => {
    console.log(data.slideDirection);
  };

  return (
    <div>
      <button
        style={{
          position: 'fixed',
          top: '2rem',
          left: '10rem',
          zIndex: '999999',
        }}
        onClick={() => {
          next();
        }}
      >
        Next
      </button>
      <button
        style={{
          position: 'fixed',
          top: '2rem',
          left: '15rem',
          zIndex: '999999',
        }}
        onClick={() => {
          scrollToIndex(3);
        }}
      >
        ToIndex 3
      </button>
      <Panorama onStart={onStart}>
        <section data-anchor="Page 2">
          <div className="text">Page 2</div>
        </section>
        <section data-anchor="Page 3">
          <div className="text">Page 3</div>
        </section>
        <section data-anchor="Page 4">
          <div className="text">Page 4</div>
        </section>
        <section data-anchor="Page 5">
          <div className="text">Page 5</div>
        </section>
        <section data-anchor="Page 6">
          <div className="text">Page 6</div>
        </section>
      </Panorama>
    </div>
  );
}

export function InterVal() {
  return (
    <div>
      <Panorama>
        <section data-anchor="Page 2">
          <div className="text">Page 2</div>
        </section>
        <section data-anchor="Page 3">
          <div className="text">Page 3</div>
        </section>
        <section data-anchor="Page 4">
          <div className="text">Page 4</div>
        </section>
        <section data-anchor="Page 5">
          <div className="text">Page 5</div>
        </section>
        <section data-anchor="Page 6">
          <div className="text">Page 6</div>
        </section>
      </Panorama>
    </div>
  );
}
