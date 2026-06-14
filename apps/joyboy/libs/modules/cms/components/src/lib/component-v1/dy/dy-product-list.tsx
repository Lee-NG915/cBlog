'use client';

import { usePathname } from 'next/navigation';
import type { DYProduct } from './types';
import { createDataTrackingData } from '@castlery/utils';
import { ListItemButton, Stack, Typography } from '@castlery/fortress';
import { ListWrapper, ProductItem } from '@castlery/modules-product-components';
import { ArrowRight } from '@castlery/fortress/Icons';
import { CustomLink } from '@castlery/shared-components';

interface DYProductListProps {
  products: DYProduct[];
  outerModuleName?: string;
  listInfo: {
    title: string;
    needShowLifeImage: boolean;
    link: string;
    linkText: string;
  };
}

const DYProductList = ({ products, outerModuleName = '', listInfo }: DYProductListProps) => {
  const pathname = usePathname();
  const trackingTags = (productName: string, index: number) => {
    createDataTrackingData({
      pathname,
      module: outerModuleName,
      elementName: 'Product Item',
      content: {
        target: productName,
        index,
      },
    });
  };

  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {listInfo.title !== '' && (
        <Typography
          level="h2"
          sx={{
            textAlign: 'center',
            fontSize: '40px',
            color: (theme) => theme.palette.brand.charcoal[800],
            marginBottom: 10,
          }}
        >
          {listInfo.title}
        </Typography>
      )}
      {listInfo.link !== '' && listInfo.linkText !== '' && (
        <Stack
          sx={{
            width: '100%',
            alignItems: 'center',
            a: {
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            },
          }}
        >
          <CustomLink href={listInfo.link}>
            <Typography
              sx={{
                color: (theme) => theme.palette.brand.wheat[500],
                fontSize: '18px',
                marginRight: 2,
              }}
            >
              {listInfo.linkText}
            </Typography>
            <ArrowRight width={26} height={22} fontSize="xl5" />
          </CustomLink>
        </Stack>
      )}
      <ListWrapper products={products}>
        {(props) => {
          const name = props.product.productData.spu_name;
          let image = props.product.productData.image_url;
          if (listInfo.needShowLifeImage && props.product.productData.lifestyle_image) {
            image = props.product.productData.lifestyle_image;
          }
          const price = props.product.productData.price;
          const strikeThroughPrice = props.product.productData.sale_price;
          const tag = props.product.productData.badgesArr?.[0] || '';
          const description = '';
          return (
            <ListItemButton>
              <ProductItem
                name={name}
                description={description}
                price={price}
                strikeThroughPrice={strikeThroughPrice}
                images={[
                  {
                    feed: image,
                    alt: name,
                  },
                ]}
                tag={tag}
              />
            </ListItemButton>
          );
        }}
      </ListWrapper>
    </Stack>
  );
};

export { DYProductList };
