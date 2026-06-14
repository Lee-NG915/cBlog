'use client';
import { useState, useCallback } from 'react';
import { useDispatch } from '@castlery/shared-redux-store';
import { getARModelCommand } from '@castlery/modules-product-services';
import { ARModelResponse } from '@castlery/modules-product-domain';

interface UseARModelReturn {
  loading: boolean;
  error: string | null;
  getARModelUrl: (uid: string, platform: 'ios' | 'android') => Promise<string | null>;
}

export function useARModel(): UseARModelReturn {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getARModelUrl = useCallback(
    async (uid: string, platform: 'ios' | 'android'): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const resultAction = await dispatch(getARModelCommand({ uid, platform }));

        if (getARModelCommand.fulfilled.match(resultAction)) {
          const data = resultAction.payload.payload;
          return data?.url || null;
        } else {
          const errorMessage = (resultAction.payload as string) || 'Failed to get AR model URL';
          setError(errorMessage);
          return null;
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'An error occurred while getting AR model URL';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  return {
    loading,
    error,
    getARModelUrl,
  };
}
