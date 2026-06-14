'use client';

import { EcEnv } from '@castlery/config';
import { Stack, useBreakpoints } from '@castlery/fortress';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { logger } from '@castlery/observability/client';

// 静态回调列表
let callbackList: Array<(grecaptcha: any) => void> = [];

// 静态加载 JS 方法
const loadJs = (): void => {
  if (typeof (window as any)._$_recaptcha_initialize_$_ !== 'undefined') {
    return;
  }

  (window as any)._$_recaptcha_initialize_$_ = function () {
    delete (window as any)._$_recaptcha_initialize_$_;
    callbackList.forEach((callback) => callback((window as any).grecaptcha));
    callbackList = [];
  };

  // FIXME can use Script Component
  const loadApi = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?onload=_$_recaptcha_initialize_$_&render=explicit';
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });

  loadApi.catch(() => {
    if (typeof (window as any).grecaptcha === 'undefined') {
      logger.error('reCaptcha initialization error (not loaded)');
    }
  });
};

interface GrepcaptchaRef {
  getToken: () => string | undefined;
  reset: () => void;
}

const Grepcaptcha = forwardRef<GrepcaptchaRef>((props, ref) => {
  const { desktop } = useBreakpoints();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<number | undefined>(undefined);
  const isInitializedRef = useRef<boolean>(false);

  const addCallback = useCallback((callback: (grecaptcha: any) => void): void => {
    if (typeof window === 'undefined') {
      return;
    }

    if ((window as any).grecaptcha) {
      callback((window as any).grecaptcha);
    } else {
      callbackList.push(callback);
      loadJs();
    }
  }, []);

  useEffect(() => {
    // 防止重复初始化
    if (isInitializedRef.current || !containerRef.current) {
      return;
    }

    addCallback((grecaptcha) => {
      if (containerRef.current && !isInitializedRef.current) {
        try {
          widgetRef.current = grecaptcha.render(containerRef.current, {
            sitekey: EcEnv.NEXT_PUBLIC_RECAPTCHA_KEY,
            theme: 'light',
          });
          isInitializedRef.current = true;
        } catch (error) {
          logger.error('reCAPTCHA render error', { error });
        }
      }
    });

    // 清理函数
    return () => {
      if (widgetRef.current !== undefined && (window as any).grecaptcha) {
        try {
          (window as any).grecaptcha.reset(widgetRef.current);
        } catch (error) {
          logger.error('reCAPTCHA reset error', { error });
        }
      }
    };
  }, [addCallback]);

  // 暴露方法给父组件使用
  useImperativeHandle(
    ref,
    () => ({
      getToken: (): string | undefined => {
        if (widgetRef.current !== undefined && (window as any).grecaptcha) {
          return (window as any).grecaptcha.getResponse(widgetRef.current);
        }
        return undefined;
      },
      reset: (): void => {
        if (widgetRef.current !== undefined && (window as any).grecaptcha) {
          try {
            (window as any).grecaptcha.reset(widgetRef.current);
          } catch (error) {
            logger.error('reCAPTCHA reset error', { error });
          }
        }
      },
    }),
    []
  );

  return (
    <Stack
      ref={containerRef}
      sx={{
        width: '100%',
        div: {
          margin: '0 auto',
        },
      }}
    />
  );
});

Grepcaptcha.displayName = 'Grepcaptcha';

export { Grepcaptcha, GrepcaptchaRef };
