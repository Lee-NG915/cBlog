export type ThirdPartyReviewVariant = 'primary' | 'secondary';

export interface ThirdPartyReviewConfig {
  website: string;
  redirectUrl: string;
  promptText: string;
  /** GA 埋点 label：Google / Trustpilot / product_review */
  trackingLabel: string;
}

/**
 * 根据国家与分流变体返回第三方评价跳转配置。
 *
 * AU 市场做 50/50 分流（由调用方决定具体变体）：
 * - primary   -> Google Maps
 * - secondary -> ProductReview
 *
 * 其他市场固定跳转 Trustpilot。
 */
export function getThirdPartyReviewConfig(
  country: string | undefined,
  variant: ThirdPartyReviewVariant = 'primary'
): ThirdPartyReviewConfig {
  if (country === 'AU') {
    if (variant === 'secondary') {
      return {
        website: 'ProductReview',
        redirectUrl: 'https://www.productreview.com.au/listings/castlery/write-review',
        promptText: 'Share your experience on Product Review? You’ll be redirected ',
        trackingLabel: 'product_review',
      };
    }

    return {
      website: 'Google',
      redirectUrl: 'https://g.page/r/CST_Qb_F1CgyEAE/review',
      promptText: 'Share your experience on Google? You’ll be redirected in ',
      trackingLabel: 'Google',
    };
  }

  return {
    website: 'Trustpilot',
    redirectUrl: 'https://www.trustpilot.com/evaluate/www.castlery.com',
    promptText: 'Share your experience on Trustpilot? You’ll be redirected in ',
    trackingLabel: 'Trustpilot',
  };
}
