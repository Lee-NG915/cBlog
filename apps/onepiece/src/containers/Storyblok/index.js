import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StoryblokComponent } from '@storyblok/react';
import { wrapPage } from 'utils/page';
import { getPageByUrl } from 'pages';
import PropTypes from 'prop-types';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadStoryblokPage } from 'redux/modules/storyblokPage';
import { NotFoundWithoutWrapPage } from 'containers/NotFound';
import Script from 'components/Script';
import { isProd } from 'config';
import Helmet from 'components/Helmet';
import YotpoScript from 'components/Yotpo';
import { startStoryblok } from './setup';
import BirthdayModal from './BirthdayModal';

const StoryblokPage = (props, { router }) => {
  const page = getPageByUrl(router.location.pathname) || {};
  const { key } = page || {};
  const {
    data: story,
    helmetData,
    notIndexable,
    hasYotpoTemplate,
  } = useSelector((state) => state.storyblokPage?.[key]) || {};
  const [content, setContent] = useState(null);

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

  if (!story?.content || (notIndexable && page?.url !== '/announcement')) {
    return <NotFoundWithoutWrapPage location={router.location} />;
  }

  return (
    <>
      {!isProd && <Script strategy="beforeInteractive" src="//app.storyblok.com/f/storyblok-v2-latest.js" async />}
      {helmetData && (
        <Helmet
          path={router.location.pathname}
          page={{
            title: helmetData.title,
            description: helmetData.description,
            keywords: helmetData.keywords,
          }}
          jsonLd={[helmetData.structure_data]}
        />
      )}

      <BirthdayModal router={router} />

      {hasYotpoTemplate && <YotpoScript />}

      <StoryblokComponent blok={content || story.content} />
    </>
  );
};

StoryblokPage.contextTypes = {
  router: PropTypes.object,
};

export default asyncLoad([
  ({ location, store: { dispatch } }) => {
    const page = getPageByUrl(location.pathname) || {};
    return dispatch(loadStoryblokPage(page.key));
  },
])(wrapPage({ hideBreadcrumbs: true })(StoryblokPage));
