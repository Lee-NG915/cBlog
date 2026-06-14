import { Container } from '@castlery/fortress';
import { CartServiceGuaranteeImpression, WebCartSkeleton } from '@castlery/modules-cart-components';
import { CartDYRecommendations, WebCartBasicDetails } from '@castlery/modules-composite-components';
import { makeStore } from '@castlery/shared-redux-store';
import { PageClient } from './page.client';
import { cookies } from 'next/headers';
import { getCartDataInServerCommand } from '@castlery/modules-cart-services';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { Suspense } from 'react';
import type { CartDataSchema } from '@castlery/types';

export { generateMetadata } from './metedata';

interface CartCookies {
  accessToken: string | undefined;
  xCartToken: string | undefined;
}

/**
 * Extract cart-related cookies from request
 * @returns Object containing accessToken and xCartToken
 */
export function getCartCookies(): CartCookies {
  const persistenceHandles = makePersistenceHandles({ cookies });
  const accessToken = persistenceHandles.webAccessToken.getItem();
  const xCartToken = persistenceHandles.xCartToken.getItem();
  return { accessToken, xCartToken };
}

/**
 * Server-side cart data fetching
 * Only fetches if cart token exists (SSR optimization)
 * Falls back to client-side fetching if no token (CSR)
 */
async function fetchCartDataInServer(
  xCartToken: string | undefined,
  accessToken: string | undefined
): Promise<CartDataSchema | null> {
  if (!xCartToken && !accessToken) {
    return null;
  }

  try {
    // @ts-expect-error - cookies from next/headers is a function, but makeStore expects an object
    // This is a known pattern in the codebase for server-side store creation
    const store = makeStore({ req: { cookies } });
    const res = await store.dispatch(getCartDataInServerCommand({ xCartToken, accessToken }));

    // Check if the thunk was fulfilled and has payload
    if (res.type?.endsWith('fulfilled') && res.payload) {
      return res.payload as CartDataSchema;
    }

    return null;
  } catch {
    // Silently fail and let client-side handle the fetch
    return null;
  }
}

/**
 * Cart Page Component
 *
 * Rendering Strategy:
 * - SSR: If cart token exists, fetch cart data on server for faster initial load
 * - CSR: If no token, let client-side handle fetching (avoids unnecessary server work)
 *
 * This hybrid approach optimizes for:
 * 1. Performance: SSR for users with existing cart sessions
 * 2. Flexibility: CSR for new users without cart tokens
 * 3. SEO: Server-rendered content for better search engine indexing
 */
export default async function CartPage() {
  const { accessToken, xCartToken } = getCartCookies();
  const cartData = await fetchCartDataInServer(xCartToken, accessToken);

  return (
    <Container disableGutters>
      <PageClient cart={cartData} />
      <Suspense fallback={<WebCartSkeleton />}>
        <WebCartBasicDetails />
      </Suspense>
      <Suspense fallback={null}>
        <CartServiceGuaranteeImpression position="fullCart" />
      </Suspense>
      <CartDYRecommendations />
    </Container>
  );
}
