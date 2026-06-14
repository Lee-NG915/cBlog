'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { type CartDataSchema, type LineItemSchema } from '@castlery/types';
import {
  updateInitialCartLoading,
  setCartRoot,
  useUpdateZipcodeInCartMutation,
  cartViewedEvent,
} from '@castlery/modules-cart-domain';
import { DYResourceTag } from '@castlery/modules-dy-components';
import { DYPageTypes, type RecommendationContext } from '@castlery/modules-dy-domain';
import { getCartDataInClientCommand, loadGuardsmanCartPlansCommand } from '@castlery/modules-cart-services';
import { WarrantyProviderManager } from '@castlery/shared-components';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { sharedFeatureService } from '@castlery/shared-services';
import { enableWarranty, ProductTypeMapping } from '@castlery/config';

interface PageClientProps {
  cart: CartDataSchema | null;
}

interface CookieZipcodeData {
  zipcode: string;
  state?: string;
  city?: string;
}

/**
 * Client-side cart page component
 *
 * Responsibilities:
 * 1. Sync SSR cart data to Redux store (for components that read from store)
 * 2. Fetch cart data client-side if not provided via SSR
 * 3. Sync zipcode from cookie to cart
 * 4. Initialize DY tracking and warranty provider manager
 *
 * Performance optimizations:
 * - Syncs SSR data to store synchronously (faster than useEffect)
 * - Only fetches if cart prop is null (SSR fallback)
 * - Memoizes expensive computations (cart context)
 * - Uses refs to prevent duplicate operations
 */
export function PageClient({ cart }: PageClientProps) {
  const dispatch = useAppDispatch();
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const ssrDataSyncedRef = useRef(false);
  const clientFetchRef = useRef(false);

  const completedGuardsmanCartLookupKeyRef = useRef<string | null>(null);
  const pendingGuardsmanCartLookupKeyRef = useRef<string | null>(null);
  const viewCartFiredRef = useRef(false);

  const [fetchedCart, setFetchedCart] = useState<CartDataSchema | null>(null);
  const [updateZipcodeInCartTrigger] = useUpdateZipcodeInCartMutation();

  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);

  // Sync SSR cart data to Redux store synchronously (before first render)
  // This ensures components that read from store get data immediately
  if (!ssrDataSyncedRef.current && cart) {
    dispatch(setCartRoot(cart));
    ssrDataSyncedRef.current = true;
  }

  // Prefer fetched cart over SSR cart (fetched cart is more up-to-date)
  const cartRoot = fetchedCart || cart;
  const cartZipcode = cartRoot?.zipcode;
  const hasCartRoot = Boolean(cartRoot);

  // Fetch cart data client-side on every mount to ensure freshness.
  // SSR data (cart prop) is used for initial render only; a background fetch
  // keeps the store up-to-date after back navigation or Router Cache hits.
  useEffect(() => {
    if (clientFetchRef.current) {
      return;
    }

    const fetchCart = async () => {
      if (!cart) dispatch(updateInitialCartLoading(true));
      try {
        const res = await dispatch(getCartDataInClientCommand());
        if (res?.type?.endsWith('fulfilled') && res.payload) {
          const cartData = res.payload as CartDataSchema;
          setFetchedCart(cartData);
          dispatch(setCartRoot(cartData));
        }
      } finally {
        if (!cart) dispatch(updateInitialCartLoading(false));
        clientFetchRef.current = true;
      }
    };

    fetchCart();
  }, [cart, dispatch]);

  // Sync zipcode from cookie to cart when cart data is available
  useEffect(() => {
    if (!cartZipcode) {
      return;
    }

    const cookieZipcodeStr = persistenceHandles.webCity.getItem();
    if (!cookieZipcodeStr || typeof cookieZipcodeStr !== 'string') {
      return;
    }

    try {
      const cookieZipcode = JSON.parse(cookieZipcodeStr) as CookieZipcodeData;
      // Only update if zipcode differs to avoid unnecessary API calls
      if (cookieZipcode?.zipcode && cookieZipcode.zipcode !== cartZipcode.zipcode) {
        updateZipcodeInCartTrigger({
          zipcode: cookieZipcode.zipcode,
          countryState: cookieZipcode.state ?? '',
          city: cookieZipcode.city ?? '',
        });
      }
    } catch {
      // Silently handle JSON parse errors (invalid cookie data)
    }
  }, [cartZipcode, updateZipcodeInCartTrigger, persistenceHandles]);

  // Memoize cart page context for DY recommendations
  // Only recalculates when lineItems change
  const cartPageContext = useMemo<RecommendationContext>(() => {
    const skuList = cartRoot?.lineItems?.map((item: LineItemSchema) => item.variant.sku).filter(Boolean) ?? [];
    return {
      type: DYPageTypes.CART,
      data: skuList,
    };
  }, [cartRoot?.lineItems]);

  const guardsmanCartLookupKey = useMemo(() => {
    return (
      cartRoot?.lineItems
        ?.filter(
          (item: LineItemSchema) =>
            item.status !== 'disabled' &&
            ![ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(item.productType as ProductTypeMapping) &&
            Boolean(item.variant?.sku)
        )
        .map((item: LineItemSchema) => {
          const price = item.salePrice || item.variant?.price || item.cartSalePrice || 0;
          return `${item.id}:${item.variant?.sku}:${price}`;
        })
        .join('|') || ''
    );
  }, [cartRoot?.lineItems]);

  // [保险接入] Cart 页 mount 后按 line item 指纹预加载 Guardsman plans，避免重复请求
  useEffect(() => {
    if (
      !hasCartRoot ||
      !isGuardsmanEnabled ||
      pendingGuardsmanCartLookupKeyRef.current === guardsmanCartLookupKey ||
      completedGuardsmanCartLookupKeyRef.current === guardsmanCartLookupKey
    ) {
      return;
    }

    pendingGuardsmanCartLookupKeyRef.current = guardsmanCartLookupKey;
    void dispatch(loadGuardsmanCartPlansCommand()).then((result) => {
      if (pendingGuardsmanCartLookupKeyRef.current === guardsmanCartLookupKey) {
        pendingGuardsmanCartLookupKeyRef.current = null;
      }

      if (result.type.endsWith('/fulfilled')) {
        completedGuardsmanCartLookupKeyRef.current = guardsmanCartLookupKey;
      }
    });
  }, [dispatch, guardsmanCartLookupKey, hasCartRoot, isGuardsmanEnabled]);

  // Fire view_cart once per mount when line items first become non-empty
  useEffect(() => {
    if (viewCartFiredRef.current) return;
    const lineItems = cartRoot?.lineItems;
    if (!lineItems?.length) return;
    viewCartFiredRef.current = true;
    dispatch(cartViewedEvent({ surface: 'fullCart', lineItems }));
  }, [cartRoot?.lineItems, dispatch]);

  // Don't render tracking components if no cart data
  if (!cartRoot) {
    return null;
  }

  return (
    <>
      <DYResourceTag recommendationContext={cartPageContext} />
      {/* [保险接入] Cart 页加载 Guardsman/Mulberry SDK（enableWarranty 为市场级开关） */}
      {enableWarranty && <WarrantyProviderManager />}
    </>
  );
}

export default PageClient;
