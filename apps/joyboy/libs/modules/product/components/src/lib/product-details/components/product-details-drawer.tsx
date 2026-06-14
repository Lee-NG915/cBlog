'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  ModalClose,
  Stack,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import type { WarrantyProvider } from '@castlery/config';
import { Product, Variant, WarrantyOffer } from '@castlery/modules-product-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useCallback, useEffect, useState } from 'react';
import { ComfortRating } from './comfort-rating';
import { ProductAIProperty, ProductAssemblyAiData } from './product-ai-property';
import { ProductDimension } from './product-dimension';
import { ProductPropertyParis } from './product-property-paris';
import { PropertyExplanationDrawer } from './property-explanation-drawer';
import type { ProductDetailsSectionKey } from '@castlery/types';
import { PRODUCT_DETAILS_ITEMS, PRODUCT_DETAILS_TRACKING_ACTION_MAP } from '../product-details.constants';
import { EcEnv } from '@castlery/config';
import { EVENT_PDP_DETAILS } from '@castlery/modules-tracking-services';

const COMFORT_RATINGS: Array<{ name: string; totalScore: number; min?: string; max?: string }> = [
  { name: 'overall_sit_rating', totalScore: 5, min: 'Relaxed', max: 'Upright' },
  { name: 'seat_depth_rating', totalScore: 5, min: 'Shallow', max: 'Deep' },
  { name: 'seat_height_rating', totalScore: 5, min: 'Low', max: 'High' },
  { name: 'seat_softness_rating', totalScore: 5, min: 'Soft', max: 'Firm' },
  { name: 'pillow_density_rating', totalScore: 3 },
  { name: 'pillow_support_rating', totalScore: 3 },
];

interface ProductDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  initialSection: ProductDetailsSectionKey;
  product?: Product;
  variant?: Variant;
  warrantyList?: WarrantyOffer[];
  hasWarrantyPlans?: boolean;
  warrantyProvider?: WarrantyProvider;
  showAssembly?: boolean;
  showComfort?: boolean;
  assemblyAiData?: ProductAssemblyAiData;
}

export const ProductDetailsDrawer = ({
  open,
  onClose,
  initialSection,
  product,
  variant,
  warrantyList: _warrantyList,
  hasWarrantyPlans = false,
  warrantyProvider,
  showAssembly = false,
  showComfort = true,
  assemblyAiData,
}: ProductDetailsDrawerProps) => {
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [expandedSection, setExpandedSection] = useState<ProductDetailsSectionKey | null>(initialSection);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    if (open) {
      let section = initialSection;
      if (!showAssembly && section === 'assembly') section = 'dimensions';
      if (!showComfort && section === 'seat-comfort') section = 'dimensions';
      setExpandedSection(section);
    }
  }, [initialSection, open, showAssembly, showComfort]);

  const handleTrackPDPDetails = useCallback(
    async ({ action, label }: { action: string; label: string }) => {
      await dispatch(
        EVENT_PDP_DETAILS({
          action,
          label,
        })
      );
    },
    [dispatch]
  );

  const handleAccordionChange = useCallback(
    async (section: ProductDetailsSectionKey, expanded: boolean) => {
      setExpandedSection(expanded ? section : null);
      await handleTrackPDPDetails({
        action: PRODUCT_DETAILS_TRACKING_ACTION_MAP[section],
        label: expanded ? 'expand' : 'close',
      });
    },
    [handleTrackPDPDetails]
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={desktop ? 'right' : 'bottom'}
      size="md"
      sx={{
        '--Drawer-verticalSize': desktop ? undefined : '100dvh',
        '--Drawer-horizontalSize': desktop ? '448px' : undefined,
        '.MuiDrawer-content': {
          p: 0,
        },
      }}
    >
      <DialogTitle sx={{ py: { xs: 4, md: 5 }, px: { xs: 4, md: 6 }, m: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography level="h3">Product details</Typography>
          <ModalClose />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Divider />
        <AccordionGroup>
          {PRODUCT_DETAILS_ITEMS.filter((item) => {
            if (item.key === 'assembly' && !showAssembly) return false;
            if (item.key === 'seat-comfort' && !showComfort) return false;
            return true;
          }).map((item, index, items) => (
            <Accordion
              key={item.key}
              expanded={expandedSection === item.key}
              onChange={(_, expanded) => void handleAccordionChange(item.key, expanded)}
              divider
              sx={{
                py: 3,
                px: { xs: 4, md: 6 },
                ...(index === items.length - 1 && {
                  borderBottom: '1px solid var(--fortress-palette-divider)',
                }),
              }}
            >
              <AccordionSummary>{item.title}</AccordionSummary>
              <AccordionDetails
                sx={{
                  '.MuiAccordionDetails-content.Mui-expanded': {
                    pt: 4,
                  },
                }}
              >
                {item.key === 'dimensions' && (
                  <>
                    <ProductDimension product={product} variant={variant} />
                    <ProductPropertyParis propertyName="product_dimensions" product={product} variant={variant} />
                  </>
                )}
                {item.key === 'seat-comfort' &&
                  ((variant?.variant_properties?.comfort_ratings?.length || 0) > 0 ||
                    (product?.product_properties?.comfort_ratings?.length || 0) > 0) && (
                    <Stack my={5} sx={{ '& > *:not(:first-child)': { borderTop: 'none' } }}>
                      {COMFORT_RATINGS.map(({ name, totalScore, min, max }) => (
                        <ComfortRating
                          key={name}
                          name={name}
                          totalScore={totalScore}
                          minScorePresentation={min}
                          maxScorePresentation={max}
                          product={product}
                          variant={variant}
                          handleDrawerOpen={setExplanationOpen}
                          handleInfoClick={setExplanation}
                        />
                      ))}
                    </Stack>
                  )}
                {item.key === 'materials' && (
                  <ProductPropertyParis propertyName="product_details" product={product} variant={variant} />
                )}
                {item.key === 'delivery' && (
                  <ProductPropertyParis
                    propertyName="delivery_returns"
                    product={product}
                    variant={variant}
                    hasWarrantyPlans={hasWarrantyPlans}
                    warrantyProvider={warrantyProvider}
                  />
                )}
                {item.key === 'assembly' && (
                  <>
                    <ProductPropertyParis propertyName="assembly" product={product} variant={variant} />
                    {(assemblyAiData?.aiDocs?.length > 0 ||
                      assemblyAiData?.aiVideos?.length ||
                      EcEnv.NEXT_PUBLIC_COUNTRY === 'US') &&
                      ((product?.product_properties?.assembly?.length || 0) > 0 ||
                        (variant?.variant_properties?.assembly?.length || 0) > 0) && <Box sx={{ mt: 4 }} />}
                    <ProductAIProperty aiData={assemblyAiData} />
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionGroup>
      </DialogContent>
      <PropertyExplanationDrawer
        open={explanationOpen}
        onClose={() => setExplanationOpen(false)}
        explanation={explanation}
      />
    </Drawer>
  );
};
