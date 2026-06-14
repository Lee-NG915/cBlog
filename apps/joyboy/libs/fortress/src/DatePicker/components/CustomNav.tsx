'use client';
import { type HTMLAttributes } from 'react';
import { Box, Button, Stack, buttonClasses, useBreakpoints } from '../..';
import { ChevronDoubleLeft, ChevronDoubleRight, ChevronLeft, ChevronRight } from '../../Icons';

export interface CustomNavProps {
  onMonthChange: (mode: 'previous' | 'next') => void;
  onYearChange: (mode: 'previous' | 'next') => void;
}
export function CustomNav(props: CustomNavProps & HTMLAttributes<HTMLDivElement>) {
  const { onMonthChange, onYearChange } = props;
  const { mobile } = useBreakpoints();

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 4,
        px: mobile ? 2 : 3,
        height: 'var(--rdp-nav-height)',
        lineHeight: 1.2,

        [`& .${buttonClasses.root}`]: {
          flex: 'none',
          p: 0,
          height: 24,
          minHeight: 24,
          minWidth: 24,
        },
      }}
    >
      <Stack direction={'row'} gap={2}>
        <Button
          variant="ghost"
          onClick={() => onYearChange('previous')}
          aria-label="Go to the Previous Year"
          data-animated-button="true"
        >
          <ChevronDoubleLeft />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onMonthChange('previous')}
          aria-label="Go to the Previous Month"
          data-animated-button="true"
        >
          <ChevronLeft />
        </Button>
      </Stack>
      <Stack
        sx={{
          flex: 1,

          '& .rdp-caption_label': {
            display: 'inline-block',
            textAlign: 'center',
            fontWeight: `var(--fortress-fontWeight-md)`,
            fontFamily: `var(--fortress-fontFamily-body)`,
            textTransform: 'uppercase', // 默认转大写
            fontSize: `var(--fortress-fontSize-lg)`,
          },
        }}
      >
        <span {...props} />
      </Stack>
      <Stack direction={'row'} gap={2}>
        <Button
          variant="ghost"
          onClick={() => onMonthChange('next')}
          aria-label="Go to the Next Month"
          data-animated-button="true"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onYearChange('next')}
          aria-label="Go to the Next Year"
          data-animated-button="true"
        >
          <ChevronDoubleRight />
        </Button>
      </Stack>
    </Box>
  );
}
