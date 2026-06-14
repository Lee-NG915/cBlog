'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  circularProgressClasses,
  DialogContent,
  DialogTitle,
  Drawer,
  Grid,
  IconButton,
  Link,
  Loading,
  ModalClose,
  // NiceModal,
  RadioButton,
  RadioGroup,
  RadioIcon,
  Stack,
  Tag,
  Typography,
  useBreakpoints,
  withBrandColor,
} from '@castlery/fortress';
import { ChevronDown, ChevronUp, Search, ShoppingBag } from '@castlery/fortress/Icons';
import {
  selectProduct,
  Swatch,
  SwatchVariant,
  useLazyGetProductPropertiesQuery,
} from '@castlery/modules-product-domain';
import { FortressImage, PinchZoomViewer } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useScrollLock } from '@castlery/utils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSwatchCollection } from '../../../../hooks/use-swatch-collection';
import { logger } from '@castlery/observability';
import {
  selectCartLineItems,
  useRemoveCartItemMutation,
  selectAddToCartLoading,
  selectRemoveItemLoading,
} from '@castlery/modules-cart-domain';
import { addToCartCommandV2 } from '@castlery/modules-cart-services';
import { OnlineAddCartSource } from '@castlery/config';

interface ProductFreeSwatchDrawerV2Props {
  open: boolean;
  onClose: () => void;
}

export const FABRIC_FEATURE = 'fabric_feature';
export const FABRIC_TYPE = 'fabric_type';
export const fabricFeatureDefault = 'default';

interface FreeSwatchItemProps {
  variant: SwatchVariant;
  onImageClick: () => void;
  cartLineItems: ReturnType<typeof selectCartLineItems>;
}

const FreeSwatchItemComponent: React.FC<FreeSwatchItemProps> = ({ variant, onImageClick, cartLineItems }) => {
  const dispatch = useAppDispatch();
  const { mobile } = useBreakpoints();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [activeVariantId, setActiveVariantId] = useState<number>();

  const addToCartLoading = useAppSelector(selectAddToCartLoading);
  const removeCartItemLoading = useAppSelector(selectRemoveItemLoading);

  const isActionLoading = useMemo(
    () => (addToCartLoading || removeCartItemLoading) && activeVariantId === variant.id,
    [addToCartLoading, removeCartItemLoading, activeVariantId, variant.id]
  );

  const displayImage = useMemo(() => {
    const imageLinks = variant?.images?.[0]?.links;
    if (!imageLinks) return '';
    return Array.isArray(imageLinks) ? imageLinks[0] : imageLinks.large;
  }, [variant?.images]);

  // Reset active variant when loading completes
  useEffect(() => {
    if (!addToCartLoading && !removeCartItemLoading) {
      setActiveVariantId(undefined);
    }
  }, [addToCartLoading, removeCartItemLoading]);

  const handleButtonAction = useCallback(async () => {
    if (isActionLoading) return;

    setActiveVariantId(variant.id);

    try {
      if (variant.added_order) {
        const targetItem = cartLineItems?.find((item) => item.variant.id === variant.id);
        if (targetItem?.id) {
          await removeCartItem({ lineItemId: targetItem.id }).unwrap();
        }
      } else {
        await dispatch(
          addToCartCommandV2({
            scene: 'swatch',
            source: OnlineAddCartSource.PDP,
            // Casting here because SwatchVariant image type differs from cart Variant image type
            variant: variant as any,
          })
        ).unwrap();
      }
    } catch (error) {
      logger.error('Failed to toggle swatch in cart', { error, variantId: variant.id });
    }
  }, [isActionLoading, variant, cartLineItems, removeCartItem, dispatch]);

  const imageSize = mobile ? '140px' : '202px';
  const isAdded = variant.added_order;

  return (
    <Stack>
      <Box sx={{ position: 'relative', width: imageSize }}>
        <FortressImage src={displayImage} alt={variant.name} ratio={1} objectFit="cover" sizes={imageSize} />
        <IconButton
          variant="image"
          aria-label="Swatch details"
          title="Swatch details"
          sx={(theme) => ({
            position: 'absolute',
            top: theme.spacing(4),
            right: theme.spacing(4),
            width: '40px',
            height: '40px',
            '& svg': {
              color: 'var(--fortress-palette-brand-mono-900)',
            },
          })}
          onClick={onImageClick}
        >
          <Search />
        </IconButton>
      </Box>

      <Stack gap={4} mt={3}>
        <Typography level="h5">{variant.presentation}</Typography>

        {mobile ? (
          <RadioGroup
            value={isAdded ? 'added' : ''}
            name="swatch-add-to-cart"
            onClick={handleButtonAction}
            sx={{
              alignSelf: 'baseline',
              position: 'relative',
              ...(isActionLoading && {
                '& .MuiSvgIcon-root': {
                  display: 'none',
                },
              }),
            }}
          >
            <RadioIcon
              value="added"
              variant="outlined"
              disabled={isActionLoading}
              uncheckedIcon={<ShoppingBag />}
              checkedIcon={<ShoppingBag />}
            />
            {isActionLoading && (
              <CircularProgress
                size="sm"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  [`&.${circularProgressClasses.root}`]: {
                    '--CircularProgress-trackColor': 'transparent',
                    '--CircularProgress-progressColor': 'var(--fortress-palette-neutral-500)',
                    '--CircularProgress-percent': `${75} !important`,
                  },
                }}
              />
            )}
          </RadioGroup>
        ) : (
          <RadioGroup name="swatch-add-to-cart" value={isAdded ? 'added' : ''} onClick={handleButtonAction}>
            <RadioButton
              component={(props) => <Button {...props} variant="secondary" loading={isActionLoading} />}
              label={isAdded ? 'ADDED' : 'ADD TO CART'}
              value="added"
              sx={(theme) => ({
                ...(isActionLoading && {
                  '& .MuiRadio-label': {
                    display: 'none',
                  },
                  '&.MuiButton-root': {
                    backgroundColor: 'transparent',
                  },
                }),
                ...theme.typography.subh2,
                '& .MuiRadio-label': {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              })}
            />
          </RadioGroup>
        )}
      </Stack>
    </Stack>
  );
};

