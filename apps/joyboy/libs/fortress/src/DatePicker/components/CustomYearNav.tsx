'use client';
import { type HTMLAttributes } from 'react';
import { Box, Button, Stack, Typography, buttonClasses, useBreakpoints } from '../..';
import { ChevronDoubleLeft, ChevronDoubleRight } from '../../Icons';

export interface CustomYearNavProps {
  onYearChange: (mode: 'previous' | 'next') => void;
}
export function CustomYearNav(props: CustomYearNavProps & HTMLAttributes<HTMLDivElement>) {
  const { onYearChange } = props;
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
      <Button
        variant="ghost"
        onClick={() => onYearChange('previous')}
        aria-label="Go to the Previous Year"
        data-animated-button="true"
      >
        <ChevronDoubleLeft />
      </Button>
      <Stack
        sx={{
          flex: 1,
        }}
      >
        <Typography
          level="subh1"
          sx={{
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {props.children}
        </Typography>
      </Stack>
      <Button
        variant="ghost"
        onClick={() => onYearChange('next')}
        aria-label="Go to the Next Year"
        data-animated-button="true"
      >
        <ChevronDoubleRight />
      </Button>
    </Box>
  );
}
