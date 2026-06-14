import React from 'react';

import modernRegular from 'sass/fonts/minervaModern-regular.woff2';
import poppinsRegular from 'sass/fonts/poppins-regular.woff2';
import poppinsMedium from 'sass/fonts/poppins-medium.woff2';
import poppinsBold from 'sass/fonts/poppins-bold.woff2';
import { globalFeatureInAU, globalFeatureInSG, globalFeatureInUS, globalFeatureInUK, globalFeatureInCA } from 'config';

export default function CommonHead() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
      />
      {/* Make the web app full screen */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Apple Smart banner */}
      {/* <meta name="apple-itunes-app" content="app-id=1301722222" /> */}

      {/* Show the git version number of the current vesion */}
      {__APP_VERSION__ && <meta name="git-version" content={__APP_VERSION__} />}
      {/* https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs */}
      <link rel="icon" href="/static/favicon/favicon.ico" sizes="any" />
      <link rel="icon" href="/static/favicon/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/static/favicon/apple-touch-icon.png" />
      <link rel="manifest" href="/static/favicon/manifest.json" />

      {[modernRegular, poppinsRegular, poppinsMedium, poppinsBold].map((href, index) => (
        <link key={index} rel="preload" as="font" href={href} type="font/woff2" crossOrigin="anonymous" />
      ))}

      {globalFeatureInAU && (
        <meta name="trustpilot-one-time-domain-verification-id" content="pBUKKYG9iiPD8ghn5rL6qC88hTmphTNxmiZOzFDP" />
      )}

      {/* pinterest verify */}
      {globalFeatureInSG && <meta name="p:domain_verify" content="80f21e8b789ba850d24ffdb7f19158c4" />}
      {globalFeatureInAU && <meta name="p:domain_verify" content="d4db3f5dad476bd592d5b940b07bed3d" />}
      {globalFeatureInUS && <meta name="p:domain_verify" content="95104ca2f6cfd48ce176988ea0dd0421" />}
      {globalFeatureInUK && <meta name="p:domain_verify" content="1725524f07bc88cef69df31f0e79e101" />}
      {globalFeatureInCA && <meta name="p:domain_verify" content="615a5bd67fa5a1373ec881839383c255" />}
      <meta property="fb:app_id" content={__FACEBOOK_CLIENT_ID__} />
      <meta property="og:site_name" content="Castlery" />
      <meta property="og:type" content="website" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    </>
  );
}
