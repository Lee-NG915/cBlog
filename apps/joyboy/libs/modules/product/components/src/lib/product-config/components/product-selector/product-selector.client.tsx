'use client';

import {
  Box,
  RadioButton,
  RadioGroup,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { EVENT_PDP_SELECTOR } from '@castlery/modules-tracking-services';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct } from '@castlery/modules-product-domain';
import { CollectionItem, SpuGroup } from '@castlery/types';
import { useRouter } from 'nextjs-toploader/app';
import { ProductSelectorInlineVariantOptions } from './product-selector-inline-variant-options';
import { ProductSelectorCustomizeSheet } from './product-selector-customize-sheet';
import { FortressImage } from '@castlery/shared-components';

const INLINE_OPTION_NAMES = ['orientation', 'ottoman'];

interface ProductSelectorClientProps {
  currentSpuGroup: SpuGroup | undefined;
  collectionPage: CollectionItem | undefined;
  categoryCount?: number; // SPU Group 的 Category Group 总数
}

export const ProductSelectorClient = (props: ProductSelectorClientProps) => {
  const { currentSpuGroup, collectionPage, categoryCount } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { mobile } = useBreakpoints();
  const product = useAppSelector(selectProduct);

  const hasInlineOptions = INLINE_OPTION_NAMES.some((name) => product?.option_types?.find((ot) => ot.name === name));

  const activeLayoutGroup = currentSpuGroup?.layoutGroups?.find((layoutGroup) => layoutGroup.isActive);

  return (
    <Tabs
      value={activeLayoutGroup?.id}
      sx={{
        border: 'none',
      }}
    >
      <TabList
        disableUnderline
        sx={{
          width: '100%',
          px: 2,
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
          display: 'flex',
          overflow: 'auto',
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          '& > *': {
            flex: 'none',
            width: 'auto',
          },
        }}
      >
        {currentSpuGroup?.layoutGroups.map((layoutGroup) => (
          <Box
            key={layoutGroup.id}
            sx={{
              scrollSnapAlign: 'start',
            }}
            onClick={async () => {
              dispatch(
                EVENT_PDP_SELECTOR({
                  action: 'click',
                  label: layoutGroup.title,
                  tag: 'null',
                  tagValue: 'null',
                })
              );
              await new Promise((resolve) => setTimeout(resolve, 100));
              router.push(layoutGroup.defaultLink, { scroll: false });
            }}
          >
            <Tab
              variant="underline"
              key={layoutGroup.id}
              value={layoutGroup.id}
              sx={(theme) => ({
                ...theme.typography.subh2,
                width: '100%',
                whiteSpace: 'nowrap',
                '&.Mui-selected': {
                  color: 'var(--fortress-palette-brand-terracotta-500)',
                  '&::after': {
                    color: 'var(--fortress-palette-brand-terracotta-500)',
                  },
                },
                px: 2,
              })}
            >
              {layoutGroup.title}
            </Tab>
          </Box>
        ))}
      </TabList>
      <Box
        sx={{
          maxHeight: mobile ? '227px' : '360px',
          overflowY: 'auto',
        }}
      >
        {currentSpuGroup?.layoutGroups.map((layoutGroup) => (
          <TabPanel
            value={layoutGroup.id}
            key={layoutGroup.id}
            sx={{
              pb: 0,
            }}
          >
            <RadioGroup
              name="layout-options"
              value={layoutGroup.activeCategoryGroupId}
              onChange={async (event) => {
                const selectedCategoryGroupId = event.target.value;
                const selectedCategoryGroup = layoutGroup.categoryGroups.find(
                  (categoryGroup) => categoryGroup.id === selectedCategoryGroupId
                );
                if (selectedCategoryGroup) {
                  dispatch(
                    EVENT_PDP_SELECTOR({
                      action: 'click',
                      label: activeLayoutGroup?.title ?? '',
                      tag: 'configuration_option',
                      tagValue: selectedCategoryGroup.title,
                    })
                  );
                  await new Promise((resolve) => setTimeout(resolve, 100));
                  router.push(selectedCategoryGroup.defaultLink, { scroll: false });
                }
              }}
            >
              <Stack direction="column" gap={mobile ? 3 : 2}>
                {layoutGroup.categoryGroups.map((categoryGroup) => (
                  <Box key={categoryGroup.id}>
                    <RadioButton
                      label={
                        <Stack direction="row" gap={5} alignItems="center" sx={{ width: '100%' }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 40,
                              flexShrink: 0,
                            }}
                          >
                            <FortressImage
                              src={categoryGroup.icon ?? ''}
                              alt={categoryGroup.title}
                              objectFit="cover"
                              sx={{
                                ...(categoryGroup.isActive && {
                                  filter: 'brightness(0) invert(1) sepia(1) brightness(0.97)',
                                }),
                                width: '100%',
                                height: '100%',
                                '--AspectRatio-paddingBottom': 0,
                              }}
                              sizes="120px"
                            />
                          </Box>
                          <Stack alignItems="flex-start" gap={1}>
                            <Typography
                              level="body2"
                              sx={{
                                textTransform: 'none',
                                whiteSpace: 'normal',
                                overflowWrap: 'break-word',
                                textAlign: 'left',
                              }}
                            >
                              {categoryGroup.title}
                            </Typography>
                            {categoryGroup.dimension && (
                              <Typography level="caption2" sx={{ textTransform: 'none', textAlign: 'left' }}>
                                {categoryGroup.dimension}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      }
                      value={categoryGroup.id}
                      sx={{
                        width: '100%',
                        border: 'none',
                        ...(categoryGroup.isActive &&
                          hasInlineOptions && {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                          }),
                        '& .MuiRadio-label': {
                          width: '100%',
                          py: mobile ? 2 : 3,
                          px: 4,
                        },
                        '@media (hover: hover)': {
                          '&:hover img': {
                            // brightness(0) → black, invert(1) → white
                            // sepia(1) + brightness(0.97) ≈ #F6F3E7
                            filter: 'brightness(0) invert(1) sepia(1) brightness(0.97) !important',
                          },
                        },
                      }}
                    />
                    {categoryGroup.isActive && hasInlineOptions && (
                      <ProductSelectorInlineVariantOptions
                        optionNames={INLINE_OPTION_NAMES}
                        spuGroupTitle={currentSpuGroup?.title}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
          </TabPanel>
        ))}
        <Stack
          sx={{
            mt: 6,
            mobile: {
              mt: 5,
            },
          }}
          mx={4}
        >
          <Typography level="h5" variant="plain">
            Want to configure your own sofa?
          </Typography>
          <ProductSelectorCustomizeSheet categoryCount={categoryCount} collectionPage={collectionPage} />
        </Stack>
      </Box>
    </Tabs>
  );
};
