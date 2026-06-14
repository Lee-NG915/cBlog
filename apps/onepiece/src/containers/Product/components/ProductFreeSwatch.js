import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/Spinner';
import ReactSVG from 'components/ReactSVG';
import ReactPicture from 'components/ReactPicture';
import { defaultImage } from 'utils/image';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Typography } from 'fortress';
import { FreeSwatchesAddToCart, LineLeftArrow, AddWhite, ClosePopup } from '@castlery/fortress/Icons';
import {
  AccordionGroup,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Checkbox,
  Tag,
} from '@castlery/fortress';
import { useSelector, useDispatch } from 'react-redux';
import { load as loadFilterOrder } from 'redux/modules/filterOrder';
import { EVENT_PDP_DETAILS } from 'utils/track/constants';
import { useFreeSwatchPopup } from '../hooks/config';
import { useMobileFrame } from '../hooks/product';
import { useImgModal } from '../hooks/gallery';
import style from './style.scss';

const FABRIC_FEATURE = 'fabric_feature';
const FABRIC_TYPE = 'fabric_type';

const FreeSwatchPopupItem = ({ variant, currentVariant, loading, open }) => {
  const [images, setImages] = useState(variant.images[0] || {});
  const [all, openLinks] = useMemo(() => {
    const temp = images.links;
    if (temp) {
      return [temp, Array.isArray(temp) ? temp[0] : temp.large];
    }
    const defaultSrc = defaultImage();
    return [[defaultSrc], defaultSrc];
  }, [images]);

  return (
    <div className={`${style.freeSwatchPopup}__list-variant`}>
      <div role="menuitem" className={`${style.freeSwatchPopup}__list-variant-picture`} onClick={() => open(openLinks)}>
        <ReactPicture
          srcset={all}
          alt={variant.name}
          loader={{ ratio: 1 }}
          onError={() => setImages({ links: [defaultImage()] })}
        />
        <div className={`${style.freeSwatchPopup}__list-variant-picture-search`}>
          <ReactSVG name="free-swatch-search" />
        </div>
      </div>

      <div className={`${style.freeSwatchPopup}__list-variant-option`}>
        <h4 className={`${style.freeSwatchPopup}__list-variant-option-head`}>{variant.presentation}</h4>
        <section
          className={`${style.freeSwatchPopup}__list-variant-option-content`}
          role="button"
          data-selenium="add_remove_swatch"
          onClick={variant.clickHandler}
        >
          <div>
            {loading && currentVariant === variant ? (
              <div className={`${style.freeSwatchPopup}__spinner__wrapper`}>
                <Spinner className={`${style.freeSwatchPopup}__spinner`} small />
              </div>
            ) : !variant.added_order ? (
              <>
                {/* <ReactSVG name="free-swatch-add-to-cart" /> */}
                <FreeSwatchesAddToCart viewBox="0 0 16 16" />
                <div className={`${style.freeSwatchPopup}__list-variant-option-content-add-to-cart  add-to-cart-hover`}>
                  Add To Cart
                </div>
              </>
            ) : (
              <>
                <ReactSVG name="free-swatch-add-to-cart-done" />
                <div
                  className={`${style.freeSwatchPopup}__list-variant-option-content-tap-to-remove tap-to-remove-hover`}
                >
                  Tap to Remove
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

FreeSwatchPopupItem.propTypes = {
  open: PropTypes.func,
  variant: PropTypes.object,
  currentVariant: PropTypes.object,
  loading: PropTypes.bool,
};

const FreeSwatchPopupProperties = ({ productProperties, open, variants }) => {
  const fabricFeatureProperties = new Set();
  const fabricTypeProperties = new Set();
  variants?.forEach((variant) => {
    variant?.variant_properties?.forEach((property) => {
      if (property?.property_name === FABRIC_FEATURE) {
        fabricFeatureProperties.add(property?.value);
      }
      if (property?.property_name === FABRIC_TYPE) {
        fabricTypeProperties.add(property?.value);
      }
    });
  });
  return (
    <>
      {fabricFeatureProperties.size > 0 && (
        <div className={`${style.freeSwatchPopup}__list-property ${open ? 'open' : ''}`}>
          <div className={`${style.freeSwatchPopup}__list-property-name`}>Fabric Features</div>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {Array.from(fabricFeatureProperties)
              ?.sort((a, b) => `${a}`?.localeCompare(b))
              ?.map((value, index) => (
                <div key={index} className={`${style.freeSwatchPopup}__list-property-value`}>
                  <Tag
                    variant="soft"
                    sx={{
                      borderRadius: '4px',
                      color: 'var(--fortress-palette-brand-charcoal-700)',
                      backgroundColor: `var(--fortress-palette-brand-charcoal-100)`,
                      padding: '0 16px 0 16px',
                      marginTop: '5px',
                    }}
                  >
                    {value}
                  </Tag>
                </div>
              ))}
          </Box>
        </div>
      )}
      {fabricTypeProperties.size > 0 && (
        <div className={`${style.freeSwatchPopup}__list-property ${open ? 'open' : ''}`}>
          <div className={`${style.freeSwatchPopup}__list-property-name`}>Fabric Type</div>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {Array.from(fabricTypeProperties)
              ?.sort((a, b) => `${a}`?.localeCompare(b))
              ?.map((value, index) => (
                <div key={index} className={`${style.freeSwatchPopup}__list-property-value`}>
                  <Tag
                    variant="soft"
                    sx={{
                      borderRadius: '4px',
                      color: 'var(--fortress-palette-brand-charcoal-700)',
                      backgroundColor: `var(--fortress-palette-brand-charcoal-100)`,
                      padding: '0 16px 0 16px',
                      marginTop: '5px',
                    }}
                  >
                    {value}
                  </Tag>
                </div>
              ))}
          </Box>
        </div>
      )}
      {productProperties.length ? (
        <>
          {productProperties.map((property, i) => (
            <div key={i} className={`${style.freeSwatchPopup}__list-property ${open ? 'open' : ''}`}>
              <div className={`${style.freeSwatchPopup}__list-property-name`}>{property.presentation}</div>
              <div className={`${style.freeSwatchPopup}__list-property-value`}>{property.value}</div>
            </div>
          ))}
        </>
      ) : null}
    </>
  );
};

FreeSwatchPopupProperties.propTypes = {
  productProperties: PropTypes.array,
  variants: PropTypes.array,
  open: PropTypes.bool,
};

const FreeSwatchPopupReadMore = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    item.product_properties.length && (
      <>
        <div className={`${style.freeSwatchPopup}__list-content`}>
          {item.description}
          <div
          // style={{
          //   display: !open ? 'block' : 'none',
          // }}
          >
            <span
              role="button"
              onClick={() => setOpen((open) => !open)}
              className={`${style.freeSwatchPopup}__list-more`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {open ? (
                <>
                  Show less{' '}
                  <ReactSVG
                    name="arrow-up"
                    style={{
                      width: '24px',
                      height: '24px',
                    }}
                  />
                </>
              ) : (
                <>
                  Read More{' '}
                  <ReactSVG
                    name="arrow-up"
                    style={{
                      width: '24px',
                      height: '24px',
                      transform: 'rotate(180deg)',
                      transformOrigin: 'center',
                    }}
                  />
                </>
              )}
            </span>
          </div>
        </div>
        <FreeSwatchPopupProperties productProperties={item.product_properties} open={open} variants={item?.variants} />
      </>
    )
  );
};

FreeSwatchPopupReadMore.propTypes = {
  item: PropTypes.object,
};

export const FreeSwatchPopup = ({ closeHandler, customisable, isFromFabricPopUp = false, backHandler }) => {
  const FABRIC_FEATURE = 'fabric_feature';
  const FABRIC_TYPE = 'fabric_type';
  const fabricFeatureDefault = 'default';
  const openImageModal = useImgModal();
  const { desktop } = useBreakpoints();
  const { currentVariant, orderAliveCollections, swatchLoading, cartLoading } = useFreeSwatchPopup({
    needLoad: true,
    customisable,
  });
  const dispatch = useDispatch();
  const filterOrder = useSelector((state) => state.filterOrder);
  const [filterCollections, setFilterCollections] = useState(orderAliveCollections);
  const [orderLoading, setOrderLoading] = useState(false);
  const [, setFabricComposition] = useState(null);
  const [fabricFeatureValues, setFabricFeatureValues] = useState(new Set());
  const [fabricTypeValues, setFabricTypeValues] = useState(new Set());
  const [expanded, setExpanded] = useState(false);
  const getFabricFeatureTypeOrder = useCallback(async () => {
    setOrderLoading(true);
    try {
      const result = await Promise.all([
        dispatch(loadFilterOrder(FABRIC_TYPE)),
        dispatch(loadFilterOrder(FABRIC_FEATURE)),
      ]);
      return result;
    } catch (error) {
      console.log('🚀 ~ getFabricFeatureTypeOrder ~ error:', error);
    } finally {
      setOrderLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const handleFabric = async () => {
      let fabricFeatureSet = new Set();
      let fabricTypeSet = new Set();
      orderAliveCollections?.forEach((collection) => {
        collection?.variants?.forEach((variant) => {
          variant?.variant_properties?.forEach((property) => {
            if (property?.property_name === FABRIC_FEATURE) {
              fabricFeatureSet.add(property?.value);
            }
            if (property?.property_name === FABRIC_TYPE) {
              fabricTypeSet.add(property?.value);
            }
          });
        });
      });
      let result = null;

      if (!filterOrder?.fabric_feature || !filterOrder?.fabric_type) {
        result = await getFabricFeatureTypeOrder();
      } else {
        result = filterOrder;
      }
      if (result) {
        const tempFabricFeatureSet = new Set();
        const tempFabricTypeSet = new Set();
        let filterOrderData = [];
        if (result?.length === 2) {
          filterOrderData = result;
        } else {
          Object.keys(result).forEach((key) => {
            if (key === FABRIC_FEATURE || key === FABRIC_TYPE) {
              filterOrderData.push(result[key]);
            }
          });
        }
        filterOrderData?.forEach((item) => {
          if (item?.name === FABRIC_FEATURE) {
            item?.values?.forEach((value) => {
              if (fabricFeatureSet.has(value?.value)) {
                tempFabricFeatureSet.add(value?.value);
              }
            });
          }
          if (item?.name === FABRIC_TYPE) {
            item?.values?.forEach((value) => {
              if (fabricTypeSet.has(value?.value)) {
                tempFabricTypeSet.add(value?.value);
              }
            });
          }
        });
        fabricFeatureSet = tempFabricFeatureSet;
        fabricTypeSet = tempFabricTypeSet;
      }
      setFabricFeatureValues(fabricFeatureSet);
      setFabricTypeValues(fabricTypeSet);
    };
    handleFabric();
  }, [getFabricFeatureTypeOrder, orderAliveCollections]);

  useEffect(() => {
    setFilterCollections(orderAliveCollections);
  }, [orderAliveCollections]);

  const handleFabricClick = useCallback(
    (params) => {
      const detailAction = params?.FABRIC_TYPE ? 'fabric_type' : params?.FABRIC_FEATURE ? 'fabric_feature' : '';
      if (detailAction !== '') {
        dispatch({
          type: EVENT_PDP_DETAILS,
          result: {
            detailAction,
            label: params?.value,
          },
        });
      }
      setFabricComposition((prev) => {
        const updatedMap = new Map(prev);
        if (params?.FABRIC_FEATURE && params?.value) {
          if (params.checked) {
            if (!updatedMap.has(params.value)) {
              const firstValue = updatedMap.size > 0 ? updatedMap.get(updatedMap.keys().next().value) : [];
              updatedMap.set(params.value, firstValue);
            }
            if (updatedMap.has(fabricFeatureDefault)) {
              updatedMap.delete(fabricFeatureDefault);
            }
          } else {
            if (updatedMap.size <= 1 && updatedMap.get(params.value)?.length > 0) {
              updatedMap.set(fabricFeatureDefault, updatedMap.get(params.value));
            }
            updatedMap.delete(params.value);
          }
        }

        if (params?.FABRIC_TYPE && params?.value) {
          if (params.checked) {
            updatedMap.forEach((value, key) => {
              if (!value.includes(params.value)) {
                updatedMap.set(key, [...value, params.value]);
              }
            });
            if (updatedMap.size === 0) {
              updatedMap.set(fabricFeatureDefault, [params.value]);
            }
          } else {
            updatedMap.forEach((value, key) => {
              const updatedValue = value.filter((item) => item !== params.value);
              if (updatedValue.length > 0) {
                updatedMap.set(key, updatedValue);
              } else if (key !== fabricFeatureDefault) {
                updatedMap.set(key, []);
              } else {
                updatedMap.delete(key);
              }
            });
          }
        }
        // Filter collections based on the updated fabricComposition
        const filteredCollections = orderAliveCollections?.map((collection) => {
          if (updatedMap.size === 0) {
            return collection;
          }
          const filterVariants = collection?.variants?.filter((variant) => {
            const variantProperties = variant?.variant_properties || [];
            const featureName =
              variantProperties.find((p) => p.property_name === FABRIC_FEATURE)?.value || fabricFeatureDefault;
            const typeName = variantProperties.find((p) => p.property_name === FABRIC_TYPE)?.value || '';
            return (
              (updatedMap.has(featureName) && updatedMap.get(featureName)?.includes(typeName)) ||
              (updatedMap.has(featureName) && updatedMap.get(featureName).length === 0) ||
              (updatedMap.has(fabricFeatureDefault) &&
                updatedMap.get(updatedMap.keys().next()?.value)?.includes(typeName))
            );
          });
          return {
            ...collection,
            variants: filterVariants,
          };
        });
        setFilterCollections(filteredCollections);
        return updatedMap;
      });
    },
    [orderAliveCollections, FABRIC_FEATURE, FABRIC_TYPE, fabricFeatureDefault]
  );

  return (
    <div className={style.freeSwatchPopup}>
      {isFromFabricPopUp ? (
        <div
          className={`${style.freeSwatchPopup}__freeSwatch__button back-fabric-popup`}
          onClick={() => {
            backHandler((switchFreeSwatch) => !switchFreeSwatch);
          }}
        >
          <LineLeftArrow />
          Back to Fabric Information
        </div>
      ) : (
        desktop && <div style={{ marginTop: '30px' }} />
      )}
      <div className={`${style.freeSwatchPopup}__header`}>
        {desktop || isFromFabricPopUp ? (
          <h3 className={`${style.freeSwatchPopup}__header-head`}>Order Swatches</h3>
        ) : null}
        <div
          className={`${style.freeSwatchPopup}__header-content`}
          style={{
            marginTop: !desktop && !isFromFabricPopUp ? '60px' : '20px',
          }}
        >
          Compare fabrics in the comfort of your own home. Select up to 3 free swatches and we'll deliver them to you.
        </div>
      </div>
      {swatchLoading ? (
        <div className={style.loading}>
          <Spinner />
        </div>
      ) : (
        <>
          {(fabricFeatureValues.size !== 0 || fabricTypeValues.size !== 0) && (
            <AccordionGroup
              sx={{
                '--ListItem-paddingX': 0,
                borderTop: '1px solid var(--fortress-palette-neutral-500, #C1AF86)',
                borderBottom: '1px solid var(--fortress-palette-neutral-500, #C1AF86)',
                margin: desktop ? '32px 0' : '24px 0',
                padding: '16px 0',
              }}
            >
              <Accordion
                expanded={expanded}
                onChange={(event, expanded) => {
                  setExpanded(expanded);
                }}
              >
                <AccordionSummary
                  slots={{
                    indicator: (e) => {
                      if (e?.ownerState?.expanded) {
                        return <ClosePopup />;
                      }
                      return <AddWhite />;
                    },
                  }}
                  sx={{
                    '& button': {
                      color: 'var(--fortress-palette-brand-charcoal-800, #323433)',
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      '& svg path': {
                        fill: '#C1AF86',
                      },
                    },
                  }}
                >
                  Filters
                </AccordionSummary>
                {orderLoading && expanded ? (
                  <Spinner />
                ) : (
                  <AccordionDetails>
                    {fabricFeatureValues.size !== 0 && (
                      <Box
                        sx={{
                          marginBottom: desktop ? '24px' : '8px',
                        }}
                      >
                        <Box
                          sx={{
                            marginBottom: desktop ? '16px' : '12px',
                            color: 'var(--colours-text-primary, #323433)',
                            fontSize: desktop ? '1rem' : '0.875rem',
                          }}
                        >
                          Fabric Features
                        </Box>
                        <Grid
                          container
                          spacing={{ xs: 2, md: 3 }}
                          columns={{ xs: 4, sm: 8, md: 12 }}
                          rowSpacing={1}
                          sx={{ flexGrow: 1 }}
                        >
                          {Array.from(fabricFeatureValues).map((value, index) => (
                            <Grid xs={2} sm={4} md={4} key={index}>
                              <Checkbox
                                sx={{
                                  '& > span': {
                                    borderColor: '#A45B37',
                                  },
                                  fontSize: desktop ? '0.875rem' : '0.75rem',
                                }}
                                label={value}
                                onChange={(e) => {
                                  handleFabricClick({
                                    FABRIC_FEATURE,
                                    value,
                                    checked: e?.target?.checked,
                                  });
                                }}
                                variant="outlined"
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    {fabricTypeValues.size !== 0 && (
                      <Box>
                        <Box
                          sx={{
                            marginBottom: desktop ? '16px' : '12px',
                            color: 'var(--colours-text-primary, #323433)',
                            fontSize: desktop ? '1rem' : '0.875rem',
                          }}
                        >
                          Fabric Type
                        </Box>
                        <Grid
                          container
                          spacing={{ xs: 2, md: 3 }}
                          columns={{ xs: 4, sm: 8, md: 12 }}
                          rowSpacing={1}
                          sx={{ flexGrow: 1 }}
                        >
                          {Array.from(fabricTypeValues).map((value, index) => (
                            <Grid xs={2} sm={4} md={4} key={index}>
                              <Checkbox
                                sx={{
                                  '& > span': {
                                    borderColor: '#A45B37',
                                  },
                                  fontSize: desktop ? '0.875rem' : '0.75rem',
                                }}
                                label={value}
                                onChange={(e) => {
                                  handleFabricClick({
                                    FABRIC_TYPE,
                                    value,
                                    checked: e?.target?.checked,
                                  });
                                }}
                                variant="outlined"
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </AccordionDetails>
                )}
              </Accordion>
            </AccordionGroup>
          )}

          {!filterCollections?.every((collection) => collection?.variants?.length === 0) ? (
            filterCollections.map((it) => {
              if (it?.variants?.length > 0) {
                return (
                  <div key={it.id} className={`${style.freeSwatchPopup}__list`}>
                    <h4 className={`${style.freeSwatchPopup}__list-head`}>{it.presentation}</h4>
                    <FreeSwatchPopupReadMore item={it} />
                    <div className={`${style.freeSwatchPopup}__list-container`}>
                      {it.variants.map((v) => (
                        <FreeSwatchPopupItem
                          key={v.id}
                          variant={v}
                          open={openImageModal}
                          loading={cartLoading}
                          currentVariant={currentVariant}
                        />
                      ))}
                    </div>
                  </div>
                );
              }
              return undefined;
            })
          ) : (
            // TODO 样式处理
            <Typography mt={2}> No available swatches for this product.</Typography>
          )}
        </>
      )}
      {desktop && (
        <button type="button" className={`${style.freeSwatchPopup}__drawer__dismiss`} onClick={closeHandler}>
          <ReactSVG name="dismiss" />
        </button>
      )}
    </div>
  );
};

FreeSwatchPopup.propTypes = {
  closeHandler: PropTypes.func,
  customisable: PropTypes.bool,
  isFromFabricPopUp: PropTypes.bool,
  backHandler: PropTypes.func,
};

const FreeSwatch = (props = {}) => {
  const { freeSwatch = false, customisable = false } = props;

  const buttonRef = useRef();

  const { frame } = useMobileFrame();
  const { desktop } = useBreakpoints();

  const dispatch = useDispatch();

  const closeHandler = useCallback(() => {
    frame.removeModal();
    if (buttonRef.current) {
      buttonRef.current.dataset.show = 'false';
    }
  }, [frame]);

  const desktopFreeSwatch = useCallback(() => {
    if (buttonRef.current) buttonRef.current.dataset.show = 'true';
    frame.addModal(<FreeSwatchPopup closeHandler={closeHandler} customisable={customisable} />, 'side', {
      dismiss: closeHandler,
      position: 'right',
      maxWidth: 736,
    });
  }, [closeHandler, frame, customisable]);

  // const mobileFreeSwatch = useCallback(
  //   () =>
  //     frame.openMobileModal({
  //       head: <div style={{ height: '10px' }} />,
  //       content: <FreeSwatchPopup />,
  //     }),
  //   [frame]
  // );

  const mobileFreeSwatch = useCallback(() => {
    if (buttonRef.current) buttonRef.current.dataset.show = 'true';
    frame.openModal(
      'mobileModal',
      {
        head: <h3 className={`${style.freeSwatchPopup}__header-head`}>Order Swatches</h3>,
        closeHandler: () => {
          if (buttonRef.current) buttonRef.current.dataset.show = 'false';
        },
        content: <FreeSwatchPopup customisable={customisable} />,
        styleOverflow: 'scroll',
      },
      { height: 80, styleOverflow: 'auto' }
    );
  }, [frame, customisable]);

  const handleOpenFreeSwatch = useCallback(() => {
    dispatch({
      type: EVENT_PDP_DETAILS,
      result: {
        detailAction: 'click_through_get_free_swatches1',
      },
    });
    if (desktop) {
      desktopFreeSwatch();
    } else {
      mobileFreeSwatch();
    }
  }, [desktop, desktopFreeSwatch, mobileFreeSwatch]);

  return freeSwatch ? (
    <div className={style.materialFreeSwatch}>
      <a
        ref={buttonRef}
        className={`${style.materialFreeSwatch}__btn get-free-swatch-button`}
        role="button"
        data-show="false"
        data-selenium="open_swatch"
        onClick={handleOpenFreeSwatch}
      >
        Get Free Swatches
      </a>
    </div>
  ) : null;
};

FreeSwatch.propTypes = {
  freeSwatch: PropTypes.bool,
  customisable: PropTypes.bool,
};

export default FreeSwatch;
