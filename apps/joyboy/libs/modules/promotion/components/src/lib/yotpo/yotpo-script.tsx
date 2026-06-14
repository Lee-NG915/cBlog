'use client';

import { EcEnv } from '@castlery/config';
import type { User } from '@castlery/types';
import Script from 'next/script';
import { FC, useState, useEffect } from 'react';
import { logger } from '@castlery/observability/client';

interface YotpoScriptProps {
  getApi?: boolean;
  user: User | null;
}

export const YotpoScript: FC<YotpoScriptProps> = ({ getApi = false, user }) => {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const generateToken = async () => {
      if (!user?.email || !EcEnv.NEXT_PUBLIC_YOTPO_API_KEY) {
        setToken('');
        return;
      }

      try {
        // 使用 Web Crypto API 生成 SHA-256 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(user.email.toLowerCase() + EcEnv.NEXT_PUBLIC_YOTPO_API_KEY);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        setToken(hashHex);
      } catch (error) {
        logger.error('Failed to generate Yotpo token', { error, userId: user.id });
        setToken('');
      }
    };

    generateToken();
  }, [user?.email]);

  // Add error handler to catch Yotpo initialization errors
  useEffect(() => {
    const handleYotpoError = (event: ErrorEvent) => {
      // Check if the error is from Yotpo widget code
      const isYotpoError =
        event.message?.includes('trackShown') ||
        event.filename?.includes('yotpo.com') ||
        event.filename?.includes('widget-referral-widget');

      if (isYotpoError) {
        // Prevent the error from propagating to Sentry
        event.preventDefault();
        event.stopImmediatePropagation();

        logger.warn('Caught Yotpo initialization error - widget may not be fully loaded', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });

        return false;
      }
    };

    window.addEventListener('error', handleYotpoError, true);

    return () => {
      window.removeEventListener('error', handleYotpoError, true);
    };
  }, []);

  if (!EcEnv.NEXT_PUBLIC_YOTPO_ENABLED || !EcEnv.NEXT_PUBLIC_YOTPO_GUID) {
    return null;
  }

  return (
    <>
      {user?.id && user?.email && (
        <div
          id="swell-customer-identification"
          data-authenticated="true"
          data-email={user.email}
          data-id={user.id}
          data-tags='["wholesale"]'
          style={{ display: 'none' }}
          data-token={token}
        />
      )}
      {getApi ? (
        <Script
          id="yotpo-api-script"
          src={`https://cdn-loyalty.yotpo.com/loader/${EcEnv.NEXT_PUBLIC_YOTPO_GUID}.js`}
          strategy="afterInteractive"
          async
        />
      ) : (
        <Script
          id="yotpo-widget-script"
          src={`https://cdn-widgetsrepository.yotpo.com/v1/loader/${EcEnv.NEXT_PUBLIC_YOTPO_GUID}`}
          async
          onReady={() => {
            // 延迟初始化，确保 DOM 已准备好
            let retryCount = 0;
            const MAX_RETRIES = 50; // 最多重试 50 次（约 5 秒）

            const initializeWidgets = () => {
              try {
                // 检查 Yotpo API 和容器是否都已准备好
                const hasWidgetContainers =
                  document.querySelector('[data-yotpo-widget-id]') !== null ||
                  document.querySelector('[data-yotpo-instance-id]') !== null ||
                  document.querySelector('.yotpo-widget-instance') !== null;

                const isYotpoReady =
                  window?.yotpoWidgetsContainer?.initWidgets &&
                  typeof window.yotpoWidgetsContainer.initWidgets === 'function';

                if (isYotpoReady && (hasWidgetContainers || document.readyState === 'complete')) {
                  // 确保在调用前 API 完全可用
                  window.yotpoWidgetsContainer?.initWidgets?.();
                } else if (retryCount < MAX_RETRIES) {
                  // 如果容器或 API 还不存在，延迟重试
                  retryCount++;
                  setTimeout(initializeWidgets, 100);
                } else {
                  logger.warn('Yotpo widgets initialization timeout after max retries', {
                    hasWidgetContainers,
                    isYotpoReady,
                  });
                }
              } catch (error) {
                logger.error('Failed to initialize Yotpo widgets', { error, retryCount });
              }
            };

            // 使用 requestAnimationFrame 确保在下一帧执行
            requestAnimationFrame(() => {
              setTimeout(initializeWidgets, 200);
            });
          }}
        />
      )}
    </>
  );
};
