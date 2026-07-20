import type React from 'react';

/**
 * Static sketch figures referenced by `figure` blocks (render: '<name>').
 * Populated alongside chapter content; unknown names render a placeholder.
 */
export const figureRegistry: Record<string, React.ComponentType> = {};
