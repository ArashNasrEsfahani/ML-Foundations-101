import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function TeX({
  tex,
  block = false,
  /**
   * Render at display size without making the element a block. Fractions and
   * sums shrink in inline maths, which is right in a sentence and wrong when
   * the fragment is really part of a display equation broken into pieces.
   */
  displayStyle = false,
}: {
  tex: string;
  block?: boolean;
  displayStyle?: boolean;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(displayStyle ? `\\displaystyle ${tex}` : tex, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return tex;
    }
  }, [tex, block, displayStyle]);
  const Tag = block ? 'div' : 'span';
  return <Tag className={block ? 'tex-block' : 'tex-inline'} dangerouslySetInnerHTML={{ __html: html }} />;
}
