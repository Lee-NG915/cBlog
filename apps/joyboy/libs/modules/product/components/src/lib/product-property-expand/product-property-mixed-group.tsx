'use client';
import { useEffect, useState } from 'react';
import ProductPropertyExpand, { ContentListItem } from './product-property-expand';
import {
  Drawer,
  Box,
  // Accordion, AccordionGroup, AccordionSummary, AccordionDetails
} from '@castlery/fortress';

/* eslint-disable-next-line */
export interface ProductPropertyMixedGroupProps {
  comfort_ratings: ContentListItem[];
  delivery_returns: ContentListItem[];
  product_details: ContentListItem[];
  product_dimensions: ContentListItem[];
  dimension_image?: {
    links: {
      large: string;
    };
  };
}

export function ProductPropertyMixedGroup(props: ProductPropertyMixedGroupProps) {
  const { comfort_ratings, delivery_returns, product_details, product_dimensions, dimension_image } = props;
  const [productDimensions, setProductDimensions] = useState<ContentListItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [explanationContent, setExplanationContent] = useState<string>('');
  const handleClick = (explanation: string) => {
    setDrawerOpen(true);
    setExplanationContent(explanation);
  };

  useEffect(() => {
    if (dimension_image) {
      setProductDimensions(
        comfort_ratings?.concat(product_dimensions).concat([
          {
            explanation: dimension_image?.links?.large,
            is_private: false,
            is_public: true,
            name: 'Dimension Image',
            presentation: 'Dimension Image',
            value: 0,
          },
        ])
      );
    } else {
      setProductDimensions(comfort_ratings?.concat(product_dimensions));
    }
  }, [product_dimensions, comfort_ratings, dimension_image]);

  return (
    <>
      <ProductPropertyExpand
        propertyName="Product Material & Care"
        contentList={product_details}
        onClick={handleClick}
      />
      <ProductPropertyExpand propertyName="Product Dimensions" contentList={productDimensions} onClick={handleClick} />
      <ProductPropertyExpand propertyName="Delivery & Warranty" contentList={delivery_returns} onClick={handleClick} />
      {/* <AccordionGroup sx={{ maxWidth: 400 }}>
        <Accordion>
          <AccordionSummary>Product Dimensions</AccordionSummary>
          <AccordionDetails></AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>Second accordion</AccordionSummary>
          <AccordionDetails>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>Third accordion</AccordionSummary>
          <AccordionDetails>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </AccordionDetails>
        </Accordion>
      </AccordionGroup> */}
      {explanationContent !== '' && (
        <Drawer
          open={drawerOpen}
          showCloseButton
          onClose={() => {
            setDrawerOpen(false);
            setExplanationContent('');
          }}
        >
          <Box
            sx={{
              color: (theme) => theme.palette.brand.charcoal[800],
            }}
            dangerouslySetInnerHTML={{ __html: explanationContent }}
          />
        </Drawer>
      )}
    </>
  );
}

export default ProductPropertyMixedGroup;
