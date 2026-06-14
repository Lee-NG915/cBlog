import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from 'components/Tooltip';
import ReactPaginate from 'react-paginate';
import ReadMore from 'components/Review/ReadMore';
import Spinner from 'components/Spinner';
import ReactSVG from 'components/ReactSVG';
import Rating from 'components/Rating';
import Tag from 'components/Review/Tag';
import ReactPicture from 'components/ReactPicture';
import { getVariantLink } from 'utils/link';
import { formatDate } from 'utils/time';
import { ColorPalette } from 'utils/color';
import SvgIcon from 'components/SvgIcon';
import pagStyle from 'sass/pagination.scss';
import { EVENT_PDP_REVIEW_SECTION } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import { useReview, useReviewHead, useReviewScroll } from '../hooks/review';
import { useCurrentProduct, useMobileFrame } from '../hooks/product';
import style from './style.scss';

const ProductReviewHead = (props = {}) => {
  const { fromModal = false } = props;
  const product = useCurrentProduct();

  const { avg_rating: avgRating, count: reviewCount } = product.reviews || {};

  return (
    <div className={classNames(`${style.review}__header`, fromModal ? `${style.review}__headerLeft` : '')}>
      <h2 className={`${style.review}__header-head`}>Customer Reviews</h2>
      {avgRating >= 3 && (
        <div className={`${style.review}__header-rating`}>
          <div className={`${style.review}__header-rating-star`}>
            <Rating
              rating={avgRating}
              margin={1}
              size={16}
              innerType="outline"
              innerColor={ColorPalette.primary}
              outerColor={ColorPalette.primary}
            />
          </div>
          <span className={`${style.review}__header-rating-count`}>
            {reviewCount} {reviewCount > 1 ? 'Reviews' : 'Review'}
          </span>
        </div>
      )}
    </div>
  );
};

ProductReviewHead.propTypes = {
  fromModal: PropTypes.bool,
};

const ProductReviewItem = ({
  firstname,
  lastname,
  rating,
  messageTitle,
  messageTime,
  messageContent,
  messageImages,
  variant,
  isRelated,
  variantName,
  replay,
  tag,
  fromModal,
}) => {
  const container = useRef();
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const trackReviewEvent = useCallback(
    (action) => {
      dispatch({
        type: EVENT_PDP_REVIEW_SECTION,
        result: {
          detailAction: action,
          label: '',
        },
      });
    },
    [dispatch]
  );

  return (
    <div className={style.reviewItem}>
      <div className={`${style.reviewItem}__head`}>
        <div className={`${style.reviewItem}__head-name`} ref={container}>
          <p>{`${firstname} ${lastname}`.trim() || 'Castlery Customer'}</p>
          <Tooltip title="Verified Customer" placement="bottom" className={`${style.reviewItem}__head-tooltip`}>
            <ReactSVG name="check-circle-thick" />
          </Tooltip>
          {!desktop && <div className={`${style.reviewItem}__date`}>{formatDate(messageTime)}</div>}
        </div>
        <div className={`${style.reviewItem}__head-star`}>
          <Rating
            rating={rating}
            size={!desktop ? 14 : 16}
            margin={3}
            innerType="outline"
            innerColor={ColorPalette.primary}
            outerColor={ColorPalette.primary}
          />
        </div>
        {desktop && tag.level === 'super_rare' && (
          <div className={`${style.reviewItem}__head-tag`}>
            <Tag />
          </div>
        )}
      </div>
      <div className={`${style.reviewItem}__content`}>
        <div className={`${style.reviewItem}__content-title`}>{messageTitle}</div>
        <div className={`${style.reviewItem}__content-body`}>
          <ReadMore content={messageContent} maxLength={!desktop ? 300 : 600} mode="new" />
        </div>
        <div className={`${style.reviewItem}__content-img`}>
          {messageImages.map((image, index) => (
            <div
              className={`${style.reviewItem}__content-img-item`}
              role="menuitem"
              key={image.image_url}
              type="button"
              onClick={() => {
                image?.clickHandler();
                trackReviewEvent('view_review_image');
              }}
            >
              {fromModal ? (
                <ReactPicture
                  srcset={image.image_url}
                  alt={`review from ${firstname} ${index + 1}`}
                  loader={{ ratio: 1 }}
                />
              ) : (
                <ReactPicture
                  srcset={image.image_url}
                  alt={`review from ${firstname} ${index + 1}`}
                  loader={{ ratio: 1 }}
                />
              )}
            </div>
          ))}
        </div>
        <div className={`${style.reviewItem}__content-variant`}>
          {isRelated ? 'Review on similar product ' : 'Review on '}
          <span className={`${style.reviewItem}__content-variant-name`}>
            <Link to={getVariantLink(variant)} onClick={() => trackReviewEvent('click_review_link')}>
              {variantName}
            </Link>
          </span>
        </div>
      </div>
      <div className={`${style.reviewItem}__footer`}>
        {desktop && <div className={`${style.reviewItem}__date`}>{formatDate(messageTime)}</div>}
      </div>
      {replay.length ? (
        <div className={`${style.reviewItem}__replay`}>
          <div className={`${style.reviewItem}__replay-title`}>Castlery Replied</div>
          <div className={`${style.reviewItem}__replay-content`}>{replay[0].content}</div>
        </div>
      ) : null}
    </div>
  );
};

