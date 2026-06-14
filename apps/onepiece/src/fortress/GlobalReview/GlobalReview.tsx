import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Container, Select, Stack, Typography } from 'fortress';
import Option from '@mui/joy/Option';
import { ReviewList } from './components/ReviewList/ReviewList';
import ReviewPagination from './components/ReviewPagination/ReviewPagination';
import useBreakpoints from 'fortress/hooks/useBreakpoints/useBreakpoints';
import ReviewReadMore from './components/ReviewReadMore/ReviewReadMore';
import GlobalLoading from './components/ReviewLoading/GlobalLoading';
import useGlobalReview, { OrderItems } from './hooks/useGlobalReview';
import { useMobileFrame } from 'containers/Product/hooks/product';
import ReviewLoading from './components/ReviewLoading/ReviewLoading';
import ReviewMoreBody from './components/ReviewMoreBody/ReviewMoreBody';
import Rating from 'components/Rating';
import { ColorPalette } from 'utils/color';
import { CountryCode, CountryName } from 'config/country';

type GlobalReviewProps = {
  forwardRef: React.RefObject<HTMLDivElement>;
};

const GlobalReview = ({ forwardRef }: GlobalReviewProps) => {
  const { mobile } = useBreakpoints();
  const {
    loadingState,
    setCurrentPage,
    reviewListData,
    setSelectCountry,
    setOrderItems,
    pageCount,
    productVariantCode,
    reviewsSummary,
    productBundleVariantCode,
    selectCountry,
    currentPage,
  } = useGlobalReview();
  const headerRef = useRef<HTMLSpanElement>(null);
  const { frame } = useMobileFrame();
  const [pageHasChanging, setPageHasChanging] = useState(false);
  useEffect(() => {
    if (pageHasChanging && loadingState === 2) {
      setPageHasChanging(false);
      headerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pageHasChanging, loadingState]);
  const click = useCallback(() => {
    frame?.openModal(
      'mobileModal',
      {
        head: <></>,
        content: <ReviewMoreBody variantCode={productVariantCode} bundleVariantCodes={productBundleVariantCode} />,
        styleOverflow: 'scroll',
      },
      { height: 85, styleOverflow: 'auto' }
    );
  }, [frame, productVariantCode]);
  const renderHeader = () => {
    return (
      <>
        <Typography
          sx={(theme) => ({
            fontFamily: 'MinervaModern',
            fontSize: '24px', // 默认字体大小
            [theme.breakpoints.up('md')]: {
              // >= 768px
              fontSize: '32px',
            },
            [theme.breakpoints.up('xl')]: {
              // >= 1200px
              fontSize: '40px',
            },
            // fontFamily: 'cursive',
            color: theme.palette.brand.charcoal[800],
            mt: theme.spacing(2),
          })}
          ref={headerRef}
        >
          Customer Reviews
        </Typography>
        <Stack
          sx={() => ({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
          })}
        >
          {reviewsSummary && (
            <>
              <Rating
                rating={reviewsSummary.average_rating}
                margin={1}
                size={14}
                innerType="outline"
                innerColor={ColorPalette.primary}
                outerColor={ColorPalette.primary}
              />
              <Typography
                sx={(theme) => ({
                  fontSize: '1.125rem',
                  color: theme.palette.brand.charcoal[900],
                  marginLeft: 3,
                })}
              >
                {`${reviewsSummary.total_count} ${reviewsSummary.total_count > 1 ? 'reviews' : 'review'} globally`}
              </Typography>
            </>
          )}
        </Stack>
      </>
    );
  };
  const renderRecommendTypeList = () => {
    return (
      <>
        <Option
          sx={{
            color: '#323433',
          }}
          value="recommended"
        >
          Recommended
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="most_recent"
        >
          Most Recent
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="rating_high_to_low"
        >
          Rating - High to Low
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="rating_low_to_high"
        >
          Rating - Low to High
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="with_image"
        >
          With Pictures
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="product_self"
        >
          View Product Itself
        </Option>
      </>
    );
  };
  const renderCountryTypeList = () => {
    return (
      <>
        {Object.keys(CountryCode).map((key) => {
          return (
            <Option
              sx={{
                color: '#323433',
              }}
              value={key}
              key={key}
            >
              {CountryName[key as keyof typeof CountryName]}
            </Option>
          );
        })}
        {/* <Option
          sx={{
            color: '#323433',
          }}
          value="ALL"
        >
          All Reviews
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="SG"
        >
          Singapore
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="AU"
        >
          Australia
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="US"
        >
          United States
        </Option>
        <Option
          sx={{
            color: '#323433',
          }}
          value="CA"
        >
          Canada
        </Option> */}
      </>
    );
  };
  const handleSelectCountryFirstLoad = () => {
    // switch (selectCountry) {
    //   case 'US':
    //     return 'US';
    //   case 'AU':
    //     return 'AU';
    //   case 'SG':
    //     return 'SG';
    //   default:
    //     return 'ALL';
    // }
    return CountryCode[selectCountry as keyof typeof CountryCode] ? selectCountry : 'ALL';
  };
  const renderSelectBar = () => {
    return (
      <Stack
        sx={() => ({
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          padding: '0 20px',
          justifyContent: mobile ? 'center' : 'space-between',
          marginBottom: 7,
        })}
      >
        <Box
          sx={() => ({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: !mobile ? 0 : 3,
          })}
        >
          {!mobile && (
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#323433',
                marginRight: 1,
              }}
            >
              Sort by:
            </Typography>
          )}
          <Select
            sx={(theme) => ({
              borderColor: theme.palette.brand.terracotta[300],
              color: '#323443 !important',
              minWidth: mobile ? '171px' : '204px',
              ':hover': {
                backgroundColor: 'transparent',
              },
              '& .MuiSelect-icon': {
                color: '#323443',
              },
            })}
            onChange={(event: React.SyntheticEvent | null, newValue: OrderItems) => setOrderItems(newValue)}
            defaultValue="recommended"
          >
            {renderRecommendTypeList()}
          </Select>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {!mobile && (
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#323433',
                marginRight: 1,
              }}
            >
              Reviews:
            </Typography>
          )}
          <Select
            sx={(theme: any) => ({
              borderColor: theme.palette.brand.terracotta[300],
              color: '#323443 !important',
              minWidth: mobile ? '171px' : '204px',
              ':hover': {
                backgroundColor: 'transparent',
              },
              '& .MuiSelect-icon': {
                color: '#323443',
              },
            })}
            onChange={(event: React.SyntheticEvent | null, newValue: Country) => setSelectCountry(newValue)}
            value={selectCountry}
          >
            {renderCountryTypeList()}
          </Select>
        </Box>
      </Stack>
    );
  };

  const renderPagination = () => {
    if (mobile) {
      return <ReviewReadMore handleClick={click} />;
    }
    return (
      <ReviewPagination
        pageCount={pageCount}
        onCurrentPageChange={(page) => {
          setCurrentPage(page);
          setTimeout(() => {
            setPageHasChanging(true);
          }, 100);
        }}
        currentPage={currentPage}
      />
    );
  };
  const emptyReviewsText = () => {
    return (
      <Typography
        sx={(theme) => ({
          fontSize: '1.125rem',
          color: theme.palette.brand.charcoal[900],
        })}
      >
        There are currently no reviews available.
      </Typography>
    );
  };

  if (loadingState === 0 || reviewListData === undefined) {
    return <GlobalLoading />;
  }
  return (
    <Container
      sx={{
        marginBottom: mobile ? '40px' : '60px',
      }}
    >
      <Box
        sx={() => ({
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        })}
        ref={forwardRef}
      >
        {renderHeader()}
        {renderSelectBar()}
        {loadingState === 2 && reviewListData.length === 0 && emptyReviewsText()}
        <ReviewList list={reviewListData} />
        {renderPagination()}
        {loadingState === 1 && <ReviewLoading list={reviewListData} />}
      </Box>
    </Container>
  );
};

export { GlobalReview };
