'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardOverflow,
  CardContent,
  Tag,
  Stack,
  Typography,
  // Link,
  useBreakpoints,
} from '@castlery/fortress';
// Import Swiper React components
import { Swiper, type SwiperClass, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { OptionSelector, OptionItem } from '../option-selector/option-selector';
import { FortressImage } from '../fortress-image/fortress-image';
import { WishlistBtn, WishlistToast } from '../wishlist-btn/wishlist-btn';

// TODO 使用 CustomLink 有闭包问题 导致无法获取到最新的URL
// import { CustomLink } from '../custom-link/custom-link';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { EcEnv } from '@castlery/config';
import { formatCurrencyClient, LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { featureManager, FeatureName } from '@castlery/monorepo-features';

// 通用产品数据接口
export interface ProductOption {
  value: string;
  presentation: string;
  image_src?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  price: string;
  list_price?: string;
  color?: string;
  lead_time?: number;
  lead_time_presentation?: string;
  product_short_description?: string;
  available_quantity?: number;
  badges?: string[];
  tags?: string[];
  images?: Array<{ large: string }>;
  life_style_image?: { large: string };
  option_values?: {
    material?: ProductOption;
    color_option?: ProductOption;
    wood?: ProductOption;
    leg_color?: ProductOption;
    frame?: ProductOption;
    length?: ProductOption;
  };
}

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  product_type?: string;
  variants: ProductVariant[];
  colorVariantsLength?: number;
  lengthVariantsLength?: number;
  colorOptionLimit?: number;
}

export interface ProductCardProps {
  /** 产品数据 */
  product: ProductData;
  /** 强制显示 hover 状态（用于 Storybook 展示） */
  forceHover?: boolean;
  /** 点击产品时的回调 */
  onProductClick?: (product: ProductData, variant: ProductVariant) => void;
  /** 点击变体选项时的回调 */
  onVariantSelect?: (variantIndex: number) => void;
  /** 点击收藏按钮时的回调 */
  onFavoriteClick?: (product: ProductData, variant: ProductVariant) => void;
  /** 是否展示喜欢按钮 */
  isShowWishlistBtn?: boolean;
  /** 搜索结果中的索引 */
  hitIndex?: number;
}

// 常量配置
const DAYS_IN_STOCK = 7;
const MAX_DESCRIPTION_LENGTH = 38;
const MAX_COLOR_OPTIONS = 3;
// 产品卡片图片尺寸配置：
// - 手机端 (xs): 50vw (2列布局，每列约50%)
// - iPad (sm-md): 33.33vw (3列布局，每列约33%)
// - 桌面端 (lg+): 25vw (4列布局，每列约25%)

const isPOS = EcEnv.NEXT_PUBLIC_CHANNEL === 'POS';

const PRODUCT_CARD_IMAGE_SIZES = ['0.25-lg', '0.3-sm', '0.5-xs'];

// 工具函数
const truncateString = (inputString: string, maxLength: number) => {
  if (inputString.length <= maxLength) {
    return inputString;
  }
  return `${inputString.slice(0, maxLength)}...`;
};

const defaultGetLinkUrl = (slug: string, variant?: ProductVariant) => {
  const baseLink = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${slug}`;
  if (!variant?.option_values) return baseLink;

  const options = variant.option_values;
  const queryParams = Object.keys(options)
    .map((key) => {
      const optionValue = options[key as keyof typeof options];
      return optionValue?.value ? `${key}=${optionValue.value}` : null;
    })
    .filter(Boolean) // 过滤掉 null 和空字符串
    .join('&');

  return queryParams ? `${baseLink}?${queryParams}` : baseLink;
};

const shouldHandleClientNavigation = (e: React.MouseEvent) => {
  return !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);
};

// 变体选择钩子
const useVariantSelection = (variants: ProductVariant[], initialIndex: number) => {
  // 为什么需要 initialIndex：
  // - onepiece 会先对变体按选定的选项值去重，并将第一个包含“Sale”标签的变体提前展示
  // - 我们的 UI 默认选中的变体应与“第一条展示的去重结果”一致，否则会出现“图/价/文”与选中状态不一致
  // - 因此把根据业务规则计算出的 initialIndex 作为初始选中项
  const hasUserSelectedRef = useRef(false);
  const clampIndex = (idx: number) =>
    Math.max(0, Math.min(Number.isFinite(idx) ? idx : 0, Math.max(variants.length - 1, 0)));

  const [currentVariantIndex, setCurrentVariantIndex] = useState<number>(clampIndex(initialIndex));

  // 当数据变化导致长度变短时，保证索引不越界
  useEffect(() => {
    if (variants.length > 0 && currentVariantIndex >= variants.length) {
      setCurrentVariantIndex(clampIndex(initialIndex));
      // 注意：此处即使用户曾经手动选择过，也必须回退，因为原先选择的索引已无效（越界）
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants.length]);

  // 当 initialIndex 或数据变化时，设置初始索引；但一旦用户手动选择过，就不再强制覆盖
  useEffect(() => {
    if (!hasUserSelectedRef.current) {
      setCurrentVariantIndex(clampIndex(initialIndex));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIndex, variants.length]);

  const safeSetCurrentVariantIndex = (index: number) => {
    hasUserSelectedRef.current = true; // 标记用户已选择，后续不再用 initialIndex 覆盖
    setCurrentVariantIndex(index);
  };

  const currentVariant = variants[currentVariantIndex] || null;

  return {
    currentVariant,
    currentVariantIndex,
    setCurrentVariantIndex: safeSetCurrentVariantIndex,
  };
};

// 变体选项钩子
const useVariantOptions = (variants: ProductVariant[]) => {
  return useMemo(() => {
    // 仅在以下支持的选项类型上进行聚合，和 onepiece 逻辑保持一致
    const SUPPORTED_OPTION_TYPES = ['material', 'color_option', 'wood', 'leg_color', 'frame'] as const;

    // optionsMap 记录每种类型的去重后的选项值，用于判断用哪种类型作为“去重维度”
    const optionsMap: Record<string, string[]> = {};
    const lengthOptions = new Set<string>(); // 记录长度选项的去重计数，用于“X sizes available”

    variants.forEach((variant) => {
      if (!variant.option_values) return;

      SUPPORTED_OPTION_TYPES.forEach((optionType) => {
        const optionValue = variant.option_values?.[optionType];
        if (optionValue) {
          if (!optionsMap[optionType]) {
            optionsMap[optionType] = [];
          }
          if (!optionsMap[optionType].includes(optionValue.value)) {
            optionsMap[optionType].push(optionValue.value);
          }
        }
      });

      // 仅用于展示“有多少种长度”，不参与去重维度选择
      const lengthOption = variant.option_values.length;
      if (lengthOption) {
        lengthOptions.add(lengthOption.value);
      }
    });

    // 选出“去重维度”的优先级：
    // - 先看是否有多于 1 个不同值的类型，按 material → color_option → wood → leg_color → frame 的顺序
    // - 若都只有 1 个值，则退而选任意存在的单值类型（同优先级顺序）
    type OptionType = (typeof SUPPORTED_OPTION_TYPES)[number];
    // 更简洁的实现：
    // 1) 先找“有多个不同值”的类型；
    // 2) 否则找“至少有一个值”的类型；
    // 3) 都没有则回退到优先级数组的第一个（material）
    const selectedOptionType: OptionType =
      SUPPORTED_OPTION_TYPES.find((t) => (optionsMap[t]?.length ?? 0) > 1) ??
      SUPPORTED_OPTION_TYPES.find((t) => (optionsMap[t]?.length ?? 0) >= 1) ??
      SUPPORTED_OPTION_TYPES[0];

    // 构建“按选中维度去重”的列表，并实现“Sale 优先只提前一次”的业务规则
    // - seenValues 控制按该维度的值去重
    // - saleFirstApplied 确保仅把遇到的第一个带“Sale”标签的条目提前
    //   且不会对相同值的后续项目再次提前，与 onepiece 的 isSaleFirstInShown/Hidden 语义对齐
    let saleFirstApplied = false;
    const seenValues = new Set<string>();
    const variantOptions: Array<{
      variant: ProductVariant;
      index: number;
      optionValue: ProductOption;
    }> = [];

    variants.forEach((variant, index) => {
      const optionValue = variant.option_values?.[selectedOptionType as keyof typeof variant.option_values] as
        | ProductOption
        | undefined;
      if (!optionValue) return;
      if (seenValues.has(optionValue.value)) return;

      seenValues.add(optionValue.value);
      const item = { variant, index, optionValue };
      const isSale = Array.isArray(variant.tags) && variant.tags.indexOf('Sale') > -1;
      if (isSale && !saleFirstApplied) {
        variantOptions.unshift(item);
        saleFirstApplied = true;
      } else {
        variantOptions.push(item);
      }
    });

    const uniqueOptionCount = optionsMap[selectedOptionType]?.length || 0;
    const lengthVariantsLength = lengthOptions.size;

    // 计算初始选中索引 initialIndex：指向“去重后的第一个（可能是 Sale 提前的）变体”的原始索引
    // 为什么需要它：
    // - 展示的第一个“颜色点/材质点”和默认选中的变体需要一致，否则用户看到 A 样式但价格/图片来自 B 变体
    // - 当某些值被去重折叠后，直接用 0 号变体可能与“展示的第一个不同值”不一致
    let initialIndex = 0;
    if (variantOptions.length > 0) {
      initialIndex = variantOptions[0].index;
    } else {
      // 极端情况下去重后无可用项（等价于 onepiece 的 noColorVariants 分支），
      // 则退化为第一个带 Sale 的原始变体，否则取 0
      const saleIdx = variants.findIndex((v) => Array.isArray(v.tags) && v.tags.indexOf('Sale') > -1);
      initialIndex = saleIdx !== -1 ? saleIdx : 0;
    }

    return {
      variantOptions,
      selectedOptionType,
      totalOptionsCount: uniqueOptionCount,
      lengthVariantsLength,
      initialIndex,
    };
  }, [variants]);
};

// 变体选择器组件
interface VariantOptionSelectorProps {
  variantOptions: Array<{
    variant: ProductVariant;
    index: number;
    optionValue: ProductOption;
  }>;
  currentVariantIndex: number;
  onVariantSelect: (index: number) => void;
  totalOptionsCount: number;
  optionLimit?: number;
}

function VariantOptionSelector({
  variantOptions,
  currentVariantIndex,
  onVariantSelect,
  totalOptionsCount,
  optionLimit = MAX_COLOR_OPTIONS,
}: VariantOptionSelectorProps) {
  if (variantOptions.length <= 1) {
    return null;
  }

  const displayOptions = variantOptions.slice(0, optionLimit);

  // 这里的 isSelected 使用“原始变体索引”来对齐 onepiece 的行为
  // 因为 variantOptions 是去重后的视图，但我们要保持与原始 variants 的索引对应关系
  const options: OptionItem[] = displayOptions.map(({ variant, index, optionValue }) => ({
    id: `${variant.id}-${optionValue.value}-${index}`,
    value: optionValue.value,
    label: optionValue.presentation || variant.color || 'Variant option',
    image: optionValue.image_src,
    isSelected: currentVariantIndex === index,
  }));

  const handleSelect = (optionId: string) => {
    const selectedOption = displayOptions.find(
      ({ variant, optionValue, index }) => `${variant.id}-${optionValue.value}-${index}` === optionId
    );
    if (selectedOption) {
      onVariantSelect(selectedOption.index);
    }
  };

  return (
    <OptionSelector
      options={options}
      maxDisplay={optionLimit}
      totalOptionsCount={totalOptionsCount}
      size={24}
      onSelect={handleSelect}
      allowWrap={true}
      sx={{
        mb: {
          xs: 3,
          md: 4,
        },
      }}
      variant="square"
    />
  );
}

// 产品图片组件
interface ProductImageProps {
  variant: ProductVariant;
  productName: string;
  canonicalLink: string;
  navigationLink: string;
  shouldShowHoverState: boolean;
  onProductClick?: () => void;
  isShowWishlistBtn?: boolean;
  onToastShow?: (status: 'add' | 'remove') => void;
}

function ProductImage({
  variant,
  productName,
  canonicalLink,
  navigationLink,
  shouldShowHoverState,
  onProductClick,
  isShowWishlistBtn,
  onToastShow,
}: ProductImageProps) {
  const { mobile } = useBreakpoints();
  const router = useRouter();
  const { t } = useTranslation(LocalesNamespace.SHARED, { keyPrefix: 'common' });
  const hasLifestyleImage = Boolean(variant?.life_style_image);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const highlightBadgeList = ['Sale', 'Clearance', 'Extra 5% Off'];
  // 重置 slide 索引当 variant 变化时
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [variant]);

  const handleClick = (e: React.MouseEvent) => {
    if (onProductClick) {
      onProductClick();
    }
    if (navigationLink !== canonicalLink && shouldHandleClientNavigation(e)) {
      e.preventDefault();
      router.push(navigationLink);
    }
  };

  // 准备图片数组（主图片 + lifestyle图片）
  const images = useMemo(() => {
    const imageList = [];
    if (variant?.images?.[0]?.large) {
      imageList.push({
        src: variant.images[0].large,
        alt: variant?.name || productName,
        type: 'main',
      });
    }
    if (hasLifestyleImage) {
      imageList.push({
        src: variant.life_style_image!.large,
        alt: `${variant.name || productName} lifestyle`,
        type: 'lifestyle',
      });
    }
    return imageList;
  }, [variant, productName, hasLifestyleImage]);

  // 判断当前显示的是否为 lifestyle 图片（第二张图片）
  const isShowingLifestyle = currentSlideIndex === 1 && hasLifestyleImage;

  // 移动端 swiper 设置
  const swiperSettings = {
    modules: [Pagination],
    spaceBetween: 0,
    slidesPerView: 1,
    pagination: {
      clickable: true,
      dynamicBullets: false,
    },
    onSlideChange: (swiper: SwiperClass) => {
      setCurrentSlideIndex(swiper.activeIndex);
    },
  };

  // 移动端：为 Swiper 渲染图片（带点击链接）
  const renderSwiperImage = (img: { src: string; alt: string; type: string }, index: number) => (
    <Box
      key={index}
      component={NextLink}
      href={canonicalLink}
      onClick={handleClick}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'block',
        cursor: 'pointer',
      }}
      {...{
        prefetch: false,
      }}
    >
      <FortressImage
        src={img.src}
        alt={img.alt}
        ratio={1} // 关键修复：明确禁用 ratio 避免 AspectRatio 冲突
        sizes={PRODUCT_CARD_IMAGE_SIZES}
        objectFit={img?.type === 'lifestyle' ? 'cover' : 'contain'}
        sx={{
          // 关键修复：覆盖 AspectRatio 的默认 paddingBottom 行为
          '--AspectRatio-paddingBottom': '0px',
          '& .MuiAspectRatio-content': {
            position: 'absolute',
            top: 0,
            left: 0,
          },
        }}
      />
    </Box>
  );

  const renderOverlayElements = () => (
    <>
      {/* Top row: Badge on left, Wishlist button on right */}
      <Box
        sx={{
          m: isPOS
            ? 1
            : {
                xs: 2,
                md: 4,
              },
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 2,
          pointerEvents: 'none', // 容器不拦截点击，让点击穿透
        }}
      >
        {/* Product badge - left side */}
        <Box sx={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          {variant?.badges && variant.badges.length > 0 && (
            <Tag
              variant="solid"
              sx={{
                backgroundColor: highlightBadgeList.includes(variant?.badges[0])
                  ? 'var(--fortress-palette-brand-burntOrange-400)'
                  : 'var(--fortress-palette-brand-terracotta-500)',
              }}
            >
              <Typography level="caption2">{variant?.badges[0]}</Typography>
            </Tag>
          )}
          {variant?.badges?.includes("Steve's picks") && variant?.badges?.[0] !== "Steve's picks" && (
            <Tag variant="solid" sx={{ backgroundColor: 'var(--fortress-palette-brand-maroonVelvet-500)' }}>
              <Typography level="caption2">Steve's picks</Typography>
            </Tag>
          )}
        </Box>

        {/* Wishlist button - right side, only show in WEB channel */}
        <Box>
          {!mobile && isShowWishlistBtn && (
            <Box
              sx={{
                display: shouldShowHoverState ? 'block' : 'none',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 3, // Above the link overlay (zIndex: 0)
              }}
            >
              {variant.id && (
                <WishlistBtn
                  variantId={variant.id}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  onToastShow={onToastShow}
                  showToast={false}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Lead time info */}
      {!mobile && featureManager.isFeatureEnabled(FeatureName.LEADTIME_DISPLAY) && variant.lead_time_presentation && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            opacity: shouldShowHoverState ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '100%',
              py: 2,
              px: 3,
              textAlign: 'center',
              bgcolor: 'var(--fortress-palette-brand-burntOrange-500)',
            }}
          >
            <Typography
              level="caption1"
              sx={{
                color: 'var(--fortress-palette-brand-warmLinen-500)',
              }}
            >
              {t('dispatch')} <strong>{variant.lead_time_presentation}</strong>
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );

  return (
    <CardOverflow>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
        }}
      >
        {/* Clickable overlay for navigation - sits below the wishlist button */}
        <Box
          component={NextLink}
          href={canonicalLink}
          onClick={handleClick}
          sx={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            zIndex: 0,
          }}
          {...{
            prefetch: false,
          }}
        />

        {mobile && images.length > 1 ? (
          // 移动端：使用 swiper
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1',
              zIndex: 1, // 确保 Swiper 在 link overlay 之上
              '& .swiper, & .swiper-wrapper, & .swiper-slide': {
                height: '100%',
              },
              '& .swiper-slide': {
                display: 'flex',
              },
              // 自定义 pagination 样式
              '& .swiper-pagination': {
                bottom: 2,
                '& .swiper-pagination-bullet': {
                  width: '8px',
                  height: '8px',
                  display: 'inline-block',
                  borderRadius: '50%',
                  border: `1px solid ${
                    isShowingLifestyle
                      ? 'var(--fortress-palette-brand-warmLinen-500)'
                      : 'var(--fortress-palette-brand-mono-300)'
                  }`,
                  backgroundColor: 'transparent',
                  transition: 'border-color 0.3s ease, background-color 0.3s ease',
                },
                '& .swiper-pagination-bullet-active': {
                  borderColor: isShowingLifestyle
                    ? 'var(--fortress-palette-brand-warmLinen-500)'
                    : 'var(--fortress-palette-brand-mono-700)',
                  backgroundColor: isShowingLifestyle
                    ? 'var(--fortress-palette-brand-warmLinen-500)'
                    : 'var(--fortress-palette-brand-mono-700)',
                },
              },
            }}
          >
            <Swiper {...swiperSettings}>
              {images.map((img, index) => (
                <SwiperSlide key={index}>{renderSwiperImage(img, index)}</SwiperSlide>
              ))}
            </Swiper>
          </Box>
        ) : (
          // 桌面端：保持原有的 hover 逻辑
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              aspectRatio: '1',
              pointerEvents: 'none', // 让点击事件穿透到下方的 link overlay
            }}
          >
            {/* Base image */}
            <FortressImage
              src={variant?.images?.[0]?.large || ''}
              alt={variant?.name || productName}
              ratio={1}
              sizes={PRODUCT_CARD_IMAGE_SIZES}
              sx={{
                position: 'absolute',
                inset: 0,
                transition: 'opacity 0.3s ease',
                opacity: shouldShowHoverState && hasLifestyleImage ? 0 : 1,
              }}
            />

            {/* Lifestyle image (shown on hover) */}
            {hasLifestyleImage && (
              <FortressImage
                src={variant.life_style_image!.large}
                alt={`${variant.name || productName} lifestyle`}
                objectFit="cover"
                ratio={1}
                sizes={PRODUCT_CARD_IMAGE_SIZES}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  transition: 'opacity 0.3s ease',
                  opacity: shouldShowHoverState ? 1 : 0,
                }}
              />
            )}
          </Box>
        )}

        {renderOverlayElements()}
      </Box>
    </CardOverflow>
  );
}

// 产品信息组件
interface ProductInfoProps {
  product: ProductData;
  variant: ProductVariant;
  canonicalLink: string;
  navigationLink: string;
  isLowStock: boolean;
  onProductClick?: () => void;
  variantOptions: Array<{
    variant: ProductVariant;
    index: number;
    optionValue: ProductOption;
  }>;
  currentVariantIndex: number;
  onVariantSelect: (index: number) => void;
  totalOptionsCount: number;
  colorOptionLimit?: number;
  shouldShowHoverState: boolean;
  lengthVariantsLength: number;
}

function ProductInfo({
  product,
  variant,
  canonicalLink,
  navigationLink,
  isLowStock,
  onProductClick,
  variantOptions,
  currentVariantIndex,
  onVariantSelect,
  totalOptionsCount,
  colorOptionLimit = MAX_COLOR_OPTIONS,
  shouldShowHoverState,
  lengthVariantsLength,
}: ProductInfoProps) {
  const router = useRouter();
  const price = variant?.price || '';
  const isFree = parseFloat(price) === 0;
  const pricePresentation = isFree
    ? 'Free'
    : `${product.product_type === 'bundle' ? 'From ' : ''}${formatCurrencyClient(price)}`;
  const hasListPrice = variant?.list_price && variant.price !== variant.list_price;
  const { mobile } = useBreakpoints();

  const handleClick = (e: React.MouseEvent) => {
    if (onProductClick) {
      onProductClick();
    }
    if (navigationLink !== canonicalLink && shouldHandleClientNavigation(e)) {
      e.preventDefault();
      router.push(navigationLink);
    }
  };
  return (
    <CardContent
      sx={{
        flexGrow: 1,
        bgcolor: 'transparent',
        p: isPOS
          ? 1
          : {
              xs: 2,
              md: 4,
            },
        pb: {
          xs: 4,
          md: 6,
        },
        pt: {
          xs: 3,
          md: 4,
        },
      }}
    >
      {/* Product name */}

      <Typography
        level={isPOS ? 'body1' : 'h5'}
        mb={{
          xs: 1,
          md: 2,
        }}
      >
        <NextLink
          href={canonicalLink}
          onClick={handleClick}
          style={{ textDecoration: 'none', color: 'inherit' }}
          prefetch={false}
        >
          {product.name}
        </NextLink>
      </Typography>

      {/* Product description */}
      {variant?.product_short_description && (
        <Typography
          level="caption1"
          sx={{
            mb: {
              xs: 3,
              md: 4,
            },
            color: 'var(--fortress-palette-brand-mono-700)',
          }}
        >
          {truncateString(variant.product_short_description, MAX_DESCRIPTION_LENGTH)}
        </Typography>
      )}

      {/* Variant Selector - moved above price */}
      <VariantOptionSelector
        variantOptions={variantOptions}
        currentVariantIndex={currentVariantIndex}
        onVariantSelect={onVariantSelect}
        totalOptionsCount={totalOptionsCount}
        optionLimit={colorOptionLimit}
      />

      {/* Size information */}
      {lengthVariantsLength > 1 && (
        <Typography
          level="body2"
          mb={6}
          sx={{
            color: 'var(--fortress-palette-brand-mono-700)',
          }}
        >
          {lengthVariantsLength} sizes available
        </Typography>
      )}

      {/* Price */}
      <Box>
        {hasListPrice ? (
          <Stack direction="row" alignItems="center" spacing={3}>
            <Typography level={isPOS ? 'body1' : 'h5'} sx={{ color: 'var(--fortress-palette-brand-terracotta-500)' }}>
              {pricePresentation}
            </Typography>
            <Typography
              level={isPOS ? 'body1' : 'h5'}
              color="danger"
              sx={{
                textDecoration: 'line-through',
                color: 'var(--fortress-palette-brand-mono-500)',
              }}
            >
              {formatCurrencyClient(variant.list_price!)}
            </Typography>
          </Stack>
        ) : (
          <Typography level={isPOS ? 'body1' : 'h5'}>{pricePresentation}</Typography>
        )}
      </Box>

      {/* Stock warning */}
      {isLowStock && (
        <Typography level="body2" color="danger">
          Only {variant?.available_quantity} left in stock
        </Typography>
      )}
    </CardContent>
  );
}

/**
 * 通用产品卡片组件
 *
 * 这是一个可复用的产品展示卡片，不依赖特定的数据源
 */
export function ProductCard({
  product,
  forceHover = false,
  onProductClick,
  onVariantSelect,
  onFavoriteClick,
  isShowWishlistBtn = true,
  hitIndex,
}: ProductCardProps) {
  const { mobile, desktop } = useBreakpoints();
  const [isHovered, setIsHovered] = useState(forceHover);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastStatus, setToastStatus] = useState<'add' | 'remove'>('add');
  // 先根据业务规则（去重 + Sale 优先）计算出 initialIndex 和展示用的 variantOptions
  const { variantOptions, totalOptionsCount, lengthVariantsLength, initialIndex } = useVariantOptions(product.variants);
  // 再用 initialIndex 初始化“真正选中的变体”，并在用户交互后不再被覆盖
  const { currentVariant, currentVariantIndex, setCurrentVariantIndex } = useVariantSelection(
    product.variants,
    initialIndex
  );

  // 在移动端禁用 hover 效果
  const shouldShowHoverState = !mobile && (forceHover || isHovered);

  const handleVariantSelect = (index: number) => {
    setCurrentVariantIndex(index);
    if (onVariantSelect) {
      onVariantSelect(index);
    }
  };

  const handleProductClick = () => {
    if (onProductClick && currentVariant) {
      onProductClick(product, currentVariant);
    }
  };

  const handleToastShow = (status: 'add' | 'remove') => {
    setToastStatus(status);
    setToastOpen(true);
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  const canonicalProductLink = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${product.slug}`;
  const navigationProductLink = defaultGetLinkUrl(product.slug, currentVariant);

  // 库存警告逻辑
  const isLowStock = Boolean(
    currentVariant?.available_quantity &&
      currentVariant.available_quantity <= 3 &&
      (currentVariant.lead_time || 0) <= DAYS_IN_STOCK
  );

  if (!currentVariant) {
    return null;
  }

  return (
    <Card
      variant="plain"
      data-hit-index={hitIndex}
      data-hit-sku={currentVariant?.sku}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        gap: 0,
        borderRadius: 0,
        p: 0,
        m: 0,
        '--Card-padding': '0px',
        '--Card-radius': '0px',
        '&:hover': {
          boxShadow: 'none',
        },
      }}
      data-testid="product-card"
      onMouseEnter={() => !forceHover && setIsHovered(true)}
      onMouseLeave={() => !forceHover && setIsHovered(false)}
    >
      <ProductImage
        variant={currentVariant}
        productName={product.name}
        canonicalLink={canonicalProductLink}
        navigationLink={navigationProductLink}
        shouldShowHoverState={shouldShowHoverState}
        onProductClick={handleProductClick}
        isShowWishlistBtn={isShowWishlistBtn}
        onToastShow={handleToastShow}
      />

      <ProductInfo
        product={product}
        variant={currentVariant}
        canonicalLink={canonicalProductLink}
        navigationLink={navigationProductLink}
        isLowStock={isLowStock}
        onProductClick={handleProductClick}
        variantOptions={variantOptions}
        currentVariantIndex={currentVariantIndex}
        onVariantSelect={handleVariantSelect}
        totalOptionsCount={totalOptionsCount}
        colorOptionLimit={product.colorOptionLimit}
        shouldShowHoverState={shouldShowHoverState}
        lengthVariantsLength={lengthVariantsLength}
      />

      <WishlistToast
        open={toastOpen}
        onClose={handleToastClose}
        status={toastStatus}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      />
    </Card>
  );
}