const FreeSwatchItem = memo(FreeSwatchItemComponent);

// Properties Component
const FreeSwatchPropertiesComponent: React.FC<{
  productProperties: any[];
  variants: any[];
  expanded: boolean;
}> = ({ productProperties, variants, expanded }) => {
  const { fabricFeatureProperties, fabricTypeProperties } = useMemo(() => {
    const featureSet = new Set<string>();
    const typeSet = new Set<string>();

    variants?.forEach((variant) => {
      variant?.variant_properties?.forEach((property: any) => {
        if (property?.property_name === FABRIC_FEATURE) {
          featureSet.add(property?.value);
        }
        if (property?.property_name === FABRIC_TYPE) {
          typeSet.add(property?.value);
        }
      });
    });

    return {
      fabricFeatureProperties: featureSet,
      fabricTypeProperties: typeSet,
    };
  }, [variants]);

  const { mobile } = useBreakpoints();

  return (
    <Stack sx={{ display: expanded ? 'flex' : 'none' }}>
      {fabricFeatureProperties.size > 0 && (
        <Box mt={mobile ? 4 : 6}>
          <Typography
            level="subh3"
            sx={{
              color: 'var(--fortress-palette-brand-terracotta-500)',
              textTransform: 'uppercase',
            }}
          >
            Fabric Features
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {Array.from(fabricFeatureProperties)
              // .sort((a: any, b: any) => a?.value?.localeCompare(b?.value))
              .map((value: any) => (
                <Tag key={value} sx={{ ...withBrandColor('warmLinen', { variant: 'solid' }) }} variant="solid">
                  <Typography
                    level="caption2"
                    sx={{
                      textTransform: 'capitalize',
                    }}
                  >
                    {value}
                  </Typography>
                </Tag>
              ))}
          </Stack>
        </Box>
      )}

      {fabricTypeProperties.size > 0 && (
        <Box mt={mobile ? 4 : 6}>
          <Typography
            level="subh3"
            sx={{
              color: 'var(--fortress-palette-brand-terracotta-500)',
              textTransform: 'uppercase',
            }}
          >
            Fabric Type
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {Array.from(fabricTypeProperties)
              // .sort((a: any, b: any) => a.localeCompare(b))
              .map((value: any, index: number) => (
                <Tag key={index} sx={{ ...withBrandColor('warmLinen', { variant: 'solid' }) }} variant="solid">
                  <Typography
                    level="caption2"
                    sx={{
                      textTransform: 'capitalize',
                    }}
                  >
                    {value}
                  </Typography>
                </Tag>
              ))}
          </Stack>
        </Box>
      )}

      {productProperties.length > 0 && (
        <>
          {productProperties.map((property) => (
            <Stack key={property.value} mt={mobile ? 4 : 6} gap={2}>
              <Typography
                level="subh3"
                sx={{
                  color: 'var(--fortress-palette-brand-terracotta-500)',
                  textTransform: 'uppercase',
                }}
              >
                {property.presentation}
              </Typography>
              <Typography level="body2" color="neutral">
                {property.value}
              </Typography>
            </Stack>
          ))}
        </>
      )}
    </Stack>
  );
};

