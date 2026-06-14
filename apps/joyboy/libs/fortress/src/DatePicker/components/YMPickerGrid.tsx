'use client';
import { Grid, Typography } from '../..';

export interface YMPickerGridProps {
  type: 'year' | 'month';
  label: string;
  value: number;
  outside: boolean;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;
}

export function YMPickerGrid({ type, label, value, outside, disabled, selected, onClick }: YMPickerGridProps) {
  return (
    <Grid
      xs={4}
      key={value}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& button': {
          px: 5,
          py: 2,
          width: 120,
          borderRadius: 0,
          border: 'none',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.brand.terracotta[600],
            color: (theme) => theme.palette.common.white,
          },
          '&:active': {
            backgroundColor: (theme) => theme.palette.brand.terracotta[800],
            color: (theme) => theme.palette.common.white,
          },
          '&:disabled,&.ym_dp_grid_btn__outside': {
            color: (theme) => theme.palette.brand.mono[300],
            backgroundColor: 'transparent',
            cursor: 'not-allowed',
          },
          '&.ym_dp_grid_btn__selected': {
            backgroundColor: (theme) => theme.palette.brand.maroonVelvet[500],
            color: (theme) => theme.palette.common.white,
          },
        },
      }}
    >
      <button
        className={`ym_dp_grid_btn ym_dp_grid_${type}_btn ${outside ? `ym_dp_grid_btn__outside` : ''} ${
          selected ? 'ym_dp_grid_btn__selected' : ''
        }`}
        aria-label={`${label}`}
        aria-disabled={disabled || outside}
        disabled={disabled || outside}
        onClick={onClick}
      >
        <Typography level="subh1">{label}</Typography>
      </button>
    </Grid>
  );
}
