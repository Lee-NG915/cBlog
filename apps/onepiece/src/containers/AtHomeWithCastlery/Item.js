import React from 'react';
import PropTypes from 'prop-types';
import stickybits from 'stickybits';
import ReactPicture from 'components/ReactPicture';
import ReactSVG from 'components/ReactSVG';
import Rating from 'components/Rating';
import { formatDate } from 'utils/time';
import ApiClient from 'helpers/ApiClient';
import Product from 'components/Product';
import Slick from 'react-slick';
import Spinner from 'components/Spinner';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import classNames from 'classnames';
import { PrevBtn, NextBtn } from 'components/DesktopSlideButton';
import Tooltip from 'components/Tooltip';
import { postProductSearch } from 'api/search';
import { withUseBreakpoints } from 'utils/page';
import { globalFeatureInSG } from 'config';
import Like from './Like';
import style from './style.scss';

@withUseBreakpoints
export default class Item extends React.Component {
  static propTypes = {
    // pass detail or id, both props won't get updated
    detail: PropTypes.object,
    id: PropTypes.string,
    originalLiked: PropTypes.bool,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
    router: PropTypes.object,
  };

  state = {
    // loading single review
    detail: this.props.detail,
    error: '',
    products: null,
  };

  componentDidMount() {
    const { detail, id } = this.props;

    if (detail) {
      this.init();
    } else {
      this.loadSingleReview(id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (!prevState.products && this.state.products && desktop && this.stikcy) {
      stickybits(this.stikcy);
    }

    if (!prevState.detail && this.state.detail) {
      this.init();
    }
  }

  componentWillUnmount() {
    if (this.tip) {
      this.tip.destroyAll();
    }
  }

  client = new ApiClient();

  init() {
    const { detail } = this.state;

    this.loadProducts([detail.product_id, ...detail.relative_product_ids]);
  }

  loadSingleReview(id) {
    this.client
      .get(`/reviews/${id}`)
      .then((review) => {
        this.setState({
          detail: review,
          error: '',
          products: null,
        });
      })
      .catch((error) =>
        this.setState({
          detail: null,
          error: error.errors[0].detail,
          products: null,
        })
      );
  }

  loadProducts(products) {
    postProductSearch({
      query: {
        bool: {
          must: {
            ids: {
              values: products,
            },
          },
          filter: {
            nested: {
              path: 'variants',
              query: {
                bool: {
                  filter: {
                    exists: {
                      field: 'variants',
                    },
                  },
                },
              },
            },
          },
        },
      },
      size: 32,
    }).then(
      (response) => {
        this.setState({
          products: response.hits.hits.sort((a, b) => products.indexOf(a._source.id) - products.indexOf(b._source.id)),
        });
      },
      (err) =>
        console.error(
          JSON.stringify(
            {
              message: 'AtHomeWithCastlery error',
              error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
            },
            null,
            2
          )
        )
    );
  }

  viewAll(e) {
    e.preventDefault();

    this.context.frame.scrollToTop(false);
    this.context.router.push(getUrl('at-home-with-castlery'));
  }

  render() {
    const { products, detail, error } = this.state;
    const { id, originalLiked, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;

    let rendered;
    if (detail) {
      const comment = (
        <div
          className={classNames(`${style.item}__comment`, {
            'is-borderless': id !== undefined,
          })}
        >
          <div className={`${style.item}__user`}>
            <span>{`${detail.messages[0]?.user?.firstname} ${detail.messages[0]?.user?.lastname}`}</span>
            <Tooltip title="Verified Customer" placement="bottom">
              <div className={`${style.item}__tip`}>
                <ReactSVG name="check-circle-thick" />
              </div>
            </Tooltip>
          </div>
          <div className={`${style.item}__rating`}>
            <Rating rating={detail.rating_product} />
            <span>{formatDate(new Date(detail.updated_at))}</span>
          </div>
          {detail.messages.length > 0 && <p className={`${style.item}__content`}>{detail.messages[0].content}</p>}

          {desktop && detail.messages.length > 0 && (
            <Like
              originalLiked={originalLiked}
              count={detail.messages[0].count_like}
              messageId={detail.messages[0].id}
              className={`${style.item}__like`}
            />
          )}
        </div>
      );

      rendered = (
        <div className={`${style.item}__main`}>
          {!desktop && comment}
          <div className={`${style.item}__gallery`}>
            {detail.messages.length > 0 &&
              detail.messages[0].images.map((image, index) => (
                <ReactPicture
                  key={image.image_url}
                  srcset={image.image_url}
                  alt={`review from ${detail.messages[0].user.firstname} ${index + 1}`}
                  loader={{ ratio: image.ratio }}
                />
              ))}
          </div>
          <div className={`${style.item}__sidebar`} ref={(c) => (this.sidebar = c)}>
            {desktop && comment}

            {!desktop && (
              <div className={`${style.item}__viewMore`}>
                {detail.messages.length > 0 && (
                  <Like
                    originalLiked={originalLiked}
                    count={detail.messages[0].count_like}
                    messageId={detail.messages[0].id}
                    className={`${style.item}__like`}
                  />
                )}
                {globalFeatureInSG && id !== undefined && (
                  <Link to={getUrl('at-home-with-castlery')} onClick={this.viewAll.bind(this)}>
                    Explore more homes with Castlery <ReactSVG name="arrow-next" />
                  </Link>
                )}
              </div>
            )}

            {products ? (
              products.length > 0 && (
                <div ref={(c) => (this.stikcy = c)}>
                  <div className={`${style.item}__taggedProduct`}>
                    <h3>Tagged Product</h3>
                    <Product
                      className={`${style.item}__product`}
                      listName="Others - Review Tagged Product"
                      listPosition={1}
                      product={products[0]._source}
                      showHover={false}
                    />
                  </div>
                  {products.length > 1 && (
                    <div className={`${style.item}__relatedProducts`}>
                      <h3>Also Bought</h3>
                      {!desktop ? (
                        <div className={`${style.item}__relatedProducts__container`}>
                          {products.map((p, index) => {
                            if (index === 0) {
                              return null;
                            }
                            return (
                              <div key={index}>
                                <Product
                                  className={`${style.item}__product`}
                                  listName="Others - Review Related Products"
                                  listPosition={index + 1}
                                  product={p._source}
                                  showHover={false}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <Slick
                          infinite={false}
                          draggable={false}
                          speed={300}
                          arrows={products.length > 2}
                          prevArrow={<PrevBtn />}
                          nextArrow={<NextBtn />}
                        >
                          {products.map((p, index) => {
                            if (index === 0) {
                              return null;
                            }
                            return (
                              <div key={index}>
                                <Product
                                  className={`${style.item}__product`}
                                  listName="Others - Review Related Products"
                                  listPosition={index + 1}
                                  product={p._source}
                                  showHover={false}
                                />
                              </div>
                            );
                          })}
                        </Slick>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className={`${style.item}__loading has-border`}>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      );
    } else if (error) {
      rendered = <div className={`${style.item}__error`}>{error}</div>;
    } else {
      rendered = (
        <div className={`${style.item}__loading`}>
          <Spinner />
        </div>
      );
    }

    return (
      <div className={style.item}>
        {rendered}
        {globalFeatureInSG && desktop && id !== undefined && detail && (
          <div className={`${style.item}__viewMore`}>
            <Link
              to={getUrl('at-home-with-castlery')}
              onClick={this.viewAll.bind(this)}
              className="btn btn-primary-outline"
            >
              Explore more homes with Castlery <ReactSVG name="arrow-next" />
            </Link>
          </div>
        )}
      </div>
    );
  }
}
