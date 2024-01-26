<h1 align="center">
    PanoramaJS
</h1>

<p align="center">
    <img src="banner.png" alt="PanoramaJS Banner" width="150" height="150" style="border-radius: 5px;">
</p>
<h1 align="center">Creating captivating fullscreen snap scrolling, single-page websites with elegant landscape sliders for a seamless, immersive, and visually stunning online experience.</h1>

PanoramaJS is a highly intuitive React library designed for effortless creation of full-page scrolling and snap interfaces. It enables developers to easily build seamless, engaging webpages, offering a rich suite of features including detailed scroll events like start and finish indicators. This library streamlines the implementation of advanced functionalities, allowing for the quick integration of dynamic, responsive scrolling experiences that enhance user interaction and the visual appeal of web projects.

## Features

- 📜 Seamless Scrolling: Smooth, fullpage scrolling and snapping for an enhanced browsing experience.
- 🔄 Dynamic Effects: Implement dynamic scrolling effects with ease.
- 📏 Responsive and Adaptive: Fully responsive design for compatibility with various devices and screen sizes.
- 🔗 Scroll Navigation: Simplified navigation through sections using scroll navigation.
- 🔧 Customizable: Extensive customization options to match your website's requirements.
- 💡 Lightweight and Efficient: Designed for performance, ensuring quick load times and smooth operation.

## Installation

Integrate PanoramaJS into your React project using npm or yarn:

```bash
npm install panoramajs --save
```

## Compatibility

PanoramaJS is fully functional on all modern browsers, including Internet Explorer 11. Additionally, it provides touch support for mobile phones, tablets, and touch screen computers.

#### React JS example with all props

A more comprehensive initialization that includes all property settings might appear as follows:

```javascript
import { Panorama } from "panoramajs";
import type { SlideData } from "panoramajs";

<Panorama
  className="pa-container"
  /** The duration in ms of the scroll animation */
  animation={1500}
  /** The delay in ms before the scroll animation starts */
  delay={0}
  /** The interval in ms that the resize callback is fired */
  throttle={50}
  /** Specifies the scrolling direction: either 'vertical' or 'horizontal' */
  orientation='vertical'
  /** Swipe/Mouse drag distance (px) before firing the page change event */
  swipeThreshold={100}
  /** Allow manual scrolling when dragging instead of automatically moving to next page */
  freeScroll={true}
  /** Enable infinite scrolling */
  infinite={false}
  /** Activates the responsive mode of the page. When set, scroll snap is disabled and contents are responsive on the page. */
  responsiveAt="small" // 'small' | 'medium' | 'large' | 'xLarge'
  /** Specifies the easing function to be used for transitions and animations. */
  easing={easingFunction}
  /** Called when the component is initialized, with initial slide data */
  onInit={(data: SlideData) => void}
  /** Called when the component updates, with updated slide data */
  onUpdate={(data: SlideData) => void}
  /** Called before the start of a scroll action, with the index of the old slide */
  onBeforeStart={(oldIndex: number) => void}
  /** Called at the start of a scroll action, with the identifier (id) of the new slide */
  onStart={(data: SlideData) => void}
  /** Called during the scroll action, with current slide data and optional scroll type */
  onScroll={(data: SlideData, type?: string) => void}
  /** Called when the scroll action finishes, with the final slide data */
  onFinish={(data: SlideData) => void}
>
  <section data-anchor="Page 2">
    <div className="text">Page 2</div>
  </section>
  <section data-anchor="Page 3">
    <div className="text">Page 3</div>
  </section>
</ Panorama>
```

#### Responsive Design and Dynamic Parallax

