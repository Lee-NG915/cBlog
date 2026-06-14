'use client';
import { type AutocompleteRenderGroupParams, Divider, Typography } from '@castlery/fortress';
import React from 'react';
import type { CouponItemType } from './helperV2';

export const groupBy = (options: CouponItemType) => options.couponType;

export const renderGroup = (params: AutocompleteRenderGroupParams, points: number) => {
  return (
    <React.Fragment>
      {params.group === 'credits-notice' ? (
        <>
          <Typography level="caption1" sx={{ paddingX: 2, paddingY: 1, textAlign: 'center' }}>
            You have <Typography color="primary">{points} credits</Typography> available.
          </Typography>
        </>
      ) : (
        <>
          {params.group === 'credits' && <Divider />}
          {params.children}
        </>
      )}
    </React.Fragment>
  );
};
