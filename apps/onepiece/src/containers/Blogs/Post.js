import React from 'react';
import PropTypes from 'prop-types';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadPost } from 'redux/modules/post';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Helmet from 'components/Helmet';
import { connect } from 'react-redux';
import Bem from 'utils/bem';
import { formatDate, getDate } from 'utils/time';
import showdown from 'showdown';
import { getUrl } from 'pages';
import { join } from 'utils/path';
import Breadcrumbs from 'components/Breadcrumbs';

import { cloudinaryRoot } from 'config';
import { Container } from '@castlery/fortress';
import { withUseBreakpoints } from 'utils/page';
// import { campaignNames, load as dyApiData } from 'redux/modules/dyApiData';
// import { StoryblokComponent } from '@storyblok/react';
import style from './style.scss';
import CoverList from './CoverList';

@asyncLoad([({ params, store: { dispatch } }) => dispatch(loadPost(params.slug))])
@connect((state, params) => ({
  post: state.post[params.params.slug],
}))
@withUseBreakpoints
export default class Post extends React.Component {
  static propTypes = {
    post: PropTypes.object,
    location: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  render() {
    const { post, location, breakpoints = {} } = this.props;

    const { pathname } = location;
    const { desktop } = breakpoints;
    const block = new Bem(style.post);

    if (!post) {
      this.context.router.replace(getUrl('blog'));
      return null;
    }

    let content;
    if (!desktop) {
      content = new showdown.Converter().makeHtml(
        post.content.replace(
          /https:\/\/res.cloudinary.com\/castlery\/image\/upload(\/?v.*?)?\/(.*)(\.jpg)/gi,
          (match, p1, p2, p3) => {
            if (p1) {
              return match.replace(p1, `/w_1200,f_auto,q_auto${p1}`);
            }
            if (p2) {
              return match.replace(p2, `w_1200,f_auto,q_auto/${p2}`).replace(p3, '_mobile.jpg');
            }
          }
        )
      );
    } else {
      content = new showdown.Converter().makeHtml(
        post.content.replace(new RegExp(cloudinaryRoot, 'ig'), `${cloudinaryRoot}/w_1800,f_auto,q_auto`)
      );
    }

    const published_time = getDate(post.published_at).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const modified_time = getDate(post.updated_at).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    const facebook = `https://www.facebook.com/Castlery${__COUNTRY__}`;

    return (
      <>
        <Helmet
          path={pathname}
          page={{
            title: post.title,
            metaTitle: post.meta_title,
            description: post.description,
            keywords: post.keywords,
            image: post.cover,
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
                "name": "${post.author}",
                "url": "${__BASE_URL__}"
              },
              "headline": "${post.title}",
              "url": "${join(__BASE_URL__, pathname)}",
              "datePublished": "${published_time}",
              "dateModified": "${modified_time}",
              "image": {
                "@type": "ImageObject",
                "url": "${post.cover}",
                "width": 1080,
                "height": 720
              },
              "thumbnailUrl": "${post.cover}",
              "keywords": "${post.keywords}",
              "description": "${post.description}",
              "mainEntityOfPage": "${join(__BASE_URL__, pathname)}"
            }
          `,
          ]}
        >
          <meta property="og:image:width" content="1080" />
          <meta property="og:image:height" content="720" />
          <meta property="article:published_time" content={published_time} />
          <meta property="article:modified_time" content={modified_time} />
          <meta property="article:publisher" content={facebook} />
          <meta property="article:author" content={facebook} />
        </Helmet>
        <Header />

        <Breadcrumbs
          location={location}
          showHome={desktop}
          customBreadcrumbs={[{ customUrl: getUrl('blog'), name: 'Blog' }, { name: post.title }]}
        />

        <div className={block}>
          <Container fixed>
            <h1>{post.title}</h1>
            <p className={block.elm('sub')}>
              {post.author}&nbsp;&nbsp; | &nbsp;&nbsp;
              {formatDate(post.published_at)}
            </p>
            <div
              className={block.elm('content')}
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />

            {post.related_blogs && post.related_blogs.length > 0 && (
              <div className={block.elm('related')}>
                <h3>Related Stories</h3>
                <CoverList blogs={post.related_blogs} />
              </div>
            )}
          </Container>
        </div>

        <Footer />
      </>
    );
  }
}
