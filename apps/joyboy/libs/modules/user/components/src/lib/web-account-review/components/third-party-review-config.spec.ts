import { getThirdPartyReviewConfig } from './third-party-review-config';

describe('getThirdPartyReviewConfig', () => {
  describe('AU market 50/50 split', () => {
    it('primary variant redirects to Google Maps', () => {
      const config = getThirdPartyReviewConfig('AU', 'primary');
      expect(config.website).toBe('Google');
      expect(config.redirectUrl).toBe('https://maps.app.goo.gl/Gt6DbJSWMR8x6KjP8');
    });

    it('secondary variant redirects to ProductReview', () => {
      const config = getThirdPartyReviewConfig('AU', 'secondary');
      expect(config.website).toBe('ProductReview');
      expect(config.redirectUrl).toBe('https://www.productreview.com.au/listings/castlery/write-review');
    });

    it('defaults to primary (Google Maps) when variant is omitted', () => {
      const config = getThirdPartyReviewConfig('AU');
      expect(config.website).toBe('Google');
    });
  });

  describe('non-AU markets', () => {
    it.each(['US', 'SG', 'CA', 'UK'])('returns Trustpilot for %s regardless of variant', (country) => {
      expect(getThirdPartyReviewConfig(country, 'primary').website).toBe('Trustpilot');
      expect(getThirdPartyReviewConfig(country, 'secondary').website).toBe('Trustpilot');
    });
  });
});
