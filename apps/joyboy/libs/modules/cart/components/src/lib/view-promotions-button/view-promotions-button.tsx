'use client';

import {
  Stack,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Typography,
  List,
  ListItem,
  accordionSummaryClasses,
  accordionDetailsClasses,
} from '@castlery/fortress';
import { ExpandMore } from '@castlery/fortress/Icons';
import type { Promotion_V2 } from '@castlery/types';
import { toPrice } from '@castlery/utils';

export interface ViewPromotionsButtonProps {
  label: string;
  ctaLabel: string;
  value: string;
  promotions: Promotion_V2[];
}
export function ViewPromotionsButton({ label, ctaLabel, value, promotions }: ViewPromotionsButtonProps) {
  return (
    <AccordionGroup
      disableDivider
      transition={{
        initial: '0.3s ease-out',
        expanded: '0.2s ease',
      }}
      sx={{ p: 0, m: 0, height: 24, minHeight: 24 }}
    >
      <Accordion sx={{ p: 0 }}>
        <Stack direction="row" justifyContent={'space-between'}>
          <AccordionSummary
            indicator={<ExpandMore sx={{ color: (theme) => theme.palette.brand.burntOrange[500] }} />}
            sx={{
              p: 0,
              m: 0,
              [`.${accordionSummaryClasses.button}`]: {
                p: 0,
                m: 0,
                gap: 0,
                minHeight: 24,
                height: 24,
              },
            }}
          >
            <Typography level="body2">
              {label} <Link level="caption1">{ctaLabel}</Link>
            </Typography>
          </AccordionSummary>
          <Typography level="body2">{value}</Typography>
        </Stack>

        <AccordionDetails sx={{ [`.${accordionDetailsClasses.content}`]: { py: 0 } }}>
          <List sx={{ pt: 6 }}>
            {promotions.map((promotion) => {
              return (
                <ListItem sx={{ justifyContent: 'space-between', p: 0, m: 0 }}>
                  <Typography level="caption1">{promotion.name}</Typography>
                  <Typography level="caption1">{toPrice(Number(promotion.amount), true)}</Typography>
                </ListItem>
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
}
export default ViewPromotionsButton;
