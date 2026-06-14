import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/joy/styles';
import type { Breakpoints } from './types';

function useBreakpoints(): Breakpoints {
  let xs, sm, md, lg, xl, desktop, mobile, tablet;

  try {
    xs = useMediaQuery((theme: Theme) => theme.breakpoints.between('xs', 'sm'));
    sm = useMediaQuery((theme: Theme) => theme.breakpoints.between('sm', 'md'));
    md = useMediaQuery((theme: Theme) => theme.breakpoints.between('md', 'lg'));
    lg = useMediaQuery((theme: Theme) => theme.breakpoints.between('lg', 'xl'));
    xl = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));
    desktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    mobile = xs;
    tablet = sm;
  } catch (error) {
    // error while using media queries
    console.error(
      JSON.stringify(
        {
          message: 'Media query error',
          error: error instanceof Error ? error.message : String(error),
        },
        null,
        2
      )
    );
    xs = sm = md = lg = xl = desktop = mobile = tablet = false;
  }

  return {
    xs,
    sm,
    md,
    lg,
    xl,
    mobile,
    tablet,
    desktop,
  };
}

export default useBreakpoints;
