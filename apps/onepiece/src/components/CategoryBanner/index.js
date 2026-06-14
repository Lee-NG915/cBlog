import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Banner from 'components/Banner';
import Countdown from 'components/Countdown';
import Tooltip from 'components/Tooltip';
import { ArrowBtn } from 'components/Button';
import { EVENT_DY_EVENT } from 'utils/track/constants';
import { useSelector, useDispatch } from 'react-redux';
import { load as loadSofaDiscoveryQuiz } from 'redux/modules/dyApiData';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { toCamel } from 'utils/common';
import { addressFeatureInUS } from 'config';
import style from './style.scss';

const CategoryBanner = ({ page }) => {
  const { desktop } = useBreakpoints();
  let countdown = null;
  const camelPage = toCamel(page);
  const {
    imageWithText,
    imageWithTextResponsive,
    image,
    imageResponsive,
    countdownColor,
    countdownDeadline,
    name,
    description,
    backgroundColor,
  } = camelPage;
  const desktopImage = imageWithText || image;
  const mobileImage = imageWithTextResponsive || imageResponsive;

  const dyState = useSelector((state) => state.dyApiData?.campaign?.['Sofa Discovery Quiz']);
  const dyVariation = dyState?.data?.variation;
  const hasQuiz = addressFeatureInUS && camelPage.url === '/sofas/all-sofas';
  const showQuiz = hasQuiz && dyVariation === 'B';

  const dispatch = useDispatch();

  useEffect(() => {
    if (hasQuiz) {
      dispatch(
        loadSofaDiscoveryQuiz({
          selectorArray: ['Sofa Discovery Quiz'],
        })
      );
    }
  }, [hasQuiz, dispatch]);

  useEffect(() => {
    if (showQuiz) {
      const script = document.createElement('script');
      script.src = 'https://paperform.co/__embed.min.js';
      document.body.appendChild(script);
    }
  }, [showQuiz, dispatch]);

  useEffect(() => {
    if (dyState) {
      dispatch({
        type: EVENT_DY_EVENT,
        result: {
          detailAction: dyState.campaignName,
          label: dyVariation,
        },
      });
    }
  }, [dispatch, dyState, dyVariation]);

  const openQuiz = () => {
    if (window.Paperform) {
      window.Paperform.popup('inmyce1z');
    }
  };

  if (countdownDeadline) {
    countdown = (
      <Countdown
        className={classNames(`${style.banner}__countdown is-${countdownColor || 'white'}`)}
        deadline={countdownDeadline}
      />
    );
  }

  return (
    <Banner
      className={style.banner}
      mediaQueries={[
        {
          breakpoint: 'xs',
          srcset: mobileImage,
          loader: { ratio: showQuiz ? 0.507 : 0.371 },
        },
        {
          breakpoint: 'lg',
          srcset: desktopImage,
          loader: { ratio: showQuiz ? 0.224 : 0.208 },
        },
      ]}
      lazy={false}
      title={name}
      setImagePreloaderOnServer
      backgroundColor={backgroundColor}
      type="category"
      style={{
        backgroundColor,
      }}
    >
      {!(imageWithText || imageWithTextResponsive) && (
        <div className={`${style.banner}__textContainer`}>
          <h1>{name}</h1>
          {countdown}
          {description &&
            (!desktop ? (
              <Tooltip title={description} placement="bottom" className={`${style.banner}__tooltip`}>
                <p dangerouslySetInnerHTML={{ __html: description }} />
              </Tooltip>
            ) : (
              <p dangerouslySetInnerHTML={{ __html: description }} />
            ))}

          {showQuiz && (
            <div className={`${style.banner}__quiz`}>
              <ArrowBtn text="Find my perfect sofa" onClick={openQuiz} />
            </div>
          )}
        </div>
      )}
    </Banner>
  );
};

CategoryBanner.propTypes = {
  page: PropTypes.object,
};

export default CategoryBanner;
