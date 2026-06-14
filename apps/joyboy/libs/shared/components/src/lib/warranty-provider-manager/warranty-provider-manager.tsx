'use client';

import Script from 'next/script';
import { MulberryManager } from '../mulberry-manager/mulberry-manager';
import { initializeGuardsmanWidget } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import { sharedFeatureService } from '@castlery/shared-services';

export interface WarrantyProviderManagerProps {
  loadSuccess?: () => void;
}

export function WarrantyProviderManager({ loadSuccess }: WarrantyProviderManagerProps) {
  const runtimeConfig = sharedFeatureService.getWarrantyRuntimeConfig();

  if (runtimeConfig.provider === 'mulberry') {
    return <MulberryManager loadSuccess={loadSuccess} />;
  }

  if (runtimeConfig.provider !== 'guardsman') {
    return null;
  }

  const initWidget = async () => {
    try {
      const widget = await initializeGuardsmanWidget();
      if (widget) {
        loadSuccess?.();
      }
    } catch (error) {
      logger.error('[WarrantyProviderManager]: Failed to initialize Guardsman widget', error as object);
    }
  };

  return (
    <Script
      id="guardsman-widget-script"
      src="https://cdn-sandbox.prosuro.com/widget.js"
      onReady={() => {
        void initWidget();
      }}
      onError={(error: Error) => {
        logger.error('[WarrantyProviderManager]: Failed to load Guardsman widget script', error as object);
      }}
    />
  );
}

export default WarrantyProviderManager;
