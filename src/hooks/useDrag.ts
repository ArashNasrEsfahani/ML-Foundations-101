import { useRef, useCallback } from 'react';

/**
 * Pointer-drag helper for SVG widgets. Returns props to spread on the svg
 * element. Coordinates are reported in the SVG's viewBox space.
 */
export function useSvgDrag(
  onDrag: (x: number, y: number, phase: 'start' | 'move' | 'end') => void,
) {
  const dragging = useRef(false);

  const toLocal = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const x = ((e.clientX - rect.left) / rect.width) * (vb?.width || rect.width);
    const y = ((e.clientY - rect.top) / rect.height) * (vb?.height || rect.height);
    return { x, y };
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      const { x, y } = toLocal(e);
      onDrag(x, y, 'start');
    },
    [onDrag],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging.current) return;
      const { x, y } = toLocal(e);
      onDrag(x, y, 'move');
    },
    [onDrag],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging.current) return;
      dragging.current = false;
      const { x, y } = toLocal(e);
      onDrag(x, y, 'end');
    },
    [onDrag],
  );

  return { onPointerDown, onPointerMove, onPointerUp, style: { touchAction: 'none' as const } };
}
