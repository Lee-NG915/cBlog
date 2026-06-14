'use client';

import { Container, Modal, ModalClose, useBreakpoints } from '@castlery/fortress';
import { DynamicModalDialog, DynamicModalOverflow } from '@castlery/shared-fortress-client';
import { MainContent } from './components/main-content';
import { useCallback, useEffect, useState } from 'react';
import { basePageConfig, EcEnv, WEB_PAGE_NAMES } from '@castlery/config';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { postQuizReward } from '@castlery/shared-redux-services';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const { desktop, mobile } = useBreakpoints();
  const [displayLogin, setDisplayLogin] = useState(true);
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: WEB_PAGE_NAMES.ACCOUNT_PAGE }));
      setDisplayLogin(true);
    }
  }, [open, dispatch]);

  const handleQuizRewardAfterAuth = useCallback(async () => {
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
  }, []);

  const handleSuccess = useCallback(() => {
    onClose();
    if (
      EcEnv.NEXT_PUBLIC_YOTPO_ENABLED &&
      [basePageConfig['rewards'], basePageConfig['referral']].includes(pathname?.slice(3) as any)
    ) {
      // TODO: handle yotpo
      // if(fromCart){
      //   const { origin, pathname } = window.location;
      //   const newUrl = `${origin + pathname}?open=cart`;
      //   window.location.href = newUrl;
      // } else {
      //   window.location?.reload();
      // }
    }
    window.setTimeout(() => {
      void handleQuizRewardAfterAuth();
    }, 3000);
    if (onSuccess) {
      onSuccess();
    }
  }, [handleQuizRewardAfterAuth, onClose, onSuccess, pathname]);

  return (
    <Modal open={open} onClose={onClose}>
      <DynamicModalOverflow
        sx={{
          padding: 0,
        }}
      >
        <DynamicModalDialog
          sx={{
            pt: desktop ? 7 : mobile ? 6 : 9,
            px: desktop ? 7 : mobile ? 6 : 10,
            ...(desktop
              ? {
                  width: '960px',
                }
              : {
                  width: '100%',
                  height: '100% !important',
                  minHeight: '100% !important',
                  overflowY: 'auto',
                }),
          }}
        >
          <ModalClose />
          <Container fixed disableGutters>
            <MainContent
              displayLogin={displayLogin}
              onSuccess={handleSuccess}
              onSignUp={() => setDisplayLogin(false)}
              onSignIn={() => setDisplayLogin(true)}
            />
          </Container>
        </DynamicModalDialog>
      </DynamicModalOverflow>
    </Modal>
  );
};
