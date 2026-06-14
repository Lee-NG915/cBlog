import React from 'react';
import { Grid } from '../../../../index';
import useBreakpoints from '../../../../hooks/useBreakpoints';

type RenderYearContentProps = {
  year: number;
  disabled?: boolean;
  selected?: boolean;
};
const RenderYearContent: React.FC<RenderYearContentProps> = ({ year, disabled = false, selected = false }) => {
  const { mobile } = useBreakpoints() || {};

  const sxStyle = React.useMemo(
    () => ({
      width: 72,
      height: 48,
      lineHeight: '48px',
      textAlign: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: (theme: any) =>
        disabled
          ? theme.palette.text.secondary
          : selected
          ? theme.palette.brand.terracotta[700]
          : theme.palette.brand.charcoal[800],
      backgroundColor: (theme: any) => (selected ? theme.palette.primary[10] : 'transparent'),
      ...(disabled
        ? {}
        : {
            '&:hover': {
              color: (theme: any) => theme.palette.brand.terracotta[700],
            },
          }),
      marginBottom: mobile ? (theme: any) => theme.spacing(2) : (theme: any) => theme.spacing(4),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );
  return <Grid sx={sxStyle}>{year}</Grid>;
};

export default React.memo(RenderYearContent);
