'use client';
import { EcEnv } from '@castlery/config';
import { Button, InputSubscription, Sheet, Stack, SxProps, Typography, useBreakpoints } from '@castlery/fortress';
import { postSubscription, selectProduct, selectVariant } from '@castlery/modules-product-domain';
import { getCityInfo } from '@castlery/modules-user-domain';
import { CustomLink } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useState } from 'react';

interface WebLongLeadTimeSheetProps {
  // containerRef: React.RefObject<any>;
  confirmLoadingStatus: boolean;
  onConfirm: () => void;
  sx?: SxProps;
}

export const WebLongLeadTimeSheet = (props: WebLongLeadTimeSheetProps) => {
  const {
    onConfirm,
    confirmLoadingStatus,
    sx,
    // containerRef
  } = props;
  const product = useAppSelector(selectProduct);
  const variant = useAppSelector(selectVariant);
  const dispatch = useAppDispatch();
  const { mobile } = useBreakpoints();
  const [isKeepMeUpdatedOpen, setIsKeepMeUpdatedOpen] = useState(false);
  const [isSubscriptionFinished, setIsSubscriptionFinished] = useState(false);
  const [useEmail, setUserEmail] = useState('');
  return (
    <Stack justifyContent={'center'} alignContent={'center'} sx={{ ...sx }}>
      <Stack flexDirection={mobile ? 'column' : 'row'} gap={2}>
        <Button
          variant="secondary"
          sx={{ flex: 1 }}
          onClick={(e) => {
            // containerRef?.current?.handleCancel(e);
            setIsKeepMeUpdatedOpen((state) => !state);
          }}
        >
          {'Keep me updated'}
        </Button>
        <Button
          sx={{ flex: 1 }}
          loading={confirmLoadingStatus}
          onClick={() => {
            onConfirm();
          }}
        >
          {'Continue adding to cart'}
        </Button>
      </Stack>
      <Sheet
        sx={{
          display: isKeepMeUpdatedOpen ? 'block' : 'none',
          marginTop: '20px',
          backgroundColor: '#f0ede2',
        }}
      >
        <Stack gap={2}>
          <Typography
            level={'body2'}
            sx={{
              // color: linkProps.color,
              padding: '20px',
            }}
          >
            {!isSubscriptionFinished ? (
              <>
                {
                  'Leave your email below and we’ll let you know when the product is available with a shorter waiting time.'
                }
                <InputSubscription
                  customSx={{
                    margin: '10px 0',
                  }}
                  onSubmit={async (params) => {
                    setUserEmail(params?.email);
                    if (variant?.sku && product?.min_sale_qty) {
                      const city = await dispatch(getCityInfo());
                      console.log('🚀 ~ onSubmit={ ~ city:', city);
                      const submitParams = {
                        email: params.email,
                        source: 'LLT',
                        extra: {
                          variant_sku: variant?.sku,
                          quatity: product.min_sale_qty,
                          ...(EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() !== 'sg' && {
                            zipcode: city?.payload?.zipcode,
                          }),
                          ...(EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() !== 'au' && {
                            city: city?.payload?.city,
                            state: city?.payload?.state,
                          }),
                        },
                      };
                      const res = await dispatch(postSubscription.initiate(submitParams));
                      console.log('🚀 ~ onSubmit={ ~ res:', res);
                      return res;
                    }
                    return null;
                  }}
                  onSuccessChange={() => {
                    setIsSubscriptionFinished(true);
                  }}
                />
              </>
            ) : (
              `Thanks for your interest! A notification will be sent to ${useEmail} when the time is right.
                Sit tight!`
            )}
            <Typography
              level={'body3'}
              sx={{
                color: '#888888',
                a: {
                  color: '#888888',
                },
              }}
            >
              By entering your email above, you agree to our{' '}
              <CustomLink
                href="/terms-of-use"
                isExternalFlag={true}
                {...{
                  target: '_blank',
                }}
              >
                Terms
              </CustomLink>{' '}
              &amp;{' '}
              <CustomLink
                href="/privacy-policy"
                isExternalFlag={true}
                {...{
                  target: '_blank',
                }}
              >
                Privacy Policy.
              </CustomLink>
            </Typography>
          </Typography>
        </Stack>
      </Sheet>
    </Stack>
  );
};