[Demo](https://panoramajs-example.vercel.app/) An example website featuring parallax effects and responsive design adjusts its height and width automatically. This functionality is easily applied through props such as `responsiveAt="small"`. In this setup, sections remain fullscreen until the responsive mode is activated. Once triggered, they adapt to the size dictated by their content, which may be larger or smaller than the viewport. Additionally, custom events like `onStart`, `onScroll`, and `onFinish` enable the implementation of the parallax effect, enriching the user experience with dynamic visual depth.

---

## `forwardRef` panoramaRef

The `forwardRef` offers a simple and effective method for incorporating `Panorama` features into your React component. It encapsulates essential scrolling functions, providing a user-friendly interface for controlling scroll behavior within your components.

### Usage

First, import the hook into your component:

```javascript
import type {RefFunctionType} from 'panoramajs';
import {useRef} from "react"
```

Then, use the hook within your functional component to access its features:

```javascript
const MyComponent = () => {
  const panoramaRef = useRef < RefFunctionType > null;

  return <Panorama ref={panoramaRef} {...props}></Panorama>;
};
```

### Provided Methods

- **next**: Triggers a scroll to the next slide or section.

  ```javascript
  panoramaRef.current.next();
  ```

- **prev**: Triggers a scroll to the previous slide or section.

  ```javascript
  panoramaRef.current.prev();
  ```

- **setResponsive(activate: boolean)**: Enables or disables the responsive mode. `activate` is a boolean value (`true` to enable, `false` to disable).

  ```javascript
  panoramaRef.current.setResponsive(true); // Enable responsive mode
  ```

- **orientate(orientation: 'vertical' | 'horizontal')**: Sets the orientation of the scroll. `orientation` can be either `'vertical'` or `'horizontal'`.

  ```javascript
  panoramaRef.current.orientate('horizontal'); // Set horizontal scrolling
  ```

- **scrollToIndex(index: number)**: Scrolls to a specific slide or section based on its index.

  ```javascript
  panoramaRef.current.scrollToIndex(3); // Scroll to the slide with index 3
  ```

## Props

- `animation`: (default `700`) This parameter specifies the duration of scrolling transitions in milliseconds. It determines how quickly or slowly the scroll animation occurs when scroll snap between sections. A smaller value results in a faster transition, while a larger value slows down the effect. For example, setting `animation={300}` will result in a swift, smooth scroll, whereas `scrollSpeed={1000}` will create a more gradual, leisurely scrolling experience.

- `delay`: (default `0`) This setting controls the delay in milliseconds before initiating the scroll animation. It allows you to set a specific time interval that elapses after a user action (like a wheel or a drag scroll action) and before the actual scrolling motion starts. For instance, `scrollDelay={200}` means there will be a `200 ms` pause before the scrolling begins.

- `throttle`: (default `50`) This property sets the interval, in milliseconds, for the throttling of the resize callback. Throttling is a technique used to limit the rate at which a function (in this case, the resize callback) is executed.

- `orientation`: (default: `'vertical'`) This configuration sets the scrolling direction of your application, with options being either `'vertical'` or `'horizontal'`. By default, the orientation is set to `'vertical'`, which means the scrolling will occur up and down. If set to `'horizontal'`, the scrolling will shift to a left-to-right motion.

- `swipeThreshold`: (default `50`) This parameter defines the minimum swipe or mouse drag distance, in pixels, required to trigger a page change event. With the default set to `100`, it means that a swipe or drag must cover at least 100 pixels for the component to consider it a valid action to change the page.

- `freeScroll`: (default `false`) This setting enables manual scrolling when dragging, as opposed to automatically moving to the next page. When `freeScroll` is set to `true`, it allows users to have a more traditional scrolling experience, where they can manually control the scroll position through drag actions.

- `infinite`: (default `false`) This option toggles the infinite scrolling feature. When set to `false`, the default setting, scrolling follows the traditional pattern where reaching the end of the content concludes the scrollable area. However, when `infinite` is set to `true`, it enables an endless scrolling loop, meaning that upon reaching the end of the content, the scroll seamlessly transitions back to the beginning, and vice versa.

- `responsiveAt`: (default `"small"`) This setting activates the responsive mode of the page and is crucial for adapting your content to different screen sizes. When `responsiveAt` is set, scroll snap is disabled, and the contents become responsive, adjusting to the specified breakpoint. The available options are `'small'`, `'medium'`, `'large'`, and `'xLarge'`, which correspond to different viewport widths or device sizes.

For instance, setting `responsiveAt="small"` means that the responsive behavior will kick in at small-sized viewports, typically suitable for mobile devices. As you switch to `'medium'`, `'large'`, or `'xLarge'`, the responsive mode activates at increasingly larger viewport widths, catering to tablets, desktops, and larger screens, respectively.

- `slideshow`: (Not supported as of version 1.0) `SlideshowConfig` This feature enables an automatic slideshow that cycles through your pages. When implemented, it transitions between pages without user input, creating a dynamic, auto-advancing experience. The behavior of the slideshow is defined by the `SlideshowConfig`, which includes the following properties:

  - `interval`: Specifies the time in milliseconds between each page change.
  - `delay`: Defines the delay in milliseconds that occurs after the interval has ended and before the page actually changes.

- `events`: (optional) `EventsConfig` This parameter allows you to configure the activation of various event-driven features within your application. By using the `EventsConfig` object, you can enable or disable specific interaction modes, providing a customized user experience based on the nature of your content and the preferences of your audience. The `EventsConfig` includes the following properties:

  - `wheel`: This flag enables or disables scrolling via the mouse wheel.
  - `mouse`: This option controls mouse drag scrolling.
  - `touch`: This property toggles touch or swipe-based scrolling, essential for mobile and touch-enabled devices.
  - `keydown`: This setting enables or disables navigation via keyboard input.

  - `childSelector` (Deprecated after version 1.0): (default `data-anchor`) **[Deprecated]** (There's no longer a requirement to add the data-anchor attribute to child elements.) This property is a CSS3 selector string used by the Panorama component to identify which child elements should have scroll snap functionality. To effectively utilize this feature, each relevant child element must be wrapped within an HTML container, such as a `<div>`. Additionally, these containers must be assigned a `data-anchor` attribute. This setup is crucial for the Panorama component to function correctly, as it relies on these selectors to apply scroll snapping. For instance, if you have multiple sections in your layout that you want to include in the scroll snap sequence, each section should be encapsulated in a `<div>` with the data-anchor attribute set, allowing Panorama to recognize and interact with these elements appropriately.

Example:

```javascript
<Panorama childSelector="[data-anchor]" animation={1500}>
  <section data-anchor="Page 2">
    <div className="text">Page 2</div>
  </section>
  <section data-anchor="Page 3">
    <div className="text">Page 3</div>
  </section>
</Panorama>
```

## Methods

### easing(currentTime, startPos, endPos, interval)

This parameter specifies the easing function used for transitions and animations within your application. Easing functions define the rate of change of a parameter over time, and are essential for creating smooth and visually appealing animations and transitions.

```javascript
easing={(t, b, c, d = 0) => {
    if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
    return (-c / 2) * ((t -= 1) * (t - 2) - 1) + b;
}
```

---

### `onInit`: (optional) `(data: SlideData) => void`

The `onInit` callback is invoked when the component initializes, providing initial slide data to the user.

The callback function receives a parameter `data` of type `SlideData`, which contains detailed information about the current slide. The structure of `SlideData` is as follows:

```typescript
export type SlideData = {
  // Index of the current slide
  index: number;
  // Percentage of the current scroll position relative to the slide
  percent: number;
  // Absolute scrolled distance in pixels
  scrolled: number;
  // Maximum scrollable distance in pixels
  max: number;
  // Direction of the slide movement, either 'up' or 'down'
  slideDirection: 'up' | 'down';
  // The current page element being viewed
  currentPage: HTMLElement;
  // The next upcoming page element
  upcomingPage: HTMLElement;
};
```

The `onInit` method provides critical insights, such as the `index` of the current slide, the `percent` of how much of the current slide is visible, the `scrolled` distance in pixels, and the `max` scrollable distance. It also offers directional context with `slideDirection`, and direct access to the `currentPage` and `upcomingPage` HTML elements.

Example usage:

```javascript
onInit={(data) => {
  console.log('Initial slide data:', data);
  // Additional actions based on the initial slide data
}}
```

---

### `onUpdate`: (optional) `(data: SlideData) => void`

The `onUpdate` callback is designed to be invoked whenever the component undergoes an update, providing the latest slide data.

When triggered, `onUpdate` receives an argument `data`, which is of the type `SlideData`.
The `SlideData` type includes:

```typescript
export type SlideData = {
  // Index of the current slide
  index: number;
  // Percentage of the current scroll position relative to the slide
  percent: number;
  // Absolute scrolled distance in pixels
  scrolled: number;
  // Maximum scrollable distance in pixels
  max: number;
  // Indicates the direction of slide movement, either 'up' or 'down'
  slideDirection: 'up' | 'down';
  // The current page element in view
  currentPage: HTMLElement;
  // The next page element that is about to come into view
  upcomingPage: HTMLElement;
};
```

Example implementation:

```javascript
onUpdate={(data) => {
  console.log('Updated slide data:', data);
  // Execute additional logic based on the updated slide data
}}
```

---

### `onBeforeStart`: (optional) `(oldIndex: number) => void`

The `onBeforeStart` callback function is designed to be invoked right before the commencement of a scroll action. This pre-emptive trigger provides an opportunity to perform operations or adjustments just before the scrolling begins, making it a strategic point for preparations or state changes in your application.

When a scroll action is about to start, `onBeforeStart` receives a single argument, `oldIndex`, which is a number representing the index of the slide that is about to be transitioned away from. This allows you to gain context about the scroll action's origin, enabling you to implement logic based on where the user is coming from in the slide sequence.

Example usage:

```javascript
onBeforeStart={(oldIndex) => {
  console.log('Scrolling away from slide:', oldIndex);
  // Additional logic to execute before the scroll starts
}}
```

---

### `onStart`: (optional) `(data: SlideData) => void`

The `onStart` callback is a function that gets called at the very beginning of a scroll action. This is particularly useful for initiating certain behaviors or actions when the user starts to transition to a new slide.

When a scroll action commences, the `onStart` callback is provided with an argument `data` of the type `SlideData`. This data structure delivers comprehensive information about the new slide that the user is transitioning to. The `SlideData` type includes several important pieces of information:

```typescript
export type SlideData = {
  // Index of the current slide
  index: number;
  // Percentage of the current scroll position relative to the slide
  percent: number;
  // Absolute scrolled distance in pixels
  scrolled: number;
  // Maximum scrollable distance in pixels
  max: number;
  // Direction of the slide movement, either 'up' or 'down'
  slideDirection: 'up' | 'down';
  // The current page element being viewed
  currentPage: HTMLElement;
  // The next upcoming page element
  upcomingPage: HTMLElement;
};
```

This data provides a comprehensive snapshot of the current scroll state, including the `index` of the active slide, the `percent` of how much of the slide is visible, and the `scrolled` distance. It also indicates the `slideDirection` and provides direct access to the `currentPage` and `upcomingPage`.

Example implementation of `onStart`:

```javascript
onStart={(data) => {
  console.log('Starting scroll to slide:', data.index);
  // Perform actions or adjustments specific to the new slide
}}
```

---

### `onScroll`: (optional) `(data: SlideData, type?: string) => void`

The `onScroll` callback function is designed to be triggered continuously during the scroll action. This feature provides real-time data about the scrolling process, allowing for dynamic responses and interactions as the user navigates through the slides.

The `onScroll` function receives two arguments:

1. `data`: An object of type `SlideData`, which contains detailed information about the current slide during the scrolling action.
2. `type` (optional): A string that may specify the type of scroll event, if applicable.

The `SlideData` structure encompasses several key pieces of information:

```typescript
export type SlideData = {
  // Index of the current slide
  index: number;
  // Percentage of the current scroll position relative to the slide
  percent: number;
  // Absolute scrolled distance in pixels
  scrolled: number;
  // Maximum scrollable distance in pixels
  max: number;
  // Direction of the slide movement, either 'up' or 'down'
  slideDirection: 'up' | 'down';
  // The current page element being viewed
  currentPage: HTMLElement;
  // The next upcoming page element
  upcomingPage: HTMLElement;
};
```

This data provides a comprehensive snapshot of the current scroll state, including the `index` of the active slide, the `percent` of how much of the slide is visible, and the `scrolled` distance. It also indicates the `slideDirection` and provides direct access to the `currentPage` and `upcomingPage`.

Example usage of `onScroll`:

```javascript
onScroll={(data, type) => {
  console.log(`Scrolling in progress on slide ${data.index}, type: ${type}`);
  // Additional logic or actions to perform during scrolling
}}
```

---

### `onFinish`: (optional) `(data: SlideData) => void`

The `onFinish` callback function is designed to be called when a scroll action completes, providing you with the final slide data once the user finishes scrolling. This callback is particularly useful for executing tasks or updates that should occur only after the user has stopped scrolling and has settled on a slide.

The `SlideData` type includes the following key pieces of information:

```typescript
export type SlideData = {
  // Index of the current slide
  index: number;
  // Percentage of the current scroll position relative to the slide
  percent: number;
  // Absolute scrolled distance in pixels
  scrolled: number;
  // Maximum scrollable distance in pixels
  max: number;
  // Direction of the slide movement, either 'up' or 'down'
  slideDirection: 'up' | 'down';
  // The current page element being viewed
  currentPage: HTMLElement;
  // The next upcoming page element
  upcomingPage: HTMLElement;
};
```

This structure provides a comprehensive overview of the scroll's endpoint, including the `index` of the final slide, the `percent` of the slide visible, the total `scrolled` distance, and more. It also gives direct access to the `currentPage` which the user has settled on.

Example implementation of `onFinish`:

```javascript
onFinish={(data) => {
  console.log('Scroll action finished on slide:', data.index);
  // Execute logic or actions that should occur after the scroll completes
}}
```

---

## Change Log

### Version 1.0.0

- Migrated all functionality to a pure React component: In this major update, we've transitioned the entire scroll functionality from a traditional OOP class with direct DOM manipulation to a fully-fledged React component. This change enhances performance and leverages React's efficient DOM manipulation techniques.

### Version 0.7.x

- Traditional OOP Class for Scroll Functionality: Prior to version 1.0.0, the component utilized a traditional object-oriented programming (OOP) approach for handling scroll functionality, including direct manipulation of the DOM.
