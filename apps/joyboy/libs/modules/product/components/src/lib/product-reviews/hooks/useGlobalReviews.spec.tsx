'use client';

import { renderHook, act, waitFor } from '@testing-library/react';
import { CountryCode } from '@castlery/utils';

// ─── Imports (after all jest.mock calls) ─────────────────────────────────────
import * as ConfigModule from '@castlery/config';
import { useGlobalReviews } from './useGlobalReviews';
import { useSelector } from '@castlery/shared-redux-store';
import { selectVariant, selectBundleVariants } from '@castlery/modules-product-domain';
import { logger as mockLogger } from '@castlery/observability/client';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// jest.mock factories are hoisted before variable declarations.
// The stable object reference returned from the factory can be mutated later in
// beforeEach / individual tests — that mutated value is what the hook reads.

jest.mock('@castlery/config', () => ({
  EcEnv: {
    NEXT_PUBLIC_COUNTRY: 'SG',
    NEXT_PUBLIC_APPLICATION_ENV: 'test',
    NEXT_PUBLIC_API_HOST: 'https://api.example.com',
    NEXT_PUBLIC_BASE_URL: 'https://example.com',
    NEXT_PUBLIC_LOCALE: 'en',
    NEXT_PUBLIC_CHANNEL: 'web',
    NODE_ENV: 'test',
  },
}));

// Mock redux store — mockDispatch is a module-level jest.fn() used in a factory,
// which IS safe because jest.fn() itself creates a function reference at parse
// time (before hoisting occurs at runtime).
const mockDispatch = jest.fn();
jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

// Mock product domain selectors
jest.mock('@castlery/modules-product-domain', () => ({
  selectBundleVariants: jest.fn(),
  selectVariant: jest.fn(),
}));

// Mock the reviews async thunk
const mockGetWebProductReviewsCommand = jest.fn();
jest.mock('@castlery/modules-product-services', () => ({
  getWebProductReviewsCommand: (...args: unknown[]) => mockGetWebProductReviewsCommand(...args),
}));

// Mock logger
jest.mock('@castlery/observability/client', () => ({
  logger: { error: jest.fn() },
}));

// ─── Test helpers ─────────────────────────────────────────────────────────────

const mockVariant = { id: 'v1', sku: 'SKU-001' };
const mockProduct = {
  id: 'prod-1',
  reviews: {
    average_rating: 4.5,
    total_count: 42,
  },
};

