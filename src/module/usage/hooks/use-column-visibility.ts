import type { GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useState, useCallback } from 'react';

export const defaultPeopleColumns: GridColumnVisibilityModel = {};

function readModel(key: string): GridColumnVisibilityModel | null {
  try {
    const stored = localStorage.getItem(key);
    const parsed: unknown = stored === null ? null : JSON.parse(stored);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as GridColumnVisibilityModel)
      : null;
  } catch {
    return null;
  }
}

export function useColumnVisibility(
  key: string,
  defaults: GridColumnVisibilityModel,
  alwaysVisible: string
) {
  const [model, setModel] = useState(() => ({
    ...(readModel(key) ?? defaults),
    [alwaysVisible]: true,
  }));

  const update = useCallback(
    (next: GridColumnVisibilityModel) => {
      setModel(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        return;
      }
    },
    [key]
  );

  return [model, update] as const;
}
