import { Box, Typography, Tag, Link } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';

interface PlaceholderProductNameProps {
  lineItem: any;
  showQuantity?: boolean;
  showLink?: boolean;
  onLinkClick?: () => void;
}

// 获取产品链接
export const getLineItemLink = (item: any) => {
  // 简化的链接生成逻辑，实际应根据项目需要调整
  const productSlug = (variant: any) => {
    if (variant.variant_option_values.length === 0) {
      return variant.product_slug;
    }
    const variations = variant.variant_option_values.map((item: any, index: number) => {
      return `${item.option_type_name}=${item.name}${index === variant.variant_option_values.length - 1 ? '' : '&'}`;
    });
    return `${variant.product_slug}?${variations.join('')}`;
  };

  if (item.variant?.product_slug) {
    return `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/products/${productSlug(item.variant)}`;
  }
  return null;
};

export const PlaceholderProductName = ({
  lineItem,
  showQuantity = false,
  showLink = true,
  onLinkClick,
}: PlaceholderProductNameProps) => {
  // 构建产品名称内容
  const nameContent = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography level="body1">
        {lineItem.variant?.name || 'Product Name'}
        {showQuantity && ` x ${lineItem.quantity || 1}`}
      </Typography>

      {/* GIFT 徽章 */}
      {lineItem.is_gift && <Tag color="warning">GIFT</Tag>}

      {/* BUNDLE SALE 徽章 */}
      {lineItem.pair_up_info && <Tag color="primary">BUNDLE SALE</Tag>}
    </Box>
  );

  // 如果需要链接且不是样本/服务类型
  if (lineItem.product_type !== 'swatch' && lineItem.product_type !== 'service' && showLink) {
    const link = getLineItemLink(lineItem);
    if (link) {
      return (
        <Link variant="primary" href={link} onClick={onLinkClick}>
          {nameContent}
        </Link>
      );
    }
  }

  return nameContent;
};
