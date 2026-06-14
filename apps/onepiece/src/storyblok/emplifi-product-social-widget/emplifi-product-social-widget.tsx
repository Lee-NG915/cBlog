import Script from 'components/Script';
import { Box } from '@castlery/fortress';
import React from 'react';
import config from 'config';

type EmplifiProductSocialWidgetProps = {
  blok: {
    widgetId?: string;
    widget_id?: string;
  };
};

const EmplifiProductSocialWidget = ({ blok }: EmplifiProductSocialWidgetProps) => {
  const { widgetId, widget_id } = blok;
  return (
    <Box
      sx={{
        marginBottom: '32px',
      }}
    >
      {(widgetId || widget_id) && (
        <Script
          {...(config.enabledConsentBlocked && {
            ...config.cookieYesConsentAdsAttribute,
          })}
          src="https://assets.pxlecdn.com/assets/pixlee_widget_1_0_0.js"
          id="emplifi-init-script"
          async
          onReady={() => {
            if (window) {
              window.PixleeAsyncInit = function () {
                Pixlee.init({ apiKey: __PIXLEE_API_KEY__ });
                Pixlee.addSimpleWidget({
                  widgetId: Number(widgetId || widget_id),
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
  );
};

export { EmplifiProductSocialWidget };
