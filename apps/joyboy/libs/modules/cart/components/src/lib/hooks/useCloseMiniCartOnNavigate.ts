'use client';

import { useCallback } from 'react';
import { selectMiniCartMode, updateMiniCartMode } from '@castlery/modules-cart-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';

export function useCloseMiniCartOnNavigate() {
  const dispatch = useAppDispatch();
  const isMiniCartMode = useAppSelector(selectMiniCartMode);

  return useCallback(() => {
    if (!isMiniCartMode) return;

    dispatch(updateMiniCartMode(false));
  }, [dispatch, isMiniCartMode]);
}
