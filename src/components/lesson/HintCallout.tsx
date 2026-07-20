import React, { useState } from 'react';
import { SketchIcon } from '../sketch/SketchIcon';
import { Illo } from '../../illustrations';
import { renderInline } from './inline';
import { useProgress } from '../../state/progressStore';

export function HintCallout({ md, hintId }: { md: string; hintId: string }) {
  const [open, setOpen] = useState(false);
  const { dispatch } = useProgress();

  return (
    <div style={{ margin: '1em 0' }}>
      <button
        className="ghost"
        onClick={() => {
          if (!open) dispatch({ type: 'hint', hintId });
          setOpen(!open);
        }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}
        aria-expanded={open}
      >
        <Illo name="mascot-bulb" size={22} fallback={<SketchIcon name="bulb" size={20} />} />
        {open ? 'Hide hint' : 'Need a hint?'}
      </button>
      {open && (
        <div
          style={{
            marginTop: 8,
            padding: '12px 16px',
            borderLeft: '2px dashed var(--graphite)',
            background: 'var(--paper-2)',
            borderRadius: '0 var(--radius) var(--radius) 0',
            fontSize: '0.97rem',
          }}
        >
          {renderInline(md)}
        </div>
      )}
    </div>
  );
}
