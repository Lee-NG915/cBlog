'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { EcEnv } from '@castlery/config';

type GcrOptInStyle = 'CENTER_DIALOG' | 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'TOP_RIGHT' | 'TOP_LEFT' | 'BOTTOM_TRAY';

interface GoogleCustomerReviewsProps {
  orderId: string;
  email: string;
  deliveryCountry: string;
  estimatedDeliveryDate: string | null;
  gcrOptInStyle?: GcrOptInStyle;
}

declare global {
  interface Window {
    renderOptIn?: () => void;
    gapi?: {
      load?: (module: string, callback: () => void) => void;
      surveyoptin?: {
        render: (options: {
          merchant_id: string;
          order_id: string;
          email: string;
          delivery_country: string;
          estimated_delivery_date: string;
          opt_in_style: GcrOptInStyle;
        }) => void;
      };
    };
  }
}

export function GoogleCustomerReviews({
  orderId,
  email,
  deliveryCountry,
  estimatedDeliveryDate,
  gcrOptInStyle = 'BOTTOM_TRAY',
}: GoogleCustomerReviewsProps) {
  const merchantId = EcEnv.NEXT_PUBLIC_GOOGLE_MERCHANT_ID;
  const canRender = !!(merchantId && orderId && email && deliveryCountry && estimatedDeliveryDate);

  // Register window.renderOptIn BEFORE platform.js loads.
  // Google's ?onload=renderOptIn calls this when GAPI is fully initialized,
  // which is more reliable than Next.js onLoad (fires on script download complete).
  useEffect(() => {
    if (!canRender) return;

    window.renderOptIn = () => {
      console.log('renderOptIn called');
      window.gapi?.load?.('surveyoptin', () => {
        window.gapi?.surveyoptin?.render({
          merchant_id: merchantId!,
          order_id: orderId,
          email,
          delivery_country: deliveryCountry,
          estimated_delivery_date: estimatedDeliveryDate!,
          opt_in_style: gcrOptInStyle,
        });
      });
    };

    // If script was cached and gapi already available, trigger immediately
    if (window.gapi?.load) {
      window.renderOptIn();
    }
  }, [canRender, merchantId, orderId, email, deliveryCountry, estimatedDeliveryDate, gcrOptInStyle]);

  if (!canRender) return null;

  return <Script src="https://apis.google.com/js/platform.js?onload=renderOptIn" strategy="afterInteractive" />;
}
