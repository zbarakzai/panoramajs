import React from 'react';
import {EpicScroll, useEpicScroll} from './index';

import './style.css';

export default {
  component: EpicScroll,
};

export function Default() {
  const {next, scrollToIndex} = useEpicScroll();

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
      <EpicScroll>
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
      </EpicScroll>
    </div>
  );
}

export function InterVal() {
  return (
    <div>
      <EpicScroll>
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
      </EpicScroll>
    </div>
  );
}
