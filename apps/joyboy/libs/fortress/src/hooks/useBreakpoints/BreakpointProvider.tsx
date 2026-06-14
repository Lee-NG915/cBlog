'use client';

import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/joy/styles';
import { createContext, useContext, useMemo } from 'react';
import type { Breakpoints } from './types';

const defaultBreakpoints: Breakpoints = {
  xs: false,
  sm: false,
  md: false,
  lg: false,
  xl: false,
  mobile: false,
  tablet: false,
  desktop: false,
};

export const BreakpointContext = createContext<Breakpoints>(defaultBreakpoints);

export function BreakpointProvider({ children }: { children: React.ReactNode }) {
  const xs = useMediaQuery((theme: Theme) => theme.breakpoints.between('xs', 'sm'));
  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.between('sm', 'md'));
  const md = useMediaQuery((theme: Theme) => theme.breakpoints.between('md', 'lg'));
  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.between('lg', 'xl'));
  const xl = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));
  const desktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const value = useMemo(() => ({ xs, sm, md, lg, xl, mobile: xs, tablet: sm, desktop }), [xs, sm, md, lg, xl, desktop]);

  return <BreakpointContext.Provider value={value}>{children}</BreakpointContext.Provider>;
}

export function useBreakpointContext(): Breakpoints {
  return useContext(BreakpointContext);
}
