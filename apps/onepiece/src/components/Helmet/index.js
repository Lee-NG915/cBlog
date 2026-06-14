/*= =====================*\
pass only 'path' if the page is configed in pages.js.
otherwise pass 'page' config as an additional parameter.
\*====================== */

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { getPageByUrl } from 'pages';
import { join } from 'utils/path';
import lang from 'utils/lang';
import { useBreakpoints } from '@castlery/fortress';
import { processUrl } from 'components/ReactPicture/utils';
import defaultImage from './castlery.jpg';

const ReactHelmet = (props) => {
  // eslint-disable-next-line prefer-const
  let { path, page, jsonLd, children, largeImagePreview, preloadImgs, preloadVideo } = props;

  const { desktop } = useBreakpoints();

  const widthsArr = !desktop ? [640, 960, 1280, 1440, 1920] : [960, 1280, 1440, 1920, 2880];

  const preloadImgsWithWidth = [];

  if (preloadImgs && Array.isArray(preloadImgs) && preloadImgs.length > 0) {
    preloadImgs.forEach((img) => {
      if (img && img.length > 0) {
        widthsArr.forEach((width) => {
          const imgWithWidth = processUrl(img, width, false);
          preloadImgsWithWidth.push(imgWithWidth);
        });
      }
    });
  }

  const preloadVideoWithWidth = [];

  if (preloadVideo && Array.isArray(preloadVideo) && preloadVideo.length > 0) {
    preloadVideo.forEach((video) => {
      const decorateVideo = `https://res.cloudinary.com/castlery/video/upload/f_auto,q_auto,w_${
        desktop ? '1920' : '1280'
      },ac_none,c_fill/${video}.mp4`;
      preloadVideoWithWidth.push(decorateVideo);
    });
  }

  if (path || page || jsonLd) {
    page = { ...getPageByUrl(path), ...page };

    // determine keywords
    const defaultKeywords = lang.t('common.keywords');

    const keywords = page.metaKeywords || defaultKeywords;
    const title = page.metaTitle || page.title || page.name;
    const description = page.metaDescription || page.description;

    const canonicalHref = join(__BASE_URL__, page.canonicalHref || path);

    return (
      <Helmet>
        <title>{`${title} | Castlery ${
          __COUNTRY__ === 'CA' ? lang.t('common.country_whole_name') : lang.t('common.country')
        }`}</title>
        <link rel="canonical" href={canonicalHref} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={`${title} | Castlery`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={join(__BASE_URL__, path)} />
        <meta property="og:image" content={page.image || defaultImage} />
        {largeImagePreview && <meta name="robots" content="max-image-preview:large" />}
        {page.notIndexed && <meta name="robots" content="noindex" />}
        {preloadImgsWithWidth.map((img, index) => (
          <link key={`preload-img-${index}`} rel="preload" as="image" href={img} />
        ))}
        {preloadVideoWithWidth.map((video, index) => (
          <link key={`preload-video-${index}`} rel="preload" as="video" href={video} />
        ))}
        {jsonLd &&
          jsonLd.length > 0 &&
          jsonLd.map((j, index) => (
            <script key={index} type="application/ld+json">
              {j}
            </script>
          ))}
        {children}
      </Helmet>
    );
  }
  return <Helmet>{children}</Helmet>;
};

ReactHelmet.propTypes = {
  path: PropTypes.string,
  page: PropTypes.object,
  jsonLd: PropTypes.array,
  children: PropTypes.node,
  largeImagePreview: PropTypes.bool,
  preloadImgs: PropTypes.array,
  preloadVideo: PropTypes.array,
};

export default ReactHelmet;
