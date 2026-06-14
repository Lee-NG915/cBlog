'use client';
import { List, ListItem, useBreakpoints } from '@castlery/fortress';
import { ScrollWrapper, scrollTrackClasses } from '@castlery/shared-components';

export interface ListWrapperProps {
  products: any[];
  fullWidth?: boolean;
  customWidth?: number | string;
  children: ({ product, index }: { product: any; index: number }) => React.ReactNode;
}
export const ListWrapper = ({ products, fullWidth, customWidth, children }: ListWrapperProps) => {
  const { desktop, tablet } = useBreakpoints();

  return (
    <ScrollWrapper
      hideDesktopAction={true}
      stepLength={desktop ? 375 * 3 : tablet ? 350 * 2 : 210 * 2}
      sx={{
        width: fullWidth ? '100%' : 'auto',
        [`& .${scrollTrackClasses.root}`]: {
          mx: desktop ? 4 : 3,
        },
      }}
    >
      <List
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          p: 0,
          m: 0,
          px: desktop ? 4 : 3,
          gap: desktop ? '40px' : tablet ? 0 : 1,
        }}
      >
        {Array.isArray(products) &&
          products.map((product, index) => (
            <ListItem
              key={product.id}
              sx={{
                width: customWidth ? customWidth : desktop || tablet ? 350 : 202,
                flex: 'none',
                p: 0,
                m: 0,
              }}
            >
              {children({ product, index })}
            </ListItem>
          ))}
      </List>
    </ScrollWrapper>
  );
};

export default ListWrapper;
