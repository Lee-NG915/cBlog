import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import PageHeader from 'components/PageHeader';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { renderImage } from 'utils/image';

import { wrapPage } from 'utils/page';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';

import { Container } from '@castlery/fortress';
import style from './style.scss';

const Press = () => {
  const press = useSelector(
    (state) => state.marketing?.[`${__COUNTRY__.toLocaleLowerCase()}/general-content/other-pages/press`]
  );

  const {
    title,
    intro,
    banner,
    banner_mobile,
    footer_banner,
    footer_banner_mobile,
    footer_title,
    footer_intro,
    footer_action_text,
    footer_action_link,
    press_items,
  } = press.data.story.content;

  return (
    <div className={style.press}>
      <div className={`${style.press}__wrapper`}>
        <Container>
          <PageHeader
            className={`${style.press}__banner`}
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: banner_mobile,
                loader: { ratio: 0.8133 },
              },
              {
                breakpoint: 'lg',
                srcset: banner,
                loader: { ratio: 0.3125 },
              },
            ]}
            lazy={false}
            title={title}
            mainTitle={title}
            mainIntro="Find the latest buzz on Castlery with a curated selection of articles and features from top publications."
            subTitle="Media enquiries and collaborations"
            subIntro={intro}
            showMask
          />

          <Container maxWidth="md" className={`${style.press}__container`}>
            <div className={`${style.press}__items`}>
              {press_items.map((press) => (
                <div key={press._uid} className={`${style.press}__item`}>
                  <img src={press.press_logo} alt={press.press_name} className={`${style.press}__item__left`} />
                  <div className={`${style.press}__item__right`}>
                    <h3>{press.title}</h3>
                    <div>{press.quote}</div>
                    <a href={press.action_link} target="_blank">
                      {press.action_text}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className={`${style.press}__reviews`}>
              {footer_banner && footer_title && (
                <div className={`${style.press}__reviews-image`}>
                  {renderImage(footer_banner, 0.625, 0.5, { alt: footer_title })}
                </div>
              )}
              {footer_banner_mobile && footer_intro && footer_action_text && footer_title && footer_action_link && (
                <div className={`${style.press}__reviews-content`}>
                  <div className={`${style.press}__reviews-mobile-image`}>
                    {renderImage(footer_banner_mobile, 0.688, 1, { alt: footer_title })}
                  </div>
                  <h3 className={`${style.press}__reviews-title`}>{footer_title}</h3>
                  <div className={`${style.press}__reviews-detail`}>{footer_intro}</div>
                  <div className={`${style.press}__reviews-action`}>
                    <Link to={footer_action_link}>{footer_action_text}</Link>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </Container>
      </div>
    </div>
  );
};

Press.contextTypes = {
  frame: PropTypes.object,
};

export default asyncLoad([
  ({ store: { dispatch } }) =>
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/other-pages/press`)),
])(wrapPage()(Press));
