import React, { useMemo } from 'react';
import rough from 'roughjs';
import { useSvgSize } from '../../hooks/useSvgSize';

/** A card with a hand-drawn rough.js border. Chrome only — never used on moving marks. */
export function PaperCard({
  children,
  seed = 7,
  padding = 20,
  dashed = false,
  style,
  className,
}: {
  children: React.ReactNode;
  seed?: number;
  padding?: number;
  dashed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  // NOTE: size comes from the element's border box (see useSvgSize) — measuring the
  // content box drew the sketch border inside the padding, clipping the content.
  const [ref, { w, h }] = useSvgSize<HTMLDivElement>();

  const paths = useMemo(() => {
    if (w < 4 || h < 4) return [];
    const gen = rough.generator();
    const drawable = gen.rectangle(2, 2, w - 4, h - 4, {
      roughness: 1.4,
      bowing: 1.2,
      seed,
      stroke: 'currentColor',
      strokeWidth: 1.4,
    });
    return gen.toPaths(drawable);
  }, [w, h, seed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        padding,
        background: '#fffdf8',
        borderRadius: 8,
        boxShadow: 'var(--shadow)',
        color: 'var(--ink)',
        ...style,
      }}
    >
      <svg
        aria-hidden
        width={w}
        height={h}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      >
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke={dashed ? 'var(--graphite)' : 'var(--ink)'}
            strokeWidth={1.4}
            fill="none"
            strokeDasharray={dashed ? '6 5' : undefined}
            opacity={dashed ? 0.55 : 0.9}
          />
        ))}
      </svg>
      {children}
    </div>
  );
}
