'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { HeadBanner } from '../../../HeadBanner';
import { useEffect, useRef, useState } from 'react';
import { AuthModal } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { postQuizReward } from '@castlery/shared-redux-services';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

const AfterSubmitPage = ({
  onFuncCall,
}: {
  onFuncCall: (action: { type: string; payload: { index: number; type: string } }) => void;
}) => {
  const dispatch = useAppDispatch();
  const { desktop } = useBreakpoints();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const hasLoggedIn = useAppSelector(selectedActiveUser);
  const hasRequestedRewardRef = useRef(false);

  useEffect(() => {
    if (!hasLoggedIn || hasRequestedRewardRef.current) {
      return;
    }

    hasRequestedRewardRef.current = true;

    const claimQuizReward = async () => {
      const { idealVacationHomeQuizId } = makePersistenceHandles();
      const rawQuizIdPayload = idealVacationHomeQuizId.getItem();

      if (!rawQuizIdPayload) {
        return;
      }

      try {
        const parsedPayload = JSON.parse(rawQuizIdPayload) as {
          value?: string;
          expiresAt?: number;
        };
        const quizId = parsedPayload?.value;
        const expiresAt = Number(parsedPayload?.expiresAt);

        if (!quizId || !expiresAt || Date.now() > expiresAt) {
          idealVacationHomeQuizId.removeItem();
          return;
        }

        await dispatch(postQuizReward.initiate({ quizId }));
        idealVacationHomeQuizId.removeItem();
      } catch (error) {
        idealVacationHomeQuizId.removeItem();
      }
    };

    void claimQuizReward();
  }, [hasLoggedIn]);

  return (
    <Stack>
      <HeadBanner
        header="What’s your ideal vacation home?"
        image={{
          desktop_url:
            'https://res.cloudinary.com/castlery/image/upload/v1779939085/hardcode%20pages/quiz_main_desktop.jpg',
          mobile_url:
            'https://res.cloudinary.com/castlery/image/upload/v1779939120/hardcode%20pages/quiz_main_mobile.jpg',
          tablet_url:
            'https://res.cloudinary.com/castlery/image/upload/v1779939120/hardcode%20pages/quiz_main_mobile.jpg',
          alt: 'Ideal Vacation Home Banner',
        }}
        hideMarginBottom={true}
      />
      {hasLoggedIn && (
        <Stack
          sx={(theme) => ({
            padding: `${theme.spacing(10)} ${theme.spacing(15)}`,
            alignItems: 'center',
            backgroundColor: theme.palette.brand.warmLinen[500],
            ...(!desktop && {
              padding: `${theme.spacing(6)} ${theme.spacing(4)}`,
            }),
          })}
        >
          <Typography
            level="h3"
            sx={(theme) => ({
              textAlign: 'center',
              fontSize: '28px',
              color: theme.palette.brand.terracotta[500],
              mb: theme.spacing(4),
              ...(!desktop && {
                fontSize: '20px',
                mb: theme.spacing(6),
              }),
            })}
          >
            You're all set. 40 credits have been added to your account!
          </Typography>
          <Button
            sx={(theme) => ({
              textTransform: 'uppercase',
              mb: theme.spacing(4),
              width: 'fit-content',
              minWidth: '480px',
              ...(!desktop && {
                mb: theme.spacing(8),
                minWidth: '358px',
                width: 'fit-content',
              }),
            })}
            onClick={() => {
              onFuncCall({
                type: 'goResult',
                payload: {
                  index: 0,
                  type: 'rr',
                },
              });
            }}
          >
            See my results
          </Button>
        </Stack>
      )}
      {!hasLoggedIn && (
        <>
          <Stack
            sx={(theme) => ({
              padding: `${theme.spacing(10)} ${theme.spacing(15)}`,
              alignItems: 'center',
              backgroundColor: theme.palette.brand.warmLinen[500],
              ...(!desktop && {
                padding: `${theme.spacing(6)} ${theme.spacing(4)}`,
              }),
            })}
          >
            <Typography
              level="h3"
              sx={(theme) => ({
                textAlign: 'center',
                fontSize: '28px',
                color: theme.palette.brand.terracotta[500],
                mb: theme.spacing(4),
                ...(!desktop && {
                  fontSize: '20px',
                  mb: theme.spacing(3),
                }),
              })}
            >
              Sign up or log in with your email to receive 40 credits in your account.
            </Typography>
            <Typography
              level="body1"
              sx={(theme) => ({
                textAlign: 'center',
                fontSize: '18px',
                color: theme.palette.brand.maroonVelvet[500],
                mb: theme.spacing(8),
                ...(!desktop && {
                  fontSize: '16px',
                  mb: theme.spacing(6),
                }),
              })}
            >
              Be part of The Castlery Club for member-only rewards, early access, and other exclusive perks.
            </Typography>
            <Button
              sx={(theme) => ({
                textTransform: 'uppercase',
                mb: theme.spacing(4),
                width: 'fit-content',
                minWidth: '480px',
                ...(!desktop && {
                  mb: theme.spacing(3),
                  minWidth: '358px',
                  width: 'fit-content',
                }),
              })}
              onClick={() => setAuthModalOpen(true)}
            >
              Login/create an account
            </Button>
            <Button
              variant="outlined"
              sx={(theme) => ({
                textTransform: 'uppercase',
                mb: theme.spacing(4),
                width: 'fit-content',
                minWidth: '480px',
                ...(!desktop && {
                  mb: theme.spacing(3),
                  minWidth: '358px',
                  width: 'fit-content',
                }),
              })}
              onClick={() => {
                onFuncCall({
                  type: 'goResult',
                  payload: {
                    index: 0,
                    type: 'rr',
                  },
                });
              }}
            >
              see my results
            </Button>
          </Stack>
          <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
      )}
    </Stack>
  );
};

export { AfterSubmitPage };
