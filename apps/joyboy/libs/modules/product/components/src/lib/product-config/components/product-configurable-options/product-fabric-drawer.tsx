'use client';

import {
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Loading,
  ModalClose,
  Stack,
  Tag,
  Typography,
  useBreakpoints,
  withBrandColor,
} from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import { ProductOptionValueConfig, selectSwatchLoading, SwatchVariantProperty } from '@castlery/modules-product-domain';
import { FortressImage, OptionSelector, PinchZoomViewer } from '@castlery/shared-components';
import { DynamicDialogContent } from '@castlery/shared-fortress-client';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { useScrollLock } from '@castlery/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSwatchCollection } from '../../../../hooks/use-swatch-collection';
import { ProductFabricCollections } from './product-fabric-collections';
import { FABRIC_FEATURE, FABRIC_TYPE } from './product-free-swatch-drawer';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';

interface ProductFabricDrawerProps {
  open: boolean;
  onClose: () => void;
  options: ProductOptionValueConfig[];
  selectedOption?: ProductOptionValueConfig | null;
}

export const ProductFabricDrawer: React.FC<ProductFabricDrawerProps> = ({ open, onClose, options, selectedOption }) => {
  const dispatch = useAppDispatch();
  const { desktop, mobile } = useBreakpoints();
  const [targetOption, setTargetOption] = useState<ProductOptionValueConfig | null>(selectedOption || null);
  const [switchFreeSwatch, setSwitchFreeSwatch] = useState(false);
  const [selectedMap, setSelectedMap] = useState(new Map());
  const [openMaterialPinchZoom, setOpenMaterialPinchZoom] = useState(false);
  const swatchLoading = useAppSelector(selectSwatchLoading);
  const [hasLoaded, setHasLoaded] = useState(false);
  useScrollLock(open);

  useEffect(() => {
    if (open && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [open, hasLoaded]);

  useEffect(() => {
    if (open) {
      setTargetOption(selectedOption || options.find((option) => option.isSelected) || null);
      const tempMap = new Map();
      options?.forEach((item) => {
        tempMap.set(item.id, item?.isSelected);
      });
      setSelectedMap(tempMap);
    }
  }, [selectedOption, options, open]);

  // Separate stocked and custom fabrics with updated selection state
  const stockedFabrics = useMemo(() => {
    return (
      options
        ?.filter((option) => !option.isCustomized)
        ?.map((option) => ({
          ...option,
          isSelected: selectedMap.get(option.id) || false,
        })) || []
    );
  }, [options, selectedMap]);

  const customFabrics = useMemo(() => {
    return (
      options
        ?.filter((option) => option.isCustomized)
        ?.map((option) => ({
          ...option,
          isSelected: selectedMap.get(option.id) || false,
        })) || []
    );
  }, [options, selectedMap]);

  const { activeCollection } = useSwatchCollection({
    activeValue: targetOption?.value || '',
  });

  const { variantProperties, variantId } = useMemo(() => {
    if (activeCollection && activeCollection?.variants) {
      const variant = activeCollection?.variants?.find(
        (v) =>
          v?.presentation?.toLowerCase()?.startsWith(targetOption?.value?.toLowerCase() || '') ||
          targetOption?.value?.toLowerCase()?.startsWith(v?.presentation?.toLowerCase() || '')
      );
      return {
        variantProperties: variant?.variant_properties,
        variantId: variant?.id,
      };
    }
    return {
      variantProperties: undefined,
      variantId: undefined,
    };
  }, [activeCollection, targetOption?.value]);

  const properties = useMemo(() => {
    if (variantProperties) {
      return activeCollection?.product_properties?.map((item) => {
        const data = variantProperties?.find((it) => item.name === it.property_name);
        return data ? { ...item, ...data } : item;
      });
    }
    return [];
  }, [activeCollection?.product_properties, variantProperties]);

  const fabricProperties = useMemo(() => {
    if (variantProperties) {
      return variantProperties?.filter(
        (it) => it?.property_name === FABRIC_FEATURE || it?.property_name === FABRIC_TYPE
      );
    }
    return [];
  }, [variantProperties]);

  const handleSelect = useCallback(
    (optionId: string) => {
      const option = options.find((opt) => opt.id === optionId);
      if (option && option.id !== targetOption?.id) {
        // Update selectedMap to reflect new selection
        const newSelectedMap = new Map(selectedMap);
        if (targetOption?.id) {
          newSelectedMap.set(targetOption.id, false);
        }
        newSelectedMap.set(option.id, true);
        setSelectedMap(newSelectedMap);
        setTargetOption(option);
      }
    },
    [options, targetOption, selectedMap]
  );

  // Handle selection confirmation
  const selectHandler = useCallback(() => {
    if (targetOption?.id !== selectedOption?.id) {
      targetOption?.onSelect();
    }
    onClose();
  }, [onClose, targetOption, selectedOption]);

  const handleTrackPDPDetails = useCallback(async () => {
    await dispatch(
      EVENT_PDP_DETAILS({
        action: 'click_through_get_free_swatches2',
      })
    );
  }, [dispatch]);

  // Handle free swatch click
  const handleClickOpenSwatches = useCallback(() => {
    setSwitchFreeSwatch(true);
    handleTrackPDPDetails();
  }, []);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      anchor={desktop ? 'right' : 'bottom'}
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
        {/* Fabric Title */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="h3">{targetOption?.value}</Typography>
          <ModalClose onClick={onClose} />
        </Stack>
      </DialogTitle>
      <DynamicDialogContent sx={{ px: 6 }}>
        {hasLoaded && (
          <Stack>
            {/* Fabric Properties */}
            {fabricProperties?.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={2} mb={desktop ? 4 : 5}>
                {fabricProperties
                  ?.sort((a: SwatchVariantProperty) => (a.property_name === FABRIC_FEATURE ? 1 : -1))
                  // ?.sort((a: SwatchVariantProperty, b: SwatchVariantProperty) =>
                  //   `${a.value}`?.localeCompare(`${b.value}`)
                  // )
                  ?.map((property: SwatchVariantProperty) => (
                    <Tag
                      key={property?.id}
                      sx={{ ...withBrandColor('warmLinen', { variant: 'solid' }) }}
                      variant="solid"
                    >
                      <Typography
                        level="caption2"
                        sx={{
                          textTransform: 'capitalize',
                        }}
                      >
                        {property?.value}
                      </Typography>
                    </Tag>
                  ))}
              </Stack>
            )}

            {/* Stocked Fabrics */}
            {stockedFabrics.length > 0 && (
              <Stack gap={3}>
                <Typography level="body1">Stocked fabrics</Typography>
                <OptionSelector
                  options={stockedFabrics}
                  onSelect={handleSelect}
                  maxDisplay={stockedFabrics.length}
                  showAdditionalCount={false}
                  isProductPage={true}
                  sx={{
                    flexWrap: 'wrap',
                  }}
                  variant="square"
                />
              </Stack>
            )}

            {/* Custom Fabrics */}
            {customFabrics.length > 0 && (
              <Stack gap={3} mt={mobile ? 5 : 4}>
                <Typography level="body1">Custom fabrics</Typography>
                <OptionSelector
                  options={customFabrics}
                  onSelect={handleSelect}
                  maxDisplay={customFabrics.length}
                  showAdditionalCount={false}
                  isProductPage={true}
                  sx={{
                    flexWrap: 'wrap',
                  }}
                  variant="square"
                />
              </Stack>
            )}

            {/* Large Image */}
            {targetOption?.image && (
              <Stack
                mt={mobile ? 5 : 6}
                sx={{
                  position: 'relative',
                }}
              >
                <FortressImage
                  src={targetOption.image || ''}
                  alt={targetOption.label || 'fabric'}
                  ratio={3 / 2}
                  objectFit="cover"
                  sizes={['0.3-md', '1-sm', '1-xs']}
                />
                <IconButton
                  variant="image"
                  aria-label="Fabric details"
                  title="Fabric details"
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
                  onClick={() => setOpenMaterialPinchZoom(true)}
                >
                  <Search />
                </IconButton>
                <PinchZoomViewer
                  open={openMaterialPinchZoom}
                  setOpen={setOpenMaterialPinchZoom}
                  slideImages={[
                    {
                      src: targetOption.image,
                      alt: targetOption.label,
                      height: 100,
                      width: 100,
                    },
                  ]}
                  index={0}
                />
              </Stack>
            )}

            {/* Select Button */}
            <Button
              onClick={selectHandler}
              variant="secondary"
              disabled={!targetOption}
              sx={{
                mt: 4,
              }}
            >
              Select Material
            </Button>

            {targetOption?.collection && (
              <Stack mt={desktop ? 8 : mobile ? 6 : 7} gap={2}>
                <Typography
                  level="subh3"
                  sx={{
                    color: 'var(--fortress-palette-brand-terracotta-500)',
                    textTransform: 'uppercase',
                  }}
                >
                  {targetOption?.collection?.presentation}
                </Typography>
                <Typography level="body2">{targetOption?.collection?.description}</Typography>
              </Stack>
            )}

            {/* Properties */}
            {swatchLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Loading theme="dark" />
              </Box>
            ) : (
              properties?.length > 0 &&
              properties
                ?.sort((a: any) => (a.presentation === 'Care' ? 1 : -1))
                .map((property: any) => {
                  if (property.value) {
                    return (
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
                        <Typography level="body2">{property.value}</Typography>
                      </Stack>
                    );
                  }
                  return null;
                })
            )}

            {/*  dy recommendation
            {variantId && (
                <VariantCollectionList
                  title={targetOption?.collection ? `See the entire ${targetOption?.collection?.presentation}` : ''}
                  searchCollectionId={variantId}
                  materialType={targetOption?.value}
                />
              )} */}
            {variantId && (
              <Box mt={mobile ? 6 : 7}>
                <ProductFabricCollections
                  title={targetOption?.collection ? `See the entire ${targetOption?.collection?.presentation}` : ''}
                  materialType={targetOption?.value || ''}
                />
              </Box>
            )}
          </Stack>
        )}
      </DynamicDialogContent>
    </Drawer>
  );
};
