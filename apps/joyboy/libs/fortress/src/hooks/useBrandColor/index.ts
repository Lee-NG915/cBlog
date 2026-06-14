// libs/fortress/src/Theme/hooks/useBrandColor.ts
// import { useMemo } from 'react';
import { generateColorVariants } from '../../Theme/helpers/generateColorVariants';
import { paletteV2 } from '../../Theme/v2/colors';
import { palette } from '../../Theme/v1/colors';
export type BrandColorName = keyof typeof paletteV2 | keyof typeof palette;

/**
 * 为组件应用品牌色系
 * @param colorName 品牌色系名称，如'leafGreen'、'burntOrange'等
 * @param options 配置选项，包括变体类型
 * @example
 * <Button color="primary" sx={{ ...withBrandColor('warmLinen') }}>warmLinenButton</Button>
 * <Button sx={{ m: 2, ...withBrandColor('freshWaterBlue', { variant: 'outlined' }) }}>freshWaterBlueOutlinedButton</Button>
 *
 * @description
 * 使用函数式 slotProps 确保品牌色样式不被覆盖，同时保留所有原有的事件处理和属性
 */
export function withBrandColor(colorName: BrandColorName, options: { variant?: string } = {}) {
  // 确保色系存在
  const colorRange = paletteV2[colorName] || palette[colorName];
  if (!colorRange) {
    console.warn(`品牌色系 "${String(colorName)}" 在调色板中未找到。可用色系:`, [
      ...Object.keys(paletteV2),
      ...Object.keys(palette),
    ]);
    return {};
  }

  const variant = options.variant || 'solid';
  const colorTokens = generateColorVariants(colorRange, [variant as any]);
  const cssVars = Object.entries(colorTokens).reduce((acc, [key, value]) => {
    acc[`--variant-${key}`] = value as string;
    return acc;
  }, {} as Record<string, string>);

  return cssVars;
}
