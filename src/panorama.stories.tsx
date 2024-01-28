import React, {useRef} from 'react';
import {Panorama, SlideData, RefFunctionType} from './index';

import './style.css';

export default {
  component: Panorama,
};

export function Default() {
  const panoramaRef = useRef<RefFunctionType>(null);

  const onStart = (data: SlideData) => {
    console.log('started', data.slideYDirection);
    // console.log('started', data);
  };

  const onFinish = (data: SlideData) => {
    console.log('started', data.slideYDirection);
    // console.log('finished', data);
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
          panoramaRef.current?.next();
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
          panoramaRef.current?.prev();
        }}
      >
        Prev
      </button>
      <button
        style={{
          position: 'fixed',
          top: '2rem',
          left: '20rem',
          zIndex: '999999',
        }}
        onClick={() => {
          panoramaRef.current?.orientate('horizontal');
        }}
      >
        toggle R
      </button>
      <Panorama
        ref={panoramaRef}
        // infinite={true}
        responsiveAt="small"
        onStart={onStart}
        onFinish={onFinish}
      >
        <section className="page-1" id="page-1" data-anchor="Page 1">
          <div className="text">Page 1</div>
        </section>
        <section className="page-2" id="page-2" data-anchor="Page 2">
          <div className="text">Page 2</div>
        </section>
        <section className="page-3" id="page-3" data-anchor="Page 3">
          <div className="text">Page 3</div>
        </section>
        <section className="page-4" id="page-4" data-anchor="Page 4">
          <div className="text">Page 4</div>
        </section>
        <section className="page-5" id="page-5" data-anchor="Page 5">
          <div className="text">Page 5</div>
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
