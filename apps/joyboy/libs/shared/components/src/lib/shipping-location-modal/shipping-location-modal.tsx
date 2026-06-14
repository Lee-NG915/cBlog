'use client';

import { enablePostcode } from '@castlery/config';
import { NiceModal } from '@castlery/fortress';
import { getProductByIdOrSlugThunk } from '@castlery/modules-product-domain';
import { getBundleVariant, initializeProduct, refreshWebLeadTimeCommand } from '@castlery/modules-product-services';
import { noticeCityInfoUpdated } from '@castlery/modules-user-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { logger } from '@castlery/observability/client';
import { LocationSearch, LocationSearchType, ZipcodeResult } from '../location-search/location-search';
import { productShippingZipcodeSelectorSubmittedEvent } from '@castlery/modules-product-domain';
import { quickshipZipcodeSelectorSubmittedEvent } from '@castlery/modules-search-domain';
import { updateZipcodeInCart } from '@castlery/modules-cart-domain';

export type ShippingLocationModalSource = 'PDP' | 'Quickship';

export interface ShippingLocationModalProps {
  open: boolean;
  onClose: () => void;
  finalSlug?: string;
  onLocationChangeSuccess?: (zipcode: string) => void;
  /**
   * Which surface opened the modal. Determines which domain interaction event
   * gets dispatched on submit. Tracking listener resolves the GA label.
   */
  source: ShippingLocationModalSource;
}

export const ShippingLocationModal = (props: ShippingLocationModalProps) => {
  const { open, onClose, finalSlug, onLocationChangeSuccess, source } = props;
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams);

  const handleSubmit = useCallback(
    async (result: ZipcodeResult) => {
      const { zipcode, state = '', city = '' } = result;
      if (!zipcode) {
        return;
      }
      dispatch(
        source === 'PDP' ? productShippingZipcodeSelectorSubmittedEvent() : quickshipZipcodeSelectorSubmittedEvent()
      );
      try {
        if (finalSlug) {
          const newLocationProduct = await dispatch(
            getProductByIdOrSlugThunk({
              idOrSlug: finalSlug,
              cityInfo: {
                zipcode,
                city,
                state,
              },
              isClientSide: true,
            })
          ).unwrap();
          const bundleVariant = getBundleVariant({ productData: newLocationProduct, query });
          await dispatch(
            refreshWebLeadTimeCommand({
              outerZipcode: zipcode,
              outerCity: city,
              outerState: state,
              outerVariantId: newLocationProduct?.variants[0]?.id,
              outerBundleVariant: bundleVariant,
            })
          ).unwrap();
          dispatch(initializeProduct({ product: newLocationProduct, bundleVariant }));
        }

        await dispatch(
          updateZipcodeInCart.initiate({
            zipcode,
            countryState: state,
            city,
          })
        );

        // dispatch(setLeadtimeShippingFee(newLocationLeadTime));
        dispatch(
          noticeCityInfoUpdated({
            city,
            state,
            zipcode,
          })
        );
        makePersistenceHandles().webCity.setItem(
          JSON.stringify({
            city,
            state,
            zipcode,
          })
        );

        // 调用成功回调（如果提供了的话）
        onLocationChangeSuccess?.(zipcode);

        onClose();
      } catch (error: any) {
        onClose();
        logger.error('Failed to update shipping location', { error });
      }
    },
    [dispatch, finalSlug, onClose, onLocationChangeSuccess, query, source]
  );

  return (
    <>
      <NiceModal
        open={open}
        onClose={onClose}
        showDefaultFooter={false}
        title={'Shipping location'}
        desc={`Enter your location ${
          enablePostcode ? 'postcode' : 'zip code'
        } to get an accurate estimate shipping information.`}
      >
        <LocationSearch
          type={LocationSearchType.ZIPCODE}
          placeholder={enablePostcode ? 'Enter postcode' : 'Enter ZIP code'}
          autoFocus
          onSubmit={async (result: ZipcodeResult) => {
            await handleSubmit(result);
          }}
        />
      </NiceModal>
    </>
  );
};
