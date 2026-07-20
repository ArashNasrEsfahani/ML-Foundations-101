import { useLayoutEffect, useRef, useState } from 'react';

/** Observes an element's size — used to size rough.js chrome and responsive SVGs. */
export function useSvgSize<T extends HTMLElement>(): [React.RefObject<T>, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // border-box, not contentRect: overlay chrome (rough.js borders) is positioned
    // at inset:0 of the padded element, so it must be measured including padding.
    const ro = new ResizeObserver(() => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      setSize((prev) =>
        Math.abs(prev.w - width) > 1 || Math.abs(prev.h - height) > 1
          ? { w: width, h: height }
          : prev,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}
