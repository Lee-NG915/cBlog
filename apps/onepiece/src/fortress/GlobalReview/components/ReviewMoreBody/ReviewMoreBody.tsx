import React, { useEffect, useRef, useState } from 'react';
import { OrderItems } from 'fortress/GlobalReview/hooks/useGlobalReview';
import { Box } from 'fortress';
import { ReviewList } from '../ReviewList/ReviewList';
import ReviewMoreHeader from '../ReviewMoreHeader/ReviewMoreHeader';
import Spinner from 'components/Spinner';
import ApiClient from 'helpers/ApiClient';
import { GlobalReviewListItemType } from 'fortress/GlobalReview/types/types';
import { useImgModal } from 'containers/Product/hooks/gallery';
import { CountryCode } from 'config/country';

type ReviewMoreBodyProps = {
  variantCode: string;
  bundleVariantCodes: string;
};

const ReviewMoreBody = ({ variantCode, bundleVariantCodes = '' }: ReviewMoreBodyProps) => {
  const handleSelectCountryFirstLoad = () => {
    // switch (__COUNTRY__) {
    //   case 'US':
    //     return Country.US;
    //   case 'AU':
    //     return Country.AU;
    //   case 'SG':
    //     return Country.SG;
    //   default:
    //     return Country.ALL;
    // }
    return CountryCode[__COUNTRY__ as keyof typeof CountryCode] ? __COUNTRY__ : 'ALL';
  };
  const renderLocationWholeName = (location: string) => {
    switch (location) {
      case 'SG':
        return 'Singapore';
      case 'US':
        return 'United States';
      case 'AU':
        return 'Australia';
      default:
        return location;
    }
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const client = new ApiClient();
  const open = useImgModal();
  const [reviewListData, setReviewListData] = useState<GlobalReviewListItemType[]>([]);
  const [selectCountry, setSelectCountry] = useState<CountryCode>(handleSelectCountryFirstLoad());
  const [orderItems, setOrderItems] = useState<OrderItems>(OrderItems.recommended);
  const currentPageRef = useRef(1);
  const pageNumRef = useRef(1);
  const [loadingState, setLoadingState] = useState(0);
  const [firstEnter, setFirstEnter] = useState(true);

  const fetchData = (nowPage: number) => {
    client
      .get('/gw/reviews/by_variant', {
        params: {
          variant_code: variantCode,
          country: selectCountry,
          order_by: orderItems,
          page: nowPage,
          per_page: 5,
          bundle_variant_codes: bundleVariantCodes,
        },
      })
      .then(
        (res: {
          current_page: number;
          per_page: number;
          count: number;
          results: {
            id: number;
            user_name: string;
            rating: number;
            country: string;
            is_featured: boolean;
            title: string;
            content: string;
            attachments: { url: string }[];
            updated_at: string;
            created_at: string;
            variant: { name: string; product_slug: string };
            relation_type: string;
            replies: {
              id: string;
              user_name: string;
              content: string;
              attachments: { url: string }[];
              attachmentsZoom: string[];
              attachmentsReal: { image_url: string; clickHandler?: () => void }[];
            }[];
          }[];
        }) => {
          setLoadingState(2);
          pageNumRef.current = Math.ceil(res.count / res.per_page);
          if (res.count === 0 && firstEnter) {
            setSelectCountry(CountryCode.ALL);
          }
          setFirstEnter(false);
          const tempArr: GlobalReviewListItemType[] = [];
          res.results.forEach((item) => {
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
                  return image.url.replace(/upload\//, 'upload/w_1000,f_auto,q_auto/');
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
                        return image.url.replace(/upload\//, 'upload/w_1000,f_auto,q_auto/');
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
          setReviewListData(tempArr);
        }
      )
      .catch((err: any) => {
        console.log('🚀 ~ file: ReviewMoreBody.tsx:158 ~ fetchData ~ err:', err);
      });
  };

  useEffect(() => {
    setLoadingState(0);
    fetchData(1);
  }, [variantCode, selectCountry, orderItems]);

  const scrollCallback = () => {
    if (currentPageRef.current < pageNumRef.current) {
      setLoadingState(1);
      fetchData(currentPageRef.current + 1);
      currentPageRef.current += 1;
    }
  };

  useEffect(() => {
    const modal = document.querySelector('#modal');
    if (modal) {
      const scrollEle = modal.firstElementChild?.firstElementChild?.children[1]?.firstElementChild;
      const eventCallback = () => {
        if (scrollEle?.scrollTop) {
          if (scrollEle.scrollTop + scrollEle.clientHeight >= scrollEle.scrollHeight) {
            scrollCallback();
          }
        }
      };
      if (scrollEle) {
        scrollEle.addEventListener('scroll', eventCallback);
        return () => scrollEle.removeEventListener('scroll', eventCallback);
      }
    }
  }, []);

  useEffect(() => {
    const modal = document.querySelector('#modal');
    if (modal) {
      const scrollEle = modal.firstElementChild?.firstElementChild?.children[1]?.firstElementChild;
      const preventDefault = (e: TouchEvent) => {
        e.preventDefault();
      };
      const eventCallback = () => {
        if (scrollEle?.scrollTop) {
          if (scrollEle.scrollTop + scrollEle.clientHeight >= scrollEle.scrollHeight - 1) {
            scrollCallback();
          }
        }
      };
      if (scrollEle) {
        if (loadingState !== 2) {
          scrollEle.addEventListener('touchmove', preventDefault, { passive: false });
          scrollEle.addEventListener('wheel', preventDefault, { passive: false });
        } else {
          scrollEle.removeEventListener('touchmove', preventDefault);
          scrollEle.removeEventListener('wheel', preventDefault);
          scrollEle.addEventListener('scroll', eventCallback);
        }
        return () => {
          scrollEle.removeEventListener('touchmove', preventDefault);
          scrollEle.removeEventListener('wheel', preventDefault);
        };
      }
    }
  }, [loadingState]);

  useEffect(() => {
    currentPageRef.current = 1;
  }, [selectCountry, orderItems]);

  if (reviewListData) {
    return (
      <Box
        sx={() => ({
          paddingLeft: 3,
          paddingTop: 5,
        })}
        ref={containerRef}
        id="review-more-body"
      >
        <ReviewMoreHeader
          selectCountry={selectCountry}
          setOrderItems={setOrderItems}
          setSelectCountry={setSelectCountry}
        />
        {loadingState === 0 && (
          <Box
            sx={() => ({
              width: '100%',
              height: '100%',
              paddingRight: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            })}
          >
            <Spinner />
          </Box>
        )}
        <ReviewList list={reviewListData} isInInfinite={true} needRefresh={currentPageRef.current === 1} />
        {loadingState === 1 && (
          <Box sx={{ justifyContent: 'center', position: 'relative' }}>
            <Spinner />
          </Box>
        )}
      </Box>
    );
  }
  return null;

  //   useReviewScroll({ ref, loading, loadMore, loadNext });
};

export default ReviewMoreBody;
