'use client';

import { AccordionGroup, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { AccordionItem, AccordionItemProps } from './accordion-item';
interface AccordionProps {
  blok: {
    _uid: string;
    component: string;
    header: string;
    header_color: string;
    items: AccordionItemProps[];
    background_color: string;
    has_faq_schema: boolean;
  };
}

const Accordion = ({ blok }: AccordionProps) => {
  const { header, header_color, items, background_color, has_faq_schema } = blok || {};
  const { desktop } = useBreakpoints();

  return (
    <Stack
      sx={(theme) => ({
        padding: desktop ? '32px 96px' : '32px 24px',
        backgroundColor: background_color || theme.palette.brand.warmLinen[500],
      })}
    >
      <AccordionGroup>
        <Typography
          level="h4"
          sx={(theme) => ({
            color: header_color || theme.palette.brand.mono[900],
          })}
        >
          {header}
        </Typography>
        {items.map((item) => (
          <AccordionItem key={item._uid} blok={item} />
        ))}
      </AccordionGroup>
    </Stack>
  );
};

export { Accordion };
