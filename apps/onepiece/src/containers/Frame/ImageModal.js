import React, { useState, useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Slick from 'react-slick';
import Video from 'components/Video';
import View360 from 'components/View360';
import PinchZoom from 'components/PinchZoom';
import ReactSVG from 'components/ReactSVG';
import ImageLoader from 'components/ImageLoader';
import { PrevBtn, NextBtn } from 'components/DesktopSlideButton';
import { EVENT_PDP_IMAGE_DURATION } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import ReactPicture from 'components/ReactPicture';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useProductOptions } from 'containers/Product/hooks/product';
import { setImageQuality } from 'redux/modules/productOptions.js';
import { processUrl } from 'components/ReactPicture/utils';
import { FrameContext } from './FrameContext';
import style from './style.scss';

const Item = ({ image, allowSwipe, stopSwipe, needPause }) => {
  const productOptions = useProductOptions();
  const { imageParam } = productOptions;
  if (typeof image === 'string' || image?.imageUrl) {
    const imageUrl = image.imageUrl ? image.imageUrl : image;
    return (
      <ImageLoader
        src={imageParam?.imageQuality === 'best' ? processUrl(imageUrl, null, true) : imageUrl}
        style={{ height: '100%' }}
      >
        <PinchZoom className={`${style.image}__zoomItem`} change={stopSwipe} reset={allowSwipe}>
          <ReactPicture
            className={`${style.image}__wrapper`}
            srcset={imageUrl}
            alt="img"
            lazy={false}
            bestQuality={imageParam?.imageQuality === 'best'}
          />
        </PinchZoom>
      </ImageLoader>
    );
  }

  if (typeof image === 'object' && image !== null) {
    if (Array.isArray(image)) {
      const url = image.map((s) => `url(${s})`).join(', ');
      return (
        <ImageLoader src={image} style={{ height: '100%' }}>
          <div className={`${style.image}__item`} style={{ backgroundImage: url }} />
        </ImageLoader>
      );
    }
    if (image.type === 'short_video') {
      return (
        <div className={`${style.image}__video`}>
          <Video
            key={image.id}
            id={image.id}
            ratios={image.ratio || 0.667}
            videoRoot={image.videoRoot}
            showControls={false}
            loop
            muted
          />
        </div>
      );
    }
    if (image.type === 'video' || image.type === 'master_video') {
      return (
        <div className={`${style.image}__video`}>
          <Video
            key={image.id}
            id={image.id}
            ratios={image.ratio || 0.667}
            autoPlay={false}
            thumbnail={{ id: image.transformId }}
            videoRoot={image.videoRoot}
            needPause={needPause}
          />
        </div>
      );
    }
    if (image.type === '3d') {
      return (
        <div className={`${style.image}__3d`}>
          <View360 variant={image.variant} pointerDownHandler={stopSwipe} pointerUpHandler={allowSwipe} />
        </div>
      );
    }
  }
  return null;
};

Item.propTypes = {
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  stopSwipe: PropTypes.func,
  allowSwipe: PropTypes.func,
  needPause: PropTypes.bool,
};

const ImageModal = ({ initialIndex, images, handleResetTime }) => {
  const frame = useContext(FrameContext);
  const [index, setIndex] = useState(initialIndex);
  const [swipe, setSwipe] = useState(true);
  const timerRef = useRef(null);
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const productOptions = useProductOptions();
  const { imageParam } = productOptions;
  const handleReset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(
    () => () => {
      handleReset();
    },
    []
  );

  const slideChange = (i) => {
    handleReset();
    if (imageParam?.imageQuality === 'best') {
      let image = images[i];
      if (typeof image === 'string' || image?.imageUrl) {
        image = images[i]?.imageUrl ? images[i]?.imageUrl : images[i];
        dispatch(
          setImageQuality({
            ...imageParam,
            imageOrigin: image,
          })
        );
      }
    }
    setIndex(i);
    if (handleResetTime) {
      handleResetTime();

      timerRef.current = setTimeout(() => {
        dispatch({
          type: EVENT_PDP_IMAGE_DURATION,
          result: {
            assetPosition: i + 1,
            assetType: images[i]?.type,
          },
        });
      }, 5000);
    }
  };

  const allowSwipe = () => {
    if (!desktop) {
      setSwipe(true);
    }
  };

  const stopSwipe = () => {
    if (!desktop) {
      setSwipe(false);
    }
  };

  return (
    <div className={style.image}>
      {images.length > 0 && (
        <Slick
          infinite={images.length > 1}
          // draggable={false}
          speed={300}
          swipe={false}
          arrows={desktop && images.length > 1}
          prevArrow={desktop && <PrevBtn />}
          nextArrow={desktop && <NextBtn />}
          afterChange={slideChange}
          initialSlide={initialIndex}
        >
          {images.map((src, i) => (
            <Item image={src} key={i} allowSwipe={allowSwipe} stopSwipe={stopSwipe} needPause={index !== i} />
          ))}
        </Slick>
      )}
      {swipe && (
        <div className={`${style.image}__counter`}>
          {index + 1} / {images.length}
        </div>
      )}
      <button
        type="button"
        className={`btn ${style.image}__close`}
        onClick={() => {
          if (handleResetTime) {
            handleResetTime();
          }
          if (imageParam?.imageQuality === 'best') {
            dispatch(setImageQuality({}));
          }
          frame.removeModal();
        }}
      >
        <ReactSVG name="close" />
      </button>
    </div>
  );
};

ImageModal.animation = 'plain';

ImageModal.propTypes = {
  images: PropTypes.array,
  initialIndex: PropTypes.number,
  handleResetTime: PropTypes.func,
};

ImageModal.defaultProps = {
  initialIndex: 0,
  images: [],
};

export default ImageModal;
