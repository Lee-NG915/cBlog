'use client';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@castlery/fortress';
import { Product, selectProduct, Variant } from '@castlery/modules-product-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

/* eslint-disable-next-line */
export interface WebConfigProps {
  productData: Product | undefined;
  variant: Variant | undefined;
  sx?: any;
}

export function WebConfig(props: WebConfigProps) {
  const { productData, sx } = props;
  const isBundle = productData?.product_type === 'bundle';
  const selectCurrentProduct = useAppSelector(selectProduct);
  return (
    <Box
      sx={{
        ...sx,
      }}
    >
      <Accordion
        sx={{
          padding: '1.875rem 5px',
        }}
        onChange={() => {
          console.log('🚀 ~ onChange:', selectCurrentProduct);
        }}
      >
        <AccordionSummary>Product Options</AccordionSummary>
        <AccordionDetails>{isBundle ? 'bundle' : 'not bundle'}</AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default WebConfig;
