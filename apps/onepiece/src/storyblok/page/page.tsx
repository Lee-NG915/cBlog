import React, { useEffect } from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { Container, Stack } from '@castlery/fortress';
import Helmet from 'components/Helmet';
import Breadcrumbs from 'components/Breadcrumbs';
import { getPageByUrl } from 'pages';
import PropTypes from 'prop-types';
import { EVENT_SUBMIT_FORM } from 'utils/track/constants';
import { useDispatch } from 'react-redux';

export type PageProps = {
  blok: {
    _uid?: string;
    meta?: Array<{
      title?: string;
      description?: string;
      keywords?: string;
    }>;
    breadcrumb?: string;
    body?: Array<{
      _uid: string;
    }>;
  };
};
type ContextProps = {
  router: any;
};

const Page = ({ blok }: PageProps, { router }: ContextProps) => {
  const { _uid, meta, breadcrumb, body } = blok;
  const { title, description, keywords } = meta?.[0] || {};
  const page = getPageByUrl(router.location.pathname) || {};
  const { url } = page || {};
  const dispatch = useDispatch();

  const trackKlaviyoForm = (e: any) => {
    const { type: eventType, metaData } = e?.detail || {};

    // This event fires when each step is submitted, and can fire multiple times per form
    if (eventType === 'stepSubmit') {
      const { $email: email, $phone_number: phone } = metaData || {};

      dispatch({
        type: EVENT_SUBMIT_FORM,
        result: {
          label: email,
          position: phone,
        },
      });
    }
  };

  useEffect(() => {
    // docs: https://developers.klaviyo.com/en/v1-2/docs/track-klaviyo-form-activity-using-javascript
    window.addEventListener('klaviyoForms', trackKlaviyoForm);

    return () => {
      window.removeEventListener('klaviyoForms', trackKlaviyoForm);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container disableGutters>
      <Stack {...storyblokEditable(blok)} key={_uid} className="container-fluid">
        <Helmet
          path={url}
          page={{
            metaTitle: title,
            metaDescription: description,
            metaKeywords: keywords,
          }}
        />
        {breadcrumb && <Breadcrumbs customBreadcrumbs={[{ name: breadcrumb }]} />}

        {body ? body.map((nestedBlok) => <StoryblokComponent blok={nestedBlok} key={nestedBlok._uid} />) : null}
      </Stack>
    </Container>
  );
};

Page.contextTypes = {
  router: PropTypes.object,
};

export { Page };
