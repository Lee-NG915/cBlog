'use client';
import { useState, useCallback, useMemo } from 'react';
import {
  Stack,
  Button,
  IconButton,
  Typography,
  Input,
  Link,
  NiceModal,
  CircularProgress,
  iconButtonClasses,
  inputClasses,
} from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { selectedCurrentCustomer, useLltSubscribeMutation } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { LineItemSchema } from '@castlery/types';
import { selectCartZipcode } from '@castlery/modules-cart-domain';
import { logger } from '@castlery/observability';
import { EcEnv, basePageConfig } from '@castlery/config';

const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
const TERMS_URL = `/${region}${basePageConfig['terms-of-use']}`;
const PRIVACY_POLICY_URL = `/${region}${basePageConfig['privacy-policy']}`;

const SUBMIT_BUTTON_SIZE = {
  width: 32,
  height: 32,
  minWidth: 32,
  minHeight: 32,
  [`& .${iconButtonClasses.loadingIndicator}`]: {
    position: 'absolute',
  },
} as const;

interface RemoveItemPopupProps {
  item: LineItemSchema;
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  removeHandler: () => Promise<void>;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function RemoveItemPopup({ item, openModal = false, setOpenModal, removeHandler }: RemoveItemPopupProps) {
  // Redux state
  const customer = useAppSelector(selectedCurrentCustomer);
  const zipcode = useAppSelector(selectCartZipcode);
  const isLoggedIn = !!customer?.id;

  // Local state
  const [email, setEmail] = useState('');
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState(false);

  // API hooks
  const [lltSubscribe, { isLoading: isSubscribing }] = useLltSubscribeMutation();

  // Computed values
  const isEmailValidated = useMemo(() => {
    return email.length === 0 || isValidEmail(email);
  }, [email]);

  const canSubmitEmail = useMemo(() => {
    return email.length > 0 && isValidEmail(email);
  }, [email]);

  const isLoading = isSubscribing || isRemoving;

  // Event handlers
  const resetModalState = useCallback(() => {
    setIsSubscribed(false);
    setEmail('');
    setSubscriptionError('');
    setShowEmailSection(false);
  }, []);

  const handleClose = useCallback(() => {
    resetModalState();
    setOpenModal(false);
  }, [resetModalState, setOpenModal]);

  const handleRemoveOnly = useCallback(async () => {
    try {
      setIsRemoving(true);
      await removeHandler();
      handleClose();
    } catch (error) {
      logger.error('Failed to remove item', { error });
    } finally {
      setIsRemoving(false);
    }
  }, [removeHandler, handleClose]);

  const subscriptionHandler = useCallback(
    async (emailAddress: string) => {
      if (!emailAddress || !isValidEmail(emailAddress)) {
        setSubscriptionError('Please enter a valid email address');
        return;
      }

      setSubscriptionError('');

      try {
        const payload = {
          email: emailAddress,
          variantSku: item.variant.sku,
          quantity: item.quantity,
          zipcode: zipcode?.zipcode || '',
          city: zipcode?.city || '',
          state: zipcode?.countryState || '',
        };
        const res = await lltSubscribe(payload);

        if (res.error) {
          const errorData = res.error as { data?: { errors?: Array<{ detail?: string }> } };
          const errorMessage = errorData?.data?.errors?.[0]?.detail || 'Error: something went wrong';
          setSubscriptionError(errorMessage);
          return;
        }

        await removeHandler();
        setIsSubscribed(true);
      } catch (error) {
        logger.error('Subscription failed', { error });
        setSubscriptionError('An unexpected error occurred');
      }
    },
    [item.variant.sku, item.quantity, zipcode?.zipcode, lltSubscribe, removeHandler]
  );

  const handleKeepMeUpdated = useCallback(async () => {
    if (!isLoggedIn) {
      setShowEmailSection(true);
      return;
    }

    // For logged-in users, subscribe with their account email
    try {
      const userEmail = customer?.email;
      if (userEmail) {
        await subscriptionHandler(userEmail);
      }
    } catch (error) {
      logger.error('Failed to subscribe', { error });
    }
  }, [isLoggedIn, customer?.email, subscriptionHandler]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && canSubmitEmail && !isLoading) {
        e.preventDefault();
        subscriptionHandler(email);
      }
    },
    [canSubmitEmail, isLoading, subscriptionHandler, email]
  );

  const modalTitle = useMemo(
    () => (isSubscribed ? "We'll keep you in the loop." : showEmailSection ? 'Keep me updated' : 'Remove from cart?'),
    [isSubscribed, showEmailSection]
  );

  const modalDescription = useMemo(
    () =>
      isSubscribed
        ? "Thanks for your interest! In the meantime, sit tight and we'll drop you a message when the time is right."
        : showEmailSection
        ? "Leave your email below and we'll let you know when the product is available with a shorter waiting time."
        : 'Would you like to remove this from your cart? You may also wish to be notified when the product has a shorter waiting time.',
    [isSubscribed, showEmailSection]
  );

  return (
    <NiceModal
      open={openModal}
      showCancelBtn={false}
      showConfirmBtn={false}
      keepMounted={false}
      onClose={handleClose}
      title={modalTitle}
      desc={modalDescription}
    >
      <Stack sx={{ pt: 2, width: '100%' }}>
        {isSubscribed ? (
          <Button fullWidth onClick={handleClose} sx={{ mt: 3 }}>
            Back to shopping cart
          </Button>
        ) : (
          <>
            {showEmailSection ? (
              <Stack spacing={2}>
                <Stack>
                  <Typography>Email Address</Typography>
                </Stack>

                <Input
                  type="email"
                  variant="borderplain"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your email address"
                  error={!isEmailValidated}
                  disabled={isLoading}
                  autoFocus
                  sx={{
                    py: 2.5,
                  }}
                  endDecorator={
                    <IconButton
                      variant="solid"
                      size="sm"
                      onClick={() => subscriptionHandler(email)}
                      loading={isSubscribing}
                      disabled={!canSubmitEmail || isLoading}
                      sx={SUBMIT_BUTTON_SIZE}
                    >
                      <ArrowRight />
                    </IconButton>
                  }
                />
                <Typography level="caption2" component="div">
                  By entering your email above, you agree to our{' '}
                  <Link href={TERMS_URL} target="_blank" rel="noopener noreferrer">
                    Terms
                  </Link>{' '}
                  &{' '}
                  <Link href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                  .
                </Typography>

                {subscriptionError && (
                  <Typography level="body2" color="danger" sx={{ mt: 1 }}>
                    {subscriptionError}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Button onClick={handleKeepMeUpdated} loading={isSubscribing} disabled={isLoading} sx={{ mt: 3 }}>
                KEEP ME UPDATED
              </Button>
            )}

            {!showEmailSection && (
              <Stack
                direction="row"
                sx={{
                  pt: 5,
                  gap: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Link
                  component="button"
                  level="body2"
                  variant="secondary"
                  onClick={handleRemoveOnly}
                  disabled={isLoading}
                  sx={{
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  Don't notify me, please remove from cart
                </Link>
                {isRemoving && <CircularProgress size="sm" color="neutral" />}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </NiceModal>
  );
}

export default RemoveItemPopup;
