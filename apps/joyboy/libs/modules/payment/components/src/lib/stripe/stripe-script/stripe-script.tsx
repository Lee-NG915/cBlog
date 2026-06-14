import Script from 'next/script';

/**
 * Stripe Script
 * @see https://docs.stripe.com/js/including
 * @note To best leverage Stripe’s advanced fraud functionality, include this script on every page, not just the checkout page. This allows Stripe to detect suspicious behavior that may be indicative of fraud as customers browse your website.
 * @note can also load Stripe.js using the async or defer attribute on the script tag. Note, however, that with asynchronous loading any API calls will have to be made only after the script execution has finished.
 * @returns Stripe Script
 */
export function StripeScript() {
  return (
    <Script src="https://js.stripe.com/clover/stripe.js" strategy="afterInteractive" type="text/javascript"></Script>
  );
}
