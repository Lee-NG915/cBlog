'use client';
import { ArrowRight } from '@castlery/fortress/Icons';
import { Typography, Stack, Link, List, ListItem, useBreakpoints, typographyClasses } from '@castlery/fortress';
import { ScrollWrapper } from '@castlery/shared-components';

export const CollectionHeader = () => {
  const { desktop } = useBreakpoints();
  return (
    <Stack gap={1} sx={{ alignItems: desktop ? 'center' : 'flex-start' }}>
      <Typography level="h1" color="primary">
        Shop the Collection
      </Typography>
      <Stack sx={{ display: 'grid', gridTemplateColumns: desktop ? '1fr auto' : '1fr' }}>
        <Typography level="body1">Check out the rest of the furniture under this collection.</Typography>
        <Link color="neutral" endDecorator={<ArrowRight />}>
          Explore more
        </Link>
      </Stack>
    </Stack>
  );
};

export interface CollectionContentProps {
  products: any[];
  children: ({ product }: { product: any }) => React.ReactNode;
}
export const CollectionContent = ({ products, children }: CollectionContentProps) => {
  const { desktop } = useBreakpoints();

  return (
    <ScrollWrapper>
      <List sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2, p: 0, m: 0 }}>
        {Array.isArray(products) &&
          products.map((product) => (
            <ListItem
              key={product.id}
              sx={{
                width: desktop ? 350 : 202,
                flex: 'none',
                p: 0,
                [`.${typographyClasses.root}`]: {
                  textAlign: 'center',
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  textOverflow: 'ellipsis',
                },
              }}
            >
              {children({ product })}
            </ListItem>
          ))}
      </List>
    </ScrollWrapper>
  );
};
