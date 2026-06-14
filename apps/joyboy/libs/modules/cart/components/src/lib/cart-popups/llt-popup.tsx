'use client';

import {
  Stack,
  Typography,
  Input,
  Link,
  NiceModal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  accordionSummaryClasses,
} from '@castlery/fortress';
import { useState, useCallback, useMemo } from 'react';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

interface LLTPopupProps {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  deliveryStartDate: string;
  deliveryEndDate: string;
  onContinue?: () => void;
}

// Shared button styles
const orangeButtonSx = {
  backgroundColor: 'brand.orange',
  padding: '16px',
  textAlign: 'center',
  width: '100%',
  color: 'white',
  '&:hover': {
    color: 'white',
    textDecoration: 'none',
    backgroundColor: 'brand.orange',
    opacity: 0.9,
  },
  '&:disabled': {
    opacity: 0.5,
  },
} as const;

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function LLTPopup({
  openModal = false,
  setOpenModal,
  deliveryStartDate,
  deliveryEndDate,
  onContinue,
}: LLTPopupProps) {
  const isLoggedIn = useAppSelector(selectedCurrentCustomer);
  const [email, setEmail] = useState('');

  const handleContinue = useCallback(() => {
    onContinue?.();
    setOpenModal(false);
  }, [onContinue, setOpenModal]);

  const handleKeepMeUpdated = useCallback(() => {
    if (email || isLoggedIn) {
      // TODO: Handle email subscription logic here
      console.log('Subscribing email:', email);
      handleContinue();
    }
  }, [email, isLoggedIn, handleContinue]);

  const isEmailValid = useMemo(() => {
    return isLoggedIn || (email.length > 0 && isValidEmail(email));
  }, [email, isLoggedIn]);

  const modalDescription = useMemo(
    () =>
      `The estimated delivery time for this product is ${deliveryStartDate} - ${deliveryEndDate}. Would you like to proceed with your purchase?`,
    [deliveryStartDate, deliveryEndDate]
  );

  return (
    <NiceModal
      open={openModal}
      onClose={() => setOpenModal(false)}
      title="This might take a while."
      desc={modalDescription}
    >
      <Stack spacing={3}>
        <Accordion
          sx={{
            boxShadow: 'none',
            backgroundColor: 'transparent',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            indicator={<Typography sx={{ ml: 1 }}>▼</Typography>}
            sx={{
              padding: 0,
              minHeight: 'unset',
              justifyContent: 'center',
              [`& .${accordionSummaryClasses.root}`]: {
                margin: 0,
                justifyContent: 'center',
                alignItems: 'center',
              },
              [`& .${accordionSummaryClasses.indicator}`]: {
                marginLeft: 1,
                transform: 'rotate(0deg)',
                transition: 'transform 0.2s ease-in-out',
                '.Mui-expanded &': {
                  transform: 'rotate(180deg)',
                },
              },
            }}
          >
            <Typography component="div" sx={orangeButtonSx}>
              KEEP ME UPDATED
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0, mt: 2 }}>
            <Stack spacing={2}>
              <Typography>
                Leave your email below and we'll let you know when the product is available with a shorter waiting time.
              </Typography>
              {!isLoggedIn && (
                <>
                  <Typography>Email Address</Typography>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    fullWidth
                    error={email.length > 0 && !isValidEmail(email)}
                    sx={{
                      backgroundColor: 'background.paper',
                    }}
                  />
                </>
              )}
              <Typography sx={{ fontSize: '0.875rem' }}>
                By entering your email above, you agree to our{' '}
                <Link href="/pages/terms-and-conditions">Terms & Privacy Policy</Link>.
              </Typography>
              <Button onClick={handleKeepMeUpdated} disabled={!isEmailValid} sx={orangeButtonSx} fullWidth>
                KEEP ME UPDATED
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Button
          onClick={handleContinue}
          sx={{
            textAlign: 'center',
            color: 'text.primary',
            backgroundColor: 'transparent',
            '&:hover': {
              textDecoration: 'none',
              backgroundColor: 'transparent',
            },
          }}
          fullWidth
        >
          Continue Adding to Cart
        </Button>
      </Stack>
    </NiceModal>
  );
}

export default LLTPopup;
