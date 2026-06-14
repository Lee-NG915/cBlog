import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StoryblokComponent } from '@storyblok/react';
import { wrapPage } from 'utils/page';
import { getPageByUrl, getUrl } from 'pages';
import PropTypes from 'prop-types';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadStoryblokBlogPage } from 'redux/modules/storyblokBlogPage';
import { NotFoundWithoutWrapPage } from 'containers/NotFound';
import Script from 'components/Script';
import { isProd } from 'config';
import { startStoryblok } from 'containers/Storyblok/setup';
import Helmet from 'components/Helmet';
import { useBreakpoints } from '@castlery/fortress/hooks';
import Breadcrumbs from 'components/Breadcrumbs';
import LazyLoad from 'react-lazyload';
import YotpoScript from 'components/Yotpo';
import BlogRecommendation from './components/BlogRecommendation';

const StoryblokBlogPage = (props, { router }) => {
  const page = getPageByUrl(router.location.pathname) || {};
  const { key } = page || {};
  const { desktop } = useBreakpoints();
  const { data: story, helmetData, hasYotpoTemplate } = useSelector((state) => state.storyblokBlogPage?.[key]) || {};
  const [content, setContent] = useState(null);
  const facebook = `https://www.facebook.com/Castlery${__COUNTRY__}`;

  useEffect(() => {
    if (story) {
      setContent(story.content);
    }
  }, [story]);

  useEffect(() => {
    startStoryblok();

    // Initialize the Storyblok JS Bridge
    const { StoryblokBridge, location } = window;
    if (StoryblokBridge) {
      const storyblokInstance = new StoryblokBridge();
      storyblokInstance.on(['published', 'change'], (event) => {
        if (!event.slugChanged) {
          // reload page if save or publish is clicked
          location.reload(true);
        }
      });
      storyblokInstance.on('input', (event) => {
        // Access currently changed but not yet saved content via:
        if (event?.story?.content) {
          setContent(event.story.content);
        }
      });
    }
  }, []);

  if (!story.content) {
    return <NotFoundWithoutWrapPage location={router.location} />;
  }

  return (
    <>
      {!isProd && <Script strategy="beforeInteractive" src="//app.storyblok.com/f/storyblok-v2-latest.js" async />}
      {helmetData && (
        <Helmet
          path={helmetData?.pathname}
          page={{
            title: helmetData?.title,
            metaTitle: helmetData?.metaTitle,
            description: helmetData?.description,
            keywords: helmetData?.keywords,
            image: helmetData?.image,
          }}
          largeImagePreview
          jsonLd={[
            `
            {
              "@context": "http://schema.org",
              "@type": "Article",
              "publisher": {
                "@type": "Organization",
                "name": "Castlery",
                "logo": {
                  "@type": "ImageObject",
                  "width": 233,
                  "height": 60,
                  "url": "${
                    'https://res.cloudinary.com/castlery/image/upload/h_60,f_auto,q_auto/' +
                    'v1539080052/static/logo-b625f9aec86cac711ef4e9e92b6989d4.png'
                  }"
                }
              },
              "author": {
                "@type": "Person",
                "name": "${helmetData?.name}",
                "url": "${__BASE_URL__}"
              },
              "headline": "${helmetData?.title}",
              "url": "${__BASE_URL__}/blog/${helmetData?.pathname}",
              "datePublished": "${helmetData?.published_time}",
              "dateModified": "${helmetData?.modified_time}",
              "image": {
                "@type": "ImageObject",
                "url": "${helmetData?.image}",
                "width": 1080,
                "height": 720
              },
              "thumbnailUrl": "${helmetData?.image}",
              "keywords": "${helmetData?.keywords}",
              "description": "${helmetData?.description}",
              "mainEntityOfPage": "${__BASE_URL__}/blog/${helmetData?.pathname}"
            }
          `,
          ]}
        >
          <meta property="og:image:width" content="1080" />
          <meta property="og:image:height" content="720" />
          <meta property="article:published_time" content={helmetData?.published_time} />
          <meta property="article:modified_time" content={helmetData?.modified_time} />
          <meta property="article:publisher" content={facebook} />
          <meta property="article:author" content={facebook} />
        </Helmet>
      )}
      <Breadcrumbs
        location=""
        showHome={desktop}
        customBreadcrumbs={[{ customUrl: getUrl('blog'), name: 'Blog' }, { name: helmetData?.title }]}
      />
      {hasYotpoTemplate && <YotpoScript />}
      <StoryblokComponent blok={content || story.content} />
      <LazyLoad offset={300} once>
        <BlogRecommendation selector="Blog Rec on Blog Page - API" />
      </LazyLoad>
    </>
  );
};

StoryblokBlogPage.contextTypes = {
  router: PropTypes.object,
};

export default asyncLoad([
  ({ location, store: { dispatch } }) => {
    const page = getPageByUrl(location.pathname) || {};
    return dispatch(loadStoryblokBlogPage(page.key));
  },
])(wrapPage({ hideBreadcrumbs: true })(StoryblokBlogPage));
