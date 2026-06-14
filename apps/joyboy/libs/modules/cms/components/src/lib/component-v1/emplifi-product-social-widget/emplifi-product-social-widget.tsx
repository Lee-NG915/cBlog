'use client';

import React from 'react';
import { Box } from '@castlery/fortress';
import Script from 'next/script';
import { DtStack } from '@castlery/modules-tracking-components';

type EmplifiProductSocialWidgetProps = {
  blok: {
    _uid: string;
    widgetId: string;
  };
};

const EmplifiProductSocialWidget = ({ blok }: EmplifiProductSocialWidgetProps) => {
  const { widgetId, _uid } = blok;
  return (
    <DtStack useImpression uid={_uid} componentName="emplifi-product-social-widget">
      <Box
        sx={{
          marginBottom: '32px',
        }}
      >
        {widgetId && (
          <Script
            src="https://assets.pxlecdn.com/assets/pixlee_widget_1_0_0.js"
            id="emplifi-init-script"
            async
            onReady={() => {
              if (window) {
                window.PixleeAsyncInit = function () {
                  Pixlee.init({ apiKey: 'gIPSbo6fXCThh8oaruf2' });
                  Pixlee.addSimpleWidget({
                    widgetId: Number(widgetId),
                    setMetaTags: true,
                    subscribedEvents: [
                      'widgetLoaded',
                      'photoOpened',
                      'photoClosed',
                      'photoChanged',
                      'ctaClicked',
                      'widgetNumPhotos',
                      'widgetLoadMore',
                      'widgetNavigated',
                      'uploaderOpened',
                      'uploadComplete',
                      'socialShare',
                      'widgetHidden',
                    ],
                  });
                };
                if (window.PixleeAsyncInit) {
                  window.setTimeout(() => {
                    window.PixleeAsyncInit();
                    const pixleeContainer = document.querySelector('#pixlee_container');
                    if (pixleeContainer && pixleeContainer.firstElementChild) {
                      Pixlee.resizeWidget();
                    }
                  }, 100);
                }
              }
            }}
          />
        )}
        <div id="pixlee_container" />
      </Box>
    </DtStack>
  );
};

export { EmplifiProductSocialWidget };
