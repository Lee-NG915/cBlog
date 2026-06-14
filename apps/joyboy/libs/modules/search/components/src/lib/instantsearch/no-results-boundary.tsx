import React from 'react';
import { useInstantSearch } from 'react-instantsearch';
import { Box } from '@castlery/fortress';

/**
 * NoResultsBoundary - Controls when to show "No Results" message
 *
 * Shows fallback (NoResults component) only when:
 * 1. Results are NOT artificial (real search completed)
 * 2. No hits returned (nbHits === 0)
 * 3. Search is NOT currently loading or stalled
 *
 * This prevents showing "No Results" when:
 * - Initial page load (results are artificial)
 * - Request was cancelled (returns artificial empty result)
 * - Search is in progress (loading/stalled state)
 * - Error occurred (returns artificial empty result)
 */
export function NoResultsBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const { results, status } = useInstantSearch();

  // Don't show "No Results" if search is in progress
  const isSearching = status === 'loading' || status === 'stalled';

  // Only show "No Results" when:
  // - Results are from a real completed search (not artificial)
  // - Actually got 0 hits
  // - Not currently searching
  const shouldShowNoResults = !results.__isArtificial && !results.nbHits && !isSearching;

  if (shouldShowNoResults) {
    return (
      <>
        {fallback}
        <Box hidden>{children}</Box>
      </>
    );
  }

  return <>{children}</>;
}
