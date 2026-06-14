/* eslint-disable @typescript-eslint/no-unused-vars */
import { Order } from '@castlery/modules-user-domain';
import * as React from 'react';
import { Box, Button, Card, Grid, Typography, TypographySystem } from '@castlery/fortress';
/* eslint-disable-next-line */
export interface SalesOrderCellProps {
  cellInfo: {
    label: string | React.ReactElement<any, any>;
    value?: string;
    renderOptions?: React.ReactElement<any, any>;
  };
  xs: number;
  align: 'column' | 'row' | string;
  sx?: any;
}

export function SalesOrderCell(props: SalesOrderCellProps) {
  const { xs, cellInfo, align = 'column', sx } = props;
  return (
    <Grid key={typeof cellInfo.label === 'string' ? cellInfo.label : ''} xs={xs} sx={sx}>
      <Card
        sx={{
          width: '100%',
          border: 'none',
          '--Card-padding': '0.2rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: align,
            justifyContent: align === 'row' ? 'start' : 'center',
            alignItems: align === 'row' ? 'center' : 'start',
          }}
        >
          {typeof cellInfo?.label === 'string' ? (
            <Typography
              level={'title-md' as keyof TypographySystem | 'inherit'}
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                marginRight: align === 'row' ? '0.5rem' : undefined,
              }}
            >
              {cellInfo?.label}
            </Typography>
          ) : (
            cellInfo?.label
          )}
          {cellInfo?.renderOptions ? (
            cellInfo.renderOptions
          ) : (
            <Typography
              level={'body-sm' as keyof TypographySystem | 'inherit'}
              sx={{
                color: '#666',
                fontSize: '1rem',
              }}
            >
              {cellInfo?.value}
            </Typography>
          )}
        </Box>
      </Card>
    </Grid>
  );
}

export default SalesOrderCell;
