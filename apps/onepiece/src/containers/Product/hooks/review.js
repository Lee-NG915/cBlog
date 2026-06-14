import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ApiClient from 'helpers/ApiClient';
import { useDispatch } from 'react-redux';
import { updateReviewIndex } from 'redux/modules/productOptions';
import { EVENT_PDP_REVIEW_SECTION } from 'utils/track/constants';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useProductOptions, useCurrentProduct } from './product';
import { useImgModal } from './gallery';

const useReviewHead = (props = {}) => {
  const dispatch = useDispatch();
  const needUpdateAllReviews = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const product = useCurrentProduct();
  const { currentReviewIndex } = useProductOptions();
  const { perPage = 2, needUpdateAllReviewsRef } = props;

  const targetUpdateAllREviewsRef = needUpdateAllReviewsRef || needUpdateAllReviews;

  const reviewDropdownOption = [
    'Recommended',
    'Most Recent',
    'Rating - High to Low',
    'Rating - Low to High',
    'With Pictures',
  ];
  const updateReviewIndexHandler = useCallback(
    (i) => {
      setCurrentPage(1);
      targetUpdateAllREviewsRef.current = true;
      dispatch(updateReviewIndex(i));

      dispatch({
        type: EVENT_PDP_REVIEW_SECTION,
        result: {
          detailAction: 'review_dropdown',
          label: reviewDropdownOption[i],
        },
      });
    },
    [dispatch, targetUpdateAllREviewsRef]
  );

  const paramsArr = useMemo(
    () =>
      Array(5)
        .fill(0)
        .map((_, i) => {
          const re = {
            index: i,
            params: {
              product_id: product.id,
              page: 1,
              per_page: perPage,
            },
            value: reviewDropdownOption[i],
            selected: currentReviewIndex === i,
            clickHandler: () => updateReviewIndexHandler(i),
          };
          if (i === 1) {
            re.params.created_at = 'desc';
          }
          if (i === 2) {
            re.params.rating = 'desc';
          }
          if (i === 3) {
            re.params.rating = 'asc';
          }
          if (i === 4) {
            re.params.only_image = 'true';
          }
          return re;
        }),
    [updateReviewIndexHandler, product, currentReviewIndex, perPage]
  );

  return {
    needUpdateAllReviewsRef: targetUpdateAllREviewsRef,
    setCurrentPage,
    currentPage,
    product,
    paramsArr,
  };
};

const useReview = (props = {}) => {
  const { product, paramsArr, needUpdateAllReviewsRef, currentPage, setCurrentPage } = useReviewHead(props);
  const withPicture = useRef(true);
  const { append = false } = props;
  const open = useImgModal();
  const totalPage = useRef();
  const mountedRef = useRef(false);
  const { init, currentReviewIndex } = useProductOptions();
  const [review, setReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadMore, setLoadMore] = useState(false);
  const client = useMemo(() => new ApiClient(), []);
  const { desktop } = useBreakpoints();
  const loadCurrent = useCallback(
    (loadProps = {}) => {
      setLoading(true);
      const { index = 1 } = loadProps;

      const params = {
        ...paramsArr[currentReviewIndex].params,
        page: index,
      };
      console.log(params);
      return client
        .get('/reviews', {
          params: {
            ...paramsArr[currentReviewIndex].params,
            page: index,
          },
        })
        .then((result) => {
          console.log(result);
          if (result.with_picture_count <= 0) {
            withPicture.current = false;
          }
          if (mountedRef.current) {
            if (result.results.length > 0) {
              const newReview = result.results.map((it) => {
                const temp = {
                  id: it.id,
                  firstname: it.messages[0]?.user?.firstname,
                  lastname: it.messages[0]?.user?.lastname,
                  rating: it.rating_product,
                  messageTitle: it.messages[0].title,
                  messageTime: it.messages[0].created_at,
                  messageContent: it.messages[0].content,
                  messageImages: it.messages[0].images,
                  messageImagesZoom: it.messages[0].images.map((image) =>
                    image.image_url.replace(
                      /upload\//,
                      !desktop ? 'upload/w_1000,f_auto,q_auto/' : 'upload/w_2000,f_auto,q_auto/'
                    )
                  ),
                  variant: it.variant,
                  isRelated: it.is_related,
                  variantName: it.variant.name,
                  options:
                    it.variant.product_type === 'bundle'
                      ? it.bundle_options
                          .map((o) => {
                            if (o.bundle_option_type !== 'simple') {
                              return {
                                id: o.id,
                                key: o.presentation,
                                value: o.variant.variant_option_values[0].presentation,
                              };
                            }
                            return null;
                          })
                          .filter(Boolean)
                      : it.variant.variant_option_values.map((o, i) => ({
                          id: i,
                          key: o.option_type_presentation,
                          value: o.presentation,
                        })),
                  replay: it.messages.slice(1),
                  tag: it.incentive,
                };
                temp.messageImages = temp.messageImages.map((image, i) => {
                  const newImage = image;
                  newImage.clickHandler = () => open(temp.messageImagesZoom, i);
                  return newImage;
                });
                return temp;
              });
              if (append) {
                if (needUpdateAllReviewsRef.current) {
                  setReview(newReview);
                } else {
                  setReview((last) => [...last, ...newReview]);
                }
              } else {
                setReview(newReview);
              }
            }
            needUpdateAllReviewsRef.current = false;
            setLoadMore(result.total_pages > result.current_page);
            setCurrentPage(index);
            totalPage.current = result.total_pages;
            setLoading(false);
          }
        })
        .catch((error) => {
          if (mountedRef.current) {
            console.log(error);
            setLoading(false);
          }
        });
    },
    [desktop, open, client, append, paramsArr, setCurrentPage, currentReviewIndex, needUpdateAllReviewsRef]
  );

  const loadNext = useCallback(() => loadCurrent({ index: currentPage + 1 }), [loadCurrent, currentPage]);

  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  useEffect(() => {
    needUpdateAllReviewsRef.current = true;
  }, [product, needUpdateAllReviewsRef]);

  // auto load first page
  useEffect(() => {
    if (init) {
      loadCurrent();
    }
  }, [loadCurrent, product, init]);

  let checkWithPicture = paramsArr;
  if (!withPicture.current) {
    checkWithPicture = paramsArr.slice(0, -1);
  }
  return {
    review,
    product,
    paramsArr: checkWithPicture,
    loadMore,
    loadNext,
    loading,
    currentPage,
    loadCurrent,
    totalPage: totalPage.current,
  };
};

const useReviewScroll = ({ ref, loadNext, loadMore, loading }) => {
  const loadingRef = useRef();
  const loadNextRef = useRef();
  const loadMoreRef = useRef();
  loadNextRef.current = loadNext;
  loadMoreRef.current = loadMore;
  loadingRef.current = loading;
  const scrollCallback = useCallback(() => {
    if (!loadingRef.current && loadNextRef.current && loadMoreRef.current) {
      loadNextRef.current();
    }
  }, []);

  useEffect(() => {
    const modal = document.querySelector('#modal');
    const scrollEle = modal.firstElementChild?.firstElementChild?.children[1]?.firstElementChild;
    const eventCallbck = () => {
      const { current: item } = ref;
      if (item && scrollEle.scrollTop >= item.offsetHeight - 1300) {
        scrollCallback();
      }
    };
    if (scrollEle) {
      scrollEle.addEventListener('scroll', eventCallbck);
      return () => scrollEle.removeEventListener('scroll', eventCallbck);
    }
  }, [ref, scrollCallback]);
};

export { useReviewHead, useReview, useReviewScroll };
