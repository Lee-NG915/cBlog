import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { renderImage } from 'utils/image';
import { useDispatch } from 'react-redux';
import { EVENT_SOCIAL_WIDGET } from 'utils/track/constants';
import Slick from 'react-slick';
import { PrevBtn, NextBtn } from 'components/DesktopSlideButton';
import SvgIcon from 'components/SvgIcon';
import { animate } from 'utils/animate';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import SocialImageModal from '../SocialImageModal';
import NewSocialImageModal from '../NewSocialImageModal';

import style from './style.scss';

const ModalContent = (props) => {
  const { targetPosts, collection, modalType, showSlideArrows, listPosition } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { desktop } = useBreakpoints();
  const isMobile = !desktop;

  // auto scroll activePage to center
  const autoScrollDot = (index) => {
    Promise.resolve().then(() => {
      const dotDom = document.querySelector(`.${style.socialImage}__slick-container-slick-dots`);
      if (!dotDom) {
        throw new Error('dom does not exist');
      }
      const containerWidth = dotDom.offsetWidth;
      const activeItem = dotDom.children[index];
      const activeItemWidth = activeItem.offsetWidth;
      const activeItemOffsetLeft = activeItem.offsetLeft;
      const scrollLeft = activeItemOffsetLeft - containerWidth / 2 + activeItemWidth / 2;
      animate({
        from: dotDom.scrollLeft,
        to: scrollLeft,
        duration: 300,
        func: 'easeInOutQuad',
        callback: (d) => (dotDom.scrollLeft = d),
      });
    });
  };

  const prevArrow = isMobile ? (
    <div>
      <SvgIcon name="line-left-arrow" hoverColor="primary" />
    </div>
  ) : (
    <PrevBtn isUsedInPDP />
  );
  const nextArrow = isMobile ? (
    <div>
      <SvgIcon name="line-right-arrow" hoverColor="primary" />
    </div>
  ) : (
    <NextBtn isUsedInPDP />
  );
  const customPaging = (i) => (
    <a
      style={{
        position: 'relative',
      }}
    >
      {renderImage(targetPosts[i]?.image, 1, null, {
        alt: 'Shop Castlery Instagram',
        lazy: i >= 7,
      })}
      {['video'].includes(targetPosts[i]?.fileType) && <div className={`${style.socialImage}__playBtn-mobile`} />}
    </a>
  );

  return modalType === 'old' ? (
    <div className={`${style.socialImage}__slick-container`}>
      <Slick
        customPaging={isMobile && customPaging}
        infinite
        speed={500}
        dots={isMobile}
        arrows={showSlideArrows}
        lazyLoad
        initialSlide={listPosition - 1}
        dotsClass={`${style.socialImage}__slick-container-slick-dots`}
        prevArrow={prevArrow}
        nextArrow={nextArrow}
        beforeChange={(_, i) => {
          isMobile && autoScrollDot(i);
        }}
        onInit={() => {
          isMobile && autoScrollDot(listPosition - 1);
        }}
      >
        {targetPosts &&
          targetPosts.map((postItem, pIndex) => (
            <div key={postItem._uid}>
              <div className={`${style.socialImage}__slider-item`}>
                <SocialImageModal post={postItem} collection={collection || ''} imagePosition={pIndex + 1} />
              </div>
            </div>
          ))}
      </Slick>
    </div>
  ) : (
    <div className={`${style.socialImage}__slick-container`}>
      <Slick
        customPaging={customPaging}
        infinite
        speed={300}
        dots={isMobile}
        arrows={false}
        lazyLoad
        dotsClass={`${style.socialImage}__slick-container-slick-dots`}
        initialSlide={listPosition - 1}
        afterChange={(i) => {
          isMobile && autoScrollDot(i);
          setCurrentIndex(i);
        }}
        onInit={() => {
          isMobile && autoScrollDot(listPosition - 1);
        }}
      >
        {targetPosts &&
          targetPosts.map((postItem, pIndex) => (
            <div key={postItem._uid}>
              <NewSocialImageModal
                post={postItem}
                collection={collection || ''}
                imagePosition={pIndex + 1}
                isCurrent={pIndex === currentIndex}
                showHeader
              />
            </div>
          ))}
      </Slick>
    </div>
  );
};
ModalContent.propTypes = {
  targetPosts: PropTypes.arrayOf(PropTypes.object),
  listPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  collection: PropTypes.string,
  modalType: PropTypes.string,
  showSlideArrows: PropTypes.bool,
};

const SocialImage = (
  {
    post = {},
    targetPosts = [],
    listPosition = 1,
    collection,
    width = 0.2,
    modalName = 'bottomUpFade',
    renderModal,
    modalType = 'old',
    fromNewPDP = false,
    hasHover = false,
    maskHeight = 135,
    draggable = 'true',
    showSlideArrows = false,
    showOverlayed = true,
  },
  { frame }
) => {
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const currentRender = useMemo(() => {
    if (renderModal) {
      return renderModal;
    }
    return ({ content, modalName, dismiss, height }) =>
      frame.addModal(content, modalName, {
        dismiss,
        fromNewPDP,
        showBtn: false,
        height: height || 88,
        contentBgColor: desktop ? 'transparent' : '#fff',
        styleOverflow: 'auto',
      });
  }, [renderModal, frame, fromNewPDP, desktop]);

  return (
    <div
      role="button"
      className={style.socialImage}
      onClick={() => {
        currentRender({
          content:
            (
              <ModalContent
                targetPosts={targetPosts}
                collection={collection}
                modalType={modalType}
                showSlideArrows={showSlideArrows}
                listPosition={listPosition}
              />
            ) || '',
          modalName,
          dismiss: () => frame.removeModal(),
        });
        dispatch({
          type: EVENT_SOCIAL_WIDGET,
          result: {
            socialWidgetAction: targetPosts[listPosition - 1].fileType === 'video' ? 'video_click' : 'image_click',
            post,
            position: listPosition,
          },
        });
      }}
    >
      {renderImage(post.image, { ratio: 1 }, width, {
        alt: 'Shop Castlery Instagram',
        draggable,
      })}
      {['video'].includes(post?.fileType) && <div className={`${style.socialImage}__playBtn`} />}

      {showOverlayed && (
        <div className={`${style.socialImage}__overlayed`}>
          <span>{post.ig_handle}</span>
        </div>
      )}
      {hasHover && (
        <div className={`${style.socialImage}__mask`} style={{ height: `${maskHeight}px` }}>
          <span>{post.ig_handle}</span>
          <p>-</p>
          <p>{post.content}</p>
        </div>
      )}
    </div>
  );
};

SocialImage.propTypes = {
  post: PropTypes.object,
  targetPosts: PropTypes.arrayOf(PropTypes.object),
  listPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  collection: PropTypes.string,
  width: PropTypes.number,
  modalName: PropTypes.string,
  renderModal: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  modalType: PropTypes.string,
  fromNewPDP: PropTypes.bool,
  hasHover: PropTypes.bool,
  maskHeight: PropTypes.number,
  draggable: PropTypes.oneOf(['true', 'false']),
  showSlideArrows: PropTypes.bool,
  showOverlayed: PropTypes.bool,
};

SocialImage.contextTypes = {
  frame: PropTypes.object,
};

export default SocialImage;
