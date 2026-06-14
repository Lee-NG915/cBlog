'use client';

import { EcEnv, EMAIL_REGEX } from '@castlery/config';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  Link,
  NiceModal,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { ArrowRight, Warning } from '@castlery/fortress/Icons';
import { postSubscriptionCommand } from '@castlery/modules-product-services';
import { NextFortressLink } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EVENT_LONG_LT } from '@castlery/modules-tracking-services';
import { selectVariant } from '@castlery/modules-product-domain';
import { useFirstInView } from '@castlery/modules-tracking-components';

interface FormData {
  email: string;
}

export const ProductKeepUpdated = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isSubscriptionFinished, setIsSubscriptionFinished] = useState(false);
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const variant = useAppSelector(selectVariant);

  const handleTrackLltEvent = useCallback(
    async (action: string) => {
      await dispatch(EVENT_LONG_LT({ action, sku: variant?.sku ?? '', skuName: variant?.name ?? '' }));
    },
    [variant]
  );

  const lltButtonRef = useFirstInView(
    () => {
      handleTrackLltEvent('pdp_text_impression');
    },
    {
      threshold: 1,
    }
  );

  const handleKeepMeUpdated = useCallback(() => {
    handleTrackLltEvent('pdp_text_click');
    setOpenModal(true);
    handleTrackLltEvent('popup_display');
  }, []);

  const handleClose = useCallback(() => {
    handleTrackLltEvent('popup_close');
    setIsSubscriptionFinished(false);
    setOpenModal(false);
  }, [handleTrackLltEvent]);

  const KeepMeUpdatedTitle = (props: { subscriptionStatus: boolean }) => {
    const { subscriptionStatus } = props;
    return (
      <Typography level="h3">{subscriptionStatus ? "We'll keep you updated." : 'Be kept in the loop.'}</Typography>
    );
  };

  const KeepMeUpdatedContent = (props: {
    subscriptionStatus: boolean;
    changeSubscriptionStatus: (status: boolean) => void;
    onClose: () => void;
    open: boolean;
  }) => {
    const { subscriptionStatus, changeSubscriptionStatus, onClose, open } = props;
    const dispatch = useAppDispatch();

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

    useEffect(() => {
      if (!open) {
        reset();
      }
    }, [open, reset]);

    const onSubmit = async (data: FormData) => {
      try {
        await dispatch(postSubscriptionCommand({ email: data.email })).unwrap();
        await handleTrackLltEvent('subscribe');
        changeSubscriptionStatus(true);
      } catch (error: any) {
        const errorMessage = error?.data?.errors?.[0]?.detail || 'Something went wrong, please try again later.';

        setError('email', {
          type: 'api',
          message: errorMessage,
        });
      }
    };

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    return (
      <>
        <Typography level="body2" sx={{ textAlign: 'center' }}>
          {!subscriptionStatus
            ? "If you prefer not to wait (and we totally get it!), leave your email below and we'll update you when the product is available with a shorter waiting time."
            : "Thanks for your interest! In the meantime, sit tight and we'll drop you a message when the time is right."}
        </Typography>
        {!subscriptionStatus ? (
          <Stack>
            <Stack mt={mobile ? 5 : 4}>
              <Typography level="body2">Email Address*</Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl sx={{ mb: 2 }}>
                  <Input
                    id="product-restock-notify-email"
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
          <Stack justifyContent={'center'} alignItems={'center'} mt={mobile ? 5 : 6}>
            <Button
              variant="primary"
              onClick={handleClose}
              sx={{
                alignSelf: 'stretch',
              }}
            >
              <Typography level="subh2">okay</Typography>
            </Button>
          </Stack>
        )}
      </>
    );
  };

  return (
    <>
      <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} mt={2} flexWrap={'wrap'}>
        <Typography
          level="body2"
          startDecorator={<Warning />}
          sx={{
            color: 'var(--fortress-palette-brand-burntOrange-400)',
          }}
        >
          Long delivery time expected.
        </Typography>
        <Link
          component="button"
          variant="primary"
          level="body2"
          onClick={handleKeepMeUpdated}
          data-selenium="llt_expand"
          sx={{
            ml: 1,
          }}
          ref={lltButtonRef}
        >
          Keep me updated
        </Link>
      </Stack>
      <NiceModal
        open={openModal}
        title={<KeepMeUpdatedTitle subscriptionStatus={isSubscriptionFinished} />}
        showDefaultFooter={false}
        onClose={handleClose}
      >
        <KeepMeUpdatedContent
          subscriptionStatus={isSubscriptionFinished}
          changeSubscriptionStatus={setIsSubscriptionFinished}
          onClose={handleClose}
          open={openModal}
        />
      </NiceModal>
    </>
  );
};
