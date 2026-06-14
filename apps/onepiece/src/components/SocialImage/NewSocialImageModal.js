import React from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
// import ReactSVG from 'components/ReactSVG';
import Variant from 'components/VariantList/Variant';
import ResponsiveSlick from 'components/ResponsiveSlick';
import { getBreakpoint } from 'utils/breakpoints';
import ReadMore from 'components/Review/ReadMore';
import { renderImage } from 'utils/image';
import ReactSVG from 'components/ReactSVG';

import { EVENT_SOCIAL_WIDGET } from 'utils/track/constants';
import Video from 'components/Video';
import { processUrl } from 'components/ReactPicture/utils';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@withUseBreakpoints
export default class newSocialImageModal extends React.Component {
  static propTypes = {
    post: PropTypes.object.isRequired,
    collection: PropTypes.string.isRequired,
    imagePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showHeader: PropTypes.bool,
    isCurrent: PropTypes.bool,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    loading: true,
    variants: [],
  };

  client = new ApiClient();

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.loadVariants();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  stopTouchmove(e) {
    e.stopPropagation();
  }

  loadVariants() {
    const { post } = this.props;

    this.client
      .get('/variants', {
        params: {
          ids: (post.variants || '').replace(/ /g, ''),
        },
      })
      .then((result) => {
        if (this._isMounted) {
          this.setState({
            loading: false,
            variants: result,
          });
        }
      })
      .catch((error) => {
        console.error(
          JSON.stringify(
            {
              message: 'Failed to load variants in NewSocialImageModal',
              error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
            },
            null,
            2
          )
        );
        if (this._isMounted) {
          this.setState({
            loading: false,
          });
        }
      });
  }

  showImageModal(images) {
    const { frame } = this.context;
    frame.openModal('image', {
      images: images.map((imgUrl) => processUrl(imgUrl, null)),
    });
  }

  ModalHeader() {
    const { post } = this.props;
    return (
      <>
        {post.ig_handle && (
          <div className={`${style.newSocialImageModal}__header`}>
            <div key={post._uid} className={`${style.newSocialImageModal}__content__ig-handle`}>
              <ReactSVG name="instagram" />
              <span>{post.ig_handle}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  render() {
    const { post, collection, imagePosition, showHeader, isCurrent = true, breakpoints = {} } = this.props;
    const { loading, variants } = this.state;
    const { desktop } = breakpoints;
    return (
      <div className={style.newSocialImageModal} style={showHeader && { marginTop: 0 }}>
        {showHeader && this.ModalHeader()}
        <div>
          {post?.fileType === 'video' ? (
            <div
              style={{
                backgroundColor: '#000',
              }}
            >
              <Video
                id={post?.videoInfo?.id}
                key={post?.videoInfo?.id}
                ratios={1.38}
                autoPlay={false}
                videoRoot={post?.videoInfo?.videoRoot}
                needPause={!isCurrent}
                thumbnail={{
                  id: post?.videoInfo?.transformId,
                }}
                resolution="1080P"
              />
            </div>
          ) : (
            <div
              className={`${style.newSocialImageModal}__image`}
              role="button"
              onClick={() => this.showImageModal([post.image])}
            >
              {renderImage(post.image, { ratio: 1 }, 0.2, {
                alt: 'Shop Castlery Instagram',
              })}
            </div>
          )}
          <div className={`${style.newSocialImageModal}__content`}>
            {/* {post.ig_handle && (
            <div className={`${style.newSocialImageModal}__content__ig-handle`}>
              <ReactSVG name="instagram" />
              <span>{post.ig_handle}</span>
            </div>
          )} */}
            <div className={`${style.newSocialImageModal}__content__text`}>
              <p>
                <ReadMore
                  color={style.primaryColor}
                  showLess
                  content={post.content}
                  maxLength={desktop ? 300 : 150}
                  mode="new"
                />
              </p>
            </div>
            <div className={`${style.newSocialImageModal}__product`} onTouchMove={this.stopTouchmove}>
              {loading ? (
                <div className={`${style.newSocialImageModal}__product__loading`}>
                  <Spinner />
                </div>
              ) : (
                variants.length > 0 && (
                  <ResponsiveSlick
                    className={`${style.newSocialImageModal}__product__slick`}
                    mediaQueries={
                      !desktop
                        ? [
                            {
                              query: `(max-width: ${getBreakpoint('xs', 'max')}px)`,
                              numPerPage: 2,
                            },
                            {
                              query:
                                `(min-width: ${getBreakpoint('sm', 'min')}) and ` +
                                `(max-width: ${getBreakpoint('md', 'max')}px)`,
                              numPerPage: 2,
                            },
                            {
                              query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                              numPerPage: 4,
                            },
                          ]
                        : [
                            {
                              query: `(min-width: 0)`,
                              numPerPage: 1,
                            },
                          ]
                    }
                  >
                    {variants.map((v, index) => (
                      <Variant
                        key={v.id}
                        listPosition={index + 1}
                        listName={`SocialWidget - ${collection}`}
                        variant={v}
                        socialCollection={collection}
                        trackClick={(dispatch) => {
                          dispatch({
                            type: EVENT_SOCIAL_WIDGET,
                            result: {
                              socialWidgetAction: 'product_link_click',
                              post,
                              position: imagePosition,
                            },
                          });
                        }}
                      />
                    ))}
                  </ResponsiveSlick>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
