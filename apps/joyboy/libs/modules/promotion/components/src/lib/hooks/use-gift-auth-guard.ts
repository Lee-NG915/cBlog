'use client';
import { useState, useRef, useCallback } from 'react';
import { accessInWeb } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

/**
 * Guards gift add/update actions behind a login check on web.
 * Reads login state from the web access token at call time (no Redux dependency).
 *
 * Usage:
 *   const { guardAction, openAuthModal, onAuthSuccess, onAuthClose } = useGiftAuthGuard();
 *
 *   guardAction(async () => { await dispatch(addGiftToCartCommand(...)); });
 *
 *   <AuthModal open={openAuthModal} onClose={onAuthClose} onSuccess={onAuthSuccess} />
 */
export function useGiftAuthGuard() {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const pendingActionRef = useRef<(() => Promise<void>) | null>(null);

  const guardAction = useCallback((action: () => Promise<void>) => {
    if (accessInWeb) {
      const hasLogin = !!makePersistenceHandles().webAccessToken.getItem();
      if (!hasLogin) {
        pendingActionRef.current = action;
        setOpenAuthModal(true);
        return;
      }
    }
    return action();
  }, []);

  const onAuthSuccess = useCallback(async () => {
    setOpenAuthModal(false);
    if (pendingActionRef.current) {
      await pendingActionRef.current();
      pendingActionRef.current = null;
    }
  }, []);

  const onAuthClose = useCallback(() => {
    setOpenAuthModal(false);
    pendingActionRef.current = null;
  }, []);

  return { guardAction, openAuthModal, onAuthSuccess, onAuthClose };
}
