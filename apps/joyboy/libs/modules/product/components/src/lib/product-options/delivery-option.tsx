/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { Box, Input, ListItem, NiceModal, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import {
  Product,
  getFormattedCity,
  selectLeadtimeShippingFee,
  selectStockLocation,
  selectedLeadtimeShippingFeeIsFetching,
  useGetCityZipcodeListQuery,
} from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { ProductOptionLabel } from './product-option-label';
import { Close, Loading, Warning } from '@castlery/fortress/Icons';
import { EcEnv, enableZipCode } from '@castlery/config';
import { useCallback, useEffect, useState } from 'react';
import {
  getCityInfo,
  noticeCityInfoUpdated,
  selectedCurrentCityCanBeApply,
  selectedCurrentCanFindSKU,
  updateCityCanBeApply,
  updateCanFindSKU,
} from '@castlery/modules-user-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useDebounce } from 'react-use';
import { refreshCheckout, selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { useRouter } from 'next/navigation';
import { orderFeatureService } from '@castlery/modules-order-services';
import { updateZipcodeInCart } from '@castlery/modules-cart-domain';
import { sharedFeatureService } from '@castlery/shared-services';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;
export interface CityCubeProps {
  description: string;
  handleClick: () => void;
  showCannotFind?: boolean;
}

const CityCube = ({ description, handleClick, showCannotFind = false }: CityCubeProps) => {
  return (
    <Typography
      sx={{
        textWrap: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '4px 16px',
        ':active': {
          backgroundColor: '#ebebeb',
        },
      }}
      onClick={handleClick}
    >
      {description}
    </Typography>
  );
};

const selectLastCityInfo = () => {
  return orderFeatureService.defaultCity;
};
export interface DeliveryOptionProps {
  needShowCustomized: boolean;
  productData?: Product;
  onRefreshProductInfo: (cityInfo: { city: string; state: string; zipcode: string }) => void;
}

export function DeliveryOption({ needShowCustomized, onRefreshProductInfo, productData }: DeliveryOptionProps) {
  const leadtimeShippingFee = useAppSelector(selectLeadtimeShippingFee);
  const leadtimeShippingFeeIsFetching = useAppSelector(selectedLeadtimeShippingFeeIsFetching);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mobile } = useBreakpoints();
  const labelText = enableZipCode ? 'Ships To' : 'Estimated Delivery';
  // eslint-disable-next-line
  const [hasSearchZipcode, setHasSearchZipcode] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cityInfo, setCityInfo] = useState<{
    city: string;
    state: string;
    zipcode: string;
  }>();
  const dispatch = useAppDispatch();

  const handleCityInfo = useCallback(async () => {
    const tempCityInfo = await dispatch(getCityInfo());
    setCityInfo(tempCityInfo.payload);
  }, [dispatch]);
  useEffect(() => {
    if (enableZipCode) {
      handleCityInfo();
    }
  }, [handleCityInfo]);
  const { isFetching, currentData: zipcodeData } = useGetCityZipcodeListQuery(searchKeyword, {
    skip: !hasSearchZipcode && searchKeyword.length === 0,
  });
  const [inputValue, setInputValue] = useState<string>('');
  const currentCityCanApply = useAppSelector(selectedCurrentCityCanBeApply);
  const currentSKUCanFind = useAppSelector(selectedCurrentCanFindSKU);
  const currentStockLocation = useAppSelector(selectStockLocation);
  const router = useRouter();
  const { city } = makePersistenceHandles();
  const [extendShow, setExtendShow] = useState(false);
  const orderNumber = useAppSelector(selectCurrentOrderNumber);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  useDebounce(
    () => {
      //PM需求：减少Google place接口调用，debounce & length > 3
      if (!inputValue || inputValue.length < 3) return;
      setSearchKeyword(inputValue);
    },
    800,
    [inputValue]
  );
  const [lastCityInfo, setLastCityInfo] = useState(selectLastCityInfo());

  const rollbackToLastCityInfo = async () => {
    await city.setItem(JSON.stringify(lastCityInfo));
    dispatch(noticeCityInfoUpdated(lastCityInfo));
    onRefreshProductInfo(lastCityInfo);
  };

  const handleRedirectToSPULink = async () => {
    await router.replace(`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${productData?.product_slug}`);
    setTimeout(() => {
      // eslint-disable-next-line
      location.reload();
    }, 3000);
  };

  useEffect(() => {
    if (!currentCityCanApply) {
      if (!errorModalOpen) {
        setErrorModalOpen(true);
      }
      // rollbackToLastCityInfo();
    }
    // eslint-disable-next-line
  }, [currentCityCanApply]);
  useEffect(() => {
    if (!currentSKUCanFind) {
      if (!errorModalOpen) {
        setErrorModalOpen(true);
      }
    }
    // eslint-disable-next-line
  }, [currentSKUCanFind]);

  // useEffect(() => {
  //   if (currentCityCanApply && cityInfo) {
  //     onRefreshProductInfo(cityInfo);
  //   }
  // }, [cityInfo, currentCityCanApply, onRefreshProductInfo]);

  const renderSelectZipcode = () => {
    if (hasSearchZipcode) {
      return (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: '200px',
            py: 4,
          }}
        >
          <Input
            sx={{
              border: 'none',
            }}
            autoFocus
            placeholder="Zip Code"
            variant="borderplain"
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              const formatter = orderFeatureService.zipcodeFormatUtil;
              const str = typeof formatter === 'function' ? formatter(value) : value;
              setInputValue(str);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && zipcodeData && zipcodeData.length > 0) {
                const firstItem = zipcodeData[0];

                const result = await dispatch(getFormattedCity.initiate(firstItem.google_place_id));
                if (result?.data) {
                  const temp: {
                    city: string;
                    state: string;
                    zipcode: string;
                  } = {
                    city: result.data.city,
                    zipcode: result.data.zipcode,
                    state: result.data.state_name,
                  };
                  setCityInfo(temp);
                  const lastCity = await city.getItem();
                  if (lastCity !== null) {
                    setLastCityInfo(JSON.parse(lastCity as string));
                  }
                  await city.setItem(JSON.stringify(temp));
                  dispatch(noticeCityInfoUpdated(temp));
                  if (orderNumber) {
                    await dispatch(
                      refreshCheckout.initiate({
                        order: orderNumber,
                        city: temp.city,
                        state: temp.state,
                        zipcode: temp.zipcode,
                      })
                    );
                  }
                  if (enableOrderV2) {
                    await dispatch(
                      updateZipcodeInCart.initiate({
                        zipcode: temp.zipcode,
                        countryState: temp.state,
                        city: temp.city,
                      })
                    );
                  }
                  onRefreshProductInfo(temp);
                  setSearchKeyword('');
                  setHasSearchZipcode(false);
                }
              }
            }}
            onFocus={() => setExtendShow(true)}
            onBlur={() => {
              setTimeout(() => {
                setExtendShow(false);
              }, 500);
            }}
          />
          <Loading
            sx={{
              '@keyframes rotate': {
                from: {
                  transform: 'rotate(0deg)',
                },
                to: {
                  transform: 'rotate(360deg)',
                },
              },
              animation: 'rotate .5s linear infinite',
              opacity: isFetching ? 1 : 0,
            }}
          />
          <Close
            sx={{
              width: '24px',
              height: '24px',
              color: '#ddd',
              cursor: 'pointer',
            }}
            onClick={() => setHasSearchZipcode(false)}
          />
          {Array.isArray(zipcodeData) && searchKeyword.length > 0 && extendShow && (
            <Box
              sx={{
                position: 'absolute',
                top: '102%',
                left: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: (theme) => theme.palette.brand.charcoal[0],
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Stack
                sx={{
                  padding: '4px 0',
                }}
              >
                {zipcodeData?.map((item, index) => (
                  <CityCube
                    key={index}
                    description={item.description}
                    handleClick={async () => {
                      // 为啥不抽象一下逻辑？两个地方维护......
                      setExtendShow(true);
                      const result = await dispatch(getFormattedCity.initiate(item.google_place_id));
                      if (result?.data) {
                        const temp: {
                          city: string;
                          state: string;
                          zipcode: string;
                        } = {
                          city: result.data.city,
                          zipcode: result.data.zipcode,
                          state: result.data.state_name,
                        };
                        setCityInfo(temp);
                        await city.getItem();
                        if (city.getItem() !== null) {
                          setLastCityInfo(JSON.parse(city.getItem() as any));
                        }
                        await city.setItem(JSON.stringify(temp));
                        dispatch(noticeCityInfoUpdated(temp));
                        if (orderNumber) {
                          await dispatch(
                            refreshCheckout.initiate({
                              order: orderNumber,
                              city: temp.city,
                              state: temp.state,
                              zipcode: temp.zipcode,
                            })
                          );
                        }
                        if (enableOrderV2) {
                          await dispatch(
                            updateZipcodeInCart.initiate({
                              zipcode: temp.zipcode,
                              countryState: temp.state,
                              city: temp.city,
                            })
                          );
                        }
                        onRefreshProductInfo(temp);
                      }
                      setTimeout(() => {
                        setExtendShow(false);
                        setSearchKeyword('');
                        setHasSearchZipcode(false);
                      }, 500);
                    }}
                  />
                ))}
                <Typography
                  sx={{
                    textWrap: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '4px 16px',
                    color: '#b7b7b7',
                  }}
                >
                  Can't find your address?
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      );
    }
    if (!cityInfo) {
      return null;
    }
    return (
      <>
        {currentStockLocation?.location_type === 'warehouse' && (
          <Typography
            sx={{
              textDecoration: 'underline',
              color: (theme) => theme.palette.brand.terracotta[500],
              cursor: 'pointer',
            }}
            onClick={() => setHasSearchZipcode(true)}
          >
            {`${cityInfo?.city !== null ? cityInfo?.city : ''}${cityInfo?.city !== null ? ', ' : ''}${
              cityInfo?.zipcode
            }`}
          </Typography>
        )}
        <NiceModal
          title="Delivery not available for this ZIP code"
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
            if (!currentCityCanApply) {
              setCityInfo(lastCityInfo);
              rollbackToLastCityInfo();
            }
            if (!currentSKUCanFind) {
              handleRedirectToSPULink();
            }
            dispatch(updateCityCanBeApply(true));
            dispatch(updateCanFindSKU(true));
          }}
          desc={
            !currentCityCanApply
              ? 'Please check the ZIP code entered or try another one'
              : 'Sorry, this sku is not available. Please choose another sku.'
          }
          showCancelBtn={false}
          showConfirmBtn={false}
        />
      </>
    );
  };

  const renderLabel = () => {
    return <ProductOptionLabel text={labelText} />;
  };
  const renderLeadTime = () => {
    if (leadtimeShippingFeeIsFetching) {
      return (
        <Loading
          sx={{
            '@keyframes rotate': {
              from: {
                transform: 'rotate(0deg)',
              },
              to: {
                transform: 'rotate(360deg)',
              },
            },
            width: '28px',
            animation: 'rotate .5s linear infinite',
            opacity: 1,
          }}
        />
      );
    }
    if (leadtimeShippingFee?.stock_state === 'OUT_OF_STOCK') {
      return (
        <Typography
          sx={{
            color: '#888',
          }}
        >
          Out of Stock
        </Typography>
      );
    } else {
      return leadtimeShippingFee?.delivery_lead_time_presentation;
    }
  };

  if (enableZipCode) {
    if (!mobile) {
      return (
        <ListItem
          sx={{
            minHeight: '56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            py: 4,
          }}
        >
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            {renderLabel()}
            <Stack>{renderLeadTime()}</Stack>
          </Stack>
          <Stack>
            {enableZipCode && renderSelectZipcode()}
            {needShowCustomized && (
              <Typography
                level="caption2"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Warning
                  sx={{
                    width: '16px',
                    height: '16px',
                    marginRight: 1,
                  }}
                />
                7-9 Week lead time. Choose carefully as Return & Refund policy does not apply.
              </Typography>
            )}
          </Stack>
        </ListItem>
      );
    }
    return (
      <ListItem
        sx={{
          boxSizing: 'border-box',
          minHeight: '56px',
          paddingBottom: 1,
        }}
      >
        <Stack>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {renderLabel()}
            {renderLeadTime()}
          </Stack>
          {enableZipCode && renderSelectZipcode()}
          {needShowCustomized && (
            <Typography
              level="caption2"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Warning
                sx={{
                  width: '24px',
                  height: '24px',
                  marginRight: 1,
                }}
              />
              7-9 Week lead time. Choose carefully as Return & Refund policy does not apply.
            </Typography>
          )}
        </Stack>
      </ListItem>
    );
  }

  if (!mobile) {
    return (
      <ListItem
        sx={{
          minHeight: '56px',
          marginBottom: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {renderLabel()}
          <Stack>
            {renderLeadTime()}
            {needShowCustomized && (
              <Typography
                level="caption2"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Warning
                  sx={{
                    width: '24px',
                    height: '24px',
                    marginRight: 1,
                  }}
                />
                7-9 Week lead time. Choose carefully as Return & Refund policy does not apply.
              </Typography>
            )}
          </Stack>
        </Stack>
      </ListItem>
    );
  }
  return (
    <ListItem
      sx={{
        boxSizing: 'border-box',
        minHeight: '56px',
        paddingBottom: 1,
      }}
    >
      <Stack>
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {renderLabel()}
          {renderLeadTime()}
        </Stack>
        {needShowCustomized && (
          <Typography
            level="caption2"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Warning
              sx={{
                width: '24px',
                height: '24px',
                marginRight: 1,
              }}
            />
            7-9 Week lead time. Choose carefully as Return & Refund policy does not apply.
          </Typography>
        )}
      </Stack>
    </ListItem>
  );
}
