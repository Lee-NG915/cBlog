'use client';
import { sharedFeatureService } from '@castlery/shared-services';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import Script from 'next/script';

export interface MulberryManagerProps {
  loadSuccess?: () => void;
}

export function MulberryManager({ loadSuccess }: MulberryManagerProps) {
  const isMulberryEnabled = sharedFeatureService.isMulberryEnabled();
  // const mulberryPayload = sharedFeatureService.getMulberryPayload();

  if (!isMulberryEnabled) {
    return null;
  }

  const onLoad = async () => {
    try {
      // https://docs.getmulberry.com/docs/integrating-with-bigcommerce
      if (!EcEnv.NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN) {
        throw Error('[MulberryManager]:mulberry init failed, missing public token');
      }

      // Check if mulberry SDK is loaded properly
      if (!window.mulberry || !window.mulberry.core) {
        logger.warn('[MulberryManager]: Mulberry SDK not loaded properly');
        return;
      }

      await window.mulberry.core.init({
        publicToken: EcEnv.NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN,
      });

      logger.info('mulberry init success');
      loadSuccess && loadSuccess();
    } catch (error) {
      // Gracefully handle initialization errors
      logger.error('[MulberryManager]: Failed to initialize Mulberry SDK', error as object);
      // Don't throw - allow the page to continue loading even if Mulberry fails
    }
  };

  const onError = (error: Error) => {
    logger.error('[MulberryManager]: Failed to load Mulberry SDK script', error);
  };

  return (
    <>
      {EcEnv.NEXT_PUBLIC_MULBERRY_SDK && (
        <Script
          src={EcEnv.NEXT_PUBLIC_MULBERRY_SDK}
          onLoad={onLoad}
          onError={onError}
          onReady={() => {
            loadSuccess && loadSuccess();
          }}
          // TODO 待aaby确认是否可以使用lazyOnload
          // strategy="lazyOnload"
        />
      )}
    </>
  );
}

export default MulberryManager;
