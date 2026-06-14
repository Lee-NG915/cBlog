'use client';
import React, { useEffect, useState } from 'react';
import { Toast, Icons } from '@castlery/fortress';
import { useInstantSearch } from 'react-instantsearch';

// Define the error type
interface SearchError {
  name: string;
  message: string;
}

export function SearchErrorToast() {
  const { addMiddlewares } = useInstantSearch();
  const [error, setError] = useState<SearchError | null>(null);

  useEffect(() => {
    const middleware = ({ instantSearchInstance }: { instantSearchInstance: any }) => {
      function handleError(searchError: SearchError) {
        // Search error is already displayed to user via toast, no need for additional logging
        setError(searchError);
      }

      return {
        subscribe() {
          instantSearchInstance.addListener('error', handleError);
        },
        unsubscribe() {
          instantSearchInstance.removeListener('error', handleError);
        },
      };
    };

    return addMiddlewares(middleware);
  }, [addMiddlewares]);

  const handleClose = () => {
    setError(null);
  };

  return (
    <Toast
      open={!!error}
      onClose={handleClose}
      startDecorator={<Icons.ErrorTips />}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={6000}
    >
      {error && (
        <>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{error.name}</div>
          <div>{error.message}</div>
        </>
      )}
    </Toast>
  );
}
