import { useBreakpointContext } from './BreakpointProvider';
import type { Breakpoints } from './types';

function useBreakpoints(): Breakpoints {
  return useBreakpointContext();
}

export default useBreakpoints;
