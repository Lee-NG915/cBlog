import { useCurrentProduct, useCurrentSelectedVariants } from 'containers/Product/hooks/product';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadIfNeeded as fetchGlobalReview } from 'redux/modules/globalReview';
import { GlobalReviewInfoType, GlobalReviewListItemType } from '../types/types';
import useBreakpoints from 'fortress/hooks/useBreakpoints/useBreakpoints';
import { useImgModal } from 'containers/Product/hooks/gallery';
import { CountryCode, CountryCodeToName } from 'config/country';

// export enum Country {
//   ALL = 'ALL',
//   US = 'US',
//   AU = 'AU',
//   SG = 'SG',
//   CA = 'CA',
// }

export enum OrderItems {
  recommended = 'recommended',
  mostRecent = 'most_recent',
  ratingHighToLow = 'rating_high_to_low',
  ratingLowToHigh = 'rating_low_to_high',
  withImage = 'with_image',
}

type VariantInfo = {
  product_slug: string;
  sku: string;
};

type ProductInfo = {
  variant: VariantInfo[];
  slug: string;
};

const useGlobalReview = () => {
  const handleSelectCountryFirstLoad = () =>
    // switch (__COUNTRY__) {
    // case CountryCode.CA:
    //   return CountryCode.CA;
    // case CountryCode.US:
    //   return CountryCode.US;
    // case CountryCode.AU:
    //   return CountryCode.AU;
    // case CountryCode.SG:
    //   return CountryCode.SG;
    // default:
    //   return CountryCode.ALL;
    // }
    CountryCode[__COUNTRY__ as keyof typeof CountryCode] ? __COUNTRY__ : 'ALL';
  const renderLocationWholeName = (location: string) =>
    // switch (location) {
    //   case 'SG':
    //     return 'Singapore';
    //   case 'US':
    //     return 'United States';
    //   case 'AU':
    //     return 'Australia';
    //   default:
    //     return location;
    // }
    CountryCodeToName[location as keyof typeof CountryCodeToName] || location;
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const open = useImgModal();
  // 0 is global loading state, 1 is a part loading state, 2 is not loading state.
  const [loadingState, setLoadingState] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewListData, setReviewListData] = useState<GlobalReviewListItemType[]>();
  const [selectCountry, setSelectCountry] = useState<CountryCode>(handleSelectCountryFirstLoad());
  const [orderItems, setOrderItems] = useState<OrderItems>(OrderItems.recommended);
  const [productVariantCode, setProductVariantCode] = useState<string>('');
  const [productBundleVariantCode, setProductBundleVariantCode] = useState<string>('');
  const [currentMarketCount, setCurrentMarketCount] = useState(0);
  const [firstEnter, setFirstEnter] = useState(true);
  const product = useCurrentProduct();
  const bundleProduct: {
    [key: string]: { sku: string };
  } = useCurrentSelectedVariants();

  useEffect(() => {
    if (Object.keys(bundleProduct).length > 0) {
      let skuJoinStr = '';
      const keys = Object.keys(bundleProduct);
      keys.forEach((key, index) => {
        skuJoinStr += bundleProduct[key].sku;
        if (index < keys.length - 1) {
          skuJoinStr += ',';
        }
      });
      setProductBundleVariantCode(skuJoinStr);
    }
    product.variants.forEach((item: VariantInfo) => {
      if (item.product_slug === product.slug) {
        setProductVariantCode(item.sku);
      }
    });
  }, [product]);
  const globalReviewInfo = useSelector((state: { globalReview: GlobalReviewInfoType }) => state.globalReview);
  const reviewsSummary: { average_rating: number; total_count: number } = useCurrentProduct().reviews;
  const updateData = useCallback(() => {
    if (globalReviewInfo) {
      if (globalReviewInfo.loading) {
        setLoadingState(reviewListData ? 1 : 0);
      } else if (globalReviewInfo.data) {
        if (globalReviewInfo.data.current_page === 1 && globalReviewInfo.data.results.length <= 5) {
          setCurrentPage(1);
        }
        const tempArr: GlobalReviewListItemType[] = [];
        setCurrentMarketCount(globalReviewInfo.data.count);
        globalReviewInfo.data.results.forEach((item) => {
          const temp: GlobalReviewListItemType = {
            id: item.id,
            info: {
              customerName: item.user_name,
              rateNum: item.rating,
              location: renderLocationWholeName(item.country),
              reviewStatus: item.is_featured ? 'Top Review' : '',
            },
            content: {
              basedCountry: item.country,
              title: item.title,
              content: item.content,
              attachmentsZoom: item.attachments.map((image) => {
                return image.url.replace(
                  /upload\//,
                  !desktop ? 'upload/w_1000,f_auto,q_auto/' : 'upload/w_2000,f_auto,q_auto/'
                );
              }),
              updatedAt: item.updated_at,
              createdAt: item.created_at,
              relativeProduct: {
                name: item.variant.name,
                linkNeeded: item.variant,
                relation_type: item.relation_type,
              },
              replies:
                item.replies.map((reply) => {
                  if (reply.attachments.length > 0) {
                    const temp = reply;
                    temp.attachmentsZoom = temp.attachments.map((image) => {
                      return image.url.replace(
                        /upload\//,
                        !desktop ? 'upload/w_1000,f_auto,q_auto/' : 'upload/w_2000,f_auto,q_auto/'
                      );
                    });
                    temp.attachmentsReal = temp.attachments.map((image, i) => {
                      return {
                        image_url: image.url,
                        clickHandler: () => open(temp.attachmentsZoom, i),
                      };
                    });
                    return temp;
                  } else {
                    return {
                      ...reply,
                      attachments: [],
                    };
                  }
                }) || [],
            },
            tag: 'top_review',
          };
          temp.content.imageList = temp.content.attachmentsZoom.map((image, i) => {
            return {
              image_url: image,
              clickHandler: () => open(temp.content.attachmentsZoom, i),
            };
          });
          tempArr.push(temp);
        });
        if (
          globalReviewInfo.visitedArray.length > 0 &&
          globalReviewInfo.data.count !== 0 &&
          globalReviewInfo.country === selectCountry &&
          globalReviewInfo.visitedArray[globalReviewInfo.visitedArray.length - 1] ===
            `${productVariantCode}+${productBundleVariantCode}`
        ) {
          setFirstEnter(false);
        }
        setReviewListData(tempArr);
        setLoadingState(2);
      }
    }
  }, [globalReviewInfo]);
  useEffect(() => {
    if (dispatch && productVariantCode) {
      dispatch(fetchGlobalReview(productVariantCode, selectCountry, orderItems, currentPage, productBundleVariantCode));
    }
  }, [dispatch, currentPage, productVariantCode, selectCountry, orderItems, productBundleVariantCode]);
  // useEffect(() => {
  //   if (dispatch && productVariantCode) {
  //     dispatch(fetchReviewsSummary(productVariantCode));
  //   }
  // }, [dispatch, productVariantCode]);
  useEffect(() => {
    updateData();
  }, [globalReviewInfo]);

  useEffect(() => {
    if (globalReviewInfo.country === selectCountry && globalReviewInfo.data?.count === 0 && firstEnter) {
      setSelectCountry(CountryCode.ALL);
      setFirstEnter(false);
    }
  }, [globalReviewInfo, firstEnter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectCountry, orderItems]);

  return {
    loadingState,
    setCurrentPage,
    reviewListData,
    setSelectCountry,
    setOrderItems,
    pageCount: globalReviewInfo?.data?.total_pages || 1,
    productVariantCode,
    reviewsSummary,
    currentMarketCount,
    productBundleVariantCode,
    selectCountry,
    currentPage,
  };
};

export default useGlobalReview;
