import React from 'react';

/**
 * Hand-drawn-looking inline SVG icons. Paths are deliberately slightly irregular
 * to read as pencil strokes. All stroke `currentColor`, no fills except accents.
 */
export type IconName =
  | 'bulb'
  | 'lock'
  | 'star'
  | 'trophy'
  | 'check'
  | 'cross'
  | 'arrow-left'
  | 'arrow-right'
  | 'medal'
  | 'eraser'
  | 'book'
  | 'gear'
  | 'flag'
  | 'reset';

const PATHS: Record<IconName, React.ReactNode> = {
  bulb: (
    <>
      <path d="M12 3.2c-3.4.1-5.9 2.6-5.8 5.7.1 2.2 1.3 3.3 2.1 4.5.6.9.8 1.6.9 2.6h5.5c.1-1 .3-1.8.9-2.7.8-1.2 2-2.3 2-4.5.1-3.1-2.3-5.7-5.6-5.6z" />
      <path d="M9.6 18.5h4.7M10.1 20.6h3.7" />
      <path d="M12 .8v1M5.2 3.4l.8.8M18.8 3.5l-.8.7" />
    </>
  ),
  lock: (
    <>
      <rect x="5.4" y="10.2" width="13.1" height="10" rx="1.5" />
      <path d="M8.1 10V7.3c0-2.2 1.7-4 3.9-4 2.2-.1 4 1.7 4 3.9v2.9" />
      <path d="M12 14v2.6" />
    </>
  ),
  star: (
    <path d="M12 2.6l2.8 6 6.4.8-4.7 4.4 1.3 6.3-5.8-3.2-5.7 3.3 1.2-6.4L2.8 9.5l6.5-.9L12 2.6z" />
  ),
  trophy: (
    <>
      <path d="M7 3.5h10.1l-.3 6c-.2 3.2-2.3 5.3-4.8 5.3s-4.6-2.1-4.8-5.2L7 3.5z" />
      <path d="M7 5.2H3.9c0 3.3 1.3 5.2 3.5 5.6M17.1 5.2h3c0 3.3-1.2 5.2-3.4 5.6" />
      <path d="M12 14.9v3M8.7 20.6h6.7" />
    </>
  ),
  check: <path d="M4.2 12.8l4.8 5.2c2-4.9 5.4-9.6 10.4-13.6" />,
  cross: <path d="M5.4 5.8l13 12.6M18.2 5.4L5.6 18.4" />,
  'arrow-left': <path d="M20 12H4.4m5.8-6.2L4 12.1l6.4 5.9" />,
  'arrow-right': <path d="M4 12h15.6m-5.8-6.2L20 12.1l-6.4 5.9" />,
  medal: (
    <>
      <circle cx="12" cy="14.5" r="6.2" />
      <path d="M9.5 3.2L8 8.7M14.5 3.2L16 8.7M9.5 3.2h5" />
      <path d="M12 11.4l1 2.1 2.3.3-1.7 1.6.5 2.3-2.1-1.2-2.1 1.2.4-2.3-1.6-1.6 2.3-.3 1-2.1z" />
    </>
  ),
  eraser: (
    <>
      <path d="M4.3 15.2l8.5-8.7c.8-.8 2-.8 2.7 0l4 4c.8.8.8 2 0 2.8l-6.4 6.4H8.5l-4.2-4.2c-.4-.4-.4-.9 0-1.3z" />
      <path d="M9.4 10.3l5.6 5.6M7 20h13" />
    </>
  ),
  book: (
    <>
      <path d="M12 5.4C10 3.8 7.2 3.3 3.8 3.6v14.6c3.3-.3 6 .2 8.2 1.8 2.1-1.6 4.9-2.1 8.2-1.8V3.6c-3.4-.3-6.2.2-8.2 1.8z" />
      <path d="M12 5.6v14" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.4 5.6l1.9 1.8M16.7 16.6l1.9 1.8M18.6 5.5l-1.9 1.9M7.3 16.7l-1.9 1.8" />
    </>
  ),
  flag: (
    <>
      <path d="M6 21.2V3.4" />
      <path d="M6.2 4.2c3.6-1.6 7.2 1.7 11.5.1l-1.8 4.4 1.8 4.3c-4.3 1.6-7.9-1.7-11.4-.1" />
    </>
  ),
  reset: (
    <>
      <path d="M4.6 8.2A8.4 8.4 0 0120.3 12a8.3 8.3 0 01-8.2 8.3A8.4 8.4 0 013.7 13" />
      <path d="M4.4 3.6l.3 4.8 4.7-.4" />
    </>
  ),
};

export function SketchIcon({
  name,
  size = 20,
  strokeWidth = 1.6,
  style,
  title,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
