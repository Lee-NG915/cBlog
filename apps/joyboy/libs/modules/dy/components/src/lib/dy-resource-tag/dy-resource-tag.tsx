'use client';
import Script from 'next/script';
import { Fragment } from 'react';
import { type RecommendationContext } from '@castlery/modules-dy-domain';
import { DyPreloadResources } from './dy-resource';
import { EcEnv } from '@castlery/config';

export interface DYResourceTagProps {
  /**
   * https://dy.dev/docs/page-context#page-context-for-e-commerce
   */
  recommendationContext: RecommendationContext;
}
/**
 * @description Add the Dynamic Yield scripts to the tag of your site, on any page you want to include in your personalization program.
 * After the scripts are implemented, your visitor activity is tracked, and Dynamic Yield campaigns can be served on your site.
 * @doc https://dy.dev/docs/implement-script
 * @see execution-flow https://dy.dev/docs/implement-script#execution-flow
 * @see data-collection-process https://dy.dev/docs/implement-script#data-collection-process
 * @see validating-your-script-implementation https://dy.dev/docs/validate-web
 */
export const DYResourceTag = ({ recommendationContext }: { recommendationContext: RecommendationContext }) => {
  const NEXT_PUBLIC_DY_ACCOUNT_ID = EcEnv.NEXT_PUBLIC_DY_ACCOUNT_ID;
  return (
    <Fragment>
      <DyPreloadResources />
      {/* ========================================= Inline Script ======================================== */}
      {/* https://dy.dev/docs/code-context */}
      <Script type="text/javascript" strategy="beforeInteractive">
        {`
          window.DY = window.DY || {};
          DY.recommendationContext = ${JSON.stringify(recommendationContext)};
        `}
      </Script>
      {/* ========================================= Scripts ======================================== */}
      {/* Dynamic Yield injects scripts inside your website only within the body tag. Any element placed outside of it would violate the HTML doc definition and could result in unexpected behavior across browsers. */}
      {/* Avoid configuring scripts to run asynchronously. reference https://dy.dev/docs/implement-script#best-practices */}
      {/* What do these scripts do? reference https://dy.dev/docs/implement-script#experiment-scripts */}
      {/* Implementing api_static and api_dynamic on the page will render the campaigns on your site. */}
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src={`https://cdn.dynamicyield.com/api/${NEXT_PUBLIC_DY_ACCOUNT_ID}/api_dynamic.js`}
      />
      <Script
        type="text/javascript"
        strategy="beforeInteractive"
        src={`https://cdn.dynamicyield.com/api/${NEXT_PUBLIC_DY_ACCOUNT_ID}/api_static.js`}
      />
    </Fragment>
  );
};
