'use client';

import { EcEnv, EMAIL_REGEX } from '@castlery/config';
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  NiceModal,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { selectLeadtimeShippingFee, type Variant } from '@castlery/modules-product-domain';
import { postSubscriptionCommand } from '@castlery/modules-product-services';
import { NextFortressLink } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EVENT_LONG_LT } from '@castlery/modules-tracking-services';

interface FormData {
  email: string;
}

const LongLeadTimeTitle = (props: { subscriptionStatus: boolean }) => {
  const { subscriptionStatus } = props;
  return (
    <Typography level="h3">{subscriptionStatus ? "We'll keep you updated." : 'This might take a while.'}</Typography>
  );
};

const LongLeadTimeChildren = (props: {
  subscriptionStatus: boolean;
  changeSubscriptionStatus: (status: boolean) => void;
  onClose: () => void;
  handleAddToCart: () => void;
  atcLoading: boolean;
  open: boolean;
  onSubscribed?: () => void;
  onExpandedEmailSection?: () => void;
}) => {
  const {
    subscriptionStatus,
    changeSubscriptionStatus,
    onClose,
    handleAddToCart,
    atcLoading,
    open,
    onSubscribed,
    onExpandedEmailSection,
  } = props;
  const leadtimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setError,
  } = useForm<FormData>({
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  // 当模态框关闭时重置所有状态
  useEffect(() => {
    if (!open) {
      setUserEmail('');
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setUserEmail(data.email);
      await dispatch(postSubscriptionCommand({ email: data.email })).unwrap();
      changeSubscriptionStatus(true);
      onSubscribed?.();
    } catch (error: any) {
      const errorMessage = error?.data?.errors?.[0]?.detail || 'Something went wrong, please try again later.';

      setError('email', {
        type: 'api',
        message: errorMessage,
      });
    }
  };

  const handleClose = useCallback(() => {
    setUserEmail('');
    reset();
    onClose();
  }, [onClose, reset]);

  return (
    <>
      <Typography
        level="body2"
        sx={{
          textAlign: 'center',
        }}
      >
        {!subscriptionStatus ? (
          <>
            The estimated delivery time for this product is{' '}
            <strong>{leadtimeShippingFee?.delivery_lead_time_presentation?.replace('Within ', '')}</strong>. Would you
            like to proceed with your purchase?
          </>
        ) : (
          <>
            Thanks for your interest! A notification will be sent to <strong>{userEmail}</strong> when the time is
            right. Sit tight!
          </>
        )}
      </Typography>
      {!subscriptionStatus ? (
        <Stack justifyContent={'center'} alignItems={'stretch'} gap={mobile ? 2 : 3} mt={mobile ? 5 : 6}>
          <Button variant="primary" onClick={handleAddToCart} loading={atcLoading}>
            <Typography level="subh2">continue</Typography>
          </Button>
          <AccordionGroup variant="plain">
            <Accordion
              onChange={(event, newValue) => {
                if (newValue) {
                  onExpandedEmailSection?.();
                }
              }}
            >
              <AccordionSummary>
                <Stack
                  direction={'row'}
                  justifyContent={'center'}
                  sx={{
                    width: '100%',
                  }}
                >
                  <Typography level="subh2">KEEP ME UPDATED</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  '&& .MuiAccordionDetails-content': {
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                }}
              >
                <Stack>
                  <Typography level="body2">
                    Leave your email below and we'll let you know when the product is available with a shorter waiting
                    time.
                  </Typography>
                  <Typography
                    level="body2"
                    sx={{
                      mt: 3,
                    }}
                  >
                    Email Address
                  </Typography>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl sx={{ mb: 2 }}>
                      <Input
                        id="long-lead-time-notify-email"
                        placeholder="Enter your email address"
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: EMAIL_REGEX,
                            message: 'Please provide a valid email address',
                          },
                        })}
                        error={!!errors.email}
                        sx={{ px: 4, py: 4 }}
                        endDecorator={
                          <IconButton
                            variant="primary"
                            size="sm"
                            loading={isSubmitting}
                            disabled={isSubmitting || !isValid}
                            type="submit"
                          >
                            <ArrowRight />
                          </IconButton>
                        }
                      />
                      {errors.email && (
                        <Box sx={{ '& div': { position: 'relative', bottom: 0 } }} mt={1}>
                          <FormHelperText sx={{ color: 'danger.500', mt: 1, position: 'relative' }}>
                            <Typography level="caption2">{errors.email.message}</Typography>
                          </FormHelperText>
                        </Box>
                      )}
                    </FormControl>
                  </form>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
          <Typography level="caption2">
            By entering your email above, you agree to our{' '}
            <NextFortressLink
              level="caption2"
              variant="secondary"
              href={`/${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/terms-of-use`}
              // isExternalFlag={true}
              {...{ target: '_blank' }}
            >
              Terms
            </NextFortressLink>
            &nbsp;&amp;&nbsp;
            <NextFortressLink
              level="caption2"
              variant="secondary"
              href={`/${EcEnv.NEXT_PUBLIC_COUNTRY?.toLowerCase()}/privacy-policy`}
              // isExternalFlag={true}
              {...{ target: '_blank' }}
            >
              Privacy Policy.
            </NextFortressLink>
          </Typography>
        </Stack>
      ) : (
        <Stack justifyContent={'center'} alignItems={'stretch'}>
          <Button
            variant="primary"
            sx={{
              mt: mobile ? 5 : 6,
            }}
            onClick={handleClose}
          >
            <Typography level="subh2">okay</Typography>
          </Button>
        </Stack>
      )}
    </>
  );
};

interface ProductLongLeadTimeModalProps {
  variant: Variant;
  open: boolean;
  onClose: () => void;
  handleAddToCart: () => void;
  atcLoading: boolean;
}

export const ProductLongLeadTimeModal = (props: ProductLongLeadTimeModalProps) => {
  const dispatch = useAppDispatch();

  const { variant, open, onClose, handleAddToCart, atcLoading } = props;
  const [isSubscriptionFinished, setIsSubscriptionFinished] = useState(false);

  const handleTrack = useCallback(
    async (action: string) => {
      await dispatch(EVENT_LONG_LT({ action, sku: variant?.sku ?? '', skuName: variant?.name ?? '' }));
    },
    [variant]
  );

  useEffect(() => {
    if (open) {
      handleTrack('popup_display');
    }
  }, [handleTrack, open]);

  const handleClose = useCallback(() => {
    handleTrack('popup_close');
    setIsSubscriptionFinished(false);
    onClose();
  }, [handleTrack, onClose]);

  return (
    <NiceModal
      title={<LongLeadTimeTitle subscriptionStatus={isSubscriptionFinished} />}
      children={
        <LongLeadTimeChildren
          subscriptionStatus={isSubscriptionFinished}
          changeSubscriptionStatus={setIsSubscriptionFinished}
          onClose={handleClose}
          handleAddToCart={handleAddToCart}
          atcLoading={atcLoading}
          open={open}
          onSubscribed={() => {
            handleTrack('subscribe');
          }}
          onExpandedEmailSection={() => {
            handleTrack('pdp_text_click');
          }}
        />
      }
      showDefaultFooter={false}
      open={open}
      onClose={handleClose}
    />
  );
};
