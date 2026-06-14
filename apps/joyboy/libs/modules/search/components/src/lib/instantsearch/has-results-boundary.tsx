import React from 'react';
import { useInstantSearch } from 'react-instantsearch';

/**
 * HasResultsBoundary - Only renders children when search has results
 *
 * Shows children only when:
 * 1. Results are NOT artificial (real search completed)
 * 2. Has hits returned (nbHits > 0)
 * 3. Search is NOT currently loading or stalled
 *
 * This prevents rendering when:
 * - Initial page load (results are artificial)
 * - No results found (nbHits === 0)
 * - Search is in progress (loading/stalled state)
 * - Error occurred (returns artificial empty result)
 */
export function HasResultsBoundary({ children }: { children: React.ReactNode }) {
  const { results, status } = useInstantSearch();

  // Don't show children if search is in progress
  const isSearching = status === 'loading' || status === 'stalled';

  // Only show children when:
  // - Results are from a real completed search (not artificial)
  // - Actually got hits
  // - Not currently searching
  const shouldShowChildren = !results.__isArtificial && results.nbHits > 0 && !isSearching;

  if (!shouldShowChildren) {
    return null;
  }

  return <>{children}</>;
}
