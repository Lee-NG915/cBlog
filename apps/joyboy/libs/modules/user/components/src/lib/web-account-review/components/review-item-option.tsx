'use client';

import React from 'react';
import { Box, Typography, Stack } from '@castlery/fortress';
import moment from 'moment-timezone';
import { EcEnv } from '@castlery/config';

// 时间处理函数（使用 moment，保持与原代码兼容）
const getDate = (date?: string, timezone = EcEnv.NEXT_PUBLIC_TIME_ZONE as string) => {
  if (date) {
    return moment.tz(date, timezone);
  }
  return moment.tz(timezone);
};

// 配置常量
export const ASSEMBLY_TYPE = {
  assembly_required: 'Assembly Required',
  fully_assembled: 'Fully Assembled',
} as const;

// 类型定义
interface VariantOptionValue {
  option_value_id?: string;
  option_type_presentation?: string;
  presentation: string;
}

interface BundleOption {
  bundle_option_type: string;
  presentation: string;
}

interface BundleLineItem {
  id: string;
  bundle_option: BundleOption;
  variant: {
    variant_option_values: VariantOptionValue[];
  };
}

interface CustomAttributes {
  type: 'disposal' | 'carry_up' | 'slot';
  number_of_items?: number;
  number_of_stories?: number;
  start_time?: string;
  end_time?: string;
}

interface LineItem {
  product_type: 'bundle' | 'swatch' | 'service' | string;
  product_layout?: string;
  product_name?: string;
  variant: {
    assembly_type?: keyof typeof ASSEMBLY_TYPE;
    variant_option_values?: VariantOptionValue[];
  };
  bundle_line_items?: BundleLineItem[];
  custom_attributes?: CustomAttributes;
}

interface LineItemOptionsProps {
  lineItem: LineItem;
  type?: 'joint' | 'detailed';
  showAssembly?: boolean;
}

/**
 * 如果不是 bundle/swatch/service → 显示 variant options
如果是 bundle + bundle_overlay → 显示 bundle options
如果是 service + custom_attributes → 根据 type 显示不同内容
最后 return null
 */

const LineItemOptions: React.FC<LineItemOptionsProps> = ({ lineItem, type = 'detailed', showAssembly = false }) => {
  // 处理普通产品（非 bundle、swatch、service）
  if (lineItem.product_type !== 'bundle' && lineItem.product_type !== 'swatch' && lineItem.product_type !== 'service') {
    const variantOptions = lineItem.variant?.variant_option_values?.slice() || [];

    // 如果需要显示组装类型且存在组装类型
    if (showAssembly && lineItem.variant?.assembly_type) {
      variantOptions.push({
        presentation: ASSEMBLY_TYPE[lineItem.variant.assembly_type],
      });
    }

    return (
      <Box>
        {type === 'joint' ? (
          <Typography level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
            {variantOptions.map((v) => v.presentation).join(' | ')}
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {lineItem.variant?.variant_option_values?.map((v, index) => (
              <Typography
                key={v.option_value_id || index}
                level="caption1"
                sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}
              >
                {v.option_type_presentation}: {v.presentation}
              </Typography>
            ))}
          </Stack>
        )}
      </Box>
    );
  }

  // 处理 bundle 产品
  if (lineItem.product_type === 'bundle' && lineItem.product_layout === 'bundle_overlay') {
    return (
      <Box>
        <Stack spacing={0.5}>
          {lineItem.bundle_line_items?.map((item) => {
            if (item.bundle_option.bundle_option_type !== 'simple' && item.variant.variant_option_values.length > 0) {
              return (
                <Typography key={item.id} level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
                  {item.bundle_option.presentation}: {item.variant.variant_option_values[0].presentation}
                </Typography>
              );
            }
            return null;
          })}
        </Stack>
      </Box>
    );
  }

  // 处理 service 产品
  if (lineItem.product_type === 'service' && lineItem.custom_attributes) {
    const { custom_attributes } = lineItem;

    // 处置服务
    if (custom_attributes.type === 'disposal') {
      return (
        <Box>
          <Typography level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
            {lineItem.product_name}
          </Typography>
        </Box>
      );
    }

    // 搬运服务
    if (custom_attributes.type === 'carry_up') {
      const { number_of_items: numOfItems = 0, number_of_stories: numOfStories = 0 } = custom_attributes;
      return (
        <Box>
          <Typography level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
            {`${numOfItems} x ${numOfItems > 1 ? 'Items' : 'Item'}, ${numOfStories} x ${
              numOfStories > 1 ? 'Storeys' : 'Storey'
            }`}
          </Typography>
        </Box>
      );
    }

    // 时间段服务
    if (custom_attributes.type === 'slot') {
      const { start_time, end_time } = custom_attributes;
      if (start_time && end_time) {
        const startDate = getDate(start_time);
        const endDate = getDate(end_time);

        return (
          <Box>
            <Typography level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
              {`${startDate.format('ddd, MMM D, ha')} - ${endDate.format('ha')}`}
            </Typography>
          </Box>
        );
      }
    }
  }

  return null;
};

export default LineItemOptions;
