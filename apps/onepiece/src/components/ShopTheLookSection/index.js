import React, { useState, useRef } from 'react';
import { GhostArrowBtn } from 'components/Button';
import TheLook from 'containers/ShopTheLook/components/TheLook';
import Slider from 'react-slick';
import { EVENT_SHOP_THE_LOOK } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import ReactSVG from 'components/ReactSVG';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

export default function ShopTheLookSection({ shopTheLookData, textConfig, type }) {
  const { desktop } = useBreakpoints();
  const looks = shopTheLookData || [];
  const isMobile = !desktop;
  const dispatch = useDispatch();
  const sliderRef = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    lazyLoad: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (cur, next) => {
      setSlideIndex(next);
      if (type === 'home') {
        dispatch({
          type: EVENT_SHOP_THE_LOOK,
          result: {
            detailAction: 'room_look_scroll',
            label: looks?.[next]?._uid,
            position: next,
          },
        });
      }
    },
    // eslint-disable-next-line react/no-unstable-nested-components
    appendDots: (dots) => (
      <div>
        <ul>
          {dots}
          {!isMobile && (
            <>
              <div
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => {
                  sliderRef.current.slickPrev();
                }}
              >
                <ReactSVG
                  className="controlBtn"
                  name="leftArrow"
                  onClick={() => {
                    sliderRef.current.slickPrev();
                  }}
                />
              </div>
              <div
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => {
                  sliderRef.current.slickNext();
                }}
              >
                <ReactSVG
                  className="controlBtn"
                  name="rightArrow"
                  onClick={() => {
                    sliderRef.current.slickNext();
                  }}
                />
              </div>
            </>
          )}
        </ul>
      </div>
    ),
    dotsClass: 'home-stl-dots',
  };
  return looks.length > 0 ? (
    <Container className={`${style.lookContainer}`} disableGutters>
      <div className={`${style.lookContainer}__header`}>
        {textConfig ? (
          <>
            <h3>{textConfig.title}</h3>
            <div className={`${style.lookContainer}__description`}>{textConfig.description}</div>
          </>
        ) : (
          <h1>Shop The Look</h1>
        )}

        <Link
          to={textConfig?.path || `/shop-the-look/${looks?.[slideIndex]?.path || 'living-room'}`}
          onClick={() => {
            if (type === 'home') {
              dispatch({
                type: EVENT_SHOP_THE_LOOK,
                result: {
                  detailAction: 'view_all_stl',
                },
              });
            }
          }}
        >
          <GhostArrowBtn text="View All" border={!isMobile} />
        </Link>
      </div>

      <Slider ref={sliderRef} {...settings}>
        {looks.map((item) =>
          item ? (
            <div key={item._uid} className={`${style.lookContainer}__sliderItem`}>
              <TheLook item={item} showWidgets={false} />
            </div>
          ) : null
        )}
      </Slider>
    </Container>
  ) : null;
}

ShopTheLookSection.propTypes = {
  shopTheLookData: PropTypes.array,
  textConfig: PropTypes.object,
  type: PropTypes.string,
};
