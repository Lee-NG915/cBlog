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
  useBreakpoints,
  accordionClasses,
} from '@castlery/fortress';
import { ExpandMore } from '@castlery/fortress/Icons';
import { toPrice } from '@castlery/utils';
import { PriceDisplay, priceDisplayClasses } from '@castlery/shared-components';

export interface ViewMoreDetailsAccordionItem {
  id?: string | number;
  name: string;
  description?: string;
  amount: string | number;
  originalTotal?: string | number;
}

export interface ViewMoreDetailsAccordionProps {
  text: string;
  ctaText: string;
  amount: string;
  originalAmount?: string;
  list: ViewMoreDetailsAccordionItem[];
}
export function ViewMoreDetailsAccordion({
  text,
  ctaText,
  amount,
  originalAmount,
  list,
}: ViewMoreDetailsAccordionProps) {
  const { mobile } = useBreakpoints();
  return (
    <AccordionGroup
      disableDivider
      transition={{
        initial: '0.3s ease-out',
        expanded: '0.2s ease',
      }}
      sx={{ p: 0, m: 0 }}
    >
      <Accordion sx={{ p: 0, m: 0, [`&.${accordionClasses.root}`]: { minBlockSize: 'auto' } }}>
        <Stack
          direction="row"
          justifyContent={'space-between'}
          sx={{
            [`& .${priceDisplayClasses.price}`]: {
              color: 'var(--fortress-palette-brand-maroonVelvet-500)',
            },
            [`& .${priceDisplayClasses.strikeThroughPrice}`]: {
              color: 'var(--fortress-palette-brand-maroonVelvet-500)',
            },
          }}
        >
          <AccordionSummary
            indicator={
              <ExpandMore
                sx={{
                  width: 20,
                  height: 20,
                  minHeight: 20,

                  color: (theme) => theme.palette.brand.burntOrange[500],
                  ...(mobile && {
                    width: 16,
                    height: 16,
                    minHeight: 16,
                  }),
                }}
              />
            }
            sx={{
              p: 0,
              m: 0,
              minBlockSize: 'auto',
              [`.${accordionSummaryClasses.button}`]: {
                p: 0,
                m: 0,
                gap: 0,
                minHeight: 20,
                height: 20,
              },
            }}
          >
            <Typography level="body2">
              {text}{' '}
              <Link level="body2" variant="primary">
                {ctaText}
              </Link>
            </Typography>
          </AccordionSummary>
          <PriceDisplay price={amount} showFree={true} strikeThroughPrice={originalAmount} typographyLevel="body2" />
        </Stack>

        <AccordionDetails
          sx={{
            [`&> .${accordionDetailsClasses.content}.Mui-expanded `]: { py: 0 },
          }}
        >
          <List>
            {list.map((item) => (
              <ListItem key={item.id ?? item.name} sx={{ justifyContent: 'space-between', p: 0, m: 0, gap: 1 }}>
                <Stack sx={{ minWidth: 0 }}>
                  <Typography level="caption1">{item.name}</Typography>
                  {item.description && (
                    <Typography level="caption2" sx={{ color: (theme) => theme.palette.brand.mono[500], mt: 0.25 }}>
                      {item.description}
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography level="caption1">{toPrice(Number(item.amount), true)}</Typography>
                  {!!Number(item.originalTotal) && Number(item.originalTotal) !== Number(item.amount) && (
                    <Typography
                      level="caption1"
                      sx={{ ml: 1, textDecoration: 'line-through', color: (theme) => theme.palette.brand.mono[500] }}
                    >
                      {toPrice(Number(item.originalTotal), true)}
                    </Typography>
                  )}
                </Stack>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
}
export default ViewMoreDetailsAccordion;
