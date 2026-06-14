'use client';

import React, { useMemo } from 'react';
import { Box, Stack, Typography, Tag, Tooltip, Loading, Sheet, withBrandColor } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { useSwatchCollection } from '../../../../hooks/use-swatch-collection';
import { FABRIC_FEATURE, FABRIC_TYPE } from './product-free-swatch-drawer';

interface ProductFabricTooltipProps {
  value: string;
  src?: string;
  id?: string;
  children: React.ReactElement; // 触发 hover 的元素，必须是单个 React 元素
}

export const ProductFabricTooltip: React.FC<ProductFabricTooltipProps> = ({ src, value, id, children }) => {
  const { activeCollection, swatchLoading } = useSwatchCollection({
    activeValue: value,
  });

  const variantProperties = useMemo(() => {
    return (
      activeCollection?.variants?.find(
        (v) =>
          v.presentation.toLowerCase().startsWith(value.toLowerCase()) ||
          value.toLowerCase().startsWith(v.presentation.toLowerCase())
      )?.variant_properties || []
    );
  }, [activeCollection?.variants, value]);

  const productProperties = useMemo(() => {
    return activeCollection?.product_properties.map((item) => {
      const data = variantProperties?.find((it) => item.name === it.property_name);
      return data ? { ...item, ...data } : item;
    });
  }, [activeCollection?.product_properties, variantProperties]);

  const fabricProperties = useMemo(() => {
    return variantProperties?.filter((it) => it?.property_name === FABRIC_FEATURE || it?.property_name === FABRIC_TYPE);
  }, [variantProperties]);

  const tooltipContent = (
    <Sheet variant="soft">
      <Stack
        sx={{
          width: '400px',
        }}
      >
        <FortressImage src={src || ''} alt={value} ratio={1.67} objectFit="cover" sizes={'400px'} />
        <Stack py={5} px={4}>
          <Typography level="h4">{value}</Typography>
          {swatchLoading ? (
            <Loading theme="dark" />
          ) : (
            <>
              {fabricProperties?.length > 0 && (
                <Stack mt={4} gap={2} direction="row" flexWrap="wrap">
                  {fabricProperties
                    ?.sort((a) => (a.property_name === FABRIC_FEATURE ? 1 : -1))
                    // ?.sort((a, b) => `${a.value}`?.localeCompare(`${b.value}`))
                    ?.map((property) => {
                      return (
                        <Tag
                          key={property.value}
                          sx={{ ...withBrandColor('warmLinen', { variant: 'solid' }) }}
                          variant="solid"
                        >
                          <Typography
                            level="caption2"
                            sx={{
                              textTransform: 'capitalize',
                            }}
                          >
                            {property.value}
                          </Typography>
                        </Tag>
                      );
                    })}
                </Stack>
              )}
            </>
          )}
          {productProperties?.length > 0 && (
            <Stack>
              {productProperties
                ?.sort((a) => (a?.presentation === 'Care' ? 1 : -1))
                ?.map((property) => {
                  if (property?.value) {
                    return (
                      <Stack key={property.value} mt={4} gap={1}>
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
                })}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Sheet>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="left"
      id={id}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 35],
          },
        },
      ]}
      sx={{
        p: 0,
      }}
    >
      <Box>{children}</Box>
    </Tooltip>
  );
};