function setupDispatch(results: unknown[] = [], totalPages = 1) {
  const unwrap = jest.fn().mockResolvedValue({ results, total_pages: totalPages });
  mockDispatch.mockReturnValue({ unwrap });
  mockGetWebProductReviewsCommand.mockReturnValue({ type: 'getWebProductReviews' });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useGlobalReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset EcEnv to a market country so tests start from a realistic baseline
    (ConfigModule.EcEnv as any).NEXT_PUBLIC_COUNTRY = 'SG';

    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectVariant) return mockVariant;
      if (selector === selectBundleVariants) return null;
      return null;
    });

    setupDispatch();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // RED: These tests MUST FAIL with the current implementation.
  //
  // Current code reads EcEnv.NEXT_PUBLIC_COUNTRY (e.g. 'SG') as the initial
  // currentCountry.  After the fix it must always start at CountryCode.ALL.
  // ─────────────────────────────────────────────────────────────────────────────

  describe('initial country selection', () => {
    it('should default to CountryCode.ALL regardless of NEXT_PUBLIC_COUNTRY env var', () => {
      // GIVEN: EcEnv says we are in the SG market
      expect((ConfigModule.EcEnv as any).NEXT_PUBLIC_COUNTRY).toBe('SG');

      // WHEN the hook initialises
      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      // THEN currentCountry must be ALL — not the market-specific 'SG'
      expect(result.current.currentCountry).toBe(CountryCode.ALL);
    });

    it('should default to CountryCode.ALL even when NEXT_PUBLIC_COUNTRY is US', () => {
      (ConfigModule.EcEnv as any).NEXT_PUBLIC_COUNTRY = 'US';

      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      expect(result.current.currentCountry).toBe(CountryCode.ALL);
    });

    it('should default to CountryCode.ALL when NEXT_PUBLIC_COUNTRY is undefined', () => {
      (ConfigModule.EcEnv as any).NEXT_PUBLIC_COUNTRY = undefined;

      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      expect(result.current.currentCountry).toBe(CountryCode.ALL);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // These tests verify existing behaviour that must remain green after the fix
  // ─────────────────────────────────────────────────────────────────────────────

  describe('country state management', () => {
    it('should allow changing country after initialisation', () => {
      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      act(() => {
        result.current.setCurrentCountry(CountryCode.SG);
      });

      expect(result.current.currentCountry).toBe(CountryCode.SG);
    });

    it('should reset page to 1 when country changes', () => {
      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      act(() => {
        result.current.setPageNumber(3);
      });
      expect(result.current.pageNumber).toBe(3);

      act(() => {
        result.current.setCurrentCountry(CountryCode.SG);
      });

      // The coreParams change triggers the pageNumber-reset effect
      expect(result.current.pageNumber).toBe(1);
    });
  });

  describe('API call country parameter', () => {
    it('should pass CountryCode.ALL as country on the initial fetch', async () => {
      renderHook(() => useGlobalReviews(mockProduct as any));

      await waitFor(() => {
        expect(mockGetWebProductReviewsCommand).toHaveBeenCalledWith(
          expect.objectContaining({ country: CountryCode.ALL })
        );
      });
    });

    it('should NOT pass the market country (SG) on the initial fetch', async () => {
      renderHook(() => useGlobalReviews(mockProduct as any));

      await waitFor(() => {
        const callArg = mockGetWebProductReviewsCommand.mock.calls[0]?.[0] as any;
        expect(callArg?.country).not.toBe(CountryCode.SG);
        expect(callArg?.country).toBe(CountryCode.ALL);
      });
    });
  });

  describe('derived values from productData', () => {
    it('should return averageRating from productData.reviews', () => {
      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));
      expect(result.current.averageRating).toBe(4.5);
    });

    it('should return totalCount from productData.reviews', () => {
      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));
      expect(result.current.totalCount).toBe(42);
    });

    it('should return 0 for averageRating when productData has no reviews field', () => {
      const { result } = renderHook(() => useGlobalReviews({ id: 'prod-2' } as any));
      expect(result.current.averageRating).toBe(0);
    });

    it('should return 0 for totalCount when productData is undefined', () => {
      const { result } = renderHook(() => useGlobalReviews(undefined));
      expect(result.current.totalCount).toBe(0);
    });
  });

  describe('fetch guard: skips fetch when required data is absent', () => {
    it('should NOT fetch when product is undefined', async () => {
      renderHook(() => useGlobalReviews(undefined));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockGetWebProductReviewsCommand).not.toHaveBeenCalled();
    });

    it('should NOT fetch when both variant and bundleVariant are absent', async () => {
      (useSelector as jest.Mock).mockImplementation(() => null);

      renderHook(() => useGlobalReviews(mockProduct as any));

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockGetWebProductReviewsCommand).not.toHaveBeenCalled();
    });
  });

  describe('derived values: reviews field shapes', () => {
    it('should use bundleVariant path for variantId in error logs', async () => {
      const mockBundleVariant = { variant_id: 'bv-1' };

      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectVariant) return null;
        if (selector === selectBundleVariants) return mockBundleVariant;
        return null;
      });

      const unwrap = jest.fn().mockRejectedValue(new Error('err'));
      mockDispatch.mockReturnValue({ unwrap });
      mockGetWebProductReviewsCommand.mockReturnValue({ type: 'getWebProductReviews' });

      renderHook(() => useGlobalReviews(mockProduct as any));

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to fetch product reviews',
          expect.objectContaining({ variantId: 'bv-1' })
        );
      });
    });
  });

  describe('error handling', () => {
    it('should set reviews to empty array when fetch throws', async () => {
      const unwrap = jest.fn().mockRejectedValue(new Error('network error'));
      mockDispatch.mockReturnValue({ unwrap });
      mockGetWebProductReviewsCommand.mockReturnValue({ type: 'getWebProductReviews' });

      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      await waitFor(() => {
        expect(result.current.reviews).toEqual([]);
        expect(result.current.totalPages).toBe(0);
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to fetch product reviews',
          expect.objectContaining({ country: CountryCode.ALL })
        );
      });
    });

    it('should set reviewsLoading to false even after a fetch error', async () => {
      const unwrap = jest.fn().mockRejectedValue(new Error('timeout'));
      mockDispatch.mockReturnValue({ unwrap });
      mockGetWebProductReviewsCommand.mockReturnValue({ type: 'getWebProductReviews' });

      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      await waitFor(() => {
        expect(result.current.reviewsLoading).toBe(false);
      });
    });
  });

  describe('isInitialPhase fallback: no redundant re-fetch when starting at ALL', () => {
    it('should keep CountryCode.ALL when initial fetch returns empty results', async () => {
      // With the old code:
      //   initial country = SG → fetch → empty → setCurrentCountry(ALL) → re-fetch
      // With the new code:
      //   initial country = ALL → fetch → empty → condition (currentCountry !== ALL)
      //   is false → no redundant state update
      setupDispatch([], 0);

      const { result } = renderHook(() => useGlobalReviews(mockProduct as any));

      await waitFor(() => {
        expect(result.current.currentCountry).toBe(CountryCode.ALL);
      });
    });
  });
});
