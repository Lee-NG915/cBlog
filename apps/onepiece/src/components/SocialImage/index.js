import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { renderImage } from 'utils/image';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import SocialImageModal from './SocialImageModal';
import NewSocialImageModal from './NewSocialImageModal';
import style from './style.scss';

const SocialImage = (
  {
    post = {},
    collection,
    width = 0.2,
    modalName = 'bottomUpFade',
    renderModal,
    modalType = 'old',
    fromNewPDP = false,
  },
  { frame }
) => {
  const { desktop } = useBreakpoints();
  const currentRender = useMemo(() => {
    if (renderModal) {
      return renderModal;
    }
    return ({ content, modalName, dismiss, height }) =>
      frame.addModal(content, modalName, {
        dismiss,
        fromNewPDP,
        height: height || 88,
      });
  }, [renderModal, frame, fromNewPDP]);

  return (
    <div
      role="button"
      className={style.socialImage}
      onClick={() => {
        currentRender({
          content:
            modalType === 'old' ? (
              <SocialImageModal post={post} collection={collection} />
            ) : (
              <NewSocialImageModal post={post} collection={collection} />
            ),
          head: (
            <>
              {post.ig_handle && (
                <div className={`${style.newSocialImageModal}__content__ig-handle`}>
                  <ReactSVG name="instagram" />
                  <span>{post.ig_handle}</span>
                </div>
              )}
            </>
          ),
          modalName,
          dismiss: () => frame.removeModal(),
        });
      }}
    >
      {renderImage(post.image, { ratio: 1, size: 'cover' }, width, {
        alt: 'Shop Castlery Instagram',
      })}
      {desktop && (
        <div className={`${style.socialImage}__mask`}>
          <div>
            <ReactSVG name="instagram" />
            {fromNewPDP ? <div>Shop the look</div> : <span>Shop the look</span>}
          </div>
        </div>
      )}
    </div>
  );
};

SocialImage.propTypes = {
  post: PropTypes.object,
  collection: PropTypes.string,
  width: PropTypes.number,
  modalName: PropTypes.string,
  renderModal: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  modalType: PropTypes.string,
  fromNewPDP: PropTypes.bool,
};

SocialImage.contextTypes = {
  frame: PropTypes.object,
};

export default SocialImage;
