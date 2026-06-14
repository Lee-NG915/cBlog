import React, { useEffect } from 'react';
import { storyblokEditable, StoryblokComponent } from '@storyblok/react';
import { Container, Stack } from '@castlery/fortress';
import Helmet from 'components/Helmet';
import Breadcrumbs from 'components/Breadcrumbs';
import { getPageByUrl, getUrl } from 'pages';
import PropTypes from 'prop-types';
import { EVENT_PAGE_VIEW, EVENT_SUBMIT_FORM } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import { cloudinaryRoot } from 'config';
import { useBreakpoints } from '@castlery/fortress/hooks';
import { gtmPageNames } from 'utils/track/config';

type SubContentProps = {
  type: string;
  attrs: {
    src: string;
  };
};

type ContentProps = {
  type: string;
  content: SubContentProps[];
};

export type BlogPageProps = {
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
      component: string;
      description?: {
        type: string;
        content: ContentProps[];
      };
    }>;
  };
};
type ContextProps = {
  router: any;
};

const BlogPage = ({ blok }: BlogPageProps, { router }: ContextProps) => {
  const { _uid, meta, breadcrumb, body } = blok;
  // const { desktop } = useBreakpoints();
  // body?.forEach((item) => {
  //   if (item.component === 'text' && item?.description?.type === 'doc') {
  //     item.description.content.forEach((content) => {
  //       if (content.type === 'paragraph') {
  //         content?.content?.forEach((para) => {
  //           if (para.type === 'image') {
  //             if (!desktop) {
  //               const tempImg = para.attrs.src.replace(
  //                 /https:\/\/res.cloudinary.com\/castlery\/image\/upload(\/?v.*?)?\/(.*)(\.jpg)/gi,
  //                 (match, p1, p2, p3) => {
  //                   if (p1) {
  //                     return match.replace(p1, `/w_1200,f_auto,q_auto${p1}`);
  //                   }
  //                   if (p2) {
  //                     return match.replace(p2, `w_1200,f_auto,q_auto/${p2}`);
  //                   }
  //                 }
  //               );
  //               para.attrs.src = tempImg ? tempImg : para.attrs.src;
  //             } else {
  //               para.attrs.src = para.attrs.src.replace(
  //                 new RegExp(cloudinaryRoot, 'ig'),
  //                 `${cloudinaryRoot}/w_1800,f_auto,q_auto`
  //               );
  //             }
  //           }
  //         });
  //       }
  //     });
  //   }
  // });
  const { title, description, keywords } = meta?.[0] || {};
  const page = getPageByUrl(router.location.pathname) || {};
  const { url } = page || {};
  const trackPageView = (result) =>
    dispatch({
      type: EVENT_PAGE_VIEW,
      result,
    });
  useEffect(() => {
    trackPageView({
      pathname: url,
      pageName: gtmPageNames.blogPage,
    });
  }, [title, router.location.pathname]);

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

BlogPage.contextTypes = {
  router: PropTypes.object,
};

export { BlogPage };
