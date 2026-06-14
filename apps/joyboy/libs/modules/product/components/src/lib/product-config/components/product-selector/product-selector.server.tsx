import { Divider, Sheet, Stack, Typography } from '@castlery/fortress';
import { CollectionItem, NavigationState } from '@castlery/types';
import { ProductSelectorClient } from './product-selector.client';
interface ProductSelectorProps {
  navigationState: NavigationState;
  collectionPage?: CollectionItem;
}

export const ProductSelectorServer = (props: ProductSelectorProps) => {
  const { navigationState, collectionPage } = props;
  const { spuGroups } = navigationState;
  const currentSpuGroup = spuGroups?.[0];

  const categoryCount = currentSpuGroup?.categoryCount ?? 0;

  return (
    <Stack
      sx={{
        mt: 4,

        mobile: {
          mt: 5,
          px: 6,
        },

        tablet: {
          px: 6,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography level="h5">Configuration</Typography>
        <Typography
          level="caption2"
          sx={{
            color: 'var(--fortress-palette-brand-mono-700)',
          }}
        >
          {categoryCount} {categoryCount === 1 ? 'configuration' : 'configurations'} available
        </Typography>
      </Stack>
      <Sheet
        variant="soft"
        sx={{
          mt: 3,
          pb: 6,
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-300)',
        }}
      >
        <ProductSelectorClient
          currentSpuGroup={currentSpuGroup}
          collectionPage={collectionPage}
          categoryCount={categoryCount}
        />
      </Sheet>
      <Divider
        sx={{
          mt: 7,
          mobile: {
            mt: 6,
          },
        }}
      />
    </Stack>
  );
};