const FreeSwatchProperties = memo(FreeSwatchPropertiesComponent);

// Read More Component
const FreeSwatchReadMoreComponent: React.FC<{
  item: any;
}> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  if (!item.product_properties?.length) return null;

  return (
    <Stack>
      <Link
        component="button"
        level="caption1"
        variant="primary"
        onClick={() => setExpanded(!expanded)}
        endDecorator={expanded ? <ChevronUp /> : <ChevronDown />}
        sx={{ alignSelf: 'flex-start' }}
      >
        {expanded ? 'Show Less' : 'Read More'}
      </Link>
      <FreeSwatchProperties
        productProperties={item.product_properties}
        expanded={expanded}
        variants={item?.variants || []}
      />
    </Stack>
  );
};

const FreeSwatchReadMore = memo(FreeSwatchReadMoreComponent);

export const ProductFreeSwatchDrawerV2: React.FC<ProductFreeSwatchDrawerV2Props> = ({ open, onClose }) => {
  const { desktop, mobile } = useBreakpoints();
  const cartLineItems = useAppSelector(selectCartLineItems);
  const product = useAppSelector(selectProduct);
  const [currentSwatchImages, setCurrentSwatchImages] = useState<string[]>(['']);
  const [currentSwatchImageIndex, setCurrentSwatchImageIndex] = useState(0);
  const [openSwatchPinchZoom, setOpenSwatchPinchZoom] = useState(false);
  const { aliveCollections, swatchLoading } = useSwatchCollection({});
  const [getFabricFeatureProperties, { data: fabricFeatureData, isLoading: fabricFeatureLoading }] =
    useLazyGetProductPropertiesQuery();
  const [getFabricTypeProperties, { data: fabricTypeData, isLoading: fabricTypeLoading }] =
    useLazyGetProductPropertiesQuery();
  // selectSwatches

  const [filterCollections, setFilterCollections] = useState<Swatch[]>([]);
  const [fabricFeatureValues, setFabricFeatureValues] = useState(new Set<string>());
  const [fabricTypeValues, setFabricTypeValues] = useState(new Set<string>());
  const [expanded, setExpanded] = useState(false);
  const [, setFabricComposition] = useState(new Map<string, string[]>());

  useScrollLock(open);

  const propertiesLoading = useMemo(
    () => fabricFeatureLoading || fabricTypeLoading,
    [fabricFeatureLoading, fabricTypeLoading]
  );

  const customizationSwatchIds = useMemo(
    () => new Set(product?.customizations?.map(({ swatch_id }) => swatch_id)),
    [product?.customizations]
  );

  const orderAliveCollections = useMemo(() => {
    return aliveCollections
      .map((collection) => {
        const orderCollection = { ...collection };
        orderCollection.variants = orderCollection.variants
          .map((variant) => {
            const newVariant = { ...variant };
            newVariant.added_order = !!cartLineItems?.find((item) => item.variant.id === variant.id);
            return newVariant;
          })
          ?.filter(({ id }) => customizationSwatchIds.has(id));

        return orderCollection;
      })
      ?.filter((orderCollection) => orderCollection?.variants?.length);
  }, [aliveCollections, cartLineItems, customizationSwatchIds]);

  // Handle fabric feature and type initialization and sorting
  const handleFabric = useCallback(async () => {
    const fabricFeatureSet = new Set<string>();
    const fabricTypeSet = new Set<string>();

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

    // 使用新的 API 获取 filter order data
    // 当 propertiesData 不存在时，获取产品属性
    if ((!fabricFeatureData || !fabricTypeData) && (fabricFeatureSet.size > 0 || fabricTypeSet.size > 0)) {
      try {
        // 分别发起两次请求获取不同的 property
        await Promise.all([getFabricFeatureProperties(FABRIC_FEATURE), getFabricTypeProperties(FABRIC_TYPE)]);
      } catch (error) {
        logger.error('Failed to fetch product properties', { error });
      }
    }

    // 处理 API 返回的数据排序
    let sortedFabricFeatureSet = fabricFeatureSet;
    let sortedFabricTypeSet = fabricTypeSet;

    if (fabricFeatureData || fabricTypeData) {
      const tempFabricFeatureSet = new Set<string>();
      const tempFabricTypeSet = new Set<string>();

      // 处理 fabric feature 数据排序
      if (fabricFeatureData?.name === FABRIC_FEATURE) {
        fabricFeatureData?.values?.forEach((value: any) => {
          if (fabricFeatureSet.has(value?.value)) {
            tempFabricFeatureSet.add(value?.value);
          }
        });
        sortedFabricFeatureSet = tempFabricFeatureSet;
      }

      // 处理 fabric type 数据排序
      if (fabricTypeData?.name === FABRIC_TYPE) {
        fabricTypeData?.values?.forEach((value: any) => {
          if (fabricTypeSet.has(value?.value)) {
            tempFabricTypeSet.add(value?.value);
          }
        });
        sortedFabricTypeSet = tempFabricTypeSet;
      }
    }

    setFabricFeatureValues(sortedFabricFeatureSet);
    setFabricTypeValues(sortedFabricTypeSet);
  }, [orderAliveCollections, fabricFeatureData, fabricTypeData, getFabricFeatureProperties, getFabricTypeProperties]);

  // Initialize fabric feature and type values
  useEffect(() => {
    if (open) {
      handleFabric();
    }
  }, [open, handleFabric]);

  useEffect(() => {
    setFilterCollections(orderAliveCollections);
  }, [orderAliveCollections]);

  const handleFabricClick = useCallback(
    (params: any) => {
      setFabricComposition((prev) => {
        const updatedMap = new Map(prev);

        if (params?.FABRIC_FEATURE && params?.value) {
          if (params.checked) {
            if (!updatedMap.has(params.value)) {
              const firstKey = updatedMap.keys().next().value;
              const firstValue = updatedMap.size > 0 && firstKey ? updatedMap.get(firstKey) || [] : [];
              updatedMap.set(params.value, firstValue);
            }
            if (updatedMap.has(fabricFeatureDefault)) {
              updatedMap.delete(fabricFeatureDefault);
            }
          } else {
            if (updatedMap.size <= 1 && (updatedMap.get(params.value)?.length || 0) > 0) {
              updatedMap.set(fabricFeatureDefault, updatedMap.get(params.value) || []);
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
              (updatedMap.has(featureName) && (updatedMap.get(featureName)?.length || 0) === 0) ||
              (updatedMap.has(fabricFeatureDefault) &&
                (() => {
                  const firstKey = updatedMap.keys().next()?.value;
                  return firstKey && updatedMap.get(firstKey)?.includes(typeName);
                })())
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
    [orderAliveCollections]
  );

  const handleImageClick = useCallback((collection: Swatch, index: number) => {
    setCurrentSwatchImages(
      collection?.variants?.map((variant) => {
        const temp = variant?.images?.[0]?.links;
        if (temp) {
          return Array.isArray(temp) ? temp[0] : temp.large;
        }
        return '';
      })
    );
    setCurrentSwatchImageIndex(index);
    setOpenSwatchPinchZoom(true);
  }, []);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={desktop ? 'right' : 'bottom'}
      size={mobile ? 'lg' : 'md'}
      sx={(theme) => ({
        '.MuiModalClose-root': {
          top: mobile ? theme.spacing(4) : theme.spacing(6),
          right: theme.spacing(6),
        },
        ...(!desktop && {
          '--Drawer-verticalSize': '80vh',
        }),
      })}
    >
      <DialogTitle component={Box} sx={{ py: mobile ? 4 : 6, px: 6, m: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="h3">Order Swatches</Typography>
          <ModalClose onClick={onClose} />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 6 }}>
        <Stack spacing={3}>
          <Typography level="body1" color="neutral">
            Compare fabrics in the comfort of your own home. Select up to 3 free swatches and we'll deliver them to you.
          </Typography>

          {swatchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Loading />
            </Box>
          ) : (
            <>
              {/* Filters Section */}
              {(fabricFeatureValues.size > 0 || fabricTypeValues.size > 0) && (
                <Box>
                  <AccordionGroup
                    sx={(theme) => ({
                      '&.MuiAccordionGroup-root': {
                        marginTop: desktop ? theme.spacing(6) : mobile ? theme.spacing(2) : theme.spacing(4),
                      },
                    })}
                  >
                    <Accordion expanded={expanded} onChange={(_, expanded) => setExpanded(expanded)}>
                      <AccordionSummary
                        sx={{
                          '&.MuiAccordionSummary-root': {
                            py: 3,
                          },
                        }}
                      >
                        <Typography
                          level="subh2"
                          sx={{
                            color: 'var(--fortress-palette-brand-mono-900)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Filters
                        </Typography>
                      </AccordionSummary>
                      {propertiesLoading && expanded ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Loading />
                        </Box>
                      ) : (
                        <AccordionDetails>
                          <Stack>
                            {fabricFeatureValues.size > 0 && (
                              <Box>
                                <Typography level="h4">Fabric Features</Typography>
                                <Grid container rowSpacing={4} columnSpacing={2} mt={2}>
                                  {Array.from(fabricFeatureValues).map((value: any) => (
                                    <Grid xs={6} key={value}>
                                      <Checkbox
                                        label={value}
                                        onChange={(e) => {
                                          handleFabricClick({
                                            FABRIC_FEATURE,
                                            value,
                                            checked: e.target.checked,
                                          });
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}

                            {fabricTypeValues.size > 0 && (
                              <Box mt={3}>
                                <Typography level="h4">Fabric Type</Typography>
                                <Grid container rowSpacing={4} columnSpacing={2} mt={2}>
                                  {Array.from(fabricTypeValues).map((value: any) => (
                                    <Grid xs={6} key={value}>
                                      <Checkbox
                                        label={value}
                                        onChange={(e) => {
                                          handleFabricClick({
                                            FABRIC_TYPE,
                                            value,
                                            checked: e.target.checked,
                                          });
                                        }}
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}
                          </Stack>
                        </AccordionDetails>
                      )}
                    </Accordion>
                  </AccordionGroup>
                </Box>
              )}

              {/* Collections */}
              {filterCollections?.length > 0 &&
              !filterCollections.every((collection) => collection?.variants?.length === 0) ? (
                <Stack spacing={4}>
                  {filterCollections.map((collection) => {
                    if (collection?.variants?.length > 0) {
                      return (
                        <Stack key={collection.id} mt={6}>
                          <Typography
                            level="subh3"
                            sx={{
                              color: 'var(--fortress-palette-brand-terracotta-500)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {collection?.presentation}
                          </Typography>
                          <Typography level="body2" mt={2}>
                            {collection?.description}
                          </Typography>
                          <FreeSwatchReadMore item={collection} />
                          <Stack
                            flexDirection={'row'}
                            flexWrap={'nowrap'}
                            justifyContent={'flex-start'}
                            gap={mobile ? 3 : 4}
                            mt={mobile ? 4 : 6}
                            sx={{
                              overflowX: 'auto',
                              overflowY: 'hidden',
                            }}
                          >
                            {collection.variants.map((variant, index) => (
                              <Box key={variant?.id}>
                                <FreeSwatchItem
                                  variant={variant}
                                  onImageClick={() => handleImageClick(collection, index)}
                                  cartLineItems={cartLineItems}
                                />
                              </Box>
                            ))}
                          </Stack>
                        </Stack>
                      );
                    }
                    return null;
                  })}
                </Stack>
              ) : (
                <Typography level="body2">No available swatches for this product.</Typography>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <PinchZoomViewer
        open={openSwatchPinchZoom}
        setOpen={setOpenSwatchPinchZoom}
        slideImages={currentSwatchImages.map((image) => ({ src: image, alt: 'swatch image', width: 100, height: 100 }))}
        index={currentSwatchImageIndex}
      />
    </Drawer>
  );
};
