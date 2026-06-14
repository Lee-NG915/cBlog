'use client';
import { noticeCityInfoUpdated, setUser } from '@castlery/modules-user-domain';
import { EVENT_CUSTOMER_IDENTIFY_GA } from '@castlery/modules-tracking-services';
import { useAppStore } from '@castlery/shared-redux-store';
import { User } from '@castlery/types';
import {
  getUtmParametersFromUrl,
  setUtmParametersToPersistence,
  stringifyUtmParameters,
  getFbcFromUrlParamAndSetToPersistence,
  generateFbcFromClId,
} from '@castlery/utils';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useRef, useEffect } from 'react';
import { logger } from '@castlery/observability/client';
import { WebVitals } from './web-vitals';

interface LocaleLayoutClientProps {
  children: React.ReactNode;
  city?: string;
  user?: User;
}

export const LocaleLayoutClient = ({ children, city, user }: LocaleLayoutClientProps) => {
  const store = useAppStore();
  const initialized = useRef(false);
  let cityInfo;
  try {
    cityInfo = city ? JSON.parse(city) : undefined;
  } catch (error) {
    cityInfo = undefined;
  }
  if (!initialized.current) {
    /**
     * 这个地方可以做那些全局会使用到的 store 数据 , 确保 客户端组件在服务端渲染的时候可以获取到数据
     */
    cityInfo && store.dispatch(noticeCityInfoUpdated(cityInfo));
    user && store.dispatch(setUser(user));
    initialized.current = true;
  }

  useEffect(() => {
    try {
      // 在session中缓存utm参数，用于数据追踪，避免user journey中丢失utm参数
      const utmParameters = getUtmParametersFromUrl();
      if (utmParameters && Object.keys(utmParameters).length > 0) {
        setUtmParametersToPersistence(stringifyUtmParameters(utmParameters));
      }
      getFbcFromUrlParamAndSetToPersistence();

      if (user) {
        const navType = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)
          ?.type;
        const isReload = navType === 'reload';
        const persistenceHandles = makePersistenceHandles();
        const alreadyReported = persistenceHandles.identifyReported.getItem();

        if (!alreadyReported || isReload) {
          store.dispatch(EVENT_CUSTOMER_IDENTIFY_GA({ isSignin: false, isSignup: false }));
          persistenceHandles.identifyReported.setItem('1');
        }
      }
    } catch (error) {
      logger.error('Error setting utm parameters or fbclid to persistence', { error });
    }
  }, []);

  return (
    <>
      <WebVitals />
      {children}
    </>
  );
};
