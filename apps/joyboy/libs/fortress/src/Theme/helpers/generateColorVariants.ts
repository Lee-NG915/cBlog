// libs/fortress/src/Theme/helpers/generateColorvariant.ts
import { PaletteRange } from '@mui/joy/styles';
import { paletteV2 } from '../v2/colors';
type VariantType = 'solid' | 'soft' | 'outlined' | 'plain';

/**
 * 根据色阶自动生成 Joy UI 变体色 token
 * 支持所有变体(solid/soft/outlined/plain)的所有状态(default/hover/focus/active/disabled/checked等)
 *
 * @param colorRange 完整色阶 (10-900)
 * @param variant 需要生成的变体类型，默认全部
 * @param monoRange 用于禁用状态的中性色，默认使用原色的浅色
 * @returns 包含所有变体色 token 的对象
 */
export function generateColorVariants(
  colorRange: PaletteRange,
  variant: VariantType[] = ['solid', 'soft', 'outlined', 'plain']
) {
  const result: Record<string, string> = {};

  // 使用系统中性色作为禁用状态色
  const mono = paletteV2.mono;
  const textColor = colorRange[500] === paletteV2.warmLinen[500] ? paletteV2.maroonVelvet : paletteV2.warmLinen;

  if (variant.includes('solid')) {
    // --------- Solid 变体 ---------
    // 基本状态 - 使用500色值
    result.solidColor = textColor[500];
    result.solidBg = colorRange[500];
    result.solidBorder = colorRange[500];

    // Hover 状态 - 使用600色值
    result.solidHoverColor = textColor[500];
    result.solidHoverBg = colorRange[600];
    result.solidHoverBorder = colorRange[600];

    // Focus 状态 - 使用600色值
    result.solidFocusColor = textColor[500];
    result.solidFocusBg = colorRange[600];
    result.solidFocusBorder = colorRange[600];

    // Active 状态 - 使用800色值
    result.solidActiveColor = textColor[500];
    result.solidActiveBg = colorRange[800];
    result.solidActiveBorder = colorRange[800];

    // Disabled 状态
    result.solidDisabledColor = mono[500];
    result.solidDisabledBg = mono[200];
    result.solidDisabledBorder = mono[200];
  }
  if (variant.includes('soft')) {
    // --------- Soft 变体 ---------
    // 基本状态
    result.softColor = textColor[500];
    result.softBg = colorRange[100];
    result.softBorder = 'transparent';

    // Hover 状态
    result.softHoverColor = textColor[500];
    result.softHoverBg = colorRange[200];
    result.softHoverBorder = 'transparent';

    // Focus 状态
    result.softFocusColor = textColor[500];
    result.softFocusBg = colorRange[200];
    result.softFocusBorder = 'transparent';

    // Active 状态
    result.softActiveColor = textColor[500];
    result.softActiveBg = colorRange[300];
    result.softActiveBorder = 'transparent';

    // Disabled 状态
    result.softDisabledColor = mono[500];
    result.softDisabledBg = mono[200];
    result.softDisabledBorder = 'transparent';
  }
  if (variant.includes('outlined')) {
    // --------- Outlined 变体 ---------
    // 基本状态
    result.outlinedColor = colorRange[500];
    result.outlinedBorder = colorRange[500];
    result.outlinedBg = 'transparent';

    // Hover 状态
    result.outlinedHoverColor = colorRange[500];
    result.outlinedHoverBorder = colorRange[500];
    result.outlinedHoverBg = colorRange[100];

    // Focus 状态
    result.outlinedFocusColor = colorRange[500];
    result.outlinedFocusBorder = colorRange[500];
    result.outlinedFocusBg = colorRange[100];

    // Active 状态
    result.outlinedActiveColor = colorRange[500];
    result.outlinedActiveBorder = colorRange[500];
    result.outlinedActiveBg = colorRange[200];

    // Disabled 状态
    result.outlinedDisabledColor = mono[500];
    result.outlinedDisabledBorder = mono[500];
    result.outlinedDisabledBg = 'transparent';
  }
  if (variant.includes('plain')) {
    // --------- Plain 变体 ---------
    // 基本状态
    result.plainColor = colorRange[500];
    result.plainBg = 'transparent';
    result.plainBorder = 'transparent';

    // Hover 状态
    result.plainHoverColor = colorRange[500];
    result.plainHoverBg = 'transparent';
    result.plainHoverBorder = 'transparent';

    // Focus 状态
    result.plainFocusColor = colorRange[500];
    result.plainFocusBg = 'transparent';
    result.plainFocusBorder = 'transparent';

    // Active 状态
    result.plainActiveColor = colorRange[500];
    result.plainActiveBg = 'transparent';
    result.plainActiveBorder = 'transparent';

    // Disabled 状态
    result.plainDisabledColor = mono[500];
    result.plainDisabledBg = 'transparent';
    result.plainDisabledBorder = 'transparent';
  }

  return result;
}
