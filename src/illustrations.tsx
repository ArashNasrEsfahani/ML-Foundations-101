import React from 'react';

/**
 * Codex-generated PNGs dropped into src/assets/illustrations/ are picked up here
 * by filename (see CODEX_IMAGES.md). Missing images fall back to built-in SVG.
 */
const modules = import.meta.glob('./assets/illustrations/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/([^/]+)\.png$/);
  if (m) byName[m[1]] = url;
}

export function illustrationUrl(name: string): string | undefined {
  return byName[name];
}

export function Illo({
  name,
  size = 96,
  fallback,
  alt = '',
  style,
}: {
  name: string;
  size?: number;
  fallback: React.ReactNode;
  alt?: string;
  style?: React.CSSProperties;
}) {
  const url = byName[name];
  if (url) {
    return (
      <img
        src={url}
        width={size}
        height={size}
        alt={alt}
        style={{ objectFit: 'contain', ...style }}
        draggable={false}
      />
    );
  }
  return <>{fallback}</>;
}