ProductReviewItem.propTypes = {
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  rating: PropTypes.number,
  messageTitle: PropTypes.string,
  messageTime: PropTypes.string,
  messageContent: PropTypes.string,
  messageImages: PropTypes.array,
  variant: PropTypes.object,
  isRelated: PropTypes.bool,
  variantName: PropTypes.string,
  replay: PropTypes.array,
  tag: PropTypes.object,
  fromModal: PropTypes.bool,
};

const ProductReviewButton = ({ params, fromModal = false }) => {
  const ref = useRef();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      ref.current.style.maxHeight = `${200}px`;
      ref.current.style.border = '1px solid #323433';
    } else {
      ref.current.style.maxHeight = `${0}px`;
      ref.current.style.border = 'none';
    }
  }, [open]);

  return (
    <div className={`${style.review}__buttonWrapper`}>
      <div
        role="menuitem"
        className={classNames(`${style.review}__button`, fromModal ? `${style.review}__button-modal` : '')}
        type="button"
        data-selenium="review_dropdown"
        onClick={() => setOpen((it) => !it)}
      >
        <div className={`${style.review}__button-outer`}>
          <span className={`${style.review}__button-outer-value`}>{params.find((it) => it.selected)?.value}</span>
          <ReactSVG
            className={classNames({
              [`${style.review}__button-outer-arrow`]: true,
            })}
            name="custom-arrow"
          />
        </div>
        <div ref={ref} className={`${style.review}__button-container`} style={{ maxHeight: '0px', border: 'none' }}>
          {params.map(({ clickHandler, value, selected, index }) => (
            <button
              className={classNames(
                `${style.review}__button-container-item`,
                selected ? `${style.review}__button-container-item-active` : ''
              )}
              key={index}
              type="button"
              onClick={clickHandler}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

ProductReviewButton.propTypes = {
  params: PropTypes.array,
  fromModal: PropTypes.bool,
};

const ProductReviewContent = ({ reviews, fromModal }) =>
  reviews.map((it) => <ProductReviewItem fromModal={fromModal} key={it.id} {...it} />);

ProductReviewContent.propTypes = {
  reviews: PropTypes.array,
  fromModal: PropTypes.bool,
};

export const ProductReviewAllPopupHead = ({ needUpdateAllReviewsRef }) => {
  const { paramsArr } = useReviewHead({
    needUpdateAllReviewsRef,
  });

  return (
    <div className={`${style.reviewPopup}__header`}>
      <ProductReviewHead fromModal />
      <ProductReviewButton fromModal params={paramsArr} />
    </div>
  );
};

ProductReviewAllPopupHead.propTypes = {
  needUpdateAllReviewsRef: PropTypes.object,
};

export const ProductReviewAllPopup = ({ needUpdateAllReviewsRef }) => {
  const ref = useRef();

  const { review, loadMore, loadNext, loading } = useReview({
    perPage: 5,
    append: true,
    needUpdateAllReviewsRef,
  });

  useReviewScroll({ ref, loading, loadMore, loadNext });

  return (
    <div ref={ref} className={style.reviewPopup}>
      {review.length ? <ProductReviewContent fromModal reviews={review} /> : null}
      {loading ? (
        <div
          className={classNames({
            [style.loading]: !needUpdateAllReviewsRef.current,
            [`${style.reviewPopup}__contentLoading`]: needUpdateAllReviewsRef.current,
          })}
        >
          <Spinner />
        </div>
      ) : null}
      {!loading && loadMore && (
        <button type="button" onClick={loadNext} className={`${style.reviewPopup}__button`}>
          Load More
        </button>
      )}
    </div>
  );
};

ProductReviewAllPopup.propTypes = {
  needUpdateAllReviewsRef: PropTypes.object,
};

const ProductReviewReadAll = () => {
  const needUpdateAllReviewsRef = useRef(false);
  const { frame } = useMobileFrame();
  const click = useCallback(() => {
    frame.openModal(
      'mobileModal',
      {
        head: <ProductReviewAllPopupHead needUpdateAllReviewsRef={needUpdateAllReviewsRef} />,
        content: <ProductReviewAllPopup needUpdateAllReviewsRef={needUpdateAllReviewsRef} />,
        styleOverflow: 'scroll',
      },
      { height: 85, styleOverflow: 'auto' }
    );
  }, [frame]);
  return (
    <button className={`${style.review}__all`} type="button" onClick={click}>
      Read All Reviews
    </button>
  );
};

const ProductReviewPagination = ({ scrollToRef, totalPage, currentPage, loadCurrent }) => {
  const dispatch = useDispatch();
  const handlePageClick = useCallback(
    (data) => {
      loadCurrent({ index: data.selected + 1 }).then(() => {
        scrollToRef();
      });

      // gtm tracking
      dispatch({
        type: EVENT_PDP_REVIEW_SECTION,
        result: {
          detailAction: 'select_review_page',
          label: data.selected + 1,
        },
      });
    },
    [loadCurrent, scrollToRef, dispatch]
  );
  if (totalPage > 1) {
    return (
      <ReactPaginate
        previousLabel={<SvgIcon name="line-left-arrow" />}
        nextLabel={<SvgIcon name="line-right-arrow" />}
        breakLabel={
          <span className="btn" href="">
            ...
          </span>
        }
        breakClassName="break-me"
        forcePage={currentPage - 1}
        pageCount={totalPage}
        marginPagesDisplayed={2}
        pageRangeDisplayed={2}
        onPageChange={handlePageClick}
        containerClassName={pagStyle.pag}
        pageLinkClassName="btn"
        activeClassName="is-active"
        previousClassName={`${pagStyle.pag}__prev`}
        previousLinkClassName="btn"
        nextClassName={`${pagStyle.pag}__next`}
        nextLinkClassName="btn"
      />
    );
  }
  return null;
};

ProductReviewPagination.propTypes = {
  scrollToRef: PropTypes.func,
  totalPage: PropTypes.number,
  currentPage: PropTypes.number,
  loadCurrent: PropTypes.func,
};

const ProductReview = ({ forwardRef, scrollToRef }) => {
  const { review, product, loading, paramsArr, totalPage, currentPage, loadCurrent } = useReview({
    perPage: 5,
  });
  const { avg_rating: avgRating, show_related_reviews: showRelatedReviews } = product.reviews || {};
  const { desktop } = useBreakpoints();
  if (avgRating < 3 && !showRelatedReviews) {
    return null;
  }

  if (review && review.length > 0) {
    return (
      <Container
        fixed
        className={classNames({
          [`${style.review}`]: true,
        })}
        ref={forwardRef}
      >
        <ProductReviewHead />
        <ProductReviewButton params={paramsArr} />
        <div className="reviewContent">
          <ProductReviewContent reviews={review} />
        </div>
        {!desktop ? (
          <ProductReviewReadAll />
        ) : (
          <ProductReviewPagination
            scrollToRef={scrollToRef}
            totalPage={totalPage}
            currentPage={currentPage}
            loadCurrent={loadCurrent}
          />
        )}
        {loading && (
          <div className={`${style.review}__loading`}>
            <Spinner />
          </div>
        )}
      </Container>
    );
  }
  if (loading) {
    return (
      <div className={style.loading}>
        <Spinner />
      </div>
    );
  }
  return null;
};

ProductReview.propTypes = {
  forwardRef: PropTypes.object,
  scrollToRef: PropTypes.func,
};

export default ProductReview;
