'use client';

import {
  resetSelectedOfferId,
  selectedOfferId,
  selectVariant,
  selectWarrantyIsFetching,
  selectWarrantyList,
  setSelectedOfferId,
  warrantySDKLoadSuccess,
} from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { Box, Link, Loading, RadioButton, RadioGroup, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Help } from '@castlery/fortress/Icons';
import { useCallback, useEffect, useState } from 'react';
import { EcEnv } from '@castlery/config';
import { EVENT_MULBERRY_WARRANTY } from '@castlery/modules-tracking-services';
import { logger } from '@castlery/observability/client';

export const ProductMulberryPicker = () => {
  const dispatch = useAppDispatch();
  const variant = useAppSelector(selectVariant);

  const warrantyList = useAppSelector(selectWarrantyList);
  const currentWarrantyOfferId = useAppSelector(selectedOfferId);
  const isWarrantyListFetching = useAppSelector(selectWarrantyIsFetching);
  const [modalInitiated, setModalInitiated] = useState(false);
  const { mobile, tablet } = useBreakpoints();

  const handleTrackMulberryEvent = async ({
    action,
    label,
    price,
  }: {
    action: string;
    label?: string;
    price?: string;
  }) => {
    await dispatch(
      EVENT_MULBERRY_WARRANTY({
        action: action,
        label: label ?? '',
        sku: variant?.sku ?? '',
        skuName: variant?.product_name ?? '',
        position: 'pdp',
        price,
      })
    );
  };

  const handleCoveredClick = useCallback(() => {
    handleTrackMulberryEvent({ action: 'extended_warranty_faq' });
    window.mulberry?.inline?.instances?.[0]?.postMessageClient?.listeners
      ?.find((x) => x.key === 'mulberry:inline-to-faq')
      ?.fn(window.mulberry?.core?.settings);
  }, [dispatch]);

  const handleWarrantyClick = useCallback(
    async (warrantyOfferId: string) => {
      if (warrantyOfferId === currentWarrantyOfferId) {
        dispatch(resetSelectedOfferId());
      } else {
        dispatch(setSelectedOfferId(warrantyOfferId));
        const targetOffer = warrantyList?.find((x) => x.warranty_offer_id === warrantyOfferId);
        if (targetOffer) {
          handleTrackMulberryEvent({
            action: 'select_extended_warranty',
            label: `${targetOffer.duration_months ? Number(targetOffer?.duration_months) / 12 : 0} Years`,
            price: targetOffer.cost ?? '',
          });
        }
      }
    },
    [currentWarrantyOfferId, dispatch, warrantyList]
  );

  useEffect(() => {
    dispatch(warrantySDKLoadSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (warrantyList?.length > 0) {
      const { settings } = window.mulberry.core;
      const initMulberry = async () => {
        try {
          await window?.mulberry?.inline?.init?.({
            offers: warrantyList,
            settings,
            selector: '.mulberry-inline-picker',
          });
          setModalInitiated(true);
        } catch (error) {
          logger.error('Failed to initialize Mulberry warranty picker', {
            error,
            variantSku: variant?.sku,
            offersCount: warrantyList?.length,
          });
          setModalInitiated(true);
        }
      };
      initMulberry();
    }
  }, [warrantyList, variant?.sku]);

  return (
    <Stack px={mobile ? 6 : tablet ? 8 : undefined}>
      {warrantyList?.length > 0 && !isWarrantyListFetching && (
        <Stack mt={mobile ? 6 : 8}>
          <Stack>
            <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
              <Typography level="h5">Add furniture protection plan</Typography>
              {modalInitiated && (
                <Link
                  component="button"
                  level="caption1"
                  variant="secondary"
                  endDecorator={<Help />}
                  onClick={handleCoveredClick}
                >
                  What's covered
                </Link>
              )}
            </Stack>
            <Typography
              level="caption1"
              sx={{
                mt: 1,
              }}
            >
              Protects your product against accidental damage, spills and more for a single price
            </Typography>
          </Stack>
          <Box
            className="mulberry-inline-picker"
            sx={{
              display: 'none',
            }}
          />
          <RadioGroup name="mulberry-warranty-picker" value={currentWarrantyOfferId}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" mt={4} gap={3}>
              {warrantyList?.map((warranty) => {
                const yearsNum = Number(warranty?.duration_months) / 12;
                const presentation = `${yearsNum} Year${yearsNum > 1 ? 's' : ''} - ${
                  EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL
                }${warranty?.customer_cost}`;
                return (
                  <RadioButton
                    key={warranty?.warranty_offer_id}
                    value={warranty?.warranty_offer_id}
                    label={presentation}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleWarrantyClick(warranty?.warranty_offer_id);
                    }}
                  />
                );
              })}
            </Stack>
          </RadioGroup>
        </Stack>
      )}
      {isWarrantyListFetching && <Loading theme="dark" />}
    </Stack>
  );
};
