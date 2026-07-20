import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function TeX({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: block, throwOnError: false });
    } catch {
      return tex;
    }
  }, [tex, block]);
  const Tag = block ? 'div' : 'span';
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}
