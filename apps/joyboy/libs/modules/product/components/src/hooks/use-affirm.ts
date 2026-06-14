'use client';

import { EcEnv } from '@castlery/config';
import { loadAffirm } from '@castlery/utils';
import { useEffect } from 'react';

export const useAffirm = () => {
  useEffect(() => {
    if (EcEnv.NEXT_PUBLIC_AFFIRM_ENABLED) {
      if (!window.affirm) {
        loadAffirm();
      } else {
        window.affirm.ui.ready(() => {
          window.affirm.ui.refresh();
        });
      }
    }
  }, []);
};
