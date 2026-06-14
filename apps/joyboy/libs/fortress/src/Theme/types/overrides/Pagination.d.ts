// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CssVarsThemeOptions } from '@mui/joy';

import { PaginationProps } from '../../../Pagination/Pagination';
import { PaginationItemProps } from '../../../Pagination/components/PaginationItem';
declare module '@mui/joy/styles/components' {
  interface Components {
    JoyPagination?: {
      defaultProps?: Partial<PaginationProps>;
      styleOverrides?: {
        root?: any;
        ul?: any;
      };
    };
    JoyPaginationItem?: {
      defaultProps?: Partial<PaginationItemProps>;
      styleOverrides?: {
        root?: any;
        icon?: any;
        ellipsis?: any;
      };
    };
  }
}
