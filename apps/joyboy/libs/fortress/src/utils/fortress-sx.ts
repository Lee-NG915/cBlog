import type { Theme } from '@mui/joy/styles';
import type { SxProps } from '@mui/joy/styles/types';

const RESPONSIVE_KEYS = ['mobile', 'tablet', 'desktop'] as const;

type ResponsiveKey = (typeof RESPONSIVE_KEYS)[number];

type ResponsiveBlock = Record<string, any> & Partial<Record<ResponsiveKey, SxProps>>;

type FortressSxLeaf = SxProps | ResponsiveBlock | null | false | undefined;

export type FortressSx = FortressSxLeaf | FortressSxLeaf[] | ReadonlyArray<FortressSxLeaf | FortressSxLeaf[]>;

const isResponsiveBlock = (value: unknown): value is ResponsiveBlock => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return RESPONSIVE_KEYS.some((key) => Object.prototype.hasOwnProperty.call(value, key));
};

const materializeSx = (value: SxProps | null | false | undefined, theme: Theme): Record<string, any> => {
  if (!value) return {};
  if (typeof value === 'function') {
    return materializeSx(value(theme), theme);
  }
  if (Array.isArray(value)) {
    return value.reduce<Record<string, any>>((acc, item) => {
      Object.assign(acc, materializeSx(item, theme));
      return acc;
    }, {});
  }
  return value as Record<string, any>;
};

/**
 * 生成与 useBreakpoints hook 语义一致的 media query
 *
 * @see libs/fortress/src/hooks/useBreakpoints/useBreakpoints.ts
 *
 * 规范：
 * - mobile: 0-599px (xs, between xs and sm)
 * - tablet: 600-899px (sm, between sm and md)
 * - desktop: 900px+ (md+, up md)
 */
const getMediaQuery = (theme: Theme, key: ResponsiveKey): string | null => {
  try {
    const breakpoints = theme.breakpoints.values as Record<string, number>;

    switch (key) {
      case 'mobile':
        // 对应 useBreakpoints: xs = between('xs', 'sm')
        // 0 - 599px
        return `@media (max-width: ${breakpoints.sm - 1}px)`;

      case 'tablet':
        // 对应 useBreakpoints: sm = between('sm', 'md')
        // 600 - 899px
        return `@media (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`;

      case 'desktop':
        // 对应 useBreakpoints: desktop = up('md')
        // 900px+
        return `@media (min-width: ${breakpoints.md}px)`;

      default:
        return null;
    }
  } catch {
    return null;
  }
};

const buildResponsiveBlock = (block: ResponsiveBlock, theme: Theme): Record<string, any> => {
  const global: Record<string, any> = { ...block };
  const responsive: Record<string, any> = {};

  RESPONSIVE_KEYS.forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(global, key)) return;
    const value = global[key];
    delete global[key];
    if (value == null || value === false) return;

    const media = getMediaQuery(theme, key);
    if (!media) return;

    responsive[media] = {
      ...(responsive[media] ?? {}),
      ...materializeSx(value, theme),
    };
  });

  return {
    ...global,
    ...responsive,
  };
};

export const normalizeFortressSx = (input: FortressSx, theme: Theme): SxProps | undefined => {
  if (input == null || input === false) return undefined;

  // 处理函数类型的 sx：调用函数并递归处理返回值
  // 这样可以支持 (theme) => ({ desktop: {...}, mobile: {...} }) 这种形式
  if (typeof input === 'function') {
    return normalizeFortressSx(input(theme), theme);
  }

  if (Array.isArray(input)) {
    const normalized = input
      .map((item) => normalizeFortressSx(item, theme))
      .filter((item): item is SxProps => Boolean(item));
    return normalized as unknown as SxProps;
  }

  if (isResponsiveBlock(input)) {
    return buildResponsiveBlock(input, theme);
  }

  return input as SxProps;
};
