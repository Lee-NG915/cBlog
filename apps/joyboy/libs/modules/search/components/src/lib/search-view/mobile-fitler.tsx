import {
  DialogContent,
  DialogTitle,
  ModalClose,
  Stack,
  Typography,
  Box,
  Badge,
  badgeClasses,
  SxProps,
} from '@castlery/fortress';

import { Divider } from '@castlery/fortress';

import { Drawer, drawerClasses } from '@castlery/fortress';

import { Button } from '@castlery/fortress';
import { FilterAlt } from '@castlery/fortress/Icons';
import { useEffect, useState } from 'react';
import { useClearRefinements, useCurrentRefinements, useInstantSearch } from 'react-instantsearch';
import { SortOption } from '../config/sort-options.config';
import { EcEnv } from '@castlery/config';
import { CustomCurrentRefinements } from '../instantsearch/custom-current-refinements';
import { CustomSortBy } from '../instantsearch/custom-sort-by';
import { FacetsContent } from '../instantsearch/facets-content';
import { formatNumberClient } from '@castlery/monorepo-i18n';
import { NextFortressLink } from '@castlery/shared-components';
import { FACET_ATTRIBUTE } from '../config';

export function MobileFilter({
  categoryFilter,
  sortOptions,
}: {
  categoryFilter?: string[];
  sortOptions: SortOption[];
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { items } = useCurrentRefinements();
  const { results } = useInstantSearch();
  const { refine: clear } = useClearRefinements({ excludedAttributes: [FACET_ATTRIBUTE.in_stock_regions] });

  const currentRefinementsCount = items.reduce((acc, item) => acc + item.refinements.length, 0);

  // Sticky behavior (disabled for POS)
  const isPosChannel = EcEnv.NEXT_PUBLIC_CHANNEL === 'POS';
  const shouldEnableSticky = !isPosChannel;

  // Computed styles for better maintainability
  const filterBarStyles: SxProps = {
    display: { xs: 'flex', md: 'none' },
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    py: 1,
    px: 6,
    // Sticky positioning (CSS only to avoid layout shifts)
    position: shouldEnableSticky ? 'sticky' : 'static',
    top: shouldEnableSticky ? 0 : 'auto',
    zIndex: shouldEnableSticky ? 'var(--fortress-zIndex-popup)' : 'auto',
    backgroundColor: 'var(--fortress-palette-background-surface)',
    borderBottom: '1px solid var(--fortress-palette-divider)',
    transition: 'all 0.2s ease-in-out',
  };

  const dividerStyles: SxProps = {
    display: { xs: 'flex', md: 'none' },
    // Make divider sticky along with the filter bar
    position: shouldEnableSticky ? 'sticky' : 'static',
    top: shouldEnableSticky ? 0 : 'auto',
    zIndex: shouldEnableSticky ? 'var(--fortress-zIndex-popup)' : 'auto',
    backgroundColor: 'var(--fortress-palette-background-surface)',
    transition: 'all 0.2s ease-in-out',
  };

  // Store the original URL to restore on cancel
  const [initialUrl, setInitialUrl] = useState('');

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (mobileFiltersOpen) {
      // Store current URL when opening drawer
      setInitialUrl(window.location.href);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  // Function to handle drawer close without applying filters
  const handleCloseWithoutApply = () => {
    setMobileFiltersOpen(false);
    // Navigate back to initial state to discard changes
    if (initialUrl) {
      window.history.replaceState(null, '', initialUrl);
    }
  };

  // Function to apply filters and close drawer
  const handleApply = () => {
    setMobileFiltersOpen(false);
    // Changes are already applied to the URL, so we just need to close the drawer
  };

  // Function to handle reset - immediately clear all filters
  const handleReset = () => {
    clear();
    // Reset is immediate, no need to wait for Apply
    // Clear initialUrl since we're now in a clean state
    setInitialUrl('');
  };

  return (
    <>
      {/* Mobile filter and sort controls - only visible on small screens */}
      <Box sx={filterBarStyles}>
        {/* Filters section */}
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
          <NextFortressLink
            variant="tertiary"
            color="neutral"
            level="subh2"
            sx={{ px: 0, textDecoration: 'none' }}
            startDecorator={
              <FilterAlt
                sx={{
                  ml: '-6px',
                }}
              />
            }
            component={'button'}
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters
          </NextFortressLink>
          <Badge
            badgeContent={currentRefinementsCount}
            sx={{
              display: currentRefinementsCount > 0 ? 'inline-flex' : 'none',
              [`.${badgeClasses.badge}`]: {
                position: 'static',
                transform: 'none',
              },
            }}
          />
        </Stack>
        {/* Sort section */}
        <CustomSortBy items={sortOptions} />
      </Box>

      {/* Divider - also becomes sticky when filter bar is sticky */}
      <Divider sx={dividerStyles} />
      {/* Mobile filters drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={handleCloseWithoutApply}
        sx={{
          display: { md: 'none' },
          [`.${drawerClasses.content}`]: {
            width: '100%',
          },
          '& .MuiDrawer-paper': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <ModalClose onClick={handleCloseWithoutApply} />
        <DialogTitle level="h1" component="span">
          Filters
        </DialogTitle>
        <Divider />

        <DialogContent
          sx={{
            flex: '1 1 auto',
            overflow: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            px: 6,
            py: 4,
          }}
        >
          {/* Selected filters at the top */}
          <Stack gap={2} pb={1}>
            <CustomCurrentRefinements />
          </Stack>

          {/* All filters */}
          <FacetsContent categoryFilter={categoryFilter} />
        </DialogContent>

        <Stack pt={4} px={6} pb={8} gap={3} bgcolor="var(--fortress-palette-brand-warmLinen-100)" boxShadow="md">
          <Typography>{`${formatNumberClient({ style: 'decimal' }).format(
            results.nbHits
          )} results available`}</Typography>
          <Stack direction="row" gap={4}>
            <Button size="sm" variant="outlined" fullWidth color="neutral" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" fullWidth onClick={handleApply}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}
