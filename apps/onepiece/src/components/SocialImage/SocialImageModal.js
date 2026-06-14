import React from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
import ReactSVG from 'components/ReactSVG';
import Variant from 'components/VariantList/Variant';
import ResponsiveSlick from 'components/ResponsiveSlick';
import { getBreakpoint } from 'utils/breakpoints';
import ReadMore from 'components/Review/ReadMore';
import { renderImage } from 'utils/image';
import { EVENT_SOCIAL_WIDGET } from 'utils/track/constants';
import { withUseBreakpoints } from 'utils/page';

import Video from 'components/Video';
import style from './style.scss';

@withUseBreakpoints
export default class SocialImageModal extends React.Component {
  static propTypes = {
    post: PropTypes.object.isRequired,
    collection: PropTypes.string.isRequired,
    imagePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    breakpoints: PropTypes.object,
  };

  state = {
    loading: true,
    variants: [],
    fixedWidthChange: window.innerWidth <= 1500,
  };

  client = new ApiClient();

  _isMounted = false;

  updateFixedWidthChange = () => {
    this.setState({ fixedWidthChange: window.innerWidth <= 1500 });
  };

  componentDidMount() {
    this._isMounted = true;
    this.loadVariants();
    window.addEventListener('resize', this.updateFixedWidthChange);
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.updateFixedWidthChange);
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
              message: 'Failed to load variants in SocialImageModal',
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

  render() {
    const { post, collection, imagePosition, breakpoints = {} } = this.props;
    const { loading, variants } = this.state;
    const { desktop } = breakpoints;
    const Image =
      post?.fileType === 'video' ? (
        <Video
          id={post?.videoInfo?.id}
          key={post?.videoInfo?.id}
          ratios={1.4}
          autoPlay={false}
          videoRoot={post?.videoInfo?.videoRoot}
          thumbnail={{
            id: post?.videoInfo?.transformId,
          }}
          resolution="1080P"
        />
      ) : (
        renderImage(post.image, { size: 'cover' }, 0.4, {
          alt: 'Shop Castlery Instagram',
        })
      );
    return (
      <div className={style.socialImageModal}>
        <div className={`${style.socialImageModal}__image`}>{Image}</div>
        <div className={`${style.socialImageModal}__content`}>
          {post.ig_handle && (
            <div className={`${style.socialImageModal}__content__ig-handle`}>
              {/* TODO If you want to extend it later, you need to add the corresponding svg icon */}
              {/* instagram facebook tiktok pinterest  */}
              <ReactSVG name={post?.component || 'instagram'} />
              <span>{post.ig_handle}</span>
            </div>
          )}
          <div className={`${style.socialImageModal}__content__text`}>
            <p>
              <ReadMore
                color={style.primaryColor}
                content={post.content}
                maxLength={desktop ? 300 : 150}
                mode="new"
                showLess
              />
            </p>
          </div>
          <div className={`${style.socialImageModal}__product`} onTouchMove={this.stopTouchmove}>
            {loading ? (
              <div className={`${style.socialImageModal}__product__loading`}>
                <Spinner />
              </div>
            ) : (
              variants.length > 0 && (
                <ResponsiveSlick
                  className={`${style.socialImageModal}__product__slick`}
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
                  fixedWidthChange={this.state.fixedWidthChange}
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
    );
  }
}
